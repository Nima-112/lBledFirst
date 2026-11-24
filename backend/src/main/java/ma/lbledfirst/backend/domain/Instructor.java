package ma.lbledfirst.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Embarqué directement dans Formation : un formateur est toujours édité en
// même temps que la formation dans ce projet (pas d'entité autonome pour
// l'instant, cf. FormationEditor côté frontend qui édite l'instructeur inline).
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Instructor {

    @Column(name = "instructor_name", nullable = false)
    private String name;

    @Column(name = "instructor_specialty")
    private String specialty;

    @Column(name = "instructor_experience_years")
    private Integer experienceYears;

    @Column(name = "instructor_bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "instructor_photo")
    private String photo;

    @Builder.Default
    @Column(name = "instructor_total_formations")
    private Integer totalFormations = 0;

    @Builder.Default
    @Column(name = "instructor_average_rating")
    private Double averageRating = 0.0;

    @Builder.Default
    @Column(name = "instructor_students_trained")
    private Integer studentsTrained = 0;
}
