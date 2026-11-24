package ma.lbledfirst.backend.service;

import ma.lbledfirst.backend.domain.Booking;
import ma.lbledfirst.backend.domain.BookingStatus;
import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.ExperienceStatus;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.dto.BookingRequest;
import ma.lbledfirst.backend.dto.BookingResponse;
import ma.lbledfirst.backend.dto.UserResponse;
import ma.lbledfirst.backend.repository.BookingRepository;
import ma.lbledfirst.backend.repository.ExperienceRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

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

    private UserResponse mapToUserResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getPhone(),
                user.getCountry(),
                user.getLanguage(),
                user.getAvatar(),
                user.isEmailVerified()
        );
    }

    private BookingResponse mapToResponse(Booking b) {
        if (b == null) return null;
        return new BookingResponse(
                b.getId(),
                mapToUserResponse(b.getTourist()),
                b.getExperience(),
                b.getDate(),
                b.getStatus(),
                b.getTotalPrice(),
                b.getGuests(),
                b.getCreatedAt()
        );
    }

    private void initializeLazyFields(Booking b) {
        if (b == null) return;
        Hibernate.initialize(b.getTourist());
        Hibernate.initialize(b.getExperience());
        if (b.getExperience() != null) {
            Hibernate.initialize(b.getExperience().getHost());
            if (b.getExperience().getRegion() != null) {
                Hibernate.initialize(b.getExperience().getRegion());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findAllDto() {
        List<Booking> list = bookingRepository.findAll();
        list.forEach(this::initializeLazyFields);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findMyBookingsDto(String email) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<Booking> list = bookingRepository.findByTouristId(user.getId());
        list.forEach(this::initializeLazyFields);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse findByIdDto(Long id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        initializeLazyFields(b);
        return mapToResponse(b);
    }

    @Transactional
    public BookingResponse createDto(BookingRequest req, String currentTouristEmail) {
        if (req.getExperience() == null || req.getExperience().getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Experience is required");
        }

        User tourist;
        if (isCurrentUserAdmin() && req.getTourist() != null && req.getTourist().getId() != null) {
            tourist = userRepository.findById(req.getTourist().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Tourist not found"));
        } else {
            if (currentTouristEmail == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            }
            tourist = userRepository.findByEmail(currentTouristEmail)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        }

        Experience experience = experienceRepository.findById(req.getExperience().getId())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Experience not found"));

        if (!isCurrentUserAdmin() && experience.getStatus() != ExperienceStatus.published) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot book an experience that is not published");
        }

        if (experience.getHost() != null && tourist.getId().equals(experience.getHost().getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "An owner cannot book their own experience");
        }

        int guests = req.getGuests() != null && req.getGuests() >= 1 ? req.getGuests() : 1;
        java.math.BigDecimal basePrice = experience.getPrice().multiply(java.math.BigDecimal.valueOf(guests));
        java.math.BigDecimal finalPrice = basePrice;
        if (req.getTotalPrice() != null) {
            java.math.BigDecimal clientPrice = req.getTotalPrice();
            java.math.BigDecimal priceWithFee = basePrice.add(java.math.BigDecimal.valueOf(45));
            if (clientPrice.compareTo(basePrice) != 0 && clientPrice.compareTo(priceWithFee) != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid booking price");
            }
            finalPrice = clientPrice;
        }

        Booking booking = Booking.builder()
                .experience(experience)
                .tourist(tourist)
                .date(req.getDate())
                .totalPrice(finalPrice)
                .status(req.getStatus() != null ? req.getStatus() : BookingStatus.pending)
                .guests(guests)
                .build();

        Booking saved = bookingRepository.save(booking);
        initializeLazyFields(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse updateDto(Long id, BookingRequest req) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (req.getExperience() != null && req.getExperience().getId() != null) {
            Experience exp = experienceRepository.findById(req.getExperience().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Experience not found"));
            existing.setExperience(exp);
        }
        if (req.getTourist() != null && req.getTourist().getId() != null) {
            User t = userRepository.findById(req.getTourist().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Tourist not found"));
            existing.setTourist(t);
        }
        if (req.getDate() != null) existing.setDate(req.getDate());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());
        if (req.getTotalPrice() != null) existing.setTotalPrice(req.getTotalPrice());
        if (req.getGuests() != null) existing.setGuests(req.getGuests());

        Booking saved = bookingRepository.save(existing);
        initializeLazyFields(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse cancelDto(Long id, String email, boolean isAdmin) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!isAdmin && !booking.getTourist().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }
        if (booking.getStatus() == BookingStatus.completed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a completed booking");
        }
        if (booking.getStatus() == BookingStatus.cancelled) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.cancelled);
        Booking saved = bookingRepository.save(booking);
        initializeLazyFields(saved);
        return mapToResponse(saved);
    }

    // Keep entities methods for backwards compatibility
    @Override
    @Transactional(readOnly = true)
    public List<Booking> findAll() {
        List<Booking> list = super.findAll();
        list.forEach(this::initializeLazyFields);
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public Booking findById(Long id) {
        Booking b = super.findById(id);
        initializeLazyFields(b);
        return b;
    }

    @Override
    @Transactional
    public Booking save(Booking booking) {
        initializeLazyFields(booking);
        return super.save(booking);
    }

    @Override
    @Transactional
    public Booking update(Long id, Booking booking) {
        initializeLazyFields(booking);
        return super.update(id, booking);
    }
}
