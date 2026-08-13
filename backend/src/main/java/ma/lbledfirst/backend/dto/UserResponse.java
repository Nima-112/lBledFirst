package ma.lbledfirst.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String country;
    private String language;
    private String avatar;
    private boolean emailVerified;
    private String bio;
    private String specialty;
    private Integer experienceYears;
    private String hostRegion;

    public UserResponse(Long id, String name, String email, String role) {
        this(id, name, email, role, null, null, null, null, false, null, null, null, null);
    }

    public UserResponse(
            Long id,
            String name,
            String email,
            String role,
            String phone,
            String country,
            String language,
            String avatar,
            boolean emailVerified) {
        this(id, name, email, role, phone, country, language, avatar, emailVerified, null, null, null, null);
    }
}
