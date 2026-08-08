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

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model-transcription}")
    private String model;

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

        public double getStart() { return start; }
        public double getEnd() { return end; }
        public String getText() { return text; }
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

        public String getText() { return text; }
        public String getLanguage() { return language; }
        public List<TranscriptionSegment> getSegments() { return segments; }
    }

    public TranscriptionResult transcribeWithTimestamps(String audioFilePath) throws IOException, InterruptedException {
        Path audioPath = Path.of(audioFilePath);
        byte[] audioBytes = Files.readAllBytes(audioPath);
        String fileName = audioPath.getFileName().toString();

        String boundary = "----Boundary" + UUID.randomUUID();
        var multipartBody = buildMultipartBody(boundary, fileName, audioBytes, model);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(WHISPER_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody))
                .build();

        log.info("Envoi de l'audio à Whisper : {}", fileName);
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Whisper a échoué ({}): {}", response.statusCode(), response.body());
            throw new RuntimeException("Whisper API error " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String text = root.path("text").asText();
        String language = root.path("language").asText(null);

        List<TranscriptionSegment> segments = new ArrayList<>();
        JsonNode segArray = root.path("segments");
        if (segArray.isArray()) {
            for (JsonNode seg : segArray) {
                double start = seg.path("start").asDouble();
                double end = seg.path("end").asDouble();
                String segText = seg.path("text").asText().trim();
                segments.add(new TranscriptionSegment(start, end, segText));
            }
        }

        log.info("Transcription reçue avec succès ({} segment(s), langue détectée : {})", segments.size(), language);
        return new TranscriptionResult(text, language, segments);
    }

    private byte[] buildMultipartBody(String boundary, String fileName, byte[] fileBytes, String model)
            throws IOException {
        var out = new java.io.ByteArrayOutputStream();
        String lineEnd = "\r\n";

        out.write(("--" + boundary + lineEnd).getBytes());
        out.write(("Content-Disposition: form-data; name=\"model\"" + lineEnd + lineEnd).getBytes());
        out.write((model + lineEnd).getBytes());

        out.write(("--" + boundary + lineEnd).getBytes());
        out.write(("Content-Disposition: form-data; name=\"response_format\"" + lineEnd + lineEnd).getBytes());
        out.write(("verbose_json" + lineEnd).getBytes());

        out.write(("--" + boundary + lineEnd).getBytes());
        out.write(("Content-Disposition: form-data; name=\"timestamp_granularities[]\"" + lineEnd + lineEnd).getBytes());
        out.write(("segment" + lineEnd).getBytes());

        out.write(("--" + boundary + lineEnd).getBytes());
        out.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"" + lineEnd).getBytes());
        out.write(("Content-Type: audio/mpeg" + lineEnd + lineEnd).getBytes());
        out.write(fileBytes);
        out.write(lineEnd.getBytes());

        out.write(("--" + boundary + "--" + lineEnd).getBytes());

        return out.toByteArray();
    }
}