package ma.lbledfirst.backend.service;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.PlatformSetting;
import ma.lbledfirst.backend.repository.PlatformSettingRepository;
import ma.lbledfirst.backend.controller.PlatformSettingsController.SaveSettingsRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {

    private final PlatformSettingRepository settingsRepository;

    private static final Map<String, String> DEFAULTS = Map.of(
            "autoConfirm", "false",
            "allowSignups", "true",
            "maintenance", "false",
            "twoFactor", "true"
    );

    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        List<PlatformSetting> persisted = settingsRepository.findAll();
        Map<String, String> result = new HashMap<>(DEFAULTS);
        for (PlatformSetting s : persisted) {
            result.put(s.getSettingKey(), s.getSettingValue());
        }
        return result;
    }

    @Transactional
    public Map<String, String> save(SaveSettingsRequest req) {
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
        return getAll();
    }
}
