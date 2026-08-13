package ma.lbledfirst.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import ma.lbledfirst.backend.domain.Booking;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.dto.UserResponse;
import ma.lbledfirst.backend.dto.UserRequest;
import ma.lbledfirst.backend.dto.UserUpdateMeRequest;
import ma.lbledfirst.backend.dto.ChangePasswordRequest;
import ma.lbledfirst.backend.repository.BookingRepository;
import ma.lbledfirst.backend.repository.EmailVerificationTokenRepository;
import ma.lbledfirst.backend.repository.ExperienceRepository;
import ma.lbledfirst.backend.repository.FormationCapsuleProgressRepository;
import ma.lbledfirst.backend.repository.FormationFavoriteRepository;
import ma.lbledfirst.backend.repository.FormationPurchaseRepository;
import ma.lbledfirst.backend.repository.FormationRepository;
import ma.lbledfirst.backend.repository.NotificationRepository;
import ma.lbledfirst.backend.repository.PasswordResetTokenRepository;
import ma.lbledfirst.backend.repository.PaymentRepository;
import ma.lbledfirst.backend.repository.ReviewRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import ma.lbledfirst.backend.repository.VideoRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class UserService extends AbstractCrudService<User, Long> {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final FormationPurchaseRepository formationPurchaseRepository;
    private final FormationFavoriteRepository formationFavoriteRepository;
    private final FormationCapsuleProgressRepository formationCapsuleProgressRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final FormationRepository formationRepository;
    private final ExperienceRepository experienceRepository;
    private final VideoRepository videoRepository;

    public UserService(
            UserRepository repository,
            PasswordEncoder passwordEncoder,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            FormationPurchaseRepository formationPurchaseRepository,
            FormationFavoriteRepository formationFavoriteRepository,
            FormationCapsuleProgressRepository formationCapsuleProgressRepository,
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            NotificationRepository notificationRepository,
            FormationRepository formationRepository,
            ExperienceRepository experienceRepository,
            VideoRepository videoRepository) {
        super(repository);
        this.userRepository = repository;
        this.passwordEncoder = passwordEncoder;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.formationPurchaseRepository = formationPurchaseRepository;
        this.formationFavoriteRepository = formationFavoriteRepository;
        this.formationCapsuleProgressRepository = formationCapsuleProgressRepository;
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.formationRepository = formationRepository;
        this.experienceRepository = experienceRepository;
        this.videoRepository = videoRepository;
    }

    private UserResponse mapToResponse(User user) {
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
                user.isEmailVerified(),
                user.getBio(),
                user.getSpecialty(),
                user.getExperienceYears(),
                user.getHostRegion()
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAllDto() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse findByIdDto(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse createDto(UserRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "tourist123"))
                .role(req.getRole() != null ? req.getRole() : UserRole.tourist)
                .phone(req.getPhone())
                .country(req.getCountry())
                .language(req.getLanguage())
                .avatar(req.getAvatar())
                .bio(req.getBio())
                .specialty(req.getSpecialty())
                .experienceYears(req.getExperienceYears())
                .hostRegion(req.getHostRegion())
                .emailVerified(true)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateDto(Long id, UserRequest req) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (StringUtils.hasText(req.getPassword())) {
            existing.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        existing.setName(req.getName());
        existing.setEmail(req.getEmail());
        if (req.getRole() != null) existing.setRole(req.getRole());
        existing.setPhone(req.getPhone());
        existing.setAvatar(req.getAvatar());
        existing.setCountry(req.getCountry());
        existing.setLanguage(req.getLanguage());
        existing.setBio(req.getBio());
        existing.setSpecialty(req.getSpecialty());
        existing.setExperienceYears(req.getExperienceYears());
        existing.setHostRegion(req.getHostRegion());

        User saved = userRepository.save(existing);
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateMe(String email, UserUpdateMeRequest req) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User current = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (req.getName() != null && !req.getName().isBlank()) current.setName(req.getName());
        if (req.getPhone() != null) current.setPhone(req.getPhone());
        if (req.getCountry() != null) current.setCountry(req.getCountry());
        if (req.getLanguage() != null) current.setLanguage(req.getLanguage());
        if (req.getAvatar() != null) current.setAvatar(req.getAvatar());

        User saved = userRepository.save(current);
        return mapToResponse(saved);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User current = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        current.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(current);
    }

    @Override
    public User save(User user) {
        if (StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return super.save(user);
    }

    @Override
    public User update(Long id, User user) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (StringUtils.hasText(user.getPassword())) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        existing.setName(user.getName());
        existing.setEmail(user.getEmail());
        if (user.getRole() != null) existing.setRole(user.getRole());
        existing.setPhone(user.getPhone());
        existing.setAvatar(user.getAvatar());
        existing.setCountry(user.getCountry());
        existing.setLanguage(user.getLanguage());
        existing.setBio(user.getBio());
        existing.setSpecialty(user.getSpecialty());
        existing.setExperienceYears(user.getExperienceYears());
        existing.setHostRegion(user.getHostRegion());

        return userRepository.save(existing);
    }

    @Transactional
    @Override
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == UserRole.admin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete admin users");
        }

        if (formationRepository.countByFormateurId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete: user is assigned as instructor to one or more trainings");
        }

        if (experienceRepository.countByHostId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete: user is host of one or more experiences");
        }

        if (!videoRepository.findByHostId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete: user has associated videos");
        }

        emailVerificationTokenRepository.deleteAllByUserId(id);
        passwordResetTokenRepository.deleteAllByUserId(id);
        formationPurchaseRepository.deleteByUserId(id);
        formationFavoriteRepository.deleteByUserId(id);
        formationCapsuleProgressRepository.deleteByUserId(id);
        reviewRepository.deleteByTouristId(id);

        List<Booking> bookings = bookingRepository.findByTouristId(id);
        for (Booking booking : bookings) {
            paymentRepository.findByBookingId(booking.getId()).ifPresent(paymentRepository::delete);
        }
        bookingRepository.deleteAll(bookings);

        notificationRepository.deleteByUserId(id);
        userRepository.delete(user);
    }
}
