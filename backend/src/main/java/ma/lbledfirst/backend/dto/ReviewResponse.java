package ma.lbledfirst.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.Formation;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private UserResponse tourist;

    @JsonIgnoreProperties({"coverImages", "dayPrograms", "region", "programs", "bookings", "reviews", "media", "videos"})
    private Experience experience;

    @JsonIgnoreProperties({"chapters", "objectives", "skills", "prerequisites", "instructor"})
    private Formation formation;

    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
