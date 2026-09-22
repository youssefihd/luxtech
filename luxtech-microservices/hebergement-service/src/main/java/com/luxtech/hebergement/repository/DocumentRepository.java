package com.luxtech.hebergement.repository;

import com.luxtech.hebergement.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByHotelId(Long hotelId);
    List<Document> findByHotelIdAndEstObligatoireTrue(Long hotelId);
}