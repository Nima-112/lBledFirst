package ma.lbledfirst.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;
import org.junit.jupiter.api.Test;

class HealthControllerTest {

    @Test
    void healthReportsUp() {
        HealthController controller = new HealthController();
        assertEquals(Map.of("status", "UP"), controller.health());
    }
}
