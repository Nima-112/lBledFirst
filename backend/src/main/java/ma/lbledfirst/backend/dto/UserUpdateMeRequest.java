package ma.lbledfirst.backend.dto;

import lombok.Data;

@Data
public class UserUpdateMeRequest {
    private String name;
    private String phone;
    private String country;
    private String language;
    private String avatar;
}
