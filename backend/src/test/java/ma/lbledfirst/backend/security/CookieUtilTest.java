package ma.lbledfirst.backend.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

class CookieUtilTest {

    private final CookieUtil cookieUtil = new CookieUtil();

    @Test
    void authCookieIsHttpOnlyAndHasOneDayLifetime() {
        ResponseCookie cookie = cookieUtil.buildAuthCookie("example-jwt", false);

        assertEquals("access_token", cookie.getName());
        assertEquals("example-jwt", cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertFalse(cookie.isSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(86400L, cookie.getMaxAge().getSeconds());
        assertEquals("Lax", cookie.getSameSite());
    }

    @Test
    void secureAuthCookieUsesSecureAttribute() {
        ResponseCookie cookie = cookieUtil.buildAuthCookie("example-jwt", true);
        assertTrue(cookie.isSecure());
    }

    @Test
    void logoutCookieClearsAuthentication() {
        ResponseCookie cookie = cookieUtil.buildLogoutCookie(true);

        assertEquals("access_token", cookie.getName());
        assertEquals("", cookie.getValue());
        assertEquals(0L, cookie.getMaxAge().getSeconds());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
    }
}
