package com.luxtech.agency.controller;

import com.luxtech.agency.dto.AgenceDto;
import com.luxtech.agency.entity.Agence;
import com.luxtech.agency.exception.AgenceException;
import com.luxtech.agency.service.AgenceService;
import com.luxtech.agency.service.ClientAgenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agence")
@RequiredArgsConstructor
public class AgenceController {
    private final AgenceService agenceService;
    private final ClientAgenceService clientAgenceService;

    @GetMapping("/{agenceId}/clients")
    public ResponseEntity<AgenceDto.ApiResponse<List<AgenceDto.ClientResponse>>> clients(
            @PathVariable("agenceId") Long agenceId,
            @RequestHeader("X-Agency-Id") String authenticatedAgencyId,
            @RequestHeader("X-User-Role") String role) {
        authorizeAgency(agenceId, authenticatedAgencyId, role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", clientAgenceService.list(agenceId)));
    }

    @PostMapping("/{agenceId}/clients")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.ClientResponse>> createClient(
            @PathVariable("agenceId") Long agenceId,
            @RequestHeader("X-Agency-Id") String authenticatedAgencyId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody AgenceDto.ClientRequest request) {
        authorizeAgency(agenceId, authenticatedAgencyId, role);
        return ResponseEntity.status(201).body(AgenceDto.ApiResponse.ok("Client cree.", clientAgenceService.create(agenceId, request)));
    }

    @PutMapping("/{agenceId}/clients/{clientId}")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.ClientResponse>> updateClient(
            @PathVariable("agenceId") Long agenceId, @PathVariable("clientId") Long clientId,
            @RequestHeader("X-Agency-Id") String authenticatedAgencyId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody AgenceDto.ClientRequest request) {
        authorizeAgency(agenceId, authenticatedAgencyId, role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Client mis a jour.", clientAgenceService.update(agenceId, clientId, request)));
    }

    @DeleteMapping("/{agenceId}/clients/{clientId}")
    public ResponseEntity<AgenceDto.ApiResponse<Void>> deleteClient(
            @PathVariable("agenceId") Long agenceId, @PathVariable("clientId") Long clientId,
            @RequestHeader("X-Agency-Id") String authenticatedAgencyId,
            @RequestHeader("X-User-Role") String role) {
        authorizeAgency(agenceId, authenticatedAgencyId, role);
        clientAgenceService.delete(agenceId, clientId);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Client supprime.", null));
    }

    @PostMapping
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> create(
            @Valid @RequestBody AgenceDto.CreateAgenceRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {
        if (!"AGENCY_ADMIN".equals(role)) throw new AgenceException("Acces agence refuse.", 403);
        Agence agency = agenceService.create(request, Long.parseLong(userId));
        return ResponseEntity.status(201).body(AgenceDto.ApiResponse.ok("Agence creee.", agenceService.toResponse(agency)));
    }

    @GetMapping
    public ResponseEntity<AgenceDto.ApiResponse<List<AgenceDto.AgenceResponse>>> getAll(
            @RequestHeader("X-User-Role") String role) {
        requireSuperAdmin(role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agenceService.getAll().stream().map(agenceService::toResponse).toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> getById(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-Agency-Id", required = false) String agencyId,
            @RequestHeader("X-User-Role") String role) {
        authorizeAgencyOrAdmin(id, agencyId, role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agencyResponse(agenceService.getById(id), role)));
    }

    @GetMapping("/my")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> myAgence(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {
        if (!isAgencyRole(role)) throw new AgenceException("Acces agence refuse.", 403);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agencyResponse(agenceService.getByUserId(Long.parseLong(userId)), role)));
    }

    @GetMapping("/pending")
    public ResponseEntity<AgenceDto.ApiResponse<List<AgenceDto.AgenceResponse>>> getPending(
            @RequestHeader("X-User-Role") String role) {
        requireSuperAdmin(role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agenceService.getPending().stream().map(agenceService::toResponse).toList()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> update(
            @PathVariable("id") Long id, @RequestBody AgenceDto.CreateAgenceRequest request,
            @RequestHeader(value = "X-Agency-Id", required = false) String agencyId,
            @RequestHeader("X-User-Role") String role) {
        if ("SUPER_ADMIN".equals(role)) {
            // LUXPURE may correct an agency profile.
        } else if (!"AGENCY_ADMIN".equals(role) || !String.valueOf(id).equals(agencyId)) {
            throw new AgenceException("Acces agence refuse.", 403);
        }
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Profil mis a jour.", agencyResponse(agenceService.update(id, request), role)));
    }

    @PutMapping("/{id}/commercial-settings")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> configureCommercial(
            @PathVariable("id") Long id, @Valid @RequestBody AgenceDto.AgencyCommercialSettingsRequest request,
            @RequestHeader("X-User-Role") String role) {
        requireSuperAdmin(role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Configuration commerciale mise a jour.",
                agenceService.toResponse(agenceService.configureCommercial(id, request))));
    }

    @PostMapping("/{id}/approuver")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> approuver(
            @PathVariable("id") Long id, @RequestHeader("X-User-Role") String role) {
        requireSuperAdmin(role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Agence approuvee.", agenceService.toResponse(agenceService.approuver(id))));
    }

    @PostMapping("/{id}/rejeter")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> rejeter(
            @PathVariable("id") Long id, @RequestHeader("X-User-Role") String role) {
        requireSuperAdmin(role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Agence rejetee.", agenceService.toResponse(agenceService.rejeter(id))));
    }

    @PostMapping("/{id}/suspendre")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> suspendre(
            @PathVariable("id") Long id, @RequestHeader("X-User-Role") String role) {
        requireSuperAdmin(role);
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Agence suspendue.", agenceService.toResponse(agenceService.suspendre(id))));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() { return ResponseEntity.ok("agency-service UP"); }

    private void authorizeAgency(Long agencyId, String authenticatedAgencyId, String role) {
        if (!isAgencyRole(role) || !String.valueOf(agencyId).equals(authenticatedAgencyId)) {
            throw new AgenceException("Acces agence refuse.", 403);
        }
    }

    private void authorizeAgencyOrAdmin(Long agencyId, String authenticatedAgencyId, String role) {
        if ("SUPER_ADMIN".equals(role)) return;
        authorizeAgency(agencyId, authenticatedAgencyId, role);
    }

    private boolean isAgencyRole(String role) {
        return "AGENCY_ADMIN".equals(role) || "AGENCY_STAFF".equals(role);
    }

    private void requireSuperAdmin(String role) {
        if (!"SUPER_ADMIN".equals(role)) throw new AgenceException("Acces administrateur refuse.", 403);
    }

    private AgenceDto.AgenceResponse agencyResponse(Agence agency, String role) {
        return agenceService.toResponse(agency, !"AGENCY_STAFF".equals(role));
    }
}
