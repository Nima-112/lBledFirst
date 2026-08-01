package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CapsuleDto {

    // null pour une capsule pas encore créée
    private Long id;

    @NotNull(message = "L'ordre de la capsule est obligatoire")
    private Integer order;

    @NotBlank(message = "Le titre de la capsule est obligatoire")
    private String title;

    private String description;

    @NotNull(message = "La durée de la capsule est obligatoire")
    @Positive(message = "La durée doit être positive")
    private Integer duration;

    private String thumbnail;

    // n'est renvoyée au client que si l'utilisateur a acheté la formation
    private String videoUrl;
}
