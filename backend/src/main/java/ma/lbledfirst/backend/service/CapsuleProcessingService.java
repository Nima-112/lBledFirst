package ma.lbledfirst.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.lbledfirst.backend.domain.Capsule;
import ma.lbledfirst.backend.repository.CapsuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CapsuleProcessingService {

    private static final Logger log = LoggerFactory.getLogger(CapsuleProcessingService.class);
    // 10-minute chunks at 64kbps mono ≈ 4.8MB — safely under Whisper's 25MB limit
    private static final int SEGMENT_SECONDS = 600;

    private final CapsuleRepository capsuleRepository;
    private final AudioExtractionService audioExtractionService;
    private final TranscriptionService transcriptionService;
    private final TranslationService translationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload.dir}")
    private String uploadDir;

    public CapsuleProcessingService(CapsuleRepository capsuleRepository,
            AudioExtractionService audioExtractionService,
            TranscriptionService transcriptionService,
            TranslationService translationService) {
        this.capsuleRepository = capsuleRepository;
        this.audioExtractionService = audioExtractionService;
        this.transcriptionService = transcriptionService;
        this.translationService = translationService;
    }

    @Async("capsuleProcessingExecutor")
    public void processAsync(Long capsuleId) {
        try {
            process(capsuleId);
        } catch (Exception e) {
            log.error("Échec du traitement IA pour la capsule {}", capsuleId, e);
            capsuleRepository.findById(capsuleId).ifPresent(cap -> {
                cap.setProcessingStatus("FAILED");
                capsuleRepository.save(cap);
            });
        }
    }

    public void process(Long capsuleId) throws Exception {
        Capsule capsule = capsuleRepository.findById(capsuleId)
                .orElseThrow(() -> new IllegalArgumentException("Capsule " + capsuleId + " introuvable"));

        capsule.setProcessingStatus("PROCESSING");
        capsuleRepository.save(capsule);

        String actualFilePath = resolveFilePath(capsule.getVideoUrl());
        List<String> audioChunks = audioExtractionService.extractAndChunkAudio(actualFilePath, SEGMENT_SECONDS);

        List<TranscriptionService.TranscriptionSegment> allSegments = new ArrayList<>();
        StringBuilder fullText = new StringBuilder();
        String detectedLanguage = null;
        double timeOffset = 0.0;
        // Passed to Whisper as context for the NEXT chunk, so a sentence or term
        // spanning a chunk boundary keeps consistent spelling/continuity instead
        // of each chunk being transcribed as if it were the very start of the video.
        String continuationPrompt = null;

        for (String chunkPath : audioChunks) {
            double actualChunkDuration = audioExtractionService.getAudioDuration(chunkPath);

            var result = transcriptionService.transcribeWithTimestamps(chunkPath, continuationPrompt);

            // Language is now forced via openai.whisper-language, so every chunk
            // reports the same language — no more "best chunk" guessing needed.
            if (detectedLanguage == null) {
                detectedLanguage = result.getLanguage();
            }

            if (fullText.length() > 0)
                fullText.append(" ");
            fullText.append(result.getText());

            for (var seg : result.getSegments()) {
                allSegments.add(new TranscriptionService.TranscriptionSegment(
                        seg.getStart() + timeOffset, seg.getEnd() + timeOffset, seg.getText()));
            }
            timeOffset += actualChunkDuration;

            continuationPrompt = result.getText();

            try {
                Files.deleteIfExists(Path.of(chunkPath));
            } catch (Exception ignored) {
            }
        }

        String transcript = fullText.toString().trim();
        List<String> originalTexts = allSegments.stream()
                .map(TranscriptionService.TranscriptionSegment::getText)
                .toList();

        Map<String, Object> captions = new LinkedHashMap<>();
        captions.put("original", toSegmentMaps(allSegments, originalTexts));

        for (var entry : TranslationService.TARGET_LANGUAGES.entrySet()) {
            String code = entry.getKey();
            String name = entry.getValue();
            List<String> translatedTexts = name.equalsIgnoreCase(detectedLanguage)
                    ? originalTexts
                    : translationService.translateBatchSafe(originalTexts, name);
            captions.put(code, toSegmentMaps(allSegments, translatedTexts));
        }

        String transcriptResult = transcript;
        String languageResult = detectedLanguage;
        String translationJsonResult = objectMapper.writeValueAsString(captions);

        Capsule fresh = capsuleRepository.findById(capsuleId)
                .orElseThrow(() -> new IllegalArgumentException("Capsule " + capsuleId + " introuvable"));
        fresh.setTranscript(transcriptResult);
        fresh.setOriginalLanguage(languageResult);
        fresh.setTranslationJson(translationJsonResult);
        fresh.setProcessingStatus("DONE");
        capsuleRepository.save(fresh);

        log.info("Capsule {} traitée avec succès (langue détectée : {}, {} segment(s))",
                capsuleId, detectedLanguage, allSegments.size());
    }

    private List<Map<String, Object>> toSegmentMaps(
            List<TranscriptionService.TranscriptionSegment> segments, List<String> texts) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (int i = 0; i < segments.size(); i++) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("start", segments.get(i).getStart());
            m.put("end", segments.get(i).getEnd());
            m.put("text", i < texts.size() ? texts.get(i) : segments.get(i).getText());
            out.add(m);
        }
        return out;
    }

    private String resolveFilePath(String videoUrl) {
        String filename = videoUrl.substring(videoUrl.lastIndexOf('/') + 1);
        return Path.of(uploadDir).resolve(filename).toString();
    }
}