package ma.lbledfirst.backend.service;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.FormationPurchase;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.dto.FormationPurchaseResponse;
import ma.lbledfirst.backend.controller.AdminFormationPurchaseController.CreatePurchaseRequest;
import ma.lbledfirst.backend.dto.UserResponse;
import ma.lbledfirst.backend.repository.FormationPurchaseRepository;
import ma.lbledfirst.backend.repository.FormationRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormationPurchaseService {

    private final FormationPurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final FormationRepository formationRepository;

    private static void initFormation(Formation f) {
        if (f == null) return;
        Hibernate.initialize(f.getInstructor());
        Hibernate.initialize(f.getObjectives());
        Hibernate.initialize(f.getSkills());
        Hibernate.initialize(f.getPrerequisites());
        Hibernate.initialize(f.getChapters());
        if (f.getChapters() != null) {
            f.getChapters().forEach(ch -> {
                if (ch != null) Hibernate.initialize(ch.getCapsules());
            });
        }
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

    private FormationPurchaseResponse mapToResponse(FormationPurchase p) {
        if (p == null) return null;
        return new FormationPurchaseResponse(
                p.getId(),
                mapToUserResponse(p.getUser()),
                p.getFormation(),
                p.getPurchasedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<FormationPurchaseResponse> getAll() {
        List<FormationPurchase> list = purchaseRepository.findAll();
        for (FormationPurchase p : list) {
            Hibernate.initialize(p.getUser());
            initFormation(p.getFormation());
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public FormationPurchaseResponse create(CreatePurchaseRequest req) {
        if (req.getUserId() == null || req.getFormationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and formationId are required");
        }
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
        Formation formation = formationRepository.findById(req.getFormationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formation not found"));

        if (purchaseRepository.existsByUserIdAndFormationId(req.getUserId(), req.getFormationId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already enrolled in this formation");
        }

        FormationPurchase p = FormationPurchase.builder()
                .user(user)
                .formation(formation)
                .purchasedAt(LocalDateTime.now())
                .build();
        FormationPurchase saved = purchaseRepository.save(p);
        
        // Auto-increment studentsCount on the formation
        formation.setStudentsCount(formation.getStudentsCount() + 1);
        formationRepository.save(formation);
        
        Hibernate.initialize(saved.getUser());
        initFormation(saved.getFormation());
        return mapToResponse(saved);
    }
}
