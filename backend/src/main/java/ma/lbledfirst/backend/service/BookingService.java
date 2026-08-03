package ma.lbledfirst.backend.service;

import ma.lbledfirst.backend.domain.Booking;
import ma.lbledfirst.backend.domain.BookingStatus;
import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.ExperienceStatus;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.repository.BookingRepository;
import ma.lbledfirst.backend.repository.ExperienceRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class BookingService extends AbstractCrudService<Booking, Long> {

    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository repository,
                           ExperienceRepository experienceRepository,
                           UserRepository userRepository) {
        super(repository);
        this.experienceRepository = experienceRepository;
        this.userRepository = userRepository;
        this.bookingRepository = repository;
    }

    private static boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(g -> "ROLE_ADMIN".equals(g.getAuthority()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> findAll() {
        List<Booking> list = super.findAll();
        for (Booking b : list) {
            Hibernate.initialize(b.getTourist());
            Hibernate.initialize(b.getExperience());
            if (b.getExperience() != null) {
                Hibernate.initialize(b.getExperience().getHost());
                if (b.getExperience().getRegion() != null) {
                    Hibernate.initialize(b.getExperience().getRegion());
                }
            }
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<Booking> findMyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User not found"));

        List<Booking> list = bookingRepository.findByTouristId(user.getId());
        for (Booking b : list) {
            Hibernate.initialize(b.getTourist());
            Hibernate.initialize(b.getExperience());
            if (b.getExperience() != null) {
                Hibernate.initialize(b.getExperience().getHost());
                if (b.getExperience().getRegion() != null) {
                    Hibernate.initialize(b.getExperience().getRegion());
                }
            }
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public Booking findById(Long id) {
        Booking b = super.findById(id);
        Hibernate.initialize(b.getTourist());
        Hibernate.initialize(b.getExperience());
        if (b.getExperience() != null) {
            Hibernate.initialize(b.getExperience().getHost());
            if (b.getExperience().getRegion() != null) {
                Hibernate.initialize(b.getExperience().getRegion());
            }
        }
        return b;
    }

    @Override
    @Transactional
    public Booking save(Booking booking) {
        if (booking.getExperience() == null || booking.getExperience().getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Experience is required");
        }
        if (booking.getTourist() == null || booking.getTourist().getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Tourist is required");
        }

        Experience experience = experienceRepository.findById(booking.getExperience().getId())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Experience not found"));
        User tourist = userRepository.findById(booking.getTourist().getId())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Tourist not found"));

        if (!isCurrentUserAdmin() && experience.getStatus() != ExperienceStatus.published) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot book an experience that is not published");
        }

        if (experience.getHost() != null && tourist.getId().equals(experience.getHost().getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "An owner cannot book their own experience");
        }

        booking.setExperience(experience);
        booking.setTourist(tourist);
        if (booking.getTotalPrice() == null) {
            booking.setTotalPrice(experience.getPrice());
        }
        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.pending);
        }
        if (booking.getGuests() == null || booking.getGuests() < 1) {
            booking.setGuests(1);
        }

        Booking saved = super.save(booking);
        Hibernate.initialize(saved.getTourist());
        Hibernate.initialize(saved.getExperience());
        if (saved.getExperience() != null) {
            Hibernate.initialize(saved.getExperience().getHost());
            if (saved.getExperience().getRegion() != null) {
                Hibernate.initialize(saved.getExperience().getRegion());
            }
        }
        return saved;
    }

    @Override
    @Transactional
    public Booking update(Long id, Booking booking) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getExperience() != null && booking.getExperience().getId() != null) {
            Experience exp = experienceRepository.findById(booking.getExperience().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Experience not found"));
            existing.setExperience(exp);
        }
        if (booking.getTourist() != null && booking.getTourist().getId() != null) {
            User t = userRepository.findById(booking.getTourist().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Tourist not found"));
            existing.setTourist(t);
        }
        if (booking.getDate() != null) existing.setDate(booking.getDate());
        if (booking.getStatus() != null) existing.setStatus(booking.getStatus());
        if (booking.getTotalPrice() != null) existing.setTotalPrice(booking.getTotalPrice());
        if (booking.getGuests() != null) existing.setGuests(booking.getGuests());

        Booking saved = bookingRepository.save(existing);
        Hibernate.initialize(saved.getTourist());
        Hibernate.initialize(saved.getExperience());
        if (saved.getExperience() != null) {
            Hibernate.initialize(saved.getExperience().getHost());
            if (saved.getExperience().getRegion() != null) {
                Hibernate.initialize(saved.getExperience().getRegion());
            }
        }
        return saved;
    }
}
