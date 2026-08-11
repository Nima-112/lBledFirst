package ma.lbledfirst.backend.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.service.PlatformSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class PlatformSettingsController {

    private final PlatformSettingsService settingsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> getAll() {
        return settingsService.getAll();
    }

    @Data
    public static class SaveSettingsRequest {
        private Map<String, String> values;
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> save(@RequestBody(required = false) SaveSettingsRequest req) {
        return ResponseEntity.ok(settingsService.save(req));
    }
}
