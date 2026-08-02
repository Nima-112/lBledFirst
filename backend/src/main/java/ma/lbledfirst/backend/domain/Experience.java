package ma.lbledfirst.backend.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "experiences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnoreProperties({"bookings","experiences","reviews","password","authorities","enabled","accountNonLocked","accountNonExpired","credentialsNonExpired"})
    private User host;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperienceStatus status;

    @Column(nullable = false)
    private String city;

    @ManyToOne
    @JoinColumn(name = "region_id")
    @JsonIgnoreProperties({"experiences"})
    private Region region;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "experience_images", joinColumns = @JoinColumn(name = "experience_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> coverImages = new ArrayList<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "experience_day_programs", joinColumns = @JoinColumn(name = "experience_id"))
    private List<ExperienceDayProgram> dayPrograms = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "experience")
    private List<Program> programs;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "experience")
    private List<Booking> bookings;

    @JsonIgnore
    @OneToMany(mappedBy = "experience")
    private List<Review> reviews;

    @JsonIgnore
    @OneToMany(mappedBy = "experience")
    private List<Media> media;

    @JsonIgnore
    @OneToMany(mappedBy = "experience")
    private List<Video> videos;

    @Builder.Default
    @Column(nullable = false)
    private Boolean deleted = Boolean.FALSE;
}
