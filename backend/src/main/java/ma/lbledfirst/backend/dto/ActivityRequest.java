package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActivityRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @NotBlank(message = "L'icône est obligatoire")
    private String icon;
}