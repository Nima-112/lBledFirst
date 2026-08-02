package ma.lbledfirst.backend.service;

import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService extends AbstractCrudService<User, Long> {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.userRepository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User save(User user) {
        if (StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return super.save(user);
    }

    @Override
    public User update(Long id, User user) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        if (StringUtils.hasText(user.getPassword())) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        existing.setName(user.getName());
        existing.setEmail(user.getEmail());
        if (user.getRole() != null) existing.setRole(user.getRole());
        existing.setPhone(user.getPhone());
        existing.setAvatar(user.getAvatar());
        existing.setCountry(user.getCountry());
        existing.setLanguage(user.getLanguage());

        return userRepository.save(existing);
    }
}
