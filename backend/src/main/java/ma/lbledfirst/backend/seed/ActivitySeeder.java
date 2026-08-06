package ma.lbledfirst.backend.seed;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Activity;
import ma.lbledfirst.backend.repository.ActivityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
public class ActivitySeeder implements CommandLineRunner {

    private final ActivityRepository activityRepository;

    @Override
    public void run(String... args) {
        if (activityRepository.count() > 0) return;

        List<Activity> activities = List.of(
                Activity.builder().name("Hiking").icon("hiking").build(),
                Activity.builder().name("Crafts").icon("crafts").build(),
                Activity.builder().name("Cuisine").icon("cuisine").build(),
                Activity.builder().name("Agriculture").icon("agriculture").build(),
                Activity.builder().name("Festivals").icon("festivals").build(),
                Activity.builder().name("Homestays").icon("homestays").build()
        );

        activityRepository.saveAll(activities);
    }
}
