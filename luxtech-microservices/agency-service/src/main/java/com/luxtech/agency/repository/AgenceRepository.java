package com.luxtech.agency.repository;
import com.luxtech.agency.entity.Agence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgenceRepository extends JpaRepository<Agence, Long> {
    Optional<Agence> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Agence> findByStatus(Agence.AgenceStatus status);
    Optional<Agence> findByUserId(Long userId);
}
