package ma.lbledfirst.backend.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.PlatformSetting;
import ma.lbledfirst.backend.repository.PlatformSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class PlatformSettingsController {

    private final PlatformSettingRepository settingsRepository;

    private static final Map<String, String> DEFAULTS = Map.of(
            "autoConfirm", "false",
            "allowSignups", "true",
            "maintenance", "false",
            "twoFactor", "true"
    );

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        List<PlatformSetting> persisted = settingsRepository.findAll();
        Map<String, String> result = new HashMap<>(DEFAULTS);
        for (PlatformSetting s : persisted) {
            result.put(s.getSettingKey(), s.getSettingValue());
        }
        return result;
    }

    @Data
    public static class SaveSettingsRequest {
        private Map<String, String> values;
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, String>> save(@RequestBody(required = false) SaveSettingsRequest req) {
        Map<String, String> payload = (req != null && req.getValues() != null) ? req.getValues() : Map.of();
        List<String> allowed = List.copyOf(DEFAULTS.keySet());
        List<PlatformSetting> toSave = payload.entrySet().stream()
                .filter(e -> allowed.contains(e.getKey()))
                .map(e -> PlatformSetting.builder()
                        .settingKey(e.getKey())
                        .settingValue(e.getValue() == null ? "" : e.getValue())
                        .build())
                .collect(Collectors.toList());
        settingsRepository.saveAll(toSave);
        return ResponseEntity.ok(getAll());
    }
}
