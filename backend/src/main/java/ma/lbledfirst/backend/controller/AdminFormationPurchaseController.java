package ma.lbledfirst.backend.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.FormationPurchase;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.repository.FormationPurchaseRepository;
import ma.lbledfirst.backend.repository.FormationRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/formation-purchases")
@RequiredArgsConstructor
public class AdminFormationPurchaseController {

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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<FormationPurchase> getAll() {
        List<FormationPurchase> list = purchaseRepository.findAll();
        for (FormationPurchase p : list) {
            Hibernate.initialize(p.getUser());
            initFormation(p.getFormation());
        }
        return list;
    }

    @Data
    public static class CreatePurchaseRequest {
        private Long userId;
        private Long formationId;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public FormationPurchase create(@RequestBody CreatePurchaseRequest req) {
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
        Hibernate.initialize(saved.getUser());
        initFormation(saved.getFormation());
        return saved;
    }
}
