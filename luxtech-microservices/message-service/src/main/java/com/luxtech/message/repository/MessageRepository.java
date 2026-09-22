package com.luxtech.message.repository;

import com.luxtech.message.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.destinataireId = :userId " +
            "AND m.isSupprimeDestinataire = false " +
            "AND m.hebergementId IS NULL " +
            "ORDER BY m.createdAt DESC")
    List<Message> findMessagesRecus(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.expediteurId = :userId " +
            "AND m.isSupprimeExpediteur = false " +
            "AND m.hebergementId IS NULL " +
            "ORDER BY m.createdAt DESC")
    List<Message> findMessagesEnvoyes(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.destinataireId = :userId " +
            "AND m.isLu = false " +
            "AND m.isSupprimeDestinataire = false " +
            "AND m.hebergementId IS NULL")
    List<Message> findNonLus(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.destinataireId = :userId " +
            "AND m.isLu = false " +
            "AND m.isSupprimeDestinataire = false " +
            "AND m.hebergementId IS NULL")
    long countNonLus(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE " +
            "((m.expediteurId = :userId1 AND m.destinataireId = :userId2) OR " +
            "(m.expediteurId = :userId2 AND m.destinataireId = :userId1)) " +
            "AND m.isSupprimeExpediteur = false " +
            "AND m.isSupprimeDestinataire = false " +
            "AND m.hebergementId IS NULL " +
            "ORDER BY m.createdAt ASC")
    List<Message> findConversation(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2);

    @Query("SELECT m FROM Message m WHERE m.parentId = :parentId " +
            "ORDER BY m.createdAt ASC")
    List<Message> findReponses(@Param("parentId") Long parentId);

    @Query("SELECT DISTINCT CASE " +
            "WHEN m.expediteurId = :userId THEN m.destinataireId " +
            "ELSE m.expediteurId END " +
            "FROM Message m WHERE " +
            "(m.expediteurId = :userId OR m.destinataireId = :userId) " +
            "AND m.isSupprimeExpediteur = false " +
            "AND m.isSupprimeDestinataire = false " +
            "AND m.hebergementId IS NULL")
    List<Long> findInterlocuteurs(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.destinataireId = :userId " +
            "AND m.isArchiveDestinataire = true " +
            "AND m.hebergementId IS NULL " +
            "ORDER BY m.createdAt DESC")
    List<Message> findArchives(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.expediteurId = :userId OR m.destinataireId = :userId) " +
            "AND m.isSupprimeExpediteur = false " +
            "AND m.isSupprimeDestinataire = false " +
            "AND m.hebergementId IS NULL " +
            "ORDER BY m.createdAt DESC")
    List<Message> findTousMessages(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.expediteurId = :userId OR m.destinataireId = :userId) " +
            "AND (LOWER(m.sujet) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(m.contenu) LIKE LOWER(CONCAT('%',:q,'%'))) " +
            "AND m.hebergementId IS NULL " +
            "ORDER BY m.createdAt DESC")
    List<Message> search(
            @Param("userId") Long userId,
            @Param("q") String q);

    // ── Communication avec un client (filtre par hebergementId) ──
    @Query("SELECT m FROM Message m WHERE m.hebergementId = :hebergementId ORDER BY m.createdAt DESC")
    List<Message> findByHebergementId(@Param("hebergementId") Long hebergementId);
}