package ma.lbledfirst.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TranscriptionService {

    private static final Logger log = LoggerFactory.getLogger(TranscriptionService.class);
    private static final String WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";

    // Whisper's own recommended heuristics (from OpenAI's reference decoder) for
    // flagging a segment as hallucinated/non-speech rather than real transcription.
    private static final double NO_SPEECH_PROB_THRESHOLD = 0.6;
    private static final double AVG_LOGPROB_THRESHOLD = -1.0; // below this = low model confidence
    private static final double COMPRESSION_RATIO_THRESHOLD = 2.4; // above this = repetitive/looping text

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model-transcription}")
    private String model;

    // ISO-639-1 hint sent to Whisper so it doesn't have to guess the language from
    // scratch on every chunk. Darija has no dedicated Whisper code, but "ar" biases
    // the model toward Arabic-family phonemes/script instead of drifting into
    // French/English guesses on noisy or code-switched segments — the single
    // biggest accuracy lever available without fine-tuning.
    @Value("${openai.whisper-language:ar}")
    private String languageHint;

    // Seeded into Whisper's `prompt` field on the FIRST chunk only (continuation
    // chunks use the previous chunk's own transcript instead — see below). Whisper
    // has no dedicated Darija language code, but the prompt field can still bias
    // decoding *style* toward Darija phrasing rather than Modern Standard Arabic.
    // This is the closest real equivalent to "forcing Darija" that the API allows.
    @Value("${openai.whisper-initial-prompt:مرحبا، غادي نهضر بالدارجة المغربية ديال المغرب.}")
    private String initialPrompt;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class TranscriptionSegment {
        private final double start;
        private final double end;
        private final String text;

        public TranscriptionSegment(double start, double end, String text) {
            this.start = start;
            this.end = end;
            this.text = text;
        }

        public double getStart() {
            return start;
        }

        public double getEnd() {
            return end;
        }

        public String getText() {
            return text;
        }
    }

    public static class TranscriptionResult {
        private final String text;
        private final String language;
        private final List<TranscriptionSegment> segments;

        public TranscriptionResult(String text, String language, List<TranscriptionSegment> segments) {
            this.text = text;
            this.language = language;
            this.segments = segments;
        }

        public String getText() {
            return text;
        }

        public String getLanguage() {
            return language;
        }

        public List<TranscriptionSegment> getSegments() {
            return segments;
        }
    }

    public TranscriptionResult transcribeWithTimestamps(String audioFilePath) throws IOException, InterruptedException {
        return transcribeWithTimestamps(audioFilePath, null);
    }

    private static final int MAX_RETRIES = 3;

    /**
     * @param continuationPrompt the tail of the previous chunk's transcript (if
     *                           any),
     *                           passed to Whisper's `prompt` field so it has
     *                           context
     *                           across chunk boundaries — improves consistency of
     *                           spelling/vocabulary and reduces quality dips right
     *                           at
     *                           the 10-minute seams.
     */
    public TranscriptionResult transcribeWithTimestamps(String audioFilePath, String continuationPrompt)
            throws IOException, InterruptedException {
        Path audioPath = Path.of(audioFilePath);
        byte[] audioBytes = Files.readAllBytes(audioPath);
        String fileName = audioPath.getFileName().toString();

        String effectivePrompt = (continuationPrompt != null && !continuationPrompt.isBlank())
                ? continuationPrompt
                : initialPrompt;

        String boundary = "----Boundary" + UUID.randomUUID();
        var multipartBody = buildMultipartBody(boundary, fileName, audioBytes, model, effectivePrompt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(WHISPER_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody))
                .build();

        log.info("Envoi de l'audio à Whisper : {} (langue forcée : {})", fileName, languageHint);
        HttpResponse<String> response = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200)
                break;
            boolean retryable = response.statusCode() == 429 || response.statusCode() >= 500;
            if (!retryable || attempt == MAX_RETRIES)
                break;
            long backoffMs = 1500L * attempt * attempt;
            log.warn("Whisper a répondu {} (tentative {}/{}), nouvelle tentative dans {} ms",
                    response.statusCode(), attempt, MAX_RETRIES, backoffMs);
            Thread.sleep(backoffMs);
        }

        if (response.statusCode() != 200) {
            log.error("Whisper a échoué ({}): {}", response.statusCode(), response.body());
            throw new RuntimeException("Whisper API error " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String text = root.path("text").asText();
        String language = root.path("language").asText(null);

        List<TranscriptionSegment> segments = new ArrayList<>();
        JsonNode segArray = root.path("segments");
        int droppedCount = 0;
        if (segArray.isArray()) {
            for (JsonNode seg : segArray) {
                double start = seg.path("start").asDouble();
                double end = seg.path("end").asDouble();
                String segText = seg.path("text").asText().trim();
                double noSpeechProb = seg.path("no_speech_prob").asDouble(0.0);
                double avgLogprob = seg.path("avg_logprob").asDouble(0.0);
                double compressionRatio = seg.path("compression_ratio").asDouble(1.0);

                boolean isMusicGlyph = segText
                        .replace("♪", "")
                        .replace("♫", "")
                        .replace("🎵", "")
                        .replace("🎶", "")
                        .isBlank();
                boolean hasNoLetters = !segText.chars().anyMatch(Character::isLetter);

                boolean silenceCorroborated = noSpeechProb > NO_SPEECH_PROB_THRESHOLD
                        && avgLogprob < AVG_LOGPROB_THRESHOLD;
                boolean hallucinationCorroborated = compressionRatio > COMPRESSION_RATIO_THRESHOLD
                        && noSpeechProb > 0.3;

                if (isMusicGlyph || hasNoLetters || segText.isEmpty() || silenceCorroborated
                        || hallucinationCorroborated) {
                    droppedCount++;
                    continue;
                }

                segments.add(new TranscriptionSegment(start, end, segText));
            }
        }

        log.info(
                "Transcription reçue : {} segment(s) retenus, {} écarté(s) (silence/hallucination), langue détectée : {}",
                segments.size(), droppedCount, language);
        return new TranscriptionResult(text, language, segments);
    }

    private byte[] buildMultipartBody(String boundary, String fileName, byte[] fileBytes, String model,
            String continuationPrompt) throws IOException {
        var out = new java.io.ByteArrayOutputStream();
        String lineEnd = "\r\n";

        writeField(out, boundary, "model", model, lineEnd);
        writeField(out, boundary, "response_format", "verbose_json", lineEnd);
        writeField(out, boundary, "timestamp_granularities[]", "segment", lineEnd);

        if (languageHint != null && !languageHint.isBlank()) {
            writeField(out, boundary, "language", languageHint, lineEnd);
        }
        if (continuationPrompt != null && !continuationPrompt.isBlank()) {
            // Whisper's prompt field caps around 224 tokens — keep it short so it
            // never gets silently truncated mid-word.
            String trimmedPrompt = continuationPrompt.length() > 500
                    ? continuationPrompt.substring(continuationPrompt.length() - 500)
                    : continuationPrompt;
            writeField(out, boundary, "prompt", trimmedPrompt, lineEnd);
        }

        out.write(("--" + boundary + lineEnd).getBytes());
        out.write(
                ("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"" + lineEnd).getBytes());
        out.write(("Content-Type: audio/mpeg" + lineEnd + lineEnd).getBytes());
        out.write(fileBytes);
        out.write(lineEnd.getBytes());

        out.write(("--" + boundary + "--" + lineEnd).getBytes());

        return out.toByteArray();
    }

    private void writeField(java.io.ByteArrayOutputStream out, String boundary, String name, String value,
            String lineEnd) throws IOException {
        out.write(("--" + boundary + lineEnd).getBytes());
        out.write(("Content-Disposition: form-data; name=\"" + name + "\"" + lineEnd + lineEnd).getBytes());
        out.write((value + lineEnd).getBytes());
    }
}