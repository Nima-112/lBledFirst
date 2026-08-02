package ma.lbledfirst.backend.domain;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnoreProperties({"password", "email", "phone", "country", "language", "experiences", "bookings", "reviews", "videos", "notifications"})
    private User tourist;

    // Un avis porte soit sur une expérience, soit sur une formation (jamais les deux) —
    // voir ReviewService#resolveTargetAndValidate pour la règle "exactement un des deux".
    @ManyToOne
    @JsonIgnoreProperties({"coverImages", "dayPrograms", "region", "programs", "bookings", "reviews", "media", "videos"})
    private Experience experience;

    @ManyToOne
    @JsonIgnoreProperties({"chapters", "objectives", "skills", "prerequisites", "instructor"})
    private Formation formation;

    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
