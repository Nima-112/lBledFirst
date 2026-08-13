package ma.lbledfirst.backend.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "formations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String longDescription;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormationLevel level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormationLanguage language;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String coverImage;

    private String previewVideo;

    @Builder.Default
    @Column(nullable = false)
    private Integer studentsCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Double averageRating = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Integer reviewsCount = 0;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "formation_objectives", joinColumns = @JoinColumn(name = "formation_id"))
    @Column(name = "objective", columnDefinition = "TEXT")
    private List<String> objectives = new ArrayList<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "formation_skills", joinColumns = @JoinColumn(name = "formation_id"))
    @Column(name = "skill", columnDefinition = "TEXT")
    private List<String> skills = new ArrayList<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "formation_prerequisites", joinColumns = @JoinColumn(name = "formation_id"))
    @Column(name = "prerequisite", columnDefinition = "TEXT")
    private List<String> prerequisites = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    private List<Chapter> chapters = new ArrayList<>();

    @Embedded
    private Instructor instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formateur_id")
    private User formateur;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
