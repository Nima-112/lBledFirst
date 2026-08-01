package ma.lbledfirst.backend.dto;

import java.math.BigDecimal;

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
    private Integer totalDuration; // minutes, calculé
    private Integer chaptersCount;
    private Integer capsulesCount;
    private Integer studentsCount;
    private Double averageRating;
    private Integer reviewsCount;
    private InstructorDto instructor;
}
