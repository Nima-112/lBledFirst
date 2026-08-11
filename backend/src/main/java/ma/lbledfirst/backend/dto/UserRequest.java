package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import ma.lbledfirst.backend.domain.UserRole;

@Data
public class UserRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    private String password;
    private UserRole role;
    private String phone;
    private String country;
    private String language;
    private String avatar;
}
