package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Program;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramRepository extends JpaRepository<Program, Long> {
}
