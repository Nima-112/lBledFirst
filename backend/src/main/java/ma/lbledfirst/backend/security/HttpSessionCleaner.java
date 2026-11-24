package ma.lbledfirst.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

/**
 * OAuth2 requires a short-lived servlet session for the Google handshake.
 * Once our JWT cookie is issued, the session must be destroyed so API auth
 * relies solely on the httpOnly JWT — not JSESSIONID.
 */
@Component
public class HttpSessionCleaner {

    public void invalidateIfPresent(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
