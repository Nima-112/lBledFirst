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

    private final ma.lbledfirst.backend.service.VideoMetadataService videoMetadataService;

    public FileUploadController(ma.lbledfirst.backend.service.VideoMetadataService videoMetadataService) {
        this.videoMetadataService = videoMetadataService;
    }

    @Value("${app.upload.dir:/app/uploads/videos}")
    private String uploadDir;

    @Value("${app.upload.avatar-dir:/app/uploads/avatars}")
    private String avatarUploadDir;

    @Value("${app.upload.images-dir:/app/uploads/images}")
    private String imagesUploadDir;

    private Path uploadPath;
    private Path avatarPath;
    private Path imagesPath;

    @PostConstruct
    @SneakyThrows
    public void initDir() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        log.info("Upload video directory ready: {}", uploadPath);

        avatarPath = Paths.get(avatarUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(avatarPath);
        log.info("Upload avatar directory ready: {}", avatarPath);

        imagesPath = Paths.get(imagesUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(imagesPath);
        log.info("Upload images directory ready: {}", imagesPath);
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
        if (safe.isBlank())
            safe = "video";
        String fileName = UUID.randomUUID() + "_" + safe + "." + ext;

        Path dest = uploadPath.resolve(fileName).normalize();
        if (!dest.startsWith(uploadPath)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom de fichier invalide"));
        }
        try (var in = file.getInputStream()) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
        }

        // Remux (NOT re-encode) into "faststart" MP4: moves the metadata (moov atom)
        // to the front of the file so the browser can read duration/seek info from
        // the first few KB instead of buffering toward the end first. This is what
        // was causing playback to sit at 00:00/00:00 on a static thumbnail for
        // several seconds. -c copy means no re-encoding — fast (seconds) and lossless.
        try {
            remuxForFastStart(dest);
        } catch (Exception e) {
            log.warn("Remux faststart échoué pour {} — la vidéo reste utilisable mais peut démarrer lentement : {}",
                    fileName, e.getMessage());
        }

        String url = "/uploads/videos/" + fileName;
        log.info("Vidéo uploadée par admin: {} ({} octets) → {}", original, file.getSize(), url);

        // Best-effort duration detection via ffprobe: if it fails for any reason
        // (corrupt file, ffprobe not on PATH, unusual codec), don't fail the whole
        // upload — the admin can still enter the duration manually in the editor.
        java.util.HashMap<String, Object> response = new java.util.HashMap<>(Map.of(
                "url", url,
                "name", original,
                "size", file.getSize(),
                "contentType", contentType));
        try {
            int durationMinutes = videoMetadataService.getDurationMinutes(dest.toString());
            response.put("durationMinutes", durationMinutes);
        } catch (Exception e) {
            log.warn("Impossible de détecter la durée de la vidéo {} : {}", fileName, e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    private void remuxForFastStart(Path videoPath) throws java.io.IOException, InterruptedException {
        Path tempOutput = videoPath.resolveSibling(videoPath.getFileName() + ".faststart.mp4");
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y", "-i", videoPath.toString(),
                "-c", "copy", "-movflags", "+faststart",
                tempOutput.toString());
        pb.redirectErrorStream(true);
        Process process = pb.start();
        try (var reader = process.inputReader()) {
            reader.lines().forEach(line -> log.debug("ffmpeg faststart: {}", line));
        }
        int exitCode = process.waitFor();
        if (exitCode != 0 || !Files.exists(tempOutput) || Files.size(tempOutput) == 0) {
            Files.deleteIfExists(tempOutput);
            throw new RuntimeException("ffmpeg remux a échoué avec le code " + exitCode);
        }
        Files.move(tempOutput, videoPath, StandardCopyOption.REPLACE_EXISTING);
    }

    private String extractExtension(String name) {
        int i = name.lastIndexOf('.');
        if (i < 0 || i == name.length() - 1)
            return "mp4";
        String ext = name.substring(i + 1).toLowerCase();
        if (ext.isBlank() || SAFE_NAME.matcher(ext).find())
            return "mp4";
        return ext;
    }

    // Avatar upload: any authenticated user can upload their profile picture
    private static final long MAX_AVATAR_BYTES = 5L * 1024L * 1024L; // 5 MB

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            org.springframework.security.core.Authentication authentication) throws Exception {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide"));
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le fichier doit être une image"));
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image trop volumineuse (max 5 Mo)"));
        }
        String original = file.getOriginalFilename() == null ? "avatar.jpg" : file.getOriginalFilename();
        String ext = extractAvatarExtension(original);
        String safe = SAFE_NAME.matcher(original.replaceAll("\\.[^.]+$", "")).replaceAll("_");
        if (safe.isBlank())
            safe = "avatar";
        String fileName = UUID.randomUUID() + "_" + safe + "." + ext;

        Path dest = avatarPath.resolve(fileName).normalize();
        if (!dest.startsWith(avatarPath)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom de fichier invalide"));
        }
        try (var in = file.getInputStream()) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
        }
        String url = "/uploads/avatars/" + fileName;
        log.info("Avatar uploadé par {}: {} ({} octets) → {}", authentication.getName(), original, file.getSize(), url);
        return ResponseEntity.ok(Map.of("url", url));
    }

    private String extractAvatarExtension(String name) {
        int i = name.lastIndexOf('.');
        if (i < 0 || i == name.length() - 1)
            return "jpg";
        String ext = name.substring(i + 1).toLowerCase();
        if (ext.isBlank() || SAFE_NAME.matcher(ext).find())
            return "jpg";
        return ext;
    }

    // General image upload: admin only (for experience covers, formation covers,
    // etc.)
    private static final long MAX_IMAGE_BYTES = 10L * 1024L * 1024L; // 10 MB

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide"));
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le fichier doit être une image"));
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image trop volumineuse (max 10 Mo)"));
        }
        String original = file.getOriginalFilename() == null ? "image.jpg" : file.getOriginalFilename();
        String ext = extractAvatarExtension(original);
        String safe = SAFE_NAME.matcher(original.replaceAll("\\.[^.]+$", "")).replaceAll("_");
        if (safe.isBlank())
            safe = "image";
        String fileName = UUID.randomUUID() + "_" + safe + "." + ext;

        Path dest = imagesPath.resolve(fileName).normalize();
        if (!dest.startsWith(imagesPath)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom de fichier invalide"));
        }
        try (var in = file.getInputStream()) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
        }
        String url = "/uploads/images/" + fileName;
        log.info("Image uploadée: {} ({} octets) → {}", original, file.getSize(), url);
        return ResponseEntity.ok(Map.of("url", url));
    }
}