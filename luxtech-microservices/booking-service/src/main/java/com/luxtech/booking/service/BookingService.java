package com.luxtech.booking.service;

import com.luxtech.booking.client.ActivityLogDto;
import com.luxtech.booking.client.ChambreApiResponse;
import com.luxtech.booking.client.HebergementApiResponse;
import com.luxtech.booking.client.HebergementClient;
import com.luxtech.booking.client.PaymentClient;
import com.luxtech.booking.client.ServiceApiResponse;
import com.luxtech.booking.dto.BookingDto;
import com.luxtech.booking.entity.Facture;
import com.luxtech.booking.entity.FactureCounter;
import com.luxtech.booking.entity.Reservation;
import com.luxtech.booking.entity.ReservationService;
import com.luxtech.booking.exception.BookingException;
import com.luxtech.booking.repository.FactureCounterRepository;
import com.luxtech.booking.repository.FactureRepository;
import com.luxtech.booking.repository.ReservationRepository;
import com.luxtech.booking.repository.ReservationServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j @Transactional
public class BookingService {

    private final ReservationRepository reservationRepository;
    private final FactureRepository     factureRepository;
    private final FactureCounterRepository factureCounterRepository;
    private final ReservationServiceRepository reservationServiceRepository;
    private final RabbitTemplate        rabbitTemplate;
    private final FacturePdfService     facturePdfService;
    private final HebergementClient     hebergementClient;
    private final PaymentClient         paymentClient;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    // ══════════════════════════════════════════════════════
    // CREATION
    // ══════════════════════════════════════════════════════

    public Reservation createReservation(BookingDto.CreateReservationRequest req, Long userId) {
        if (req.getChambreId() != null) {
            List<Reservation> conflits = reservationRepository.findConflicts(
                    req.getChambreId(), req.getDateArrivee(), req.getDateDepart());
            if (!conflits.isEmpty()) {
                throw new BookingException("Chambre déjà réservée sur cette période.", 409);
            }
        }

        long nbNuits = req.getDateArrivee().until(req.getDateDepart()).getDays();
        if (nbNuits <= 0) {
            throw new BookingException("La date de départ doit être après la date d'arrivée.", 400);
        }

        BigDecimal prixTotal = (req.getPrixTotal() != null && req.getPrixTotal().compareTo(BigDecimal.ZERO) > 0)
                ? req.getPrixTotal() : BigDecimal.ZERO;

        BigDecimal prixNuit = prixTotal.compareTo(BigDecimal.ZERO) > 0
                ? prixTotal.divide(BigDecimal.valueOf(nbNuits), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal prixHt            = prixTotal.divide(new BigDecimal("1.20"), 2, RoundingMode.HALF_UP);
        BigDecimal montantTva        = prixTotal.subtract(prixHt);
        BigDecimal montantCommission = prixTotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantReverse    = prixTotal.subtract(montantCommission);

        Reservation r = Reservation.builder()
                .numeroReservation(generateNumero())
                .hotelId(req.getHotelId())
                .chambreId(req.getChambreId())
                .chambreTypeId(req.getChambreTypeId())
                .userId(userId)
                .agencyId(req.getAgencyId())
                .clientNom(req.getClientNom())
                .clientPrenom(req.getClientPrenom())
                .clientEmail(req.getClientEmail())
                .clientTelephone(req.getClientTelephone())
                .clientNationalite(req.getClientNationalite())
                .clientCinPasseport(req.getClientCinPasseport())
                .dateArrivee(req.getDateArrivee())
                .dateDepart(req.getDateDepart())
                .nbNuits((int) nbNuits)
                .nbAdultes(req.getNbAdultes() != null ? req.getNbAdultes() : 1)
                .nbEnfants(req.getNbEnfants() != null ? req.getNbEnfants() : 0)
                .prixChambreNuit(prixNuit)
                .prixHt(prixHt)
                .prixTotal(prixTotal)
                .montantTva(montantTva)
                .montantCommission(montantCommission)
                .montantReverse(montantReverse)
                .montantPaye(BigDecimal.ZERO)
                .paymentStatus(Reservation.PaymentStatus.NON_PAYE)
                .source(req.getSource() != null ? req.getSource() : Reservation.ReservationSource.DIRECT)
                .notes(req.getNotes())
                .status(Reservation.ReservationStatus.EN_ATTENTE)
                .build();

        Reservation saved = reservationRepository.save(r);
        log.info("Réservation créée : {}", saved.getNumeroReservation());

        genererFacture(saved);
        publishEvent("reservation.created", saved.getId());
        notifierProprietaire(saved.getHotelId(), "RESERVATION", "Nouvelle réservation",
                String.format("%s %s — %s au %s (%s)",
                        saved.getClientNom(), saved.getClientPrenom() != null ? saved.getClientPrenom() : "",
                        saved.getDateArrivee(), saved.getDateDepart(), saved.getNumeroReservation()));
        logActivite(saved.getHotelId(), userId, "CREATE", "Reservation",
                "Réservation créée : " + saved.getNumeroReservation());

        return saved;
    }

    // ══════════════════════════════════════════════════════
    // LECTURE
    // ══════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Reservation getById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new BookingException("Réservation introuvable.", 404));
    }

    @Transactional(readOnly = true)
    public Reservation getByNumero(String numero) {
        return reservationRepository.findByNumeroReservation(numero)
                .orElseThrow(() -> new BookingException("Réservation introuvable.", 404));
    }

