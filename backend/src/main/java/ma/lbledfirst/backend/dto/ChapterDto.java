package ma.lbledfirst.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterDto {

    // null pour un chapitre pas encore créé
    private Long id;

    @NotNull(message = "L'ordre du chapitre est obligatoire")
    private Integer order;

    @NotBlank(message = "Le titre du chapitre est obligatoire")
    private String title;

    @Valid
    private List<CapsuleDto> capsules;
}
