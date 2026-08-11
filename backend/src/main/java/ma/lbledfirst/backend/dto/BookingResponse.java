package ma.lbledfirst.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.lbledfirst.backend.domain.BookingStatus;
import ma.lbledfirst.backend.domain.Experience;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private UserResponse tourist;

    @JsonIgnoreProperties({"coverImages", "dayPrograms", "region", "programs", "bookings", "reviews", "media", "videos"})
    private Experience experience;

    private LocalDate date;
    private BookingStatus status;
    private BigDecimal totalPrice;
    private Integer guests;
    private LocalDateTime createdAt;
}
