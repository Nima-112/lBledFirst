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
public class ExperienceResponse {
    private Long id;
    private Long hostId;
    private String hostName;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer duration;
    private String category;
    private String status;
    private String city;
    private Long regionId;
    private String regionEnumName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> coverImages;
    private List<ExperienceDayProgramDto> dayPrograms;
    private Integer bookingsCount;
    private Integer favoritesCount;
    private Integer reviewsCount;
    private Double averageRating;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExperienceDayProgramDto {
        private Integer dayNumber;
        private String title;
        private String description;
        private List<String> images;
    }
}
