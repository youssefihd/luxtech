package com.luxtech.auth.repository;

import com.luxtech.auth.entity.Parametre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParametreRepository extends JpaRepository<Parametre, String> {
    List<Parametre> findByCategorie(String categorie);
}