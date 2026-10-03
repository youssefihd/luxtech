package com.luxtech.auth.repository;
import com.luxtech.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.luxtech.auth.entity.User.UserRole;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByStatus(User.UserStatus status);

    @Query("SELECT u FROM User u WHERE u.hebergementId = :hebergementId AND u.isActive = true")
    List<User> findActiveByHebergementId(@Param("hebergementId") Long hebergementId);

    @Query("SELECT u FROM User u WHERE u.agencyId = :agencyId AND u.isActive = true")
    List<User> findActiveByAgencyId(@Param("agencyId") Long agencyId);

    List<User> findByRole(User.UserRole role);

    @Query("SELECT u FROM User u WHERE (:role IS NULL OR u.role = :role) " +
            "AND (:search IS NULL OR " +
            "LOWER(CONCAT(COALESCE(u.prenom, ''), ' ', COALESCE(u.nom, ''))) LIKE CONCAT('%', :search, '%') OR " +
            "LOWER(COALESCE(u.email, '')) LIKE CONCAT('%', :search, '%') OR " +
            "LOWER(COALESCE(u.nomEtablissement, '')) LIKE CONCAT('%', :search, '%') OR " +
            "LOWER(COALESCE(u.ville, '')) LIKE CONCAT('%', :search, '%'))")
    List<User> searchUsers(@Param("role") UserRole role, @Param("search") String search);

}
