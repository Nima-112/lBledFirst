package ma.lbledfirst.backend.controller;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.dto.RegionResponse;
import ma.lbledfirst.backend.service.RegionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @GetMapping
    public List<RegionResponse> getAllRegions() {
        return regionService.getAllRegions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegionResponse> getRegion(@PathVariable Long id) {
        return ResponseEntity.ok(regionService.getRegionById(id));
    }
}