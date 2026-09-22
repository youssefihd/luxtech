package com.luxtech.payment.service;
import com.luxtech.payment.dto.PaymentDto;
import com.luxtech.payment.entity.Abonnement;
import com.luxtech.payment.entity.Paiement;
import com.luxtech.payment.entity.Reversement;
import com.luxtech.payment.exception.PaymentException;
import com.luxtech.payment.repository.AbonnementRepository;
import com.luxtech.payment.repository.PaiementRepository;
import com.luxtech.payment.repository.ReversementRepository;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j @Transactional
public class PaymentService {
    private final PaiementRepository paiementRepository;
    private final AbonnementRepository abonnementRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ReversementRepository reversementRepository;

    // ── Stripe : créer un PaymentIntent ──────────────────────
    public PaymentDto.PaymentIntentResponse createPaymentIntent(PaymentDto.CreatePaymentIntentRequest req, Long userId) {
        try {
            String currency = req.getCurrency() != null ? req.getCurrency().toLowerCase() : "mad";
            long montantCentimes = req.getMontant().multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(montantCentimes)
                    .setCurrency(currency)
                    .putMetadata("reservationId", req.getReservationId().toString())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Paiement paiement = Paiement.builder()
                    .reservationId(req.getReservationId())
                    .montant(req.getMontant())
                    .modePaiement(Paiement.ModePaiement.STRIPE)
                    .status(Paiement.PaiementStatus.EN_ATTENTE)
                    .stripePaymentIntentId(intent.getId())
                    .build();
            Paiement saved = paiementRepository.save(paiement);

            return PaymentDto.PaymentIntentResponse.builder()
                    .clientSecret(intent.getClientSecret())
                    .paymentIntentId(intent.getId())
                    .montant(req.getMontant())
                    .currency(currency)
                    .paiementId(saved.getId())
                    .build();
        } catch (Exception e) {
            log.error("Erreur Stripe : {}", e.getMessage());
            throw new PaymentException("Erreur lors de la création du paiement Stripe : " + e.getMessage(), 500);
        }
    }

