package com.luxtech.message.service;

import com.luxtech.message.dto.MessageDto;
import com.luxtech.message.entity.Message;
import com.luxtech.message.exception.MessageException;
import com.luxtech.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageService {
    private final MessageRepository messageRepository;
    private final RabbitTemplate rabbitTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Envoyer un message ────────────────────────────────────
    public Message envoyer(
            MessageDto.EnvoyerMessageRequest req,
            Long expediteurId,
            String expediteurNom,
            String expediteurRole) {
        String conversationId = req.getConversationId();
        if (conversationId == null || conversationId.isBlank()) {
            if (req.getParentId() != null) {
                Message parent = messageRepository.findById(req.getParentId())
                        .orElseThrow(() -> new MessageException("Message parent introuvable.", 404));
                conversationId = parent.getConversationId();
            } else {
                conversationId = UUID.randomUUID().toString();
            }
        }
        Message message = Message.builder()
                .expediteurId(expediteurId)
                .expediteurNom(expediteurNom)
                .expediteurRole(expediteurRole)
                .destinataireId(req.getDestinataireId())
                .destinataireNom(req.getDestinataireNom())
                .sujet(req.getSujet())
                .contenu(req.getContenu())
                .parentId(req.getParentId())
                .conversationId(conversationId)
                .type(Message.MessageType.MESSAGE)
                .isLu(false)
                .isArchiveExpediteur(false)
                .isArchiveDestinataire(false)
                .isSupprimeExpediteur(false)
                .isSupprimeDestinataire(false)
                .build();
        Message saved = messageRepository.save(message);

        MessageDto.MessageResponse response = toResponse(saved);
        messagingTemplate.convertAndSendToUser(
                saved.getDestinataireId().toString(),
                "/queue/messages",
                response
        );
        messagingTemplate.convertAndSendToUser(
                saved.getExpediteurId().toString(),
                "/queue/messages/sent",
                response
        );
        notifierNouveauMessage(saved);
        log.info("Message envoye de {} a {}", expediteurId, req.getDestinataireId());
        return saved;
    }

    // ── Repondre a un message ─────────────────────────────────
    public Message repondre(
            MessageDto.RepondreRequest req,
            Long expediteurId,
            String expediteurNom,
            String expediteurRole) {
        Message parent = messageRepository.findById(req.getParentId())
                .orElseThrow(() -> new MessageException("Message introuvable.", 404));
        Long destinataireId = parent.getExpediteurId().equals(expediteurId)
                ? parent.getDestinataireId()
                : parent.getExpediteurId();
        Message reponse = Message.builder()
                .expediteurId(expediteurId)
                .expediteurNom(expediteurNom)
                .expediteurRole(expediteurRole)
                .destinataireId(destinataireId)
                .sujet("Re: " + parent.getSujet())
                .contenu(req.getContenu())
                .parentId(req.getParentId())
                .conversationId(parent.getConversationId())
                .type(Message.MessageType.MESSAGE)
                .isLu(false)
                .isArchiveExpediteur(false)
                .isArchiveDestinataire(false)
                .isSupprimeExpediteur(false)
                .isSupprimeDestinataire(false)
                .build();
        Message saved = messageRepository.save(reponse);

        MessageDto.MessageResponse response = toResponse(saved);
        messagingTemplate.convertAndSendToUser(
                saved.getDestinataireId().toString(),
                "/queue/messages",
                response
        );
        messagingTemplate.convertAndSendToUser(
                saved.getExpediteurId().toString(),
                "/queue/messages/sent",
                response
        );
        notifierNouveauMessage(saved);
        return saved;
    }

    // ── Boite de reception ────────────────────────────────────
    @Transactional(readOnly = true)
    public MessageDto.BoiteReceptionResponse getBoiteReception(Long userId) {
        List<Message> recus = messageRepository.findTousMessages(userId);
        long nonLus = messageRepository.countNonLus(userId);
        Map<String, List<Message>> parConversation = recus.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getConversationId() != null
                                ? m.getConversationId()
                                : m.getId().toString()));
        List<MessageDto.ConversationResponse> conversations = new ArrayList<>();
        for (Map.Entry<String, List<Message>> entry : parConversation.entrySet()) {
            List<Message> msgs = entry.getValue();
            Message dernier = msgs.get(0);
            Long autreUserId = dernier.getExpediteurId().equals(userId)
                    ? dernier.getDestinataireId()
                    : dernier.getExpediteurId();
            String autreUserNom = dernier.getExpediteurId().equals(userId)
                    ? dernier.getDestinataireNom()
                    : dernier.getExpediteurNom();
            long nonLusConv = msgs.stream()
                    .filter(m -> !Boolean.TRUE.equals(m.getIsLu())
                            && m.getDestinataireId().equals(userId))
                    .count();
            conversations.add(MessageDto.ConversationResponse.builder()
                    .conversationId(entry.getKey())
                    .autreUserId(autreUserId)
                    .autreUserNom(autreUserNom)
                    .dernierMessage(dernier.getContenu())
                    .dernierSujet(dernier.getSujet())
                    .dateDernierMessage(dernier.getCreatedAt())
                    .nonLus(nonLusConv)
                    .messages(msgs.stream().map(this::toResponse).toList())
                    .build());
        }
        return MessageDto.BoiteReceptionResponse.builder()
                .conversations(conversations)
                .totalNonLus(nonLus)
                .build();
    }

    // ── Lectures ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Message> getMessagesRecus(Long userId) {
        return messageRepository.findMessagesRecus(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesEnvoyes(Long userId) {
        return messageRepository.findMessagesEnvoyes(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getNonLus(Long userId) {
        return messageRepository.findNonLus(userId);
    }

    @Transactional(readOnly = true)
    public long countNonLus(Long userId) {
        return messageRepository.countNonLus(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversation(userId1, userId2);
    }

    @Transactional(readOnly = true)
    public List<Message> getReponses(Long parentId) {
        return messageRepository.findReponses(parentId);
    }

    @Transactional(readOnly = true)
    public List<Message> getArchives(Long userId) {
        return messageRepository.findArchives(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> search(Long userId, String q) {
        return messageRepository.search(userId, q);
    }

    // ── Actions ───────────────────────────────────────────────
    public Message marquerLu(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageException("Message introuvable.", 404));
        if (!message.getDestinataireId().equals(userId)) {
            throw new MessageException("Acces non autorise.", 403);
        }
        message.setIsLu(true);
        message.setDateLecture(LocalDateTime.now());
        Message saved = messageRepository.save(message);
        messagingTemplate.convertAndSendToUser(
                saved.getExpediteurId().toString(),
                "/queue/messages/lu",
                Map.of("messageId", saved.getId(), "lu", true)
        );
        return saved;
    }

    public void marquerTousLus(Long userId) {
        List<Message> nonLus = messageRepository.findNonLus(userId);
        nonLus.forEach(m -> {
            m.setIsLu(true);
            m.setDateLecture(LocalDateTime.now());
        });
        messageRepository.saveAll(nonLus);
    }

    public Message archiver(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageException("Message introuvable.", 404));
        if (message.getExpediteurId().equals(userId)) {
            message.setIsArchiveExpediteur(true);
        } else if (message.getDestinataireId().equals(userId)) {
            message.setIsArchiveDestinataire(true);
        } else {
            throw new MessageException("Acces non autorise.", 403);
        }
        return messageRepository.save(message);
    }

    public void supprimer(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageException("Message introuvable.", 404));
        if (message.getExpediteurId().equals(userId)) {
            message.setIsSupprimeExpediteur(true);
        } else if (message.getDestinataireId().equals(userId)) {
            message.setIsSupprimeDestinataire(true);
        } else {
            throw new MessageException("Acces non autorise.", 403);
        }
        messageRepository.save(message);
    }

    // ── Communication avec un client ──────────────────────────
    public Message envoyerMessageClient(
            MessageDto.EnvoyerMessageClientRequest req,
            Long staffUserId,
            String staffNom,
            String staffRole) {
        String conversationId = "client-" + req.getHebergementId() + "-" + req.getClientEmail();

        Message.MessageBuilder builder = Message.builder()
                .hebergementId(req.getHebergementId())
                .reservationId(req.getReservationId())
                .clientNom(req.getClientNom())
                .clientEmail(req.getClientEmail())
                .clientTelephone(req.getClientTelephone())
                .sujet(req.getSujet() != null && !req.getSujet().isBlank() ? req.getSujet() : "Communication client")
                .contenu(req.getContenu())
                .conversationId(conversationId)
                .type(Message.MessageType.MESSAGE)
                .isArchiveExpediteur(false)
                .isArchiveDestinataire(false)
                .isSupprimeExpediteur(false)
                .isSupprimeDestinataire(false);

        boolean deLaPartDuClient = Boolean.TRUE.equals(req.getDeLaPartDuClient());

        if (deLaPartDuClient) {
            builder.expediteurNom(req.getClientNom()).expediteurRole("CLIENT")
                    .destinataireId(staffUserId).destinataireNom(staffNom).destinataireRole(staffRole)
                    .isLu(false);
        } else {
            builder.expediteurId(staffUserId).expediteurNom(staffNom).expediteurRole(staffRole)
                    .destinataireNom(req.getClientNom()).destinataireRole("CLIENT")
                    .isLu(true);
        }

        Message saved = messageRepository.save(builder.build());
        log.info("Message client enregistre pour l'hebergement {} (client: {})", req.getHebergementId(), req.getClientNom());

        // Envoie un email uniquement quand l'hotel ecrit AU client (pas l'inverse)
        if (!deLaPartDuClient && req.getClientEmail() != null && !req.getClientEmail().isBlank()) {
            notifierClientParEmail(saved);
        }

        return saved;
    }

    private void notifierClientParEmail(Message m) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "MESSAGE_CLIENT");
            event.put("titre", m.getSujet());
            event.put("message", m.getContenu());
            event.put("email", m.getClientEmail());
            rabbitTemplate.convertAndSend("luxtech.events", "message.client", event);
        } catch (Exception e) {
            log.warn("Impossible de publier l'email au client : {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesClientsByHebergement(Long hebergementId) {
        return messageRepository.findByHebergementId(hebergementId);
    }

    public Message marquerLuMessageClient(Long id) {
        Message m = messageRepository.findById(id)
                .orElseThrow(() -> new MessageException("Message introuvable.", 404));
        m.setIsLu(true);
        m.setDateLecture(LocalDateTime.now());
        return messageRepository.save(m);
    }

    // ── Mapper ────────────────────────────────────────────────
    public MessageDto.MessageResponse toResponse(Message m) {
        return MessageDto.MessageResponse.builder()
                .id(m.getId())
                .expediteurId(m.getExpediteurId())
                .expediteurNom(m.getExpediteurNom())
                .expediteurRole(m.getExpediteurRole())
                .destinataireId(m.getDestinataireId())
                .destinataireNom(m.getDestinataireNom())
                .destinataireRole(m.getDestinataireRole())
                .sujet(m.getSujet())
                .contenu(m.getContenu())
                .isLu(m.getIsLu())
                .dateLecture(m.getDateLecture())
                .parentId(m.getParentId())
                .conversationId(m.getConversationId())
                .type(m.getType())
                .isArchiveExpediteur(m.getIsArchiveExpediteur())
                .isArchiveDestinataire(m.getIsArchiveDestinataire())
                .pieceJointeUrl(m.getPieceJointeUrl())
                .pieceJointeNom(m.getPieceJointeNom())
                .hebergementId(m.getHebergementId())
                .reservationId(m.getReservationId())
                .clientNom(m.getClientNom())
                .clientEmail(m.getClientEmail())
                .clientTelephone(m.getClientTelephone())
                .createdAt(m.getCreatedAt())
                .build();
    }

    // ── RabbitMQ ──────────────────────────────────────────────
    private void notifierNouveauMessage(Message m) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "NOUVEAU_MESSAGE");
            event.put("userId", m.getDestinataireId());
            event.put("titre", "Nouveau message de " + m.getExpediteurNom());
            event.put("message", m.getSujet());
            event.put("reservationId", null);
            event.put("email", null);
            rabbitTemplate.convertAndSend("luxtech.events", "message.nouveau", event);
        } catch (Exception e) {
            log.warn("Impossible de publier l'evenement message : {}", e.getMessage());
        }
    }
}