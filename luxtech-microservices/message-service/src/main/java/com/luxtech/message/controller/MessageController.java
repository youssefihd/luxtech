package com.luxtech.message.controller;

import com.luxtech.message.dto.MessageDto;
import com.luxtech.message.entity.Message;
import com.luxtech.message.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ── Envoyer ───────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<MessageDto.ApiResponse<MessageDto.MessageResponse>> envoyer(
            @Valid @RequestBody MessageDto.EnvoyerMessageRequest req,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Nom",  defaultValue = "Utilisateur") String userNom,
            @RequestHeader(value = "X-User-Role", defaultValue = "")            String userRole) {

        Message m = messageService.envoyer(req,
                Long.parseLong(userId), userNom, userRole);
        return ResponseEntity.status(201)
                .body(MessageDto.ApiResponse.ok(
                        "Message envoye.",
                        messageService.toResponse(m)));
    }

    // ── Repondre ──────────────────────────────────────────────
    @PostMapping("/repondre")
    public ResponseEntity<MessageDto.ApiResponse<MessageDto.MessageResponse>> repondre(
            @Valid @RequestBody MessageDto.RepondreRequest req,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Nom",  defaultValue = "Utilisateur") String userNom,
            @RequestHeader(value = "X-User-Role", defaultValue = "")            String userRole) {

        Message m = messageService.repondre(req,
                Long.parseLong(userId), userNom, userRole);
        return ResponseEntity.ok(MessageDto.ApiResponse.ok(
                "Reponse envoyee.", messageService.toResponse(m)));
    }

    // ── Boite de reception ────────────────────────────────────
    @GetMapping("/boite")
    public ResponseEntity<MessageDto.ApiResponse<MessageDto.BoiteReceptionResponse>> getBoite(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(MessageDto.ApiResponse.ok(
                "OK", messageService.getBoiteReception(Long.parseLong(userId))));
    }

    // ── Messages recus ────────────────────────────────────────
    @GetMapping("/recus")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> getRecus(
            @RequestHeader("X-User-Id") String userId) {
        List<MessageDto.MessageResponse> list = messageService
                .getMessagesRecus(Long.parseLong(userId))
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    // ── Messages envoyes ──────────────────────────────────────
    @GetMapping("/envoyes")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> getEnvoyes(
            @RequestHeader("X-User-Id") String userId) {
        List<MessageDto.MessageResponse> list = messageService
                .getMessagesEnvoyes(Long.parseLong(userId))
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    // ── Non lus ───────────────────────────────────────────────
    @GetMapping("/non-lus")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> getNonLus(
            @RequestHeader("X-User-Id") String userId) {
        List<MessageDto.MessageResponse> list = messageService
                .getNonLus(Long.parseLong(userId))
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    // ── Compter non lus ───────────────────────────────────────
    @GetMapping("/non-lus/count")
    public ResponseEntity<MessageDto.ApiResponse<Long>> countNonLus(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(MessageDto.ApiResponse.ok(
                "OK", messageService.countNonLus(Long.parseLong(userId))));
    }

    // ── Conversation ──────────────────────────────────────────
    @GetMapping("/conversation/{autreUserId}")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> getConversation(
            @PathVariable("autreUserId") Long autreUserId,
            @RequestHeader("X-User-Id") String userId) {
        List<MessageDto.MessageResponse> list = messageService
                .getConversation(Long.parseLong(userId), autreUserId)
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    // ── Reponses a un message ─────────────────────────────────
    @GetMapping("/{parentId}/reponses")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> getReponses(
            @PathVariable("parentId") Long parentId) {
        List<MessageDto.MessageResponse> list = messageService
                .getReponses(parentId)
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    // ── Archives ──────────────────────────────────────────────
    @GetMapping("/archives")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> getArchives(
            @RequestHeader("X-User-Id") String userId) {
        List<MessageDto.MessageResponse> list = messageService
                .getArchives(Long.parseLong(userId))
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    // ── Recherche ─────────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> search(
            @RequestParam String q,
            @RequestHeader("X-User-Id") String userId) {
        List<MessageDto.MessageResponse> list = messageService
                .search(Long.parseLong(userId), q)
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    // ── Marquer lu ────────────────────────────────────────────
    @PostMapping("/{id}/lire")
    public ResponseEntity<MessageDto.ApiResponse<MessageDto.MessageResponse>> marquerLu(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") String userId) {
        Message m = messageService.marquerLu(id, Long.parseLong(userId));
        return ResponseEntity.ok(MessageDto.ApiResponse.ok(
                "Lu.", messageService.toResponse(m)));
    }

    // ── Marquer tous lus ──────────────────────────────────────
    @PostMapping("/lire-tout")
    public ResponseEntity<MessageDto.ApiResponse<Void>> marquerTousLus(
            @RequestHeader("X-User-Id") String userId) {
        messageService.marquerTousLus(Long.parseLong(userId));
        return ResponseEntity.ok(MessageDto.ApiResponse.ok(
                "Tous marques comme lus.", null));
    }

    // ── Archiver ──────────────────────────────────────────────
    @PostMapping("/{id}/archiver")
    public ResponseEntity<MessageDto.ApiResponse<MessageDto.MessageResponse>> archiver(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") String userId) {
        Message m = messageService.archiver(id, Long.parseLong(userId));
        return ResponseEntity.ok(MessageDto.ApiResponse.ok(
                "Archive.", messageService.toResponse(m)));
    }

    // ── Supprimer ─────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageDto.ApiResponse<Void>> supprimer(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") String userId) {
        messageService.supprimer(id, Long.parseLong(userId));
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("Supprime.", null));
    }

    // ── Communication avec un client ──────────────────────────
    @PostMapping("/client")
    public ResponseEntity<MessageDto.ApiResponse<MessageDto.MessageResponse>> envoyerMessageClient(
            @Valid @RequestBody MessageDto.EnvoyerMessageClientRequest req,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Nom", defaultValue = "Utilisateur") String userNom,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String userRole) {
        Message m = messageService.envoyerMessageClient(req, Long.parseLong(userId), userNom, userRole);
        return ResponseEntity.status(201).body(MessageDto.ApiResponse.ok("Message enregistre.", messageService.toResponse(m)));
    }

    @GetMapping("/client/hebergement/{hebergementId}")
    public ResponseEntity<MessageDto.ApiResponse<List<MessageDto.MessageResponse>>> getMessagesClientsByHebergement(
            @PathVariable("hebergementId") Long hebergementId) {
        List<MessageDto.MessageResponse> list = messageService.getMessagesClientsByHebergement(hebergementId)
                .stream().map(messageService::toResponse).toList();
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("OK", list));
    }

    @PatchMapping("/client/{id}/lu")
    public ResponseEntity<MessageDto.ApiResponse<MessageDto.MessageResponse>> marquerLuMessageClient(
            @PathVariable("id") Long id) {
        Message m = messageService.marquerLuMessageClient(id);
        return ResponseEntity.ok(MessageDto.ApiResponse.ok("Lu.", messageService.toResponse(m)));
    }

    // ── Health ────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("message-service UP");
    }
}