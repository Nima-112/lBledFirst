package ma.lbledfirst.backend.controller;

import jakarta.annotation.PostConstruct;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private static final Pattern SAFE_NAME = Pattern.compile("[^A-Za-z0-9._-]");
    private static final long MAX_VIDEO_BYTES = 500L * 1024L * 1024L;

    @Value("${app.upload.dir:/app/uploads/videos}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    @SneakyThrows
    public void initDir() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        log.info("Upload video directory ready: {}", uploadPath);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadVideo(@RequestParam("file") MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide"));
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.startsWith("video/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le fichier doit être une vidéo (type video/*)"));
        }
        if (file.getSize() > MAX_VIDEO_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vidéo trop volumineuse (max 500Mo)"));
        }
        String original = file.getOriginalFilename() == null ? "video.mp4" : file.getOriginalFilename();
        String ext = extractExtension(original);
        String safe = SAFE_NAME.matcher(original.replaceAll("\\.[^.]+$", "")).replaceAll("_");
        if (safe.isBlank()) safe = "video";
        String fileName = UUID.randomUUID() + "_" + safe + "." + ext;

        Path dest = uploadPath.resolve(fileName).normalize();
        if (!dest.startsWith(uploadPath)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom de fichier invalide"));
        }
        try (var in = file.getInputStream()) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
        }
        String url = "/uploads/videos/" + fileName;
        log.info("Vidéo uploadée par admin: {} ({} octets) → {}", original, file.getSize(), url);
        return ResponseEntity.ok(Map.of(
                "url", url,
                "name", original,
                "size", file.getSize(),
                "contentType", contentType
        ));
    }

    private String extractExtension(String name) {
        int i = name.lastIndexOf('.');
        if (i < 0 || i == name.length() - 1) return "mp4";
        String ext = name.substring(i + 1).toLowerCase();
        if (ext.isBlank() || SAFE_NAME.matcher(ext).find()) return "mp4";
        return ext;
    }
}
