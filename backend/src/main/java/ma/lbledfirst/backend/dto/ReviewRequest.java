package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    private IdHolder tourist;
    private IdHolder experience;
    private IdHolder formation;

    @NotNull(message = "La note est obligatoire")
    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    private Integer rating;

    private String comment;

    @Data
    public static class IdHolder {
        private Long id;
    }
}
