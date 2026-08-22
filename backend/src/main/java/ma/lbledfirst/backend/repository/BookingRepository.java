package ma.lbledfirst.backend.repository;

import java.util.List;

import ma.lbledfirst.backend.domain.Booking;
import ma.lbledfirst.backend.domain.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Modifying
    @Query("DELETE FROM Booking b WHERE b.experience.id = :experienceId")
    void deleteByExperienceId(@Param("experienceId") Long experienceId);

    List<Booking> findByTouristId(Long touristId);

    boolean existsByTouristIdAndExperienceIdAndStatusIn(Long touristId, Long experienceId, List<BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.experience.id = :experienceId")
    long countByExperienceId(@Param("experienceId") Long experienceId);
}
