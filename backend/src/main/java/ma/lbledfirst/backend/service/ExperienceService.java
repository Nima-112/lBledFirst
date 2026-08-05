package ma.lbledfirst.backend.service;

import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.ExperienceStatus;
import ma.lbledfirst.backend.domain.Region;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.repository.BookingRepository;
import ma.lbledfirst.backend.repository.ExperienceRepository;
import ma.lbledfirst.backend.repository.RegionRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ExperienceService extends AbstractCrudService<Experience, Long> {

    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final BookingRepository bookingRepository;

    public ExperienceService(ExperienceRepository repository,
                             UserRepository userRepository,
                             RegionRepository regionRepository,
                             BookingRepository bookingRepository) {
        super(repository);
        this.experienceRepository = repository;
        this.userRepository = userRepository;
        this.regionRepository = regionRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Experience> findAll() {
        List<Experience> list = experienceRepository.findByDeletedFalse();
        for (Experience e : list) {
            Hibernate.initialize(e.getCoverImages());
            Hibernate.initialize(e.getDayPrograms());
            Hibernate.initialize(e.getHost());
            if (e.getRegion() != null) Hibernate.initialize(e.getRegion());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<Experience> findPublishedByRegion(Long regionId) {
        List<Experience> list = experienceRepository.findByRegionIdAndStatusAndDeletedFalse(
                regionId, ExperienceStatus.published);
        for (Experience e : list) {
            Hibernate.initialize(e.getCoverImages());
            Hibernate.initialize(e.getDayPrograms());
            Hibernate.initialize(e.getHost());
            if (e.getRegion() != null) Hibernate.initialize(e.getRegion());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Page<Experience> findAllPaged(Pageable pageable) {
        List<Experience> all = findAll();
        List<Experience> filtered = new java.util.ArrayList<>(all);
        filtered.sort(sortFromPageable(pageable));
        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);
        List<Experience> pageContent = start >= total ? List.of() : filtered.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, total);
    }

    @Transactional(readOnly = true)
    public Page<Experience> findPublishedPaged(Pageable pageable) {
        List<Experience> all = findAll();
        List<Experience> filtered = all.stream()
                .filter(e -> e.getStatus() == ExperienceStatus.published)
                .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));
        filtered.sort(sortFromPageable(pageable));
        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);
        List<Experience> pageContent = start >= total ? List.of() : filtered.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, total);
    }

    private java.util.Comparator<Experience> sortFromPageable(Pageable pageable) {
        if (pageable == null || pageable.getSort() == null || pageable.getSort().isUnsorted()) {
            return (a, b) -> -java.util.Objects.compare(a.getCreatedAt(), b.getCreatedAt(), java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
        }
        java.util.Comparator<Experience> cmp = null;
        for (org.springframework.data.domain.Sort.Order order : pageable.getSort()) {
            java.util.Comparator<Experience> fieldCmp = switch (order.getProperty()) {
                case "createdAt" ->
                    (a, b) -> java.util.Objects.compare(a.getCreatedAt(), b.getCreatedAt(), java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
                case "price" ->
                    (a, b) -> java.util.Objects.compare(a.getPrice(), b.getPrice(), java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
                case "duration", "durationDays" ->
                    (a, b) -> java.util.Objects.compare(a.getDuration(), b.getDuration(), java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
                case "title" ->
                    (a, b) -> java.util.Objects.compare(a.getTitle(), b.getTitle(), java.util.Comparator.nullsFirst(java.util.Comparator.naturalOrder()));
                case "city", "region" ->
                    (a, b) -> java.util.Objects.compare(a.getCity(), b.getCity(), java.util.Comparator.nullsFirst(java.util.Comparator.naturalOrder()));
                default ->
                    (a, b) -> java.util.Objects.compare(a.getId(), b.getId(), java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
            };
            if (order.isDescending()) fieldCmp = fieldCmp.reversed();
            cmp = cmp == null ? fieldCmp : cmp.thenComparing(fieldCmp);
        }
        return cmp;
    }

    @Override
    @Transactional(readOnly = true)
    public Experience findById(Long id) {
        Experience e = super.findById(id);
        if (Boolean.TRUE.equals(e.getDeleted())) {
            throw new ResponseStatusException(NOT_FOUND, "Experience not found");
        }
        Hibernate.initialize(e.getCoverImages());
        Hibernate.initialize(e.getDayPrograms());
        Hibernate.initialize(e.getHost());
        if (e.getRegion() != null) Hibernate.initialize(e.getRegion());
        return e;
    }

    @Override
    @Transactional
    public Experience save(Experience experience) {
        resolveOwner(experience);
        resolveRegion(experience);
        if (experience.getStatus() == null) {
            experience.setStatus(ExperienceStatus.draft);
        } else {
            experience.setStatus(ExperienceStatus.draft);
        }
        if (experience.getCreatedAt() == null) {
            experience.setCreatedAt(LocalDateTime.now());
        }
        Experience saved = super.save(experience);
        Hibernate.initialize(saved.getHost());
        if (saved.getRegion() != null) Hibernate.initialize(saved.getRegion());
        Hibernate.initialize(saved.getCoverImages());
        Hibernate.initialize(saved.getDayPrograms());
        return saved;
    }

    @Override
    @Transactional
    public Experience update(Long id, Experience experience) {
        Experience existing = experienceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Experience not found"));

        if (experience.getHost() != null && experience.getHost().getId() != null
                && !existing.getHost().getId().equals(experience.getHost().getId())) {
            User owner = userRepository.findById(experience.getHost().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Owner user not found"));
            existing.setHost(owner);
        }

        if (experience.getRegion() != null && experience.getRegion().getId() != null) {
            if (existing.getRegion() == null || !experience.getRegion().getId().equals(existing.getRegion().getId())) {
                Region region = regionRepository.findById(experience.getRegion().getId())
                        .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Region not found"));
                existing.setRegion(region);
            }
        }

        if (experience.getTitle() != null) existing.setTitle(experience.getTitle());
        if (experience.getDescription() != null) existing.setDescription(experience.getDescription());
        if (experience.getPrice() != null) existing.setPrice(experience.getPrice());
        if (experience.getDuration() != null) existing.setDuration(experience.getDuration());
        if (experience.getCategory() != null) existing.setCategory(experience.getCategory());
        if (experience.getStatus() != null) existing.setStatus(experience.getStatus());
        if (experience.getCity() != null) existing.setCity(experience.getCity());
        if (experience.getLatitude() != null) existing.setLatitude(experience.getLatitude());
        if (experience.getLongitude() != null) existing.setLongitude(experience.getLongitude());
        if (experience.getCoverImages() != null) existing.setCoverImages(experience.getCoverImages());
        if (experience.getDayPrograms() != null) existing.setDayPrograms(experience.getDayPrograms());

        Experience saved = experienceRepository.save(existing);
        Hibernate.initialize(saved.getHost());
        if (saved.getRegion() != null) Hibernate.initialize(saved.getRegion());
        Hibernate.initialize(saved.getCoverImages());
        Hibernate.initialize(saved.getDayPrograms());
        return saved;
    }

    @Transactional
    public Experience publish(Long id) {
        Experience experience = findById(id);
        experience.setStatus(ExperienceStatus.published);
        Experience saved = experienceRepository.save(experience);
        Hibernate.initialize(saved.getHost());
        if (saved.getRegion() != null) Hibernate.initialize(saved.getRegion());
        return saved;
    }

    private void resolveOwner(Experience experience) {
        if (experience.getHost() == null || experience.getHost().getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Owner is required");
        }
        User owner = userRepository.findById(experience.getHost().getId())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Owner user not found"));
        experience.setHost(owner);

        if (experience.getLatitude() == null) experience.setLatitude(BigDecimal.ZERO);
        if (experience.getLongitude() == null) experience.setLongitude(BigDecimal.ZERO);
        if (experience.getCity() == null) experience.setCity("");
    }

    private void resolveRegion(Experience experience) {
        if (experience.getRegion() != null && experience.getRegion().getId() != null) {
            Region region = regionRepository.findById(experience.getRegion().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Region not found"));
            experience.setRegion(region);
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Experience not found"));
        experience.setDeleted(Boolean.TRUE);
        experienceRepository.save(experience);
    }
}
