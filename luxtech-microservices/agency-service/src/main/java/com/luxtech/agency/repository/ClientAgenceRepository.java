package com.luxtech.agency.repository;

import com.luxtech.agency.entity.ClientAgence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientAgenceRepository extends JpaRepository<ClientAgence, Long> {
    List<ClientAgence> findByAgenceIdOrderByNomAscPrenomAsc(Long agenceId);
    Optional<ClientAgence> findByIdAndAgenceId(Long id, Long agenceId);
}
