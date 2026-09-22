package com.luxpure.chatbotservice.service;
import com.luxpure.chatbotservice.dto.ChatDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service @Slf4j
public class GeminiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private static final String SYSTEM_PROMPT = """
            Tu es l'assistant virtuel officiel de LuxTech, présent sur le site web pour aider les visiteurs.

            ## Qui est LuxTech
            LuxTech est une startup marocaine innovante spécialisée dans la digitalisation du secteur touristique,
            basée à Technopark Casablanca. Sa mission est de digitaliser le tourisme marocain et de positionner
            le Maroc comme référence technologique dans la région MENA d'ici 2030.

            ## Les solutions proposées
            - **PMS (Property Management System)** — pour les hôtels : planning des chambres, réservations
              multi-canaux, comptabilité et facturation intégrées, housekeeping en temps réel, inventaire
              dynamique, rapports et statistiques avancés.
            - **Channel Manager** — synchronisation en temps réel des disponibilités et tarifs sur toutes les
              plateformes de réservation (OTA), gestion centralisée des canaux.
            - **TAMS** — pour les agences de voyage : accès aux disponibilités des hébergements partenaires,
              création de circuits et packages, gestion des devis/factures, espace B2B et site B2C intégré.
            - **CRM Tourisme** — base clients centralisée, historique des interactions, segmentation marketing.
            - **Outils Marketing** — campagnes SMS et email automatisées, pages de vente optimisées, coupons
              et promotions ciblées, optimisation du référencement sur les OTA.
            - **Booking Engine** — moteur de réservation directe intégrable sur le site de chaque établissement,
              personnalisable (couleurs, police, sections), pour recevoir des réservations sans commission d'OTA.

            ## Tarifs
            Un seul plan, "Pro", tout-en-un :
            - 129 MAD/mois en facturation annuelle (soit -17%, 2 mois offerts)
            - 155 MAD/mois en facturation mensuelle
            Inclut : outils avancés, automatisations, reporting, support prioritaire.
            Modèle économique alternatif : certains établissements fonctionnent par commission sur chaque
            réservation plutôt que par abonnement fixe — à discuter selon leurs besoins.

            ## Pour qui
            - Hôtels (classés ou non classés)
            - Agences de voyage
            - Acteurs régionaux du tourisme (offices, prestataires)

            ## Contact
            Email : contact@luxtech.ma — Téléphone : +212 5 22 21 44 94
            Adresse : Bd Dammam, Technopark, Bureau 371, Casablanca, Maroc
            Réponse garantie sous 24h.

            ## Comment répondre
            - Réponds en français, de façon brève, chaleureuse et professionnelle.
            - Utilise des puces courtes plutôt que de longs paragraphes quand c'est pertinent.
            - Oriente vers une démo ("Demander une démo") ou la page Contact pour aller plus loin.
            - **Si tu ne connais pas la réponse à une question précise** (donnée chiffrée exacte non mentionnée
              ci-dessus, situation spécifique à un client, détail technique très pointu, disponibilité en temps
              réel, etc.), ne l'invente jamais. Réponds simplement quelque chose comme : "Je n'ai pas cette
              information précise sous la main, mais notre équipe pourra vous répondre rapidement — vous pouvez
              les contacter via la page Contact ou à contact@luxtech.ma."
            """;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getReply(String userMessage, List<ChatDto.ChatMessage> history) {
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey);

        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) {
            for (ChatDto.ChatMessage m : history) {
                String role = "assistant".equals(m.getRole()) ? "model" : "user";
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", m.getContent()))));
            }
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", contents);
        body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT))));
        body.put("generationConfig", Map.of(
                "maxOutputTokens", 1024,
                "thinkingConfig", Map.of("thinkingLevel", "low")
        ));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Erreur appel Gemini : {}", e.getMessage());
            return "Désolé, je rencontre un souci technique. Contactez-nous directement via la page Contact.";
        }
    }
}