package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.ToString;
import ma.lbledfirst.backend.domain.UserRole;

@Data
@ToString(exclude = "password")
public class UserRequest { 

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
        message = "Password must contain uppercase, lowercase and digit"
    )
    private String password;

    private UserRole role;

    @Pattern(regexp = "^\\+?[0-9\\s\\-]{8,20}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Country is required")
    private String country;

    private String language;
    private String avatar;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Size(max = 100, message = "Specialty must not exceed 100 characters")
    private String specialty;

    @Min(value = 0, message = "Experience must be positive")
    @Max(value = 80, message = "Experience seems unrealistic")
    private Integer experienceYears;

    @Size(max = 100, message = "Host region must not exceed 100 characters")
    private String hostRegion;
}