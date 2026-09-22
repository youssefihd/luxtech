package com.luxtech.agency.controller;
import com.luxtech.agency.dto.AgenceDto;
import com.luxtech.agency.entity.Agence;
import com.luxtech.agency.service.AgenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/agence") @RequiredArgsConstructor
public class AgenceController {
    private final AgenceService agenceService;

    @PostMapping
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> create(
            @Valid @RequestBody AgenceDto.CreateAgenceRequest req,
            @RequestHeader("X-User-Id") String userId) {
        Agence a = agenceService.create(req, Long.parseLong(userId));
        return ResponseEntity.status(201).body(AgenceDto.ApiResponse.ok("Agence créée.", agenceService.toResponse(a)));
    }

    @GetMapping
    public ResponseEntity<AgenceDto.ApiResponse<List<AgenceDto.AgenceResponse>>> getAll() {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agenceService.getAll().stream().map(agenceService::toResponse).toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agenceService.toResponse(agenceService.getById(id))));
    }

    @GetMapping("/my")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> myAgence(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agenceService.toResponse(agenceService.getByUserId(Long.parseLong(userId)))));
    }

    @GetMapping("/pending")
    public ResponseEntity<AgenceDto.ApiResponse<List<AgenceDto.AgenceResponse>>> getPending() {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("OK", agenceService.getPending().stream().map(agenceService::toResponse).toList()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> update(
            @PathVariable Long id, @RequestBody AgenceDto.CreateAgenceRequest req) {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Mis à jour.", agenceService.toResponse(agenceService.update(id, req))));
    }

    @PostMapping("/{id}/approuver")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> approuver(@PathVariable Long id) {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Approuvée.", agenceService.toResponse(agenceService.approuver(id))));
    }

    @PostMapping("/{id}/rejeter")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> rejeter(@PathVariable Long id) {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Rejetée.", agenceService.toResponse(agenceService.rejeter(id))));
    }

    @PostMapping("/{id}/suspendre")
    public ResponseEntity<AgenceDto.ApiResponse<AgenceDto.AgenceResponse>> suspendre(@PathVariable Long id) {
        return ResponseEntity.ok(AgenceDto.ApiResponse.ok("Suspendue.", agenceService.toResponse(agenceService.suspendre(id))));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() { return ResponseEntity.ok("agency-service UP"); }
}
