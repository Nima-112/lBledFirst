package ma.lbledfirst.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
import ma.lbledfirst.backend.domain.UserRole;
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
import ma.lbledfirst.backend.repository.ReviewRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final CapsuleRepository capsuleRepository;
    private final FormationPurchaseRepository purchaseRepository;
    private final FormationFavoriteRepository favoriteRepository;
    private final FormationCapsuleProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final CapsuleProcessingService capsuleProcessingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

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

        boolean completed = false;
        boolean reviewed = false;
        if (currentUserEmail != null) {
            User user = userRepository.findByEmail(currentUserEmail).orElse(null);
            if (user != null) {
                completed = purchased && isFormationCompleted(formation, user.getId());
                reviewed = reviewRepository.findByTouristIdAndFormationId(user.getId(), formation.getId()).isPresent();
            }
        }

        return toDetail(formation, purchased, completed, reviewed);
    }

    @Transactional(readOnly = true)
    public FormationDetailResponse getFormationForEdit(String slug) {
        Formation formation = findBySlugOrThrow(slug);
        // For EDIT endpoint: always include ALL videoUrls (admin needs them),
        // regardless of purchase status. Pass purchased=false so we don't
        // accidentally leak the "purchased" flag — we only care about videos.
        return toDetailForEdit(formation);
    }

    private FormationDetailResponse toDetailForEdit(Formation f) {
        Hibernate.initialize(f.getObjectives());
        Hibernate.initialize(f.getSkills());
        Hibernate.initialize(f.getPrerequisites());
        Hibernate.initialize(f.getChapters());
        if (f.getChapters() != null) {
            for (Chapter ch : f.getChapters()) {
                Hibernate.initialize(ch.getCapsules());
            }
        }

        int realStudentsCount = (int) purchaseRepository.countByFormationId(f.getId());
        int realFavoritesCount = (int) favoriteRepository.countByFormationId(f.getId());
        int realReviewsCount = (int) reviewRepository.countByFormationId(f.getId());
        double realAverageRating = reviewRepository.averageRatingByFormationId(f.getId());

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
                                        sanitizeUrl(c.getThumbnail()),
                                        sanitizeUrl(c.getVideoUrl()),  // Always include for admin edit
                                        c.getProcessingStatus()
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
                sanitizeUrl(f.getCoverImage()),
                sanitizeUrl(f.getPreviewVideo()),
                totalDuration(f),
                realStudentsCount,
                realFavoritesCount,
                realAverageRating,
                realReviewsCount,
                f.getObjectives(),
                f.getSkills(),
                f.getPrerequisites(),
                chapters,
                f.getFormateur() != null ? f.getFormateur().getId() : null,
                toInstructorDto(f.getInstructor()),
                f.getCreatedAt(),
                false, // purchased
                false, // completed
                false  // reviewed
        );
    }

    private boolean isFormationCompleted(Formation formation, Long userId) {
        int totalCapsules = formation.getChapters().stream()
                .mapToInt(ch -> ch.getCapsules().size())
                .sum();
        if (totalCapsules == 0) return false;
        long completedCapsules = progressRepository
                .findByUserIdAndCapsule_Chapter_Formation_Id(userId, formation.getId())
                .size();
        return completedCapsules >= totalCapsules;
    }

    @Transactional
    public FormationDetailResponse createFormation(FormationRequest req) {
        if (formationRepository.existsBySlug(req.getSlug())) {
            throw new FormationAlreadyExistsException("Une formation avec ce slug existe deja");
        }

        Formation formation = Formation.builder()
                .slug(req.getSlug())
                .build();
        applyRequest(formation, req);
        formationRepository.save(formation);
        triggerCapsuleProcessing(formation);

        return toDetail(formation, false, false, false);
    }

    @Transactional
    public FormationDetailResponse updateFormation(String slug, FormationRequest req) {
        Formation formation = findBySlugOrThrow(slug);

        if (!formation.getSlug().equals(req.getSlug()) && formationRepository.existsBySlug(req.getSlug())) {
            throw new FormationAlreadyExistsException("Une formation avec ce slug existe deja");
        }
        formation.setSlug(req.getSlug());
        applyRequestForUpdate(formation, req);
        formationRepository.save(formation);
        triggerCapsuleProcessing(formation);

        return toDetail(formation, false, false, false);
    }

    @Transactional
    public void deleteFormation(String slug) {
        Formation formation = findBySlugOrThrow(slug);
        Long id = formation.getId();
        progressRepository.deleteByCapsule_Chapter_Formation_Id(id);
        favoriteRepository.deleteByFormationId(id);
        purchaseRepository.deleteByFormationId(id);
        reviewRepository.deleteByFormationId(id);
        formationRepository.delete(formation);
    }

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
                .orElseThrow(() -> new NotFoundException("Capsule " + capsuleId + " non trouvee"));
        if (!capsule.getChapter().getFormation().getId().equals(formation.getId())) {
            throw new NotFoundException("Cette capsule n'appartient pas a cette formation");
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

    @Transactional(readOnly = true)
    public JsonNode getCapsuleCaptions(String slug, Long capsuleId, String email) {
        Formation formation = findBySlugOrThrow(slug);

        if (email == null || !isPurchased(formation, email)) {
            throw new FormationNotPurchasedException("Vous devez acheter cette formation pour acceder aux sous-titres");
        }

        Capsule capsule = capsuleRepository.findById(capsuleId)
                .orElseThrow(() -> new NotFoundException("Capsule " + capsuleId + " non trouvee"));
        if (!capsule.getChapter().getFormation().getId().equals(formation.getId())) {
            throw new NotFoundException("Cette capsule n'appartient pas a cette formation");
        }
        if (!"DONE".equals(capsule.getProcessingStatus())) {
            throw new NotFoundException("Les sous-titres de cette capsule ne sont pas encore disponibles");
        }

        try {
            return objectMapper.readTree(capsule.getTranslationJson());
        } catch (Exception e) {
            throw new RuntimeException("Impossible de lire les sous-titres pour la capsule " + capsuleId, e);
        }
    }

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

    private Formation findBySlugOrThrow(String slug) {
        return formationRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Formation \"" + slug + "\" non trouvee"));
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

    private String sanitizeUrl(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty()) return null;
        // Enlève les backticks parfois collés par l'admin quand il copie/colle
        // depuis Discord/Slack/Markdown : `https://...` → https://...
        while (s.startsWith("`")) s = s.substring(1).trim();
        while (s.endsWith("`")) s = s.substring(0, s.length() - 1).trim();
        if (s.isEmpty()) return null;
        s = s.replaceAll("\\s+", "");
        if (s.isEmpty()) return null;
        // Normalise les URLs absolues qui pointent vers /uploads/* du backend
        // (format déjà présent en base: http://localhost:8080/uploads/...).
        // On garde seulement le chemin relatif /uploads/* pour rester portable
        // entre dev (localhost) et la production.
        if (s.startsWith("/uploads/") || s.startsWith("/__l5e/")) {
            return s;
        }
        java.net.URI uri;
        try {
            uri = new java.net.URI(s);
        } catch (java.net.URISyntaxException ignore) {
            // Pas une URI http valide → renvoie telle quelle (probablement un
            // chemin ou une URL d'un autre format).
            return s;
        }
        String scheme = uri.getScheme();
        String path = uri.getPath();
        if (path == null || path.isEmpty()) return s;
        boolean uploadBackend = (
                path.startsWith("/uploads/")
                        && (scheme == null || scheme.equalsIgnoreCase("http")
                        || scheme.equalsIgnoreCase("https"))
        );
        return uploadBackend ? path : s;
    }

    private InstructorDto sanitizeInstructorUrls(InstructorDto i) {
        if (i == null) return null;
        return new InstructorDto(
                i.getName(),
                i.getSpecialty(),
                i.getExperienceYears(),
                i.getBio(),
                sanitizeUrl(i.getPhoto()),
                i.getTotalFormations(),
                i.getAverageRating(),
                i.getStudentsTrained()
        );
    }

    private void applyRequest(Formation formation, FormationRequest req) {
        formation.setTitle(req.getTitle());
        formation.setShortDescription(req.getShortDescription());
        formation.setLongDescription(req.getLongDescription());
        formation.setCategory(req.getCategory());
        formation.setLevel(parseLevel(req.getLevel()));
        formation.setLanguage(parseLanguage(req.getLanguage()));
        formation.setPrice(req.getPrice());
        formation.setCoverImage(sanitizeUrl(req.getCoverImage()));
        formation.setPreviewVideo(sanitizeUrl(req.getPreviewVideo()));
        formation.setStudentsCount(req.getStudentsCount() != null ? req.getStudentsCount() : 0);
        formation.setObjectives(req.getObjectives() != null ? req.getObjectives() : new ArrayList<>());
        formation.setSkills(req.getSkills() != null ? req.getSkills() : new ArrayList<>());
        formation.setPrerequisites(req.getPrerequisites() != null ? req.getPrerequisites() : new ArrayList<>());
        applyFormateur(formation, req);
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
        formation.setCoverImage(sanitizeUrl(req.getCoverImage()));
        formation.setPreviewVideo(sanitizeUrl(req.getPreviewVideo()));
        formation.setStudentsCount(req.getStudentsCount() != null ? req.getStudentsCount() : formation.getStudentsCount());
        formation.setObjectives(req.getObjectives() != null ? req.getObjectives() : new ArrayList<>());
        formation.setSkills(req.getSkills() != null ? req.getSkills() : new ArrayList<>());
        formation.setPrerequisites(req.getPrerequisites() != null ? req.getPrerequisites() : new ArrayList<>());
        applyFormateur(formation, req);
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
            String cleanVideo = sanitizeUrl(dto.getVideoUrl());
            String cleanThumb = sanitizeUrl(dto.getThumbnail());
            if (dto.getId() != null && existingCaps.containsKey(dto.getId())) {
                cap = existingCaps.remove(dto.getId());
                boolean videoChanged = cleanVideo != null && !cleanVideo.equals(cap.getVideoUrl());
                cap.setOrder(dto.getOrder());
                cap.setTitle(dto.getTitle());
                cap.setDescription(dto.getDescription());
                cap.setDuration(dto.getDuration());
                cap.setThumbnail(cleanThumb);
                if (cleanVideo != null) {
                    cap.setVideoUrl(cleanVideo);
                }
                if (videoChanged) {
                    cap.setProcessingStatus("PENDING");
                }
            } else {
                // NEW capsule: if it has a videoUrl, mark it PENDING so the
                // processing pipeline picks it up.
                String newStatus = (cleanVideo != null)
                        ? "PENDING"
                        : dto.getProcessingStatus();
                cap = Capsule.builder()
                        .order(dto.getOrder())
                        .title(dto.getTitle())
                        .description(dto.getDescription())
                        .duration(dto.getDuration())
                        .thumbnail(cleanThumb)
                        .videoUrl(cleanVideo)
                        .processingStatus(newStatus)
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
            // NEW capsule — mark PENDING when a videoUrl is provided so the
            // pipeline (transcription etc.) can run on it.
            String cleanVideo = sanitizeUrl(capDto.getVideoUrl());
            String cleanThumb = sanitizeUrl(capDto.getThumbnail());
            String status = (cleanVideo != null)
                    ? "PENDING"
                    : capDto.getProcessingStatus();
            capsules.add(Capsule.builder()
                    .order(capDto.getOrder())
                    .title(capDto.getTitle())
                    .description(capDto.getDescription())
                    .duration(capDto.getDuration())
                    .thumbnail(cleanThumb)
                    .videoUrl(cleanVideo)
                    .processingStatus(status)
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

            chapter.setCapsules(buildCapsules(dto.getCapsules(), chapter));
            chapters.add(chapter);
        }
        return chapters;
    }

    private void applyFormateur(Formation formation, FormationRequest req) {
        if (req.getFormateurId() != null) {
            User formateur = userRepository.findById(req.getFormateurId())
                    .orElseThrow(() -> new NotFoundException("Formateur introuvable"));
            if (formateur.getRole() != UserRole.formateur) {
                throw new IllegalArgumentException("L'utilisateur sélectionné n'est pas formateur");
            }
            formation.setFormateur(formateur);
            formation.setInstructor(instructorFromUser(formateur));
            return;
        }
        if (req.getInstructor() != null) {
            formation.setInstructor(toInstructor(req.getInstructor()));
        }
    }

    private Instructor instructorFromUser(User user) {
        return Instructor.builder()
                .name(user.getName())
                .specialty(user.getSpecialty())
                .experienceYears(user.getExperienceYears() != null ? user.getExperienceYears() : 0)
                .bio(user.getBio())
                .photo(user.getAvatar())
                .totalFormations(0)
                .averageRating(0.0)
                .studentsTrained(0)
                .build();
    }

    private Instructor toInstructor(InstructorDto dto) {
        return Instructor.builder()
                .name(dto.getName())
                .specialty(dto.getSpecialty())
                .experienceYears(dto.getExperienceYears())
                .bio(dto.getBio())
                .photo(sanitizeUrl(dto.getPhoto()))
                .totalFormations(dto.getTotalFormations() != null ? dto.getTotalFormations() : 0)
                .averageRating(dto.getAverageRating() != null ? dto.getAverageRating() : 0.0)
                .studentsTrained(dto.getStudentsTrained() != null ? dto.getStudentsTrained() : 0)
                .build();
    }

    private FormationLevel parseLevel(String value) {
        try {
            return FormationLevel.valueOf(value.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Niveau invalide : \"" + value + "\"");
        }
    }

    private FormationLanguage parseLanguage(String value) {
        try {
            return FormationLanguage.valueOf(value.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Langue invalide : \"" + value + "\"");
        }
    }

    private int totalDuration(Formation formation) {
        if (formation.getChapters() == null) return 0;
        // Defensive: ensure capsules are initialized (in case of LAZY hibernate
        // proxy outside of toSummary / toDetail). Hibernate.initialize on a
        // collection twice is a no-op so this is cheap.
        for (Chapter ch : formation.getChapters()) {
            Hibernate.initialize(ch.getCapsules());
        }
        return formation.getChapters().stream()
                .filter(Objects::nonNull)
                .map(Chapter::getCapsules)
                .filter(Objects::nonNull)
                .flatMap(java.util.Collection::stream)
                .filter(Objects::nonNull)
                .mapToInt(Capsule::getDuration)
                .sum();
    }

    private FormationSummaryResponse toSummary(Formation f) {
        // Collections are LAZY — we must initialize them within the
        // @Transactional(readOnly=true) session or size() silently returns 0.
        Hibernate.initialize(f.getChapters());
        if (f.getChapters() != null) {
            for (Chapter ch : f.getChapters()) {
                Hibernate.initialize(ch.getCapsules());
            }
        }
        int chaptersCount = f.getChapters() != null ? f.getChapters().size() : 0;
        int capsulesCount = chaptersCount == 0 ? 0 : f.getChapters().stream()
                .mapToInt(ch -> ch.getCapsules() != null ? ch.getCapsules().size() : 0)
                .sum();
        int realStudentsCount = (int) purchaseRepository.countByFormationId(f.getId());
        int realFavoritesCount = (int) favoriteRepository.countByFormationId(f.getId());
        int realReviewsCount = (int) reviewRepository.countByFormationId(f.getId());
        double realAverageRating = reviewRepository.averageRatingByFormationId(f.getId());

        return new FormationSummaryResponse(
                f.getId(),
                f.getSlug(),
                f.getTitle(),
                f.getShortDescription(),
                f.getCategory(),
                f.getLevel().name(),
                f.getLanguage().name(),
                f.getPrice(),
                sanitizeUrl(f.getCoverImage()),
                totalDuration(f),
                chaptersCount,
                capsulesCount,
                realStudentsCount,
                realFavoritesCount,
                realAverageRating,
                realReviewsCount,
                toInstructorDto(f.getInstructor()),
                f.getCreatedAt()
        );
    }

    private FormationDetailResponse toDetail(Formation f, boolean purchased, boolean completed, boolean reviewed) {
        Hibernate.initialize(f.getObjectives());
        Hibernate.initialize(f.getSkills());
        Hibernate.initialize(f.getPrerequisites());
        Hibernate.initialize(f.getChapters());
        if (f.getChapters() != null) {
            for (Chapter ch : f.getChapters()) {
                Hibernate.initialize(ch.getCapsules());
            }
        }

        int realStudentsCount = (int) purchaseRepository.countByFormationId(f.getId());
        int realFavoritesCount = (int) favoriteRepository.countByFormationId(f.getId());
        int realReviewsCount = (int) reviewRepository.countByFormationId(f.getId());
        double realAverageRating = reviewRepository.averageRatingByFormationId(f.getId());

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
                                        sanitizeUrl(c.getThumbnail()),
                                        purchased ? sanitizeUrl(c.getVideoUrl()) : null,
                                        c.getProcessingStatus()
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
                sanitizeUrl(f.getCoverImage()),
                sanitizeUrl(f.getPreviewVideo()),
                totalDuration(f),
                realStudentsCount,
                realFavoritesCount,
                realAverageRating,
                realReviewsCount,
                f.getObjectives(),
                f.getSkills(),
                f.getPrerequisites(),
                chapters,
                f.getFormateur() != null ? f.getFormateur().getId() : null,
                toInstructorDto(f.getInstructor()),
                f.getCreatedAt(),
                purchased,
                completed,
                reviewed
        );
    }

    private InstructorDto toInstructorDto(Instructor i) {
        if (i == null) return null;
        return new InstructorDto(
                i.getName(),
                i.getSpecialty(),
                i.getExperienceYears(),
                i.getBio(),
                sanitizeUrl(i.getPhoto()),
                i.getTotalFormations(),
                i.getAverageRating(),
                i.getStudentsTrained()
        );
    }

    private void triggerCapsuleProcessing(Formation formation) {
        List<Long> toProcess = new ArrayList<>();
        for (Chapter ch : formation.getChapters()) {
            for (Capsule cap : ch.getCapsules()) {
                if (cap.getId() == null) continue;
                if (cap.getVideoUrl() == null || cap.getVideoUrl().isBlank()) continue;
                String status = cap.getProcessingStatus();
                // On traite à la fois les nouvelles (PENDING) et les anciennes FAILED,
                // SKIPPED_NO_KEY / SKIPPED — ça permet un auto-relance quand :
                //  • l'utilisateur a renseigné OPENAI_API_KEY après-coup
                //  • on a corrigé un bug de pipeline (ex: mauvais mappage .env)
                if ("PENDING".equals(status) || "FAILED".equals(status)
                        || "SKIPPED_NO_KEY".equals(status)) {
                    cap.setProcessingStatus("PENDING");
                    toProcess.add(cap.getId());
                }
            }
        }
        if (toProcess.isEmpty()) {
            return;
        }
        // Persiste les PENDING éventuellement remis à jour (ex FAILED -> PENDING)
        capsuleRepository.saveAll(
                formation.getChapters().stream()
                        .flatMap(ch -> ch.getCapsules().stream())
                        .filter(cap -> toProcess.contains(cap.getId()))
                        .collect(java.util.stream.Collectors.toList())
        );
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    for (Long capsuleId : toProcess) {
                        capsuleProcessingService.processAsync(capsuleId);
                    }
                }
            });
        } else {
            for (Long capsuleId : toProcess) {
                capsuleProcessingService.processAsync(capsuleId);
            }
        }
    }

    /**
     * Force le retraitement d'une capsule précise (admin) — utile quand une
     * capsule a échoué, ou pour reprendre après avoir renseigné OPENAI_API_KEY
     * après-coup.
     *
     * @param formationSlug slug de la formation (pour contrôle d'appartenance)
     * @param capsuleId id de la capsule
     * @return true si le traitement a été (re)lancé.
     */
    @org.springframework.transaction.annotation.Transactional
    public boolean reprocessCapsule(String formationSlug, Long capsuleId) {
        Formation formation = findBySlugOrThrow(formationSlug);
        Capsule cap = formation.getChapters().stream()
                .flatMap(ch -> ch.getCapsules().stream())
                .filter(c -> capsuleId.equals(c.getId()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException(
                        "Capsule #" + capsuleId + " introuvable dans la formation " + formationSlug));
        if (cap.getVideoUrl() == null || cap.getVideoUrl().isBlank()) {
            throw new IllegalArgumentException("Cette capsule n'a pas de vidéo à traiter.");
        }
        Hibernate.initialize(formation.getChapters());
        cap.setProcessingStatus("PENDING");
        capsuleRepository.save(cap);
        final Long id = cap.getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    capsuleProcessingService.processAsync(id);
                }
            });
        } else {
            capsuleProcessingService.processAsync(id);
        }
        return true;
    }
}
