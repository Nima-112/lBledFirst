package ma.lbledfirst.backend.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum ExperienceStatus {
    draft,
    published,
    archived;

    @JsonCreator
    public static ExperienceStatus from(String value) {
        if (value == null) return null;
        String normalized = value.trim().toLowerCase();
        return Arrays.stream(values())
                .filter(v -> v.name().equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Statut invalide : \"" + value + "\" (attendu : draft, published, archived)"));
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
