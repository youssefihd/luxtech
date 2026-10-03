package com.luxtech.auth.service;

import com.luxtech.auth.dto.AuthDto;
import com.luxtech.auth.entity.User;
import com.luxtech.auth.exception.AuthException;
import com.luxtech.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service @RequiredArgsConstructor @Slf4j @Transactional
public class AuthService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService      jwtService;

    public AuthDto.ApiResponse<AuthDto.UserResponse> register(AuthDto.RegisterRequest req) {

        User.UserStatus status = req.getRole() == User.UserRole.SUPER_ADMIN
                ? User.UserStatus.APPROVED
                : User.UserStatus.PENDING_APPROVAL;

        User user = User.builder()
                .nom(req.getNom())
                .prenom(req.getPrenom())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .telephone(req.getTelephone())
                .role(req.getRole())
                .status(status)
                .isActive(req.getRole() == User.UserRole.SUPER_ADMIN)
                .hebergementId(req.getHotelId())
                .agencyId(req.getAgencyId())
                .typeHebergement(req.getTypeHebergement())
                .nomEtablissement(req.getNomEtablissement())
                .ville(req.getVille())
                .adresse(req.getAdresse())
                .build();

        User saved = userRepository.save(user);

        String message = req.getRole() == User.UserRole.SUPER_ADMIN
                ? "Compte créé avec succès."
                : "Inscription envoyée. En attente de validation.";

        return AuthDto.ApiResponse.ok(message, toUserResponse(saved));
    }

    @Transactional(readOnly = true)
    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new AuthException("Email ou mot de passe incorrect.", 401));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new AuthException("Email ou mot de passe incorrect.", 401);
        if (user.getStatus() == User.UserStatus.PENDING_APPROVAL)
            throw new AuthException("Votre compte est en attente de validation.", 403);
        if (user.getStatus() == User.UserStatus.REJECTED)
            throw new AuthException("Votre compte a été refusé.", 403);
        if (user.getStatus() == User.UserStatus.SUSPENDED)
            throw new AuthException("Votre compte est suspendu.", 403);
        if (!Boolean.TRUE.equals(user.getIsActive()))
            throw new AuthException("Compte inactif.", 403);

        return AuthDto.AuthResponse.builder()
                .accessToken(jwtService.generateToken(user))
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(toUserResponse(user))
                .build();
    }

    public User approveUser(Long id) {
        User u = findById(id);
        u.setStatus(User.UserStatus.APPROVED);
        u.setIsActive(true);
        return userRepository.save(u);
    }

    public User rejectUser(Long id) {
        User u = findById(id);
        u.setStatus(User.UserStatus.REJECTED);
        u.setIsActive(false);
        return userRepository.save(u);
    }

    public User suspendUser(Long id) {
        User u = findById(id);
        u.setStatus(User.UserStatus.SUSPENDED);
        u.setIsActive(false);
        return userRepository.save(u);
    }

    public User updateUser(Long id, AuthDto.UpdateUserRequest req) {
        User u = findById(id);
        if (req.getNom()       != null) u.setNom(req.getNom());
        if (req.getPrenom()    != null) u.setPrenom(req.getPrenom());
        if (req.getTelephone() != null) u.setTelephone(req.getTelephone());
        if (req.getPassword()  != null && !req.getPassword().isBlank())
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        return userRepository.save(u);
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() { return userRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<User> searchUsers(User.UserRole role, String search) {

        if (search == null || search.trim().isEmpty()) {

            if (role == null) {
                return userRepository.findAll();
            }

            return userRepository.findByRole(role);
        }

        return userRepository.searchUsers(role, search.trim().toLowerCase());
    }

    @Transactional(readOnly = true)
    public List<User> getPendingUsers() { return userRepository.findByStatus(User.UserStatus.PENDING_APPROVAL); }

    @Transactional(readOnly = true)
    public List<User> getUsersByHebergement(Long id) { return userRepository.findActiveByHebergementId(id); }

    @Transactional(readOnly = true)
    public List<User> getUsersByAgency(Long id) { return userRepository.findActiveByAgencyId(id); }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AuthException("Utilisateur introuvable.", 404));
    }

    public User createEmployee(Long hebergementId, AuthDto.CreateEmployeeRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new AuthException("Cet email est deja utilise.", 409);
        }
        User employee = User.builder()
                .nom(req.getNom())
                .prenom(req.getPrenom())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .telephone(req.getTelephone())
                .role(User.UserRole.HEBERGEMENT_STAFF)
                .status(User.UserStatus.APPROVED)
                .isActive(true)
                .hebergementId(hebergementId)
                .poste(req.getPoste())
                .build();
        return userRepository.save(employee);
    }

    public User updateEmployee(Long id, AuthDto.UpdateEmployeeRequest req) {
        User u = findById(id);
        if (req.getNom() != null) u.setNom(req.getNom());
        if (req.getPrenom() != null) u.setPrenom(req.getPrenom());
        if (req.getTelephone() != null) u.setTelephone(req.getTelephone());
        if (req.getPoste() != null) u.setPoste(req.getPoste());
        if (req.getPassword() != null && !req.getPassword().isBlank())
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        return userRepository.save(u);
    }

    public void deleteEmployee(Long id) {
        userRepository.deleteById(id);
    }

    public AuthDto.UserResponse toUserResponse(User u) {
        return AuthDto.UserResponse.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .telephone(u.getTelephone())
                .role(u.getRole())
                .status(u.getStatus())
                .isActive(u.getIsActive())
                .emailVerifiedAt(u.getEmailVerifiedAt())
                .hotelId(u.getHebergementId())
                .agencyId(u.getAgencyId())
                .typeHebergement(u.getTypeHebergement())
                .nomEtablissement(u.getNomEtablissement())
                .ville(u.getVille())
                .adresse(u.getAdresse())
                .createdAt(u.getCreatedAt())
                .poste(u.getPoste())
                .build();
    }
}
