package ma.lbledfirst.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormationDetailResponse {
    private Long id;
    private String slug;
    private String title;
    private String shortDescription;
    private String longDescription;
    private String category;
    private String level;
    private String language;
    private BigDecimal price;
    private String coverImage;
    private String previewVideo;
    private Integer totalDuration; // minutes, calculé
    private Integer studentsCount;
    private Double averageRating;
    private Integer reviewsCount;
    private List<String> objectives;
    private List<String> skills;
    private List<String> prerequisites;
    private List<ChapterDto> chapters;
    private InstructorDto instructor;
    private LocalDateTime createdAt;
    // true si l'utilisateur courant (authentifié) a acheté la formation ;
    // conditionne la présence des videoUrl dans les capsules
    private boolean purchased;
    // true si l'utilisateur courant a terminé toutes les capsules ; conditionne
    // la possibilité de publier un avis (POST /api/reviews)
    private boolean completed;
    // true si l'utilisateur courant a déjà laissé un avis pour cette formation
    private boolean reviewed;
}
