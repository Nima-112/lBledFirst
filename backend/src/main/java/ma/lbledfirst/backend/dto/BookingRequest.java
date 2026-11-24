package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ma.lbledfirst.backend.domain.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookingRequest {
    private IdHolder tourist;
    private IdHolder experience;

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

    private BookingStatus status;
    private BigDecimal totalPrice;
    private Integer guests;

    @Data
    public static class IdHolder {
        private Long id;
    }
}
