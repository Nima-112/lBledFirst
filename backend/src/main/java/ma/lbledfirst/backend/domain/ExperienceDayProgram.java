package ma.lbledfirst.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDayProgram {

    @Column(name = "day_num", nullable = false)
    private Integer dayNumber;

    @Column(name = "day_title", nullable = false)
    private String title;

    @Column(name = "day_description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "day_images", columnDefinition = "TEXT")
    private String imagesCsv;
}
