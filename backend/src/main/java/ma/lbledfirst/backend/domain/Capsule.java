package ma.lbledfirst.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Basic;
import jakarta.persistence.FetchType;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "capsules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Capsule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "position", nullable = false)
    private Integer order;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    // en minutes
    @Column(nullable = false)
    private Integer duration;
    private String thumbnail;
    // URL réelle de la vidéo — ne devrait être exposée qu'aux utilisateurs
    // ayant acheté la formation (cf. FormationService)
    private String videoUrl;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "translation_json", columnDefinition = "json")
    private String translationJson; // stored as raw JSON string, parsed/built via Jackson in the service
    @Column(name = "original_language", length = 10)
    private String originalLanguage;

    @Builder.Default
    @Column(name = "processing_status", nullable = false, length = 20)
    private String processingStatus = "PENDING";

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;
}