package ma.lbledfirst.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDto {

    @NotBlank(message = "Le nom du formateur est obligatoire")
    private String name;

    private String specialty;
    private Integer experienceYears;
    private String bio;
    private String photo;
    private Integer totalFormations;
    private Double averageRating;
    private Integer studentsTrained;
}
