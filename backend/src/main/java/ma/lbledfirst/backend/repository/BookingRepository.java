package ma.lbledfirst.backend.repository;

import java.util.List;

import ma.lbledfirst.backend.domain.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Modifying
    @Query("DELETE FROM Booking b WHERE b.experience.id = :experienceId")
    void deleteByExperienceId(@Param("experienceId") Long experienceId);

    List<Booking> findByTouristId(Long touristId);
}