    @Transactional(readOnly = true)
    public List<Reservation> getByHotel(Long hotelId) {
        return reservationRepository.findByHotelId(hotelId);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getByUser(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getByAgency(Long agencyId) {
        return reservationRepository.findByAgencyId(agencyId);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getCheckinsDuJour(Long hotelId) {
        return reservationRepository.findCheckinsDuJour(hotelId, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<Reservation> getCheckoutsDuJour(Long hotelId) {
        return reservationRepository.findCheckoutsDuJour(hotelId, LocalDate.now());
    }

    // ══════════════════════════════════════════════════════
    // ACTIONS DE STATUT
    // ══════════════════════════════════════════════════════

    public Reservation confirmer(Long id) {
        Reservation r = getById(id);
        if (r.getStatus() != Reservation.ReservationStatus.EN_ATTENTE) {
            throw new BookingException("Seules les réservations EN_ATTENTE peuvent être confirmées.", 400);
        }
        r.setStatus(Reservation.ReservationStatus.CONFIRMEE);
        Reservation saved = reservationRepository.save(r);
        publishEvent("reservation.confirmed", saved.getId());
        log.info("Réservation {} confirmée.", saved.getNumeroReservation());
        notifierProprietaire(saved.getHotelId(), "RESERVATION", "Réservation confirmée",
                String.format("%s — %s", saved.getClientNom(), saved.getNumeroReservation()));
        logActivite(saved.getHotelId(), null, "UPDATE", "Reservation",
                "Réservation confirmée : " + saved.getNumeroReservation());
        return saved;
    }

    public Reservation checkin(Long id) {
        Reservation r = getById(id);
        if (r.getStatus() != Reservation.ReservationStatus.CONFIRMEE) {
            throw new BookingException("Seules les réservations CONFIRMEE peuvent passer en check-in.", 400);
        }
        r.setStatus(Reservation.ReservationStatus.CHECKIN);
        r.setDateCheckinReel(LocalDateTime.now());
        Reservation saved = reservationRepository.save(r);

        syncChambreStatus(saved.getChambreId(), "OCCUPEE");

        publishEvent("reservation.checkin", saved.getId());
        log.info("Check-in effectué : {}", saved.getNumeroReservation());
        notifierProprietaire(saved.getHotelId(), "RESERVATION", "Check-in effectué",
                String.format("%s vient d'arriver — %s", saved.getClientNom(), saved.getNumeroReservation()));
        logActivite(saved.getHotelId(), null, "UPDATE", "Reservation",
                "Check-in effectué : " + saved.getNumeroReservation());
        return saved;
    }

    public Reservation checkout(Long id) {
        Reservation r = getById(id);
        if (r.getStatus() != Reservation.ReservationStatus.CHECKIN) {
            throw new BookingException("Seules les réservations en CHECKIN peuvent passer en check-out.", 400);
        }
        r.setStatus(Reservation.ReservationStatus.CHECKOUT);
        r.setDateCheckoutReel(LocalDateTime.now());
        Reservation saved = reservationRepository.save(r);

        factureRepository.findByReservationId(id).forEach(f -> {
            BigDecimal paye  = saved.getMontantPaye() != null ? saved.getMontantPaye() : BigDecimal.ZERO;
            BigDecimal reste = saved.getPrixTotal().subtract(paye);
            if (reste.compareTo(BigDecimal.ZERO) <= 0) {
                f.setStatut(Facture.StatutFacture.PAYEE);
                factureRepository.save(f);
            }
        });

        syncChambreStatus(saved.getChambreId(), "DISPONIBLE");

        publishEvent("reservation.checkout", saved.getId());
        log.info("Check-out effectué : {}", saved.getNumeroReservation());
        notifierProprietaire(saved.getHotelId(), "RESERVATION", "Check-out effectué",
                String.format("%s vient de partir — %s", saved.getClientNom(), saved.getNumeroReservation()));
        logActivite(saved.getHotelId(), null, "UPDATE", "Reservation",
                "Check-out effectué : " + saved.getNumeroReservation());
        return saved;
    }

    public Reservation annuler(Long id) {
        Reservation r = getById(id);
        if (!r.isAnnulable()) {
            throw new BookingException("Impossible d'annuler une réservation en cours ou terminée.", 400);
        }
        r.setStatus(Reservation.ReservationStatus.ANNULEE);
        r.setDateAnnulation(LocalDateTime.now());
        r.setPaymentStatus(Reservation.PaymentStatus.ANNULE);
        Reservation saved = reservationRepository.save(r);

        factureRepository.findByReservationId(id).forEach(f -> {
            f.setStatut(Facture.StatutFacture.ANNULEE);
            factureRepository.save(f);
        });

        publishEvent("reservation.cancelled", saved.getId());
        log.info("Réservation {} annulée.", saved.getNumeroReservation());
        notifierProprietaire(saved.getHotelId(), "RESERVATION", "Réservation annulée",
                String.format("%s — %s", saved.getClientNom(), saved.getNumeroReservation()));
        logActivite(saved.getHotelId(), null, "DELETE", "Reservation",
                "Réservation annulée : " + saved.getNumeroReservation());
        return saved;
    }

    // ══════════════════════════════════════════════════════
    // PAIEMENT
    // ══════════════════════════════════════════════════════

    public Reservation demanderAnnulationAgence(Long id, Long agencyId, Long userId, String motif) {
        Reservation reservation = getById(id);
        if (!agencyId.equals(reservation.getAgencyId())
                || reservation.getSource() != Reservation.ReservationSource.AGENCE) {
            throw new BookingException("Reservation not found for this agency.", 404);
        }
        if (!reservation.isAnnulable()) {
            throw new BookingException("Cette reservation ne peut plus etre annulee.", 409);
        }
        if (reservation.getAnnulationDemandeStatut() == Reservation.CancellationRequestStatus.DEMANDEE) {
            throw new BookingException("Une demande d'annulation est deja en attente.", 409);
        }

        reservation.setAnnulationDemandeStatut(Reservation.CancellationRequestStatus.DEMANDEE);
        reservation.setAnnulationDemandeMotif(motif);
        reservation.setAnnulationDemandeAt(LocalDateTime.now());
        reservation.setAnnulationDemandePar(userId);
        reservation.setAnnulationRefusMotif(null);
        Reservation saved = reservationRepository.save(reservation);
        publishEvent("reservation.cancellation-requested", saved.getId());
        notifierProprietaire(saved.getHotelId(), "RESERVATION", "Demande d'annulation agence",
                String.format("%s - %s", saved.getNumeroReservation(), motif != null ? motif : "Motif non precise"));
        return saved;
    }

    public Reservation deciderAnnulation(Long id, boolean acceptee, String motifRefus) {
        Reservation reservation = getById(id);
        if (reservation.getAnnulationDemandeStatut() != Reservation.CancellationRequestStatus.DEMANDEE) {
            throw new BookingException("Aucune demande d'annulation en attente.", 409);
        }

        if (acceptee) {
            BigDecimal montantPaye = reservation.getMontantPaye() != null ? reservation.getMontantPaye() : BigDecimal.ZERO;
            if (montantPaye.compareTo(BigDecimal.ZERO) > 0) {
                throw new BookingException("Traitez le remboursement avant d'accepter l'annulation.", 409);
            }
            reservation = annuler(id);
            reservation.setAnnulationDemandeStatut(Reservation.CancellationRequestStatus.ACCEPTEE);
            reservation.setMotifAnnulation(reservation.getAnnulationDemandeMotif());
        } else {
            reservation.setAnnulationDemandeStatut(Reservation.CancellationRequestStatus.REFUSEE);
            reservation.setAnnulationRefusMotif(motifRefus);
        }

        Reservation saved = reservationRepository.save(reservation);
        publishEvent(acceptee ? "reservation.cancellation-accepted" : "reservation.cancellation-refused", saved.getId());
        return saved;
    }

    public Reservation enregistrerPaiement(Long id, BigDecimal montant, Facture.MethodePaiement methode) {
        Reservation r = getById(id);

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BookingException("Le montant doit être supérieur à 0.", 400);
        }

        BigDecimal montantPaye = r.getMontantPaye() != null ? r.getMontantPaye() : BigDecimal.ZERO;
        BigDecimal nouveauPaye = montantPaye.add(montant);
        BigDecimal reste       = r.getPrixTotal().subtract(nouveauPaye);

        if (nouveauPaye.compareTo(r.getPrixTotal()) > 0) {
            throw new BookingException(
                    String.format("Montant dépasse le total dû. Reste à payer : %.2f MAD.",
                            r.getPrixTotal().subtract(montantPaye).doubleValue()), 400);
        }

        r.setMontantPaye(nouveauPaye);

        if (reste.compareTo(BigDecimal.ZERO) <= 0) {
            r.setPaymentStatus(Reservation.PaymentStatus.PAYE);
        } else {
            r.setPaymentStatus(Reservation.PaymentStatus.PARTIELLEMENT_PAYE);
        }

        Reservation saved = reservationRepository.save(r);

        factureRepository.findByReservationId(id).forEach(f -> {
            if (reste.compareTo(BigDecimal.ZERO) <= 0) {
                f.setStatut(Facture.StatutFacture.PAYEE);
            } else {
                f.setStatut(Facture.StatutFacture.PARTIELLEMENT_PAYEE);
            }
            if (methode != null) {
                f.setMethodePaiement(methode);
            }
            factureRepository.save(f);
        });

        syncPaiementVersPaymentService(saved.getHotelId(), saved.getId(), null,
                (saved.getClientNom() + " " + (saved.getClientPrenom() != null ? saved.getClientPrenom() : "")).trim(),
                montant, methode != null ? methode.name() : null);

        notifierProprietaire(saved.getHotelId(), "PAIEMENT_RECU", "Paiement reçu",
                String.format("%.2f MAD de %s — %s", montant.doubleValue(), saved.getClientNom(), saved.getNumeroReservation()));

        log.info("Paiement de {} MAD enregistré pour {}. Total payé : {} MAD.",
                montant, saved.getNumeroReservation(), nouveauPaye);
        return saved;
    }

    // ══════════════════════════════════════════════════════
    // PROLONGER
    // ══════════════════════════════════════════════════════

    public Reservation prolonger(Long id, LocalDate nouvelleDateDepart) {
        Reservation r = getById(id);

        if (r.getStatus() != Reservation.ReservationStatus.CHECKIN &&
                r.getStatus() != Reservation.ReservationStatus.CONFIRMEE) {
            throw new BookingException("Seules les réservations CONFIRMEE ou CHECKIN peuvent être prolongées.", 400);
        }
        if (!nouvelleDateDepart.isAfter(r.getDateDepart())) {
            throw new BookingException("La nouvelle date doit être après la date de départ actuelle.", 400);
        }

        int nbNuitsTotal = (int) r.getDateArrivee().until(nouvelleDateDepart).getDays();

        if (r.getPrixChambreNuit() != null && r.getPrixChambreNuit().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal nouveauTotal  = r.getPrixChambreNuit().multiply(BigDecimal.valueOf(nbNuitsTotal));
            BigDecimal prixHt        = nouveauTotal.divide(new BigDecimal("1.20"), 2, RoundingMode.HALF_UP);
            BigDecimal commission    = nouveauTotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
            r.setPrixTotal(nouveauTotal);
            r.setPrixHt(prixHt);
            r.setMontantTva(nouveauTotal.subtract(prixHt));
            r.setMontantCommission(commission);
            r.setMontantReverse(nouveauTotal.subtract(commission));
        }

        r.setDateDepart(nouvelleDateDepart);
        r.setNbNuits(nbNuitsTotal);
        Reservation saved = reservationRepository.save(r);
        log.info("Réservation {} prolongée jusqu'au {}", saved.getNumeroReservation(), nouvelleDateDepart);
        notifierProprietaire(saved.getHotelId(), "RESERVATION", "Séjour prolongé",
                String.format("%s — nouvelle date de départ : %s", saved.getClientNom(), nouvelleDateDepart));
        return saved;
    }

    // ══════════════════════════════════════════════════════
    // FACTURES
    // ══════════════════════════════════════════════════════

    private void genererFacture(Reservation r) {
        try {
            String numero = "FAC-" + genererNumeroFacture(r.getHotelId());

            Facture.TypeFacture typeFacture = r.getAgencyId() != null
                    ? Facture.TypeFacture.AGENCE
                    : Facture.TypeFacture.HOTEL;

            Facture f = Facture.builder()
                    .numeroFacture(numero)
                    .reservationId(r.getId())
                    .hotelId(r.getHotelId())
                    .agenceId(r.getAgencyId())
                    .montantTotal(r.getPrixTotal())
                    .montantHt(r.getPrixHt())
                    .montantTva(r.getMontantTva())
                    .montantCommission(r.getMontantCommission())
                    .typeFacture(typeFacture)
                    .statut(Facture.StatutFacture.IMPAYEE)
                    .dateFacture(LocalDate.now())
                    .dateEcheance(LocalDate.now().plusDays(14))
                    .build();

            factureRepository.save(f);
            log.info("Facture {} générée pour la réservation {}", numero, r.getNumeroReservation());
        } catch (Exception e) {
            log.warn("Erreur génération facture pour réservation {} : {}", r.getId(), e.getMessage());
        }
    }

    private void genererFactureService(ReservationService rs) {
        try {
            String numero = "FAC-" + genererNumeroFacture(rs.getHotelId());

            BigDecimal prixTotal = rs.getPrixTotal();
            BigDecimal prixHt = prixTotal.divide(new BigDecimal("1.20"), 2, RoundingMode.HALF_UP);
            BigDecimal montantTva = prixTotal.subtract(prixHt);
            BigDecimal montantCommission = prixTotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);

            Facture f = Facture.builder()
                    .numeroFacture(numero)
                    .reservationServiceId(rs.getId())
                    .hotelId(rs.getHotelId())
                    .montantTotal(prixTotal)
                    .montantHt(prixHt)
                    .montantTva(montantTva)
                    .montantCommission(montantCommission)
                    .typeFacture(Facture.TypeFacture.HOTEL)
                    .statut(Facture.StatutFacture.IMPAYEE)
                    .dateFacture(LocalDate.now())
                    .dateEcheance(LocalDate.now().plusDays(14))
                    .build();

            factureRepository.save(f);
            log.info("Facture {} générée pour le service {}", numero, rs.getServiceNom());
        } catch (Exception e) {
            log.warn("Erreur génération facture pour le service {} : {}", rs.getId(), e.getMessage());
        }
    }

    private String genererNumeroFacture(Long hotelId) {
        String jdbcUrl = datasourceUrl != null ? datasourceUrl.toLowerCase(Locale.ROOT) : "";
        if (jdbcUrl.startsWith("jdbc:postgresql:")) {
            factureCounterRepository.ensureExistsPostgres(hotelId);
        } else if (jdbcUrl.startsWith("jdbc:mysql:") || jdbcUrl.startsWith("jdbc:mariadb:")) {
            factureCounterRepository.ensureExistsMysql(hotelId);
        } else {
            throw new BookingException("Base de donnees non supportee pour le compteur de factures.", 500);
        }
        FactureCounter counter = factureCounterRepository.findByHotelIdForUpdate(hotelId)
                .orElseThrow(() -> new BookingException("Erreur génération numéro de facture.", 500));
        counter.setDernierNumero(counter.getDernierNumero() + 1);
        factureCounterRepository.save(counter);
        return String.format("%07d", counter.getDernierNumero());
    }

    @Transactional(readOnly = true)
    public List<Facture> getFacturesByHotel(Long hotelId) {
        return factureRepository.findByHotelId(hotelId);
    }

    @Transactional(readOnly = true)
    public List<Facture> getFacturesByAgency(Long agencyId) {
        return factureRepository.findByAgenceId(agencyId);
    }

    @Transactional(readOnly = true)
    public List<Facture> getFacturesByReservation(Long reservationId) {
        return factureRepository.findByReservationId(reservationId);
    }

    public Facture updateFactureStatut(Long id, Facture.StatutFacture statut) {
        Facture f = factureRepository.findById(id)
                .orElseThrow(() -> new BookingException("Facture introuvable.", 404));
        f.setStatut(statut);
        return factureRepository.save(f);
    }

    @Transactional(readOnly = true)
    public Facture getFactureById(Long id) {
        return factureRepository.findById(id)
                .orElseThrow(() -> new BookingException("Facture introuvable.", 404));
    }

    @Transactional(readOnly = true)
    public byte[] genererFacturePdf(Facture facture) {
        HebergementApiResponse.HebergementData hebergement = null;
        try {
            HebergementApiResponse response = hebergementClient.getById(facture.getHotelId());
            if (response != null && response.isSuccess()) {
                hebergement = response.getData();
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer les infos de l'hébergement {} pour la facture {} : {}",
                    facture.getHotelId(), facture.getNumeroFacture(), e.getMessage());
        }

        if (facture.getReservationServiceId() != null) {
            ReservationService rs = reservationServiceRepository.findById(facture.getReservationServiceId()).orElse(null);
            return facturePdfService.genererPourService(facture, rs, hebergement);
        }

        Reservation reservation = facture.getReservationId() != null
                ? reservationRepository.findById(facture.getReservationId()).orElse(null)
                : null;
        return facturePdfService.generer(facture, reservation, hebergement);
    }

    // ══════════════════════════════════════════════════════
    // RESERVATIONS DE SERVICES
    // ══════════════════════════════════════════════════════

    public ReservationService createReservationService(BookingDto.CreateReservationServiceRequest req) {
        if (req.getReservationId() == null) {
            if (req.getClientNom() == null || req.getClientNom().isBlank()) {
                throw new BookingException("Le nom du client est obligatoire pour un client externe.", 400);
            }
        }

        ServiceApiResponse serviceResp;
        try {
            serviceResp = hebergementClient.getServiceById(req.getServiceId());
        } catch (Exception e) {
            throw new BookingException("Service introuvable ou hebergement-service indisponible.", 404);
        }
        if (serviceResp == null || !serviceResp.isSuccess() || serviceResp.getData() == null) {
            throw new BookingException("Service introuvable.", 404);
        }
        ServiceApiResponse.ServiceData serviceData = serviceResp.getData();
        if (!Boolean.TRUE.equals(serviceData.getIsActive())) {
            throw new BookingException("Ce service n'est plus disponible.", 400);
        }

        int quantite = req.getQuantite() != null && req.getQuantite() > 0 ? req.getQuantite() : 1;
        BigDecimal prixTotal = serviceData.getPrix().multiply(BigDecimal.valueOf(quantite));

        String clientNom = req.getClientNom();
        String clientEmail = req.getClientEmail();
        String clientTelephone = req.getClientTelephone();

        if (req.getReservationId() != null) {
            Reservation r = getById(req.getReservationId());
            String prenom = r.getClientPrenom() != null ? r.getClientPrenom() : "";
            clientNom = (r.getClientNom() + " " + prenom).trim();
            clientEmail = r.getClientEmail();
            clientTelephone = r.getClientTelephone();
        }

        ReservationService rs = ReservationService.builder()
                .serviceId(serviceData.getId())
                .serviceNom(serviceData.getNom())
                .prixUnitaire(serviceData.getPrix())
                .hotelId(req.getHotelId())
                .reservationId(req.getReservationId())
                .clientNom(clientNom)
                .clientEmail(clientEmail)
                .clientTelephone(clientTelephone)
                .serviceDate(req.getServiceDate())
                .serviceHeure(req.getServiceHeure())
                .quantite(quantite)
                .prixTotal(prixTotal)
                .statut(ReservationService.StatutReservationService.EN_ATTENTE)
                .statutPaiement(ReservationService.StatutPaiementService.NON_PAYE)
                .notes(req.getNotes())
                .build();

        ReservationService saved = reservationServiceRepository.save(rs);
        log.info("Réservation de service créée : {} x{} pour {}", saved.getServiceNom(), quantite, clientNom);

        genererFactureService(saved);
        notifierProprietaire(saved.getHotelId(), "SERVICE", "Nouveau service réservé",
                String.format("%s x%d pour %s", saved.getServiceNom(), quantite, clientNom));

        return saved;
    }

    public ReservationService confirmerReservationService(Long id) {
        ReservationService rs = getReservationServiceById(id);
        if (rs.getStatut() != ReservationService.StatutReservationService.EN_ATTENTE) {
            throw new BookingException("Seules les réservations EN_ATTENTE peuvent être confirmées.", 400);
        }
        rs.setStatut(ReservationService.StatutReservationService.CONFIRMEE);
        ReservationService saved = reservationServiceRepository.save(rs);
        notifierProprietaire(saved.getHotelId(), "SERVICE", "Service confirmé",
                String.format("%s pour %s", saved.getServiceNom(), saved.getClientNom()));
        return saved;
    }

    public ReservationService terminerReservationService(Long id) {
        ReservationService rs = getReservationServiceById(id);
        if (rs.getStatut() != ReservationService.StatutReservationService.CONFIRMEE) {
            throw new BookingException("Seules les réservations CONFIRMEE peuvent être terminées.", 400);
        }
        rs.setStatut(ReservationService.StatutReservationService.TERMINEE);
        return reservationServiceRepository.save(rs);
    }

    public ReservationService annulerReservationService(Long id) {
        ReservationService rs = getReservationServiceById(id);
        if (rs.getStatut() == ReservationService.StatutReservationService.TERMINEE) {
            throw new BookingException("Impossible d'annuler une réservation déjà terminée.", 400);
        }
        rs.setStatut(ReservationService.StatutReservationService.ANNULEE);
        return reservationServiceRepository.save(rs);
    }

    public ReservationService enregistrerPaiementService(Long id, BigDecimal montant, ReservationService.MethodePaiementService methode) {
        ReservationService rs = getReservationServiceById(id);

        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BookingException("Le montant doit être supérieur à 0.", 400);
        }

        BigDecimal dejaPaye = rs.getMontantPaye() != null ? rs.getMontantPaye() : BigDecimal.ZERO;
        BigDecimal nouveauPaye = dejaPaye.add(montant);

        if (nouveauPaye.compareTo(rs.getPrixTotal()) > 0) {
            throw new BookingException(
                    String.format("Montant dépasse le total dû. Reste à payer : %.2f MAD.",
                            rs.getPrixTotal().subtract(dejaPaye).doubleValue()), 400);
        }

        rs.setMontantPaye(nouveauPaye);
        rs.setStatutPaiement(nouveauPaye.compareTo(rs.getPrixTotal()) >= 0
                ? ReservationService.StatutPaiementService.PAYE
                : ReservationService.StatutPaiementService.PARTIELLEMENT_PAYE);
        if (methode != null) {
            rs.setMethodePaiement(methode);
        }

        ReservationService saved = reservationServiceRepository.save(rs);

        syncPaiementVersPaymentService(saved.getHotelId(), null, saved.getId(),
                saved.getClientNom(), montant, methode != null ? methode.name() : null);

        notifierProprietaire(saved.getHotelId(), "PAIEMENT_RECU", "Paiement de service reçu",
                String.format("%.2f MAD de %s pour %s", montant.doubleValue(), saved.getClientNom(), saved.getServiceNom()));

        log.info("Paiement de {} MAD enregistré pour le service {} (réservation service #{})",
                montant, rs.getServiceNom(), rs.getId());
        return saved;
    }

    public ReservationService factureALaChambre(Long id) {
        ReservationService rs = getReservationServiceById(id);

        if (rs.getReservationId() == null) {
            throw new BookingException("Impossible de facturer à la chambre : aucune réservation liée.", 400);
        }
        if (rs.getStatutPaiement() == ReservationService.StatutPaiementService.PAYE
                || rs.getStatutPaiement() == ReservationService.StatutPaiementService.FACTURE_CHAMBRE) {
            throw new BookingException("Ce service est déjà payé ou facturé à la chambre.", 400);
        }

        BigDecimal dejaPaye = rs.getMontantPaye() != null ? rs.getMontantPaye() : BigDecimal.ZERO;
        BigDecimal resteAFacturer = rs.getPrixTotal().subtract(dejaPaye);

        Reservation r = getById(rs.getReservationId());
        r.setPrixTotal(r.getPrixTotal().add(resteAFacturer));
        reservationRepository.save(r);

        factureRepository.findByReservationId(rs.getReservationId()).forEach(f -> {
            f.setMontantTotal(f.getMontantTotal().add(resteAFacturer));
            factureRepository.save(f);
        });

        rs.setMontantPaye(rs.getPrixTotal());
        rs.setStatutPaiement(ReservationService.StatutPaiementService.FACTURE_CHAMBRE);
        log.info("Service {} facturé à la chambre — {} MAD ajoutés à la réservation {}",
                rs.getServiceNom(), resteAFacturer, r.getNumeroReservation());
        return reservationServiceRepository.save(rs);
    }

    @Transactional(readOnly = true)
    public List<ReservationService> getReservationsServicesByHotel(Long hotelId) {
        return reservationServiceRepository.findByHotelId(hotelId);
    }

    @Transactional(readOnly = true)
    public List<ReservationService> getReservationsServicesByReservation(Long reservationId) {
        return reservationServiceRepository.findByReservationId(reservationId);
    }

    @Transactional(readOnly = true)
    public ReservationService getReservationServiceById(Long id) {
        return reservationServiceRepository.findById(id)
                .orElseThrow(() -> new BookingException("Réservation de service introuvable.", 404));
    }

    public BookingDto.ReservationServiceResponse toReservationServiceResponse(ReservationService rs) {
        return BookingDto.ReservationServiceResponse.builder()
                .id(rs.getId())
                .serviceId(rs.getServiceId())
                .serviceNom(rs.getServiceNom())
                .prixUnitaire(rs.getPrixUnitaire())
                .hotelId(rs.getHotelId())
                .reservationId(rs.getReservationId())
                .clientNom(rs.getClientNom())
                .clientEmail(rs.getClientEmail())
                .clientTelephone(rs.getClientTelephone())
                .serviceDate(rs.getServiceDate())
                .serviceHeure(rs.getServiceHeure())
                .quantite(rs.getQuantite())
                .prixTotal(rs.getPrixTotal())
                .montantPaye(rs.getMontantPaye())
                .statut(rs.getStatut())
                .statutPaiement(rs.getStatutPaiement())
                .methodePaiement(rs.getMethodePaiement())
                .notes(rs.getNotes())
                .createdAt(rs.getCreatedAt())
                .build();
    }

    // ══════════════════════════════════════════════════════
    // BOOKING ENGINE PUBLIC
    // ══════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<BookingDto.DisponibiliteTypeResponse> checkDisponibilitePublique(Long hotelId, LocalDate dateArrivee, LocalDate dateDepart) {
        if (!dateDepart.isAfter(dateArrivee)) {
            throw new BookingException("La date de depart doit etre apres la date d'arrivee.", 400);
        }
        ChambreApiResponse chambresResp;
        try {
            chambresResp = hebergementClient.getChambresByHotel(hotelId);
        } catch (Exception e) {
            throw new BookingException("Etablissement indisponible.", 503);
        }
        if (chambresResp == null || !chambresResp.isSuccess() || chambresResp.getData() == null) {
            return List.of();
        }

        Map<Long, List<ChambreApiResponse.ChambreData>> parType = chambresResp.getData().stream()
                .filter(c -> !"HORS_SERVICE".equals(c.getStatus()))
                .collect(Collectors.groupingBy(ChambreApiResponse.ChambreData::getChambreTypeId));

        List<BookingDto.DisponibiliteTypeResponse> result = new ArrayList<>();
        for (Map.Entry<Long, List<ChambreApiResponse.ChambreData>> entry : parType.entrySet()) {
            List<ChambreApiResponse.ChambreData> chambresDuType = entry.getValue();
            long nbLibres = chambresDuType.stream()
                    .filter(c -> reservationRepository.findConflicts(c.getId(), dateArrivee, dateDepart).isEmpty())
                    .count();
            if (nbLibres > 0) {
                ChambreApiResponse.ChambreData premier = chambresDuType.get(0);
                BigDecimal prix = premier.getPrixNuitee() != null ? premier.getPrixNuitee() : premier.getPrixBase();
                result.add(BookingDto.DisponibiliteTypeResponse.builder()
                        .chambreTypeId(entry.getKey())
                        .nom(premier.getChambreTypeNom())
                        .description(premier.getChambreTypeDescription())
                        .prixBase(prix)
                        .nbDisponibles((int) nbLibres)
                        .capaciteAdultes(premier.getCapaciteAdultes())
                        .capaciteEnfants(premier.getCapaciteEnfants())
                        .amenities(premier.getAmenities())
                        .build());
            }
        }
        return result;
    }

    public Reservation creerReservationPublique(BookingDto.PublicReservationRequest req) {
        ChambreApiResponse chambresResp;
        try {
            chambresResp = hebergementClient.getChambresByHotel(req.getHotelId());
        } catch (Exception e) {
            throw new BookingException("Etablissement indisponible.", 503);
        }
        if (chambresResp == null || !chambresResp.isSuccess() || chambresResp.getData() == null) {
            throw new BookingException("Etablissement indisponible.", 503);
        }

        ChambreApiResponse.ChambreData chambreLibre = chambresResp.getData().stream()
                .filter(c -> req.getChambreTypeId().equals(c.getChambreTypeId()))
                .filter(c -> !"HORS_SERVICE".equals(c.getStatus()))
                .filter(c -> reservationRepository.findConflicts(c.getId(), req.getDateArrivee(), req.getDateDepart()).isEmpty())
                .findFirst()
                .orElseThrow(() -> new BookingException("Plus aucune chambre disponible pour ce type sur ces dates.", 409));

        long nbNuits = req.getDateArrivee().until(req.getDateDepart()).getDays();
        BigDecimal prixNuit = chambreLibre.getPrixNuitee() != null ? chambreLibre.getPrixNuitee() : chambreLibre.getPrixBase();
        if (prixNuit == null || prixNuit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BookingException("Aucun tarif valide n'est configuré pour cette chambre.", 409);
        }
        BigDecimal prixTotal = prixNuit.multiply(BigDecimal.valueOf(nbNuits));

        BookingDto.CreateReservationRequest createReq = BookingDto.CreateReservationRequest.builder()
                .hotelId(req.getHotelId())
                .chambreId(chambreLibre.getId())
                .clientNom(req.getClientNom())
                .clientPrenom(req.getClientPrenom())
                .clientEmail(req.getClientEmail())
                .clientTelephone(req.getClientTelephone())
                .clientNationalite(req.getClientNationalite())
                .clientCinPasseport(req.getClientCinPasseport())
                .dateArrivee(req.getDateArrivee())
                .dateDepart(req.getDateDepart())
                .nbAdultes(req.getNbAdultes() != null ? req.getNbAdultes() : 1)
                .nbEnfants(req.getNbEnfants() != null ? req.getNbEnfants() : 0)
                .prixTotal(prixTotal)
                .source(Reservation.ReservationSource.BOOKING_ENGINE)
                .notes(req.getNotes())
                .build();

        return createReservation(createReq, null);
    }

    public Reservation creerReservationAgence(BookingDto.PublicReservationRequest req, Long agencyId, Long userId) {
        if (!req.getDateDepart().isAfter(req.getDateArrivee())) {
            throw new BookingException("La date de départ doit être après la date d'arrivée.", 400);
        }

        ChambreApiResponse chambresResp;
        try {
            chambresResp = hebergementClient.getChambresByHotel(req.getHotelId());
        } catch (Exception e) {
            throw new BookingException("Établissement indisponible.", 503);
        }
        if (chambresResp == null || !chambresResp.isSuccess() || chambresResp.getData() == null) {
            throw new BookingException("Établissement indisponible.", 503);
        }

        int adultes = req.getNbAdultes() != null ? req.getNbAdultes() : 1;
        int enfants = req.getNbEnfants() != null ? req.getNbEnfants() : 0;
        ChambreApiResponse.ChambreData chambreLibre = chambresResp.getData().stream()
                .filter(c -> req.getChambreTypeId().equals(c.getChambreTypeId()))
                .filter(c -> !"HORS_SERVICE".equals(c.getStatus()))
                .filter(c -> c.getCapaciteAdultes() == null || c.getCapaciteAdultes() >= adultes)
                .filter(c -> c.getCapaciteEnfants() == null || c.getCapaciteEnfants() >= enfants)
                .filter(c -> reservationRepository.findConflicts(c.getId(), req.getDateArrivee(), req.getDateDepart()).isEmpty())
                .findFirst()
                .orElseThrow(() -> new BookingException("Plus aucune chambre disponible pour ce type sur ces dates.", 409));

        long nbNuits = req.getDateArrivee().until(req.getDateDepart()).getDays();
        BigDecimal prixNuit = chambreLibre.getPrixNuitee() != null ? chambreLibre.getPrixNuitee() : chambreLibre.getPrixBase();
        if (prixNuit == null || prixNuit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BookingException("Aucun tarif valide n'est configuré pour cette chambre.", 409);
        }
        BigDecimal prixTotal = prixNuit.multiply(BigDecimal.valueOf(nbNuits));
        BookingDto.CreateReservationRequest createReq = BookingDto.CreateReservationRequest.builder()
                .hotelId(req.getHotelId()).chambreId(chambreLibre.getId())
                .chambreTypeId(req.getChambreTypeId()).agencyId(agencyId)
                .clientNom(req.getClientNom()).clientPrenom(req.getClientPrenom())
                .clientEmail(req.getClientEmail()).clientTelephone(req.getClientTelephone())
                .dateArrivee(req.getDateArrivee()).dateDepart(req.getDateDepart())
                .nbAdultes(adultes).nbEnfants(enfants).prixTotal(prixTotal)
                .source(Reservation.ReservationSource.AGENCE).notes(req.getNotes()).build();

        return createReservation(createReq, userId);
    }

    // ══════════════════════════════════════════════════════
    // MAPPERS DTO
    // ══════════════════════════════════════════════════════

    public BookingDto.ReservationResponse toResponse(Reservation r) {
        return BookingDto.ReservationResponse.builder()
                .id(r.getId())
                .numeroReservation(r.getNumeroReservation())
                .hotelId(r.getHotelId())
                .chambreId(r.getChambreId())
                .chambreTypeId(r.getChambreTypeId())
                .userId(r.getUserId())
                .agencyId(r.getAgencyId())
                .clientNom(r.getClientNom())
                .clientPrenom(r.getClientPrenom())
                .clientEmail(r.getClientEmail())
                .clientTelephone(r.getClientTelephone())
                .dateArrivee(r.getDateArrivee())
                .dateDepart(r.getDateDepart())
                .nbNuits(r.getNbNuits())
                .nbAdultes(r.getNbAdultes())
                .nbEnfants(r.getNbEnfants())
                .prixChambreNuit(r.getPrixChambreNuit())
                .prixHt(r.getPrixHt())
                .prixTotal(r.getPrixTotal())
                .montantTva(r.getMontantTva())
                .montantCommission(r.getMontantCommission())
                .montantReverse(r.getMontantReverse())
                .montantPaye(r.getMontantPaye() != null ? r.getMontantPaye() : BigDecimal.ZERO)
                .status(r.getStatus())
                .paymentStatus(r.getPaymentStatus())
                .source(r.getSource())
                .annulationDemandeStatut(r.getAnnulationDemandeStatut())
                .annulationDemandeMotif(r.getAnnulationDemandeMotif())
                .annulationDemandeAt(r.getAnnulationDemandeAt())
                .annulationRefusMotif(r.getAnnulationRefusMotif())
                .notes(r.getNotes())
                .createdAt(r.getCreatedAt())
                .build();
    }

    public BookingDto.FactureResponse toFactureResponse(Facture f) {
        return BookingDto.FactureResponse.builder()
                .id(f.getId())
                .numeroFacture(f.getNumeroFacture())
                .reservationId(f.getReservationId())
                .hotelId(f.getHotelId())
                .agenceId(f.getAgenceId())
                .montantTotal(f.getMontantTotal())
                .montantHt(f.getMontantHt())
                .montantTva(f.getMontantTva())
                .montantCommission(f.getMontantCommission())
                .typeFacture(f.getTypeFacture())
                .statut(f.getStatut())
                .methodePaiement(f.getMethodePaiement())
                .dateFacture(f.getDateFacture())
                .dateEcheance(f.getDateEcheance())
                .createdAt(f.getCreatedAt())
                .build();
    }

    // ══════════════════════════════════════════════════════
    // CHECK-OUT AUTOMATIQUE
    // ══════════════════════════════════════════════════════

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void autoCheckoutReservationsExpirees() {
        LocalDate today = LocalDate.now();
        List<Reservation> expirees = reservationRepository.findByStatusAndDateDepartLessThanEqual(
                Reservation.ReservationStatus.CHECKIN, today);
        for (Reservation r : expirees) {
            try {
                checkout(r.getId());
                log.info("Check-out automatique effectué pour la réservation {}", r.getNumeroReservation());
            } catch (Exception e) {
                log.warn("Échec du check-out automatique pour la réservation {} : {}", r.getNumeroReservation(), e.getMessage());
            }
        }
    }

    // ══════════════════════════════════════════════════════
    // UTILITAIRES
    // ══════════════════════════════════════════════════════

    private String generateNumero() {
        String date   = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%05d", new Random().nextInt(99999));
        return "RES-" + date + "-" + random;
    }

    private void syncChambreStatus(Long chambreId, String statut) {
        if (chambreId == null) return;
        try {
            hebergementClient.updateChambreStatus(chambreId, statut);
        } catch (Exception e) {
            log.warn("Impossible de synchroniser le statut de la chambre {} vers {} : {}",
                    chambreId, statut, e.getMessage());
        }
    }

    private void syncPaiementVersPaymentService(Long hotelId, Long reservationId, Long reservationServiceId,
                                                String clientNom, BigDecimal montant, String modePaiementBrut) {
        try {
            PaymentClient.ManualPaymentDto dto = new PaymentClient.ManualPaymentDto();
            dto.reservationId = reservationId;
            dto.reservationServiceId = reservationServiceId;
            dto.hotelId = hotelId;
            dto.clientNom = clientNom;
            dto.montant = montant;
            dto.modePaiement = mapModePaiement(modePaiementBrut);
            paymentClient.enregistrerPaiementManuel(dto);
        } catch (Exception e) {
            log.warn("Impossible de synchroniser le paiement vers payment-service : {}", e.getMessage());
        }
    }

    private String mapModePaiement(String brut) {
        if (brut == null) return "ESPECES";
        return switch (brut) {
            case "ESPECE", "ESPECES" -> "ESPECES";
            case "CARTE", "CARTE_BANCAIRE" -> "CARTE_BANCAIRE";
            case "VIREMENT" -> "VIREMENT";
            case "CHEQUE" -> "CHEQUE";
            case "STRIPE" -> "STRIPE";
            default -> "ESPECES";
        };
    }

    private void notifierProprietaire(Long hotelId, String type, String titre, String message) {
        try {
            Long ownerUserId = null;
            try {
                HebergementApiResponse resp = hebergementClient.getById(hotelId);
                if (resp != null && resp.isSuccess() && resp.getData() != null) {
                    ownerUserId = resp.getData().getUserId();
                }
            } catch (Exception e) {
                log.warn("Impossible de recuperer le proprietaire de l'hotel {} : {}", hotelId, e.getMessage());
            }
            if (ownerUserId == null) return;

            Map<String, Object> event = new HashMap<>();
            event.put("type", type);
            event.put("userId", ownerUserId);
            event.put("titre", titre);
            event.put("message", message);
            rabbitTemplate.convertAndSend("luxtech.events", "hotel.notification", event);
        } catch (Exception e) {
            log.warn("Impossible de publier la notification ({}) : {}", type, e.getMessage());
        }
    }

    private void logActivite(Long hotelId, Long userId, String action, String entite, String description) {
        try {
            ActivityLogDto dto = new ActivityLogDto();
            dto.userId = userId;
            dto.userNom = userId != null ? "Utilisateur #" + userId : "Système";
            dto.action = action;
            dto.entite = entite;
            dto.description = description;
            hebergementClient.logActivite(hotelId, dto);
        } catch (Exception e) {
            log.warn("Impossible d'enregistrer le log d'activite : {}", e.getMessage());
        }
    }

    private void publishEvent(String routingKey, Long reservationId) {
        try {
            rabbitTemplate.convertAndSend("booking.exchange", routingKey,
                    "{\"reservationId\":" + reservationId + "}");
        } catch (Exception e) {
            log.warn("RabbitMQ indisponible, événement {} non publié : {}", routingKey, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Facture> getAllFactures() {
        return factureRepository.findAll();
    }

}
