package ma.lbledfirst.backend.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.dto.FormationPurchaseResponse;
import ma.lbledfirst.backend.service.FormationPurchaseService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/formation-purchases")
@RequiredArgsConstructor
public class AdminFormationPurchaseController {

    private final FormationPurchaseService purchaseService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<FormationPurchaseResponse> getAll() {
        return purchaseService.getAll();
    }

    @Data
    public static class CreatePurchaseRequest {
        private Long userId;
        private Long formationId;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public FormationPurchaseResponse create(@RequestBody CreatePurchaseRequest req) {
        return purchaseService.create(req);
    }
}
