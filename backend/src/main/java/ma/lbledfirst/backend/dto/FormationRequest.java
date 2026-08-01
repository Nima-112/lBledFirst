package ma.lbledfirst.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class FormationRequest {

    @NotBlank(message = "Le slug est obligatoire")
    private String slug;

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "La description courte est obligatoire")
    private String shortDescription;

    @NotBlank(message = "La description longue est obligatoire")
    private String longDescription;

    @NotBlank(message = "La catégorie est obligatoire")
    private String category;

    @NotBlank(message = "Le niveau est obligatoire")
    private String level; // debutant | intermediaire | avance

    @NotBlank(message = "La langue est obligatoire")
    private String language; // francais | arabe | anglais | espagnol

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal price;

    @NotBlank(message = "L'image de couverture est obligatoire")
    private String coverImage;

    private String previewVideo;

    private Integer studentsCount;
    private Double averageRating;
    private Integer reviewsCount;

    private List<String> objectives;
    private List<String> skills;
    private List<String> prerequisites;

    @Valid
    private List<ChapterDto> chapters;

    @Valid
    @NotNull(message = "Le formateur est obligatoire")
    private InstructorDto instructor;
}
