package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateMeRequest {
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Pattern(regexp = "^\\+?[0-9\\s\\-]{8,20}$", message = "Invalid phone number")
    private String phone;
    
    private String avatar;
    private String country;
    private String language;    
}
