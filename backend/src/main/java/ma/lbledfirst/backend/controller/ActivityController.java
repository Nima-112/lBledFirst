package ma.lbledfirst.backend.controller;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.dto.ActivityRequest;
import ma.lbledfirst.backend.dto.ActivityResponse;
import ma.lbledfirst.backend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

//    GET - Get all activities
    @GetMapping
    public List<ActivityResponse> getAllActivities() {
        return activityService.getAllActivities();
    }

//    GET - Get a particular activity
    @GetMapping("/{id}")
    public ResponseEntity<ActivityResponse> getActivity(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.getActivityById(id));
    }

//    POST - Create a new activity
    @PostMapping
    public ResponseEntity<ActivityResponse> createActivity(@Valid @RequestBody ActivityRequest ac) {
        ActivityResponse created = activityService.createActivity(ac);
        return ResponseEntity.ok(created);
    }

//    PUT - Modify an activity
    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponse> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest ac) {
        return ResponseEntity.ok(activityService.updateActivity(id, ac));
    }

//    DELETE - Delete an activity
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id){
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
}
