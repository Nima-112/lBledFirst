package ma.lbledfirst.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.lbledfirst.backend.domain.Capsule;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.repository.CapsuleRepository;
import ma.lbledfirst.backend.repository.FormationPurchaseRepository;
import ma.lbledfirst.backend.repository.FormationRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class VideoAccessFilter extends OncePerRequestFilter {

    private final CapsuleRepository capsuleRepository;
    private final FormationRepository formationRepository;
    private final FormationPurchaseRepository formationPurchaseRepository;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = requestUri.substring(contextPath.length());

        // Target uploads/videos
        if (path.startsWith("/uploads/videos/")) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Not authenticated");
                return;
            }

            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
                return;
            }

            // Admins have access to all videos
            if (user.getRole() == UserRole.admin) {
                filterChain.doFilter(request, response);
                return;
            }

            // Check if it's a preview video (accessible to all authenticated users)
            if (formationRepository.existsByPreviewVideo(path)) {
                filterChain.doFilter(request, response);
                return;
            }

            // Otherwise check if it matches a paid capsule
            Capsule capsule = capsuleRepository.findByVideoUrl(path).orElse(null);
            if (capsule != null) {
                Formation formation = capsule.getChapter().getFormation();
                boolean purchased = formationPurchaseRepository.existsByUserIdAndFormationId(user.getId(), formation.getId());
                if (!purchased) {
                    log.warn("Access denied for user {} to paid video {}", email, path);
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "You must purchase this training to access the video");
                    return;
                }
            } else {
                // Video is not associated with any capsule/preview.
                // For safety, only allow admin users.
                log.warn("Access denied for user {} to unmapped video {}", email, path);
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access to unmapped video files is restricted");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
