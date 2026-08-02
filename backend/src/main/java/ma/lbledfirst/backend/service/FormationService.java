package ma.lbledfirst.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Capsule;
import ma.lbledfirst.backend.domain.Chapter;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.FormationCapsuleProgress;
import ma.lbledfirst.backend.domain.FormationFavorite;
import ma.lbledfirst.backend.domain.FormationLanguage;
import ma.lbledfirst.backend.domain.FormationLevel;
import ma.lbledfirst.backend.domain.FormationPurchase;
import ma.lbledfirst.backend.domain.Instructor;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.dto.CapsuleDto;
import ma.lbledfirst.backend.dto.ChapterDto;
import ma.lbledfirst.backend.dto.FormationDetailResponse;
import ma.lbledfirst.backend.dto.FormationRequest;
import ma.lbledfirst.backend.dto.FormationSummaryResponse;
import ma.lbledfirst.backend.dto.InstructorDto;
import ma.lbledfirst.backend.exception.FormationAlreadyExistsException;
import ma.lbledfirst.backend.exception.FormationNotPurchasedException;
import ma.lbledfirst.backend.exception.InvalidCredentialsException;
import ma.lbledfirst.backend.exception.NotFoundException;
import ma.lbledfirst.backend.repository.CapsuleRepository;
import ma.lbledfirst.backend.repository.FormationCapsuleProgressRepository;
import ma.lbledfirst.backend.repository.FormationFavoriteRepository;
import ma.lbledfirst.backend.repository.FormationPurchaseRepository;
import ma.lbledfirst.backend.repository.FormationRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final CapsuleRepository capsuleRepository;
    private final FormationPurchaseRepository purchaseRepository;
    private final FormationFavoriteRepository favoriteRepository;
    private final FormationCapsuleProgressRepository progressRepository;
    private final UserRepository userRepository;

    // ---- Catalogue (public) ------------------------------------------------

    @Transactional(readOnly = true)
    public List<FormationSummaryResponse> getAllFormations() {
        return formationRepository.findAll().stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public FormationDetailResponse getFormationBySlug(String slug, String currentUserEmail) {
        Formation formation = findBySlugOrThrow(slug);
        boolean purchased = currentUserEmail != null && isPurchased(formation, currentUserEmail);
        return toDetail(formation, purchased);
    }

    // ---- Administration (admin uniquement, cf. FormationController) -------

    @Transactional
    public FormationDetailResponse createFormation(FormationRequest req) {
        if (formationRepository.existsBySlug(req.getSlug())) {
            throw new FormationAlreadyExistsException("Une formation avec ce slug existe déjà");
        }

        Formation formation = Formation.builder()
                .slug(req.getSlug())
                .build();
        applyRequest(formation, req);
        formationRepository.save(formation);

        return toDetail(formation, false);
    }

    @Transactional
    public FormationDetailResponse updateFormation(String slug, FormationRequest req) {
        Formation formation = findBySlugOrThrow(slug);

        if (!formation.getSlug().equals(req.getSlug()) && formationRepository.existsBySlug(req.getSlug())) {
            throw new FormationAlreadyExistsException("Une formation avec ce slug existe déjà");
        }
        formation.setSlug(req.getSlug());
        applyRequestForUpdate(formation, req);
        formationRepository.save(formation);

        return toDetail(formation, false);
    }

    @Transactional
    public void deleteFormation(String slug) {
        Formation formation = findBySlugOrThrow(slug);
        formationRepository.delete(formation);
    }

    // ---- Achat --------------------------------------------------------------

    @Transactional
    public void purchase(String slug, String email) {
        Formation formation = findBySlugOrThrow(slug);
        User user = findUserOrThrow(email);

        if (!purchaseRepository.existsByUserIdAndFormationId(user.getId(), formation.getId())) {
            purchaseRepository.save(FormationPurchase.builder()
                    .user(user)
                    .formation(formation)
                    .build());
            formation.setStudentsCount(formation.getStudentsCount() + 1);
        }
    }

    @Transactional(readOnly = true)
    public List<FormationSummaryResponse> getPurchasedFormations(String email) {
        User user = findUserOrThrow(email);
        return purchaseRepository.findByUserId(user.getId()).stream()
                .map(p -> toSummary(p.getFormation()))
                .toList();
    }

    // ---- Progression ----------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Long> getProgress(String slug, String email) {
        Formation formation = findBySlugOrThrow(slug);
        User user = findUserOrThrow(email);
        return progressRepository.findByUserIdAndCapsule_Chapter_Formation_Id(user.getId(), formation.getId())
                .stream()
                .map(p -> p.getCapsule().getId())
                .toList();
    }

    @Transactional
    public boolean toggleCapsuleCompletion(String slug, Long capsuleId, String email) {
        Formation formation = findBySlugOrThrow(slug);
        User user = findUserOrThrow(email);

        if (!isPurchased(formation, email)) {
            throw new FormationNotPurchasedException("Vous devez acheter cette formation pour suivre votre progression");
        }

        Capsule capsule = capsuleRepository.findById(capsuleId)
                .orElseThrow(() -> new NotFoundException("Capsule " + capsuleId + " non trouvée"));
        if (!capsule.getChapter().getFormation().getId().equals(formation.getId())) {
            throw new NotFoundException("Cette capsule n'appartient pas à cette formation");
        }

        var existing = progressRepository.findByUserIdAndCapsuleId(user.getId(), capsuleId);
        if (existing.isPresent()) {
            progressRepository.delete(existing.get());
            return false;
        }
        progressRepository.save(FormationCapsuleProgress.builder()
                .user(user)
                .capsule(capsule)
                .build());
        return true;
    }

    // ---- Favoris ------------------------------------------------------------

    @Transactional
    public boolean toggleFavorite(String slug, String email) {
        Formation formation = findBySlugOrThrow(slug);
        User user = findUserOrThrow(email);

        var existing = favoriteRepository.findByUserIdAndFormationId(user.getId(), formation.getId());
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false;
        }
        favoriteRepository.save(FormationFavorite.builder()
                .user(user)
                .formation(formation)
                .build());
        return true;
    }

    @Transactional(readOnly = true)
    public List<FormationSummaryResponse> getFavoriteFormations(String email) {
        User user = findUserOrThrow(email);
        return favoriteRepository.findByUserId(user.getId()).stream()
                .map(f -> toSummary(f.getFormation()))
                .toList();
    }

    // ---- Helpers --------------------------------------------------------------

    private Formation findBySlugOrThrow(String slug) {
        return formationRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Formation \"" + slug + "\" non trouvée"));
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Utilisateur introuvable"));
    }

    private boolean isPurchased(Formation formation, String email) {
        return userRepository.findByEmail(email)
                .map(u -> purchaseRepository.existsByUserIdAndFormationId(u.getId(), formation.getId()))
                .orElse(false);
    }

    private void applyRequest(Formation formation, FormationRequest req) {
        formation.setTitle(req.getTitle());
        formation.setShortDescription(req.getShortDescription());
        formation.setLongDescription(req.getLongDescription());
        formation.setCategory(req.getCategory());
        formation.setLevel(parseLevel(req.getLevel()));
        formation.setLanguage(parseLanguage(req.getLanguage()));
        formation.setPrice(req.getPrice());
        formation.setCoverImage(req.getCoverImage());
        formation.setPreviewVideo(req.getPreviewVideo());
        formation.setStudentsCount(req.getStudentsCount() != null ? req.getStudentsCount() : 0);
        formation.setAverageRating(req.getAverageRating() != null ? req.getAverageRating() : 0.0);
        formation.setReviewsCount(req.getReviewsCount() != null ? req.getReviewsCount() : 0);
        formation.setObjectives(req.getObjectives() != null ? req.getObjectives() : new ArrayList<>());
        formation.setSkills(req.getSkills() != null ? req.getSkills() : new ArrayList<>());
        formation.setPrerequisites(req.getPrerequisites() != null ? req.getPrerequisites() : new ArrayList<>());
        formation.setInstructor(toInstructor(req.getInstructor()));
        formation.setChapters(toChapters(req.getChapters(), formation));
    }

    private void applyRequestForUpdate(Formation formation, FormationRequest req) {
        formation.setTitle(req.getTitle());
        formation.setShortDescription(req.getShortDescription());
        formation.setLongDescription(req.getLongDescription());
        formation.setCategory(req.getCategory());
        formation.setLevel(parseLevel(req.getLevel()));
        formation.setLanguage(parseLanguage(req.getLanguage()));
        formation.setPrice(req.getPrice());
        formation.setCoverImage(req.getCoverImage());
        formation.setPreviewVideo(req.getPreviewVideo());
        formation.setStudentsCount(req.getStudentsCount() != null ? req.getStudentsCount() : formation.getStudentsCount());
        formation.setAverageRating(req.getAverageRating() != null ? req.getAverageRating() : formation.getAverageRating());
        formation.setReviewsCount(req.getReviewsCount() != null ? req.getReviewsCount() : formation.getReviewsCount());
        formation.setObjectives(req.getObjectives() != null ? req.getObjectives() : new ArrayList<>());
        formation.setSkills(req.getSkills() != null ? req.getSkills() : new ArrayList<>());
        formation.setPrerequisites(req.getPrerequisites() != null ? req.getPrerequisites() : new ArrayList<>());
        formation.setInstructor(toInstructor(req.getInstructor()));
        mergeChapters(formation, req.getChapters());
    }

    private void mergeChapters(Formation formation, List<ChapterDto> dtos) {
        if (dtos == null) dtos = new ArrayList<>();
        Map<Long, Chapter> existingChapters = new java.util.HashMap<>();
        for (Chapter ch : formation.getChapters()) {
            existingChapters.put(ch.getId(), ch);
        }

        List<Chapter> merged = new ArrayList<>();
        for (ChapterDto dto : dtos) {
            Chapter chapter;
            if (dto.getId() != null && existingChapters.containsKey(dto.getId())) {
                chapter = existingChapters.remove(dto.getId());
                chapter.setOrder(dto.getOrder());
                chapter.setTitle(dto.getTitle());
                mergeCapsules(chapter, dto.getCapsules());
            } else {
                chapter = Chapter.builder()
                        .order(dto.getOrder())
                        .title(dto.getTitle())
                        .formation(formation)
                        .build();
                chapter.setCapsules(buildCapsules(dto.getCapsules(), chapter));
            }
            merged.add(chapter);
        }

        for (Chapter removed : existingChapters.values()) {
            for (Capsule cap : removed.getCapsules()) {
                progressRepository.deleteByCapsuleId(cap.getId());
            }
        }

        formation.getChapters().clear();
        formation.getChapters().addAll(merged);
    }

    private void mergeCapsules(Chapter chapter, List<CapsuleDto> dtos) {
        if (dtos == null) dtos = new ArrayList<>();
        Map<Long, Capsule> existingCaps = new java.util.HashMap<>();
        for (Capsule c : chapter.getCapsules()) {
            existingCaps.put(c.getId(), c);
        }

        List<Capsule> merged = new ArrayList<>();
        for (CapsuleDto dto : dtos) {
            Capsule cap;
            if (dto.getId() != null && existingCaps.containsKey(dto.getId())) {
                cap = existingCaps.remove(dto.getId());
                cap.setOrder(dto.getOrder());
                cap.setTitle(dto.getTitle());
                cap.setDescription(dto.getDescription());
                cap.setDuration(dto.getDuration());
                cap.setThumbnail(dto.getThumbnail());
                cap.setVideoUrl(dto.getVideoUrl());
            } else {
                cap = Capsule.builder()
                        .order(dto.getOrder())
                        .title(dto.getTitle())
                        .description(dto.getDescription())
                        .duration(dto.getDuration())
                        .thumbnail(dto.getThumbnail())
                        .videoUrl(dto.getVideoUrl())
                        .chapter(chapter)
                        .build();
            }
            merged.add(cap);
        }

        for (Capsule removed : existingCaps.values()) {
            progressRepository.deleteByCapsuleId(removed.getId());
        }

        chapter.getCapsules().clear();
        chapter.getCapsules().addAll(merged);
    }

    private List<Capsule> buildCapsules(List<CapsuleDto> dtos, Chapter chapter) {
        List<Capsule> capsules = new ArrayList<>();
        if (dtos == null) return capsules;
        for (CapsuleDto capDto : dtos) {
            capsules.add(Capsule.builder()
                    .order(capDto.getOrder())
                    .title(capDto.getTitle())
                    .description(capDto.getDescription())
                    .duration(capDto.getDuration())
                    .thumbnail(capDto.getThumbnail())
                    .videoUrl(capDto.getVideoUrl())
                    .chapter(chapter)
                    .build());
        }
        return capsules;
    }

    private List<Chapter> toChapters(List<ChapterDto> dtos, Formation formation) {
        List<Chapter> chapters = new ArrayList<>();
        if (dtos == null) return chapters;

        for (ChapterDto dto : dtos) {
            Chapter chapter = Chapter.builder()
                    .order(dto.getOrder())
                    .title(dto.getTitle())
                    .formation(formation)
                    .build();

            List<Capsule> capsules = new ArrayList<>();
            if (dto.getCapsules() != null) {
                for (CapsuleDto capDto : dto.getCapsules()) {
                    capsules.add(Capsule.builder()
                            .order(capDto.getOrder())
                            .title(capDto.getTitle())
                            .description(capDto.getDescription())
                            .duration(capDto.getDuration())
                            .thumbnail(capDto.getThumbnail())
                            .videoUrl(capDto.getVideoUrl())
                            .chapter(chapter)
                            .build());
                }
            }
            chapter.setCapsules(capsules);
            chapters.add(chapter);
        }
        return chapters;
    }

    private Instructor toInstructor(InstructorDto dto) {
        return Instructor.builder()
                .name(dto.getName())
                .specialty(dto.getSpecialty())
                .experienceYears(dto.getExperienceYears())
                .bio(dto.getBio())
                .photo(dto.getPhoto())
                .totalFormations(dto.getTotalFormations() != null ? dto.getTotalFormations() : 0)
                .averageRating(dto.getAverageRating() != null ? dto.getAverageRating() : 0.0)
                .studentsTrained(dto.getStudentsTrained() != null ? dto.getStudentsTrained() : 0)
                .build();
    }

    private FormationLevel parseLevel(String value) {
        try {
            return FormationLevel.valueOf(value.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Niveau invalide : \"" + value + "\" (attendu : debutant, intermediaire, avance)");
        }
    }

    private FormationLanguage parseLanguage(String value) {
        try {
            return FormationLanguage.valueOf(value.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Langue invalide : \"" + value + "\" (attendu : francais, arabe, anglais, espagnol)");
        }
    }

    private int totalDuration(Formation formation) {
        return formation.getChapters().stream()
                .flatMap(ch -> ch.getCapsules().stream())
                .mapToInt(Capsule::getDuration)
                .sum();
    }

    private FormationSummaryResponse toSummary(Formation f) {
        int chaptersCount = f.getChapters().size();
        int capsulesCount = f.getChapters().stream().mapToInt(ch -> ch.getCapsules().size()).sum();

        return new FormationSummaryResponse(
                f.getId(),
                f.getSlug(),
                f.getTitle(),
                f.getShortDescription(),
                f.getCategory(),
                f.getLevel().name(),
                f.getLanguage().name(),
                f.getPrice(),
                f.getCoverImage(),
                totalDuration(f),
                chaptersCount,
                capsulesCount,
                f.getStudentsCount(),
                f.getAverageRating(),
                f.getReviewsCount(),
                toInstructorDto(f.getInstructor())
        );
    }

    private FormationDetailResponse toDetail(Formation f, boolean purchased) {
        Hibernate.initialize(f.getObjectives());
        Hibernate.initialize(f.getSkills());
        Hibernate.initialize(f.getPrerequisites());
        Hibernate.initialize(f.getChapters());
        if (f.getChapters() != null) {
            for (Chapter ch : f.getChapters()) {
                Hibernate.initialize(ch.getCapsules());
            }
        }

        List<ChapterDto> chapters = f.getChapters().stream()
                .map(ch -> new ChapterDto(
                        ch.getId(),
                        ch.getOrder(),
                        ch.getTitle(),
                        ch.getCapsules().stream()
                                .map(c -> new CapsuleDto(
                                        c.getId(),
                                        c.getOrder(),
                                        c.getTitle(),
                                        c.getDescription(),
                                        c.getDuration(),
                                        c.getThumbnail(),
                                        // la vidéo n'est exposée qu'après achat
                                        purchased ? c.getVideoUrl() : null
                                ))
                                .collect(Collectors.toList())
                ))
                .toList();

        return new FormationDetailResponse(
                f.getId(),
                f.getSlug(),
                f.getTitle(),
                f.getShortDescription(),
                f.getLongDescription(),
                f.getCategory(),
                f.getLevel().name(),
                f.getLanguage().name(),
                f.getPrice(),
                f.getCoverImage(),
                f.getPreviewVideo(),
                totalDuration(f),
                f.getStudentsCount(),
                f.getAverageRating(),
                f.getReviewsCount(),
                f.getObjectives(),
                f.getSkills(),
                f.getPrerequisites(),
                chapters,
                toInstructorDto(f.getInstructor()),
                f.getCreatedAt(),
                purchased
        );
    }

    private InstructorDto toInstructorDto(Instructor i) {
        if (i == null) return null;
        return new InstructorDto(
                i.getName(),
                i.getSpecialty(),
                i.getExperienceYears(),
                i.getBio(),
                i.getPhoto(),
                i.getTotalFormations(),
                i.getAverageRating(),
                i.getStudentsTrained()
        );
    }
}
