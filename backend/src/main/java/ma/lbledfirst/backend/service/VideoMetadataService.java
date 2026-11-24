package ma.lbledfirst.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.stream.Collectors;

@Service
public class VideoMetadataService {

    private static final Logger log = LoggerFactory.getLogger(VideoMetadataService.class);

    /** Returns the video's duration in whole minutes, rounded up (min 1). */
    public int getDurationMinutes(String videoFilePath) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                videoFilePath);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        String output;
        try (var reader = process.inputReader()) {
            output = reader.lines().collect(Collectors.joining("\n")).trim();
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            log.error("ffprobe a échoué (code {}) pour {} — sortie : {}", exitCode, videoFilePath, output);
            throw new RuntimeException("ffprobe a échoué avec le code " + exitCode + " pour " + videoFilePath);
        }

        double seconds = Double.parseDouble(output);
        int minutes = (int) Math.ceil(seconds / 60.0);
        log.info("Durée détectée pour {} : {} min", videoFilePath, minutes);
        return Math.max(minutes, 1);
    }
}