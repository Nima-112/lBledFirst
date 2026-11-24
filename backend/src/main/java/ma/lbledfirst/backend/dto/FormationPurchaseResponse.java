package ma.lbledfirst.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.lbledfirst.backend.domain.Formation;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormationPurchaseResponse {
    private Long id;
    private UserResponse user;
    private Formation formation;
    private LocalDateTime purchasedAt;
}
