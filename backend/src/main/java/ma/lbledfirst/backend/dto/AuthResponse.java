package ma.lbledfirst.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String token;
    private String role;
    private String name;
    private String email;
    private String phone;
    private String country;
    private String language;
    private String avatar;

    public AuthResponse(Long id, String token, String role, String name, String email) {
        this.id = id;
        this.token = token;
        this.role = role;
        this.name = name;
        this.email = email;
    }
}
