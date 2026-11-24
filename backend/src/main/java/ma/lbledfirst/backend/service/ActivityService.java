package ma.lbledfirst.backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Activity;
import ma.lbledfirst.backend.dto.ActivityRequest;
import ma.lbledfirst.backend.dto.ActivityResponse;
import ma.lbledfirst.backend.exception.ActivityAlreadyExistsException;
import ma.lbledfirst.backend.exception.NotFoundException;
import ma.lbledfirst.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityRepository activityRepository;

//    GET - All activities
    @Transactional(readOnly = true)
    public List<ActivityResponse> getAllActivities(){
        return activityRepository.findAll()
                .stream()
                .map(activity -> new ActivityResponse(
                        activity.getId(),
                        activity.getName(),
                        activity.getIcon()
                ))
                .toList();
    }

//    GET - Get one activity
    @Transactional(readOnly = true)
    public ActivityResponse getActivityById(Long id){
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Activité " + id + " non trouvée"));

        return new ActivityResponse(activity.getId(), activity.getName(), activity.getIcon());
    }

//    POST - Create new activity
    @Transactional
    public ActivityResponse createActivity(ActivityRequest ac){
        if (activityRepository.existsByName(ac.getName())){
            throw new ActivityAlreadyExistsException("Cette activite deja existe!");
        }

        Activity activity = Activity.builder()
                .name(ac.getName())
                .icon(ac.getIcon())
                .build();

        activityRepository.save(activity);

        return new ActivityResponse(activity.getId(), activity.getName(), activity.getIcon());
    }

    //    PUT - Modify an existing activity
    @Transactional
    public ActivityResponse updateActivity(Long id, ActivityRequest ac) {
        Activity existing = activityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Activité " + id + " non trouvée"));
        existing.setName(ac.getName());
        existing.setIcon(ac.getIcon());
        return new ActivityResponse(existing.getId(), existing.getName(), existing.getIcon());
    }

//    DELETE - Delete an activity
    @Transactional
    public void deleteActivity(Long id) {
        if (!activityRepository.existsById(id)) {
            throw new NotFoundException("Activité " + id + " non trouvée");
        }
        activityRepository.deleteById(id);
    }
}
