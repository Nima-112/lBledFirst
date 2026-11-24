package ma.lbledfirst.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormationSummaryResponse {
    private Long id;
    private String slug;
    private String title;
    private String shortDescription;
    private String category;
    private String level;
    private String language;
    private BigDecimal price;
    private String coverImage;
    private Integer totalDuration; // minutes, calculé depuis capsules
    private Integer chaptersCount;
    private Integer capsulesCount;
    private Integer studentsCount; // nb de purchases réels
    private Integer favoritesCount; // nb de favoris réels
    private Double averageRating;
    private Integer reviewsCount;
    private InstructorDto instructor;
    private LocalDateTime createdAt;
}