    // ── Stripe : confirmer un paiement (webhook ou manuel) ───
    public Paiement confirmPayment(String paymentIntentId) {
        Paiement paiement = paiementRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new PaymentException("Paiement introuvable.", 404));
        paiement.setStatus(Paiement.PaiementStatus.VALIDE);
        paiement.setDatePaiement(LocalDateTime.now());
        Paiement saved = paiementRepository.save(paiement);
        publishPaiementEvent(saved);
        return saved;
    }

    // ── Paiement manuel (espèces, chèque, virement) ──────────
    public Paiement createManualPayment(PaymentDto.ManualPaymentRequest req, Long userId) {
        if (req.getReservationId() == null && req.getReservationServiceId() == null) {
            throw new PaymentException("Une reservation ou un service doit etre precise.", 400);
        }
        Paiement paiement = Paiement.builder()
                .reservationId(req.getReservationId())
                .reservationServiceId(req.getReservationServiceId())
                .hotelId(req.getHotelId())
                .clientNom(req.getClientNom())
                .montant(req.getMontant())
                .modePaiement(req.getModePaiement())
                .status(Paiement.PaiementStatus.VALIDE)
                .datePaiement(LocalDateTime.now())
                .notes(req.getNotes())
                .reference("MAN-" + System.currentTimeMillis())
                .build();
        Paiement saved = paiementRepository.save(paiement);
        publishPaiementEvent(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Paiement> getByReservation(Long reservationId) {
        return paiementRepository.findByReservationId(reservationId);
    }

    @Transactional(readOnly = true)
    public List<Paiement> getByHotel(Long hotelId) {
        return paiementRepository.findByHotelId(hotelId);
    }

    @Transactional(readOnly = true)
    public BigDecimal getMontantPayeByReservation(Long reservationId) {
        return paiementRepository.sumMontantValideByReservation(reservationId);
    }

    public Paiement rembourser(Long id) {
        Paiement p = paiementRepository.findById(id)
                .orElseThrow(() -> new PaymentException("Paiement introuvable.", 404));
        p.setStatus(Paiement.PaiementStatus.REMBOURSE);
        return paiementRepository.save(p);
    }

    public PaymentDto.PaiementResponse toResponse(Paiement p) {
        return PaymentDto.PaiementResponse.builder()
                .id(p.getId()).reservationId(p.getReservationId())
                .reservationServiceId(p.getReservationServiceId()).abonnementId(p.getAbonnementId())
                .hotelId(p.getHotelId()).clientNom(p.getClientNom())
                .montant(p.getMontant()).modePaiement(p.getModePaiement()).status(p.getStatus())
                .stripePaymentIntentId(p.getStripePaymentIntentId()).reference(p.getReference())
                .notes(p.getNotes()).datePaiement(p.getDatePaiement()).createdAt(p.getCreatedAt())
                .build();
    }

    // ══════════════════════════════════════════════════════
    // ABONNEMENTS
    // ══════════════════════════════════════════════════════

    private static final Map<Abonnement.Plan, BigDecimal> PRIX_PLANS = Map.of(
            Abonnement.Plan.BASIQUE, new BigDecimal("299.00"),
            Abonnement.Plan.PREMIUM, new BigDecimal("599.00"),
            Abonnement.Plan.ENTREPRISE, new BigDecimal("999.00")
    );

    public Abonnement demanderAbonnement(Long hotelId, Abonnement.Plan plan) {
        Abonnement a = Abonnement.builder()
                .hotelId(hotelId)
                .plan(plan)
                .prix(PRIX_PLANS.get(plan))
                .statut(Abonnement.Statut.EN_ATTENTE)
                .build();
        return abonnementRepository.save(a);
    }

    public Abonnement validerAbonnement(Long id) {
        Abonnement a = abonnementRepository.findById(id)
                .orElseThrow(() -> new PaymentException("Abonnement introuvable.", 404));
        if (a.getStatut() != Abonnement.Statut.EN_ATTENTE) {
            throw new PaymentException("Seul un abonnement EN_ATTENTE peut etre valide.", 400);
        }

        abonnementRepository.findByHotelIdAndStatut(a.getHotelId(), Abonnement.Statut.ACTIF)
                .forEach(old -> { old.setStatut(Abonnement.Statut.EXPIRE); abonnementRepository.save(old); });

        a.setStatut(Abonnement.Statut.ACTIF);
        a.setDateDebut(LocalDate.now());
        a.setDateExpiration(LocalDate.now().plusMonths(1));
        Abonnement saved = abonnementRepository.save(a);

        Paiement p = Paiement.builder()
                .abonnementId(saved.getId())
                .hotelId(saved.getHotelId())
                .montant(saved.getPrix())
                .modePaiement(Paiement.ModePaiement.VIREMENT)
                .status(Paiement.PaiementStatus.VALIDE)
                .datePaiement(LocalDateTime.now())
                .reference("ABO-" + saved.getId())
                .notes("Paiement abonnement " + saved.getPlan())
                .build();
        paiementRepository.save(p);

        return saved;
    }

    public Abonnement annulerAbonnement(Long id) {
        Abonnement a = abonnementRepository.findById(id)
                .orElseThrow(() -> new PaymentException("Abonnement introuvable.", 404));
        if (a.getStatut() != Abonnement.Statut.ACTIF && a.getStatut() != Abonnement.Statut.EN_ATTENTE) {
            throw new PaymentException("Cet abonnement ne peut plus etre annule.", 400);
        }
        a.setStatut(Abonnement.Statut.ANNULE);
        return abonnementRepository.save(a);
    }

    @Transactional(readOnly = true)
    public List<Abonnement> getAbonnementsByHotel(Long hotelId) {
        return abonnementRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
    }

    @Transactional(readOnly = true)
    public Abonnement getAbonnementActif(Long hotelId) {
        return abonnementRepository.findFirstByHotelIdAndStatutAndDateExpirationGreaterThanEqual(
                hotelId, Abonnement.Statut.ACTIF, LocalDate.now()).orElse(null);
    }

    public PaymentDto.AbonnementResponse toAbonnementResponse(Abonnement a) {
        return PaymentDto.AbonnementResponse.builder()
                .id(a.getId()).hotelId(a.getHotelId())
                .plan(a.getPlan()).prix(a.getPrix())
                .statut(a.getStatut())
                .dateDebut(a.getDateDebut()).dateExpiration(a.getDateExpiration())
                .createdAt(a.getCreatedAt())
                .build();
    }

    // ── RabbitMQ ──────────────────────────────────────────────
    private void publishPaiementEvent(Paiement p) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "PAIEMENT_RECU");
            event.put("reservationId", p.getReservationId());
            event.put("titre", "Paiement reçu");
            event.put("message", "Paiement de " + p.getMontant() + " MAD confirmé.");
            rabbitTemplate.convertAndSend("luxtech.events", "reservation.payment", event);
        } catch (Exception e) {
            log.warn("Impossible de publier l'événement paiement : {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Paiement> getAll() {
        return paiementRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Abonnement> getAllActifs() {
        return abonnementRepository.findByStatutAndDateExpirationGreaterThanEqual(Abonnement.Statut.ACTIF, LocalDate.now());
    }

    // ══════════════════════════════════════════════════════
    // REVERSEMENTS
    // ══════════════════════════════════════════════════════

    public Reversement createReversement(PaymentDto.CreateReversementRequest req) {
        Reversement r = Reversement.builder()
                .hotelId(req.getHotelId())
                .montantBrut(req.getMontantBrut())
                .montantCommission(req.getMontantCommission())
                .montantNet(req.getMontantNet())
                .periodeDebut(req.getPeriodeDebut())
                .periodeFin(req.getPeriodeFin())
                .statut(Reversement.StatutReversement.EN_ATTENTE)
                .nbReservations(req.getNbReservations())
                .build();
        return reversementRepository.save(r);
    }

    public Reversement marquerReversementEffectue(Long id, String referenceVirement) {
        Reversement r = reversementRepository.findById(id)
                .orElseThrow(() -> new PaymentException("Reversement introuvable.", 404));
        r.setStatut(Reversement.StatutReversement.EFFECTUE);
        r.setDateReversement(LocalDateTime.now());
        r.setReferenceVirement(referenceVirement);
        return reversementRepository.save(r);
    }

    public Reversement marquerReversementEchec(Long id) {
        Reversement r = reversementRepository.findById(id)
                .orElseThrow(() -> new PaymentException("Reversement introuvable.", 404));
        r.setStatut(Reversement.StatutReversement.ECHEC);
        return reversementRepository.save(r);
    }

    @Transactional(readOnly = true)
    public List<Reversement> getAllReversements() {
        return reversementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Reversement> getReversementsByHotel(Long hotelId) {
        return reversementRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
    }

    public PaymentDto.ReversementResponse toReversementResponse(Reversement r) {
        return PaymentDto.ReversementResponse.builder()
                .id(r.getId()).hotelId(r.getHotelId())
                .montantBrut(r.getMontantBrut()).montantCommission(r.getMontantCommission()).montantNet(r.getMontantNet())
                .periodeDebut(r.getPeriodeDebut()).periodeFin(r.getPeriodeFin())
                .statut(r.getStatut()).dateReversement(r.getDateReversement()).referenceVirement(r.getReferenceVirement())
                .nbReservations(r.getNbReservations())
                .createdAt(r.getCreatedAt())
                .build();
    }

}