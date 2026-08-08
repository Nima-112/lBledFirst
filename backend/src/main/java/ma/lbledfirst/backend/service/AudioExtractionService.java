package ma.lbledfirst.backend.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AudioExtractionService {

    private static final Logger log = LoggerFactory.getLogger(AudioExtractionService.class);

    private static final String TEMP_DIR = "temp-audio";

    public String extractAudio(String inputVideoPath) throws IOException, InterruptedException {
        Path tempDir = Paths.get(TEMP_DIR);
        if (!Files.exists(tempDir)) {
            Files.createDirectories(tempDir);
        }

        String outputAudioPath = TEMP_DIR + "/" + UUID.randomUUID() + ".mp3";

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", inputVideoPath,
                "-q:a", "0", "-map", "a",
                outputAudioPath);
        pb.redirectErrorStream(true);

        log.info("Extraction audio en cours : {}", inputVideoPath);
        Process process = pb.start();

        try (var reader = process.inputReader()) {
            reader.lines().forEach(line -> log.debug("ffmpeg: {}", line));
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("ffmpeg a échoué avec le code " + exitCode);
        }

        log.info("Audio extrait avec succès : {}", outputAudioPath);
        return outputAudioPath;
    }

    public List<String> extractAndChunkAudio(String inputVideoPath, int segmentSeconds)
            throws IOException, InterruptedException {
        Path tempDir = Paths.get(TEMP_DIR);
        if (!Files.exists(tempDir)) {
            Files.createDirectories(tempDir);
        }

        String jobId = UUID.randomUUID().toString();
        String outputPattern = TEMP_DIR + "/" + jobId + "_%03d.mp3";

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", inputVideoPath,
                "-vn", // no video stream
                "-ar", "16000", // 16kHz — Whisper's native rate, keeps files small
                "-ac", "1", // mono — halves size again, no quality loss for speech
                "-b:a", "64k", // 64kbps mono speech — small enough to avoid the 25MB cap even at ~10min chunks
                "-f", "segment",
                "-segment_time", String.valueOf(segmentSeconds),
                "-reset_timestamps", "1",
                outputPattern);
        pb.redirectErrorStream(true);

        log.info("Extraction + découpage audio en cours : {}", inputVideoPath);
        Process process = pb.start();
        try (var reader = process.inputReader()) {
            reader.lines().forEach(line -> log.debug("ffmpeg: {}", line));
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException(
                    "ffmpeg a échoué avec le code " + exitCode + " pour le fichier " + inputVideoPath);
        }

        // Collect generated chunk files in order (000, 001, 002, ...)
        List<String> chunks = new ArrayList<>();
        try (var files = Files.list(tempDir)) {
            files.filter(p -> p.getFileName().toString().startsWith(jobId))
                    .sorted()
                    .forEach(p -> chunks.add(p.toString()));
        }

        if (chunks.isEmpty()) {
            throw new RuntimeException("Aucun segment audio généré pour " + inputVideoPath);
        }
        log.info("{} segment(s) audio généré(s) pour {}", chunks.size(), inputVideoPath);
        return chunks;
    }

    public double getAudioDuration(String audioPath) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                audioPath);
        pb.redirectErrorStream(false);

        Process process = pb.start();
        String output;
        try (var reader = process.inputReader()) {
            output = reader.lines().findFirst().orElse("").trim();
        }
        int exitCode = process.waitFor();
        if (exitCode != 0 || output.isEmpty()) {
            throw new RuntimeException("ffprobe n'a pas pu lire la durée de " + audioPath);
        }
        return Double.parseDouble(output);
    }
}