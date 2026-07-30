package ma.lbledfirst.backend.service;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Region;
import ma.lbledfirst.backend.dto.RegionResponse;
import ma.lbledfirst.backend.exception.NotFoundException;
import ma.lbledfirst.backend.repository.RegionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;

//    GET - Get all regions
    @Transactional(readOnly = true)
    public List<RegionResponse> getAllRegions(){
        return regionRepository.findAll()
                .stream()
                .map(region -> new RegionResponse(
                        region.getId(),
                        region.getName(),
                        region.getLatitude(),
                        region.getLongitude()
                ))
                .toList();
    }

//    GET - Get a particular region
    @Transactional(readOnly = true)
    public RegionResponse getRegionById(Long id){
        Region region = regionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Region " + id + " non trouvée"));

        return new RegionResponse(region.getId(), region.getName(), region.getLatitude(), region.getLongitude());
    }

}

