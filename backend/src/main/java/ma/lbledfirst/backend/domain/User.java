package ma.lbledfirst.backend.domain;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String phone;
    private String avatar;
    private String country;
    private String language;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "host")
    private List<Experience> experiences;

    @JsonIgnore
    @OneToMany(mappedBy = "tourist")
    private List<Booking> bookings;

    @JsonIgnore
    @OneToMany(mappedBy = "tourist")
    private List<Review> reviews;

//    @JsonIgnore
//    @OneToMany(mappedBy = "sender")
//    private List<Message> sentMessages;
//
//    @JsonIgnore
//    @OneToMany(mappedBy = "receiver")
//    private List<Message> receivedMessages;

    @JsonIgnore
    @OneToMany(mappedBy = "host")
    private List<Video> videos;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Notification> notifications;
}
