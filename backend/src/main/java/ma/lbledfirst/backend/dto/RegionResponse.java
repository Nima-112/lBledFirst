package ma.lbledfirst.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.lbledfirst.backend.domain.RegionName;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegionResponse {
    private Long id;
    private RegionName name;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
