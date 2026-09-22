package com.luxtech.hebergement.repository;

import com.luxtech.hebergement.entity.Chambre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChambreRepository extends JpaRepository<Chambre, Long> {

    @Query("SELECT c FROM Chambre c WHERE c.chambreType.hotel.id = :hotelId")
    List<Chambre> findByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT c FROM Chambre c WHERE c.chambreType.hotel.id = :hotelId " +
            "AND c.status = :status")
    List<Chambre> findByHotelIdAndStatus(
            @Param("hotelId") Long hotelId,
            @Param("status") Chambre.ChambreStatus status);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Chambre c WHERE c.numero = :numero " +
            "AND c.chambreType.hotel.id = :hotelId")
    boolean existsByNumeroAndHotelId(
            @Param("numero") String numero,
            @Param("hotelId") Long hotelId);

    // ✅ Méthode ajoutée — utilisée dans HotelService ligne 114
    @Query("SELECT c FROM Chambre c WHERE c.chambreType.hotel.id = :hotelId")
    List<Chambre> findByChambreTypeHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT c FROM Chambre c WHERE c.chambreType.id = :typeId")
    List<Chambre> findByChambreTypeId(@Param("typeId") Long typeId);

    @Query("SELECT COUNT(c) FROM Chambre c " +
            "WHERE c.chambreType.hotel.id = :hotelId " +
            "AND c.status = 'DISPONIBLE'")
    long countDisponibles(@Param("hotelId") Long hotelId);

    List<Chambre> findByStatusIn(List<Chambre.ChambreStatus> statuses);

    @Query("SELECT COUNT(c) FROM Chambre c " +
            "WHERE c.chambreType.hotel.id = :hotelId")
    long countByHotelId(@Param("hotelId") Long hotelId);
}