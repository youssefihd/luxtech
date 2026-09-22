package com.luxtech.hebergement.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxtech.hebergement.dto.HebergementDto;
import com.luxtech.hebergement.entity.*;
import com.luxtech.hebergement.exception.HebergementException;
import com.luxtech.hebergement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.luxtech.hebergement.repository.TarifSaisonnierRepository;
import com.luxtech.hebergement.repository.ActivityLogRepository;
import java.time.LocalDate;
@Service @RequiredArgsConstructor @Slf4j @Transactional
public class HebergementService {
    private final HebergementRepository hebergementRepository;
    private final ChambreTypeRepository chambreTypeRepository;
    private final ChambreRepository chambreRepository;
    private final PhotoRepository photoRepository;
    private final DocumentRepository documentRepository;
    private final ServiceHebergementRepository serviceHebergementRepository;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;
    private final TarifSaisonnierRepository tarifSaisonnierRepository;
    private final ActivityLogRepository activityLogRepository;
    public Hebergement createHebergement(HebergementDto.CreateHebergementRequest req, Long userId) {
        String slug = generateSlug(req.getNom());
        Hebergement hebergement = Hebergement.builder()
                .nom(req.getNom()).nomLegal(req.getNomLegal()).numeroFiscal(req.getNumeroFiscal())
                .description(req.getDescription()).adresse(req.getAdresse())
                .ville(req.getVille()).pays(req.getPays()).codePostal(req.getCodePostal())
                .telephone(req.getTelephone()).email(req.getEmail()).website(req.getWebsite())
                .etoiles(req.getEtoiles()).slug(slug).userId(userId)
                .heureCheckin(req.getHeureCheckin() != null ? req.getHeureCheckin() : "15:00")
                .heureCheckout(req.getHeureCheckout() != null ? req.getHeureCheckout() : "11:00")
                .devise(req.getDevise() != null ? req.getDevise() : "MAD")
                .status(Hebergement.HebergementStatus.PENDING_APPROVAL).isActive(true).build();
        return hebergementRepository.save(hebergement);
    }
    @Transactional(readOnly = true)
    public List<Hebergement> getAll() { return hebergementRepository.findAll(); }
    @Transactional(readOnly = true)
    public List<Hebergement> getAllActive() { return hebergementRepository.findAllActive(); }
    @Transactional(readOnly = true)
    public List<Hebergement> getByUserId(Long userId) { return hebergementRepository.findByUserId(userId); }
    @Transactional(readOnly = true)
    public List<Hebergement> search(String q) { return hebergementRepository.search(q); }
    @Transactional(readOnly = true)
    public Hebergement getById(Long id) {
        return hebergementRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Hebergement introuvable.", 404));
    }
    @Transactional(readOnly = true)
    public Hebergement getBySlug(String slug) {
        return hebergementRepository.findBySlug(slug)
                .orElseThrow(() -> new HebergementException("Hebergement introuvable.", 404));
    }
    public Hebergement update(Long id, HebergementDto.CreateHebergementRequest req) {
        Hebergement h = getById(id);
        if (req.getNom() != null) h.setNom(req.getNom());
        if (req.getDescription() != null) h.setDescription(req.getDescription());
        if (req.getAdresse() != null) h.setAdresse(req.getAdresse());
        if (req.getVille() != null) h.setVille(req.getVille());
        if (req.getPays() != null) h.setPays(req.getPays());
        if (req.getCodePostal() != null) h.setCodePostal(req.getCodePostal());
        if (req.getTelephone() != null) h.setTelephone(req.getTelephone());
        if (req.getEmail() != null) h.setEmail(req.getEmail());
        if (req.getWebsite() != null) h.setWebsite(req.getWebsite());
        if (req.getEtoiles() != null) h.setEtoiles(req.getEtoiles());
        if (req.getHeureCheckin() != null) h.setHeureCheckin(req.getHeureCheckin());
        if (req.getHeureCheckout() != null) h.setHeureCheckout(req.getHeureCheckout());
        return hebergementRepository.save(h);
    }
    public Hebergement approve(Long id) {
        Hebergement h = getById(id);
        h.setStatus(Hebergement.HebergementStatus.APPROVED);
        return hebergementRepository.save(h);
    }
    public Hebergement suspend(Long id) {
        Hebergement h = getById(id);
        h.setStatus(Hebergement.HebergementStatus.SUSPENDED);
        return hebergementRepository.save(h);
    }
    public ChambreType createChambreType(Long hebergementId, HebergementDto.CreateChambreTypeRequest req) {
        Hebergement hebergement = getById(hebergementId);
        ChambreType ct = ChambreType.builder()
                .nom(req.getNom()).description(req.getDescription()).prixBase(req.getPrixBase())
                .capaciteAdultes(req.getCapaciteAdultes() != null ? req.getCapaciteAdultes() : 2)
                .capaciteEnfants(req.getCapaciteEnfants() != null ? req.getCapaciteEnfants() : 0)
                .amenities(req.getAmenities())
                .ordreAffichage(req.getOrdreAffichage() != null ? req.getOrdreAffichage() : 0)
                .hotel(hebergement).build();
        return chambreTypeRepository.save(ct);
    }
    public ChambreType updateChambreType(Long id, HebergementDto.UpdateChambreTypeRequest req) {
        ChambreType ct = getChambreTypeById(id);
        if (req.getNom() != null) ct.setNom(req.getNom());
        if (req.getDescription() != null) ct.setDescription(req.getDescription());
        if (req.getPrixBase() != null) ct.setPrixBase(req.getPrixBase());
        if (req.getCapaciteAdultes() != null) ct.setCapaciteAdultes(req.getCapaciteAdultes());
        if (req.getCapaciteEnfants() != null) ct.setCapaciteEnfants(req.getCapaciteEnfants());
        if (req.getAmenities() != null) ct.setAmenities(req.getAmenities());
        if (req.getOrdreAffichage() != null) ct.setOrdreAffichage(req.getOrdreAffichage());
        return chambreTypeRepository.save(ct);
    }
    public ChambreType uploadChambreTypePhoto(Long id, MultipartFile photo) {
        ChambreType ct = getChambreTypeById(id);
        try {
            String url = storageService.uploadFile(photo, "chambre-types");
            ct.setImagesUrls(url);
            return chambreTypeRepository.save(ct);
        } catch (Exception e) {
            log.error("Erreur upload photo type de chambre {} : {}", id, e.getMessage());
            throw new HebergementException("Erreur lors de l'upload de la photo.", 500);
        }
    }
    @Transactional(readOnly = true)
    public List<ChambreType> getChambreTypesByHotel(Long hebergementId) {
        return chambreTypeRepository.findByHotelId(hebergementId);
    }
    public ChambreType getChambreTypeById(Long id) {
        return chambreTypeRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Type de chambre introuvable.", 404));
    }
    public void deleteChambreType(Long id) {
        chambreTypeRepository.deleteById(id);
    }
    public Chambre createChambre(HebergementDto.CreateChambreRequest req) {
        ChambreType ct = getChambreTypeById(req.getChambreTypeId());
        Chambre.ChambreStatus statutInitial = req.getStatut() != null ? req.getStatut() : Chambre.ChambreStatus.DISPONIBLE;
        boolean tempStatus = statutInitial == Chambre.ChambreStatus.EN_MAINTENANCE || statutInitial == Chambre.ChambreStatus.EN_NETTOYAGE;
        Chambre chambre = Chambre.builder()
                .numero(req.getNumero()).etage(req.getEtage())
                .notes(req.getNotes()).chambreType(ct)
                .capacite(req.getCapacite())
                .prixNuitee(req.getPrixNuitee())
                .superficie(req.getSuperficie())
                .equipements(req.getEquipements())
                .status(statutInitial)
                .statusChangedAt(LocalDateTime.now())
                .statusDureeMinutes(tempStatus ? req.getDureeMinutes() : null)
                .isActive(true).build();
        return chambreRepository.save(chambre);
    }
    public Chambre updateChambre(Long id, HebergementDto.UpdateChambreRequest req) {
        Chambre c = chambreRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Chambre introuvable.", 404));
        if (req.getNumero() != null) c.setNumero(req.getNumero());
        if (req.getEtage() != null) c.setEtage(req.getEtage());
        if (req.getNotes() != null) c.setNotes(req.getNotes());
        if (req.getCapacite() != null) c.setCapacite(req.getCapacite());
        if (req.getPrixNuitee() != null) c.setPrixNuitee(req.getPrixNuitee());
        if (req.getSuperficie() != null) c.setSuperficie(req.getSuperficie());
        if (req.getEquipements() != null) c.setEquipements(req.getEquipements());
        if (req.getStatut() != null) {
            c.setStatus(req.getStatut());
            c.setStatusChangedAt(LocalDateTime.now());
            boolean tempStatus = req.getStatut() == Chambre.ChambreStatus.EN_MAINTENANCE || req.getStatut() == Chambre.ChambreStatus.EN_NETTOYAGE;
            c.setStatusDureeMinutes(tempStatus ? req.getDureeMinutes() : null);
        }
        if (req.getChambreTypeId() != null) {
            ChambreType ct = getChambreTypeById(req.getChambreTypeId());
            c.setChambreType(ct);
        }
        return chambreRepository.save(c);
    }
    public Chambre uploadChambrePhoto(Long id, MultipartFile photo) {
        Chambre c = chambreRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Chambre introuvable.", 404));
        try {
            String url = storageService.uploadFile(photo, "chambres");
            c.setImageUrl(url);
            return chambreRepository.save(c);
        } catch (Exception e) {
            log.error("Erreur upload photo chambre {} : {}", id, e.getMessage());
            throw new HebergementException("Erreur lors de l'upload de la photo.", 500);
        }
    }
    public void deleteChambre(Long id) {
        if (!chambreRepository.existsById(id)) {
            throw new HebergementException("Chambre introuvable.", 404);
        }
        chambreRepository.deleteById(id);
    }
    @Transactional(readOnly = true)
    public List<Chambre> getChambresByHotel(Long hebergementId) {
        return chambreRepository.findByChambreTypeHotelId(hebergementId);
    }
    public Chambre updateChambreStatus(Long id, Chambre.ChambreStatus status, Integer dureeMinutes) {
        Chambre c = chambreRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Chambre introuvable.", 404));
        c.setStatus(status);
        c.setStatusChangedAt(LocalDateTime.now());
        boolean tempStatus = status == Chambre.ChambreStatus.EN_MAINTENANCE || status == Chambre.ChambreStatus.EN_NETTOYAGE;
        c.setStatusDureeMinutes(tempStatus ? dureeMinutes : null);
        return chambreRepository.save(c);
    }
    // Tâche planifiée — vérifie toutes les minutes si des chambres en maintenance/nettoyage
// ont dépassé leur durée prévue, et les repasse automatiquement à DISPONIBLE.
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void revertExpiredChambreStatuses() {
        List<Chambre> candidates = chambreRepository.findByStatusIn(
                List.of(Chambre.ChambreStatus.EN_MAINTENANCE, Chambre.ChambreStatus.EN_NETTOYAGE));
        LocalDateTime now = LocalDateTime.now();
        for (Chambre c : candidates) {
            if (c.getStatusDureeMinutes() != null && c.getStatusChangedAt() != null) {
                LocalDateTime expiry = c.getStatusChangedAt().plusMinutes(c.getStatusDureeMinutes());
                if (now.isAfter(expiry)) {
                    c.setStatus(Chambre.ChambreStatus.DISPONIBLE);
                    c.setStatusChangedAt(now);
                    c.setStatusDureeMinutes(null);
                    chambreRepository.save(c);
                    log.info("Chambre {} repassée DISPONIBLE automatiquement (fin de {}).",
                            c.getNumero(), c.getStatus());
                }
            }
        }
    }
    public HebergementDto.ChambreTypeResponse toChambreTypeResponse(ChambreType ct) {
        int nbChambres = chambreRepository.findByChambreTypeId(ct.getId()).size();
        return HebergementDto.ChambreTypeResponse.builder()
                .id(ct.getId()).nom(ct.getNom()).description(ct.getDescription())
                .prixBase(ct.getPrixBase()).capaciteAdultes(ct.getCapaciteAdultes())
                .capaciteEnfants(ct.getCapaciteEnfants()).amenities(ct.getAmenities())
                .imagesUrls(ct.getImagesUrls()).ordreAffichage(ct.getOrdreAffichage())
                .hotelId(ct.getHotel().getId())
                .nombreChambres(nbChambres).build();
    }
    public ServiceHebergement createService(Long hotelId, HebergementDto.CreateServiceRequest req) {
        Hebergement hebergement = getById(hotelId);
        ServiceHebergement s = ServiceHebergement.builder()
                .nom(req.getNom()).description(req.getDescription())
                .categorie(req.getCategorie()).prix(req.getPrix())
                .duree(req.getDuree()).capaciteMax(req.getCapaciteMax())
                .isActive(true).hotel(hebergement).build();
        return serviceHebergementRepository.save(s);
    }
    public ServiceHebergement updateService(Long id, HebergementDto.UpdateServiceRequest req) {
        ServiceHebergement s = getServiceById(id);
        if (req.getNom() != null) s.setNom(req.getNom());
        if (req.getDescription() != null) s.setDescription(req.getDescription());
        if (req.getCategorie() != null) s.setCategorie(req.getCategorie());
        if (req.getPrix() != null) s.setPrix(req.getPrix());
        if (req.getDuree() != null) s.setDuree(req.getDuree());
        if (req.getCapaciteMax() != null) s.setCapaciteMax(req.getCapaciteMax());
        return serviceHebergementRepository.save(s);
    }
    public ServiceHebergement toggleServiceStatus(Long id) {
        ServiceHebergement s = getServiceById(id);
        s.setIsActive(!Boolean.TRUE.equals(s.getIsActive()));
        return serviceHebergementRepository.save(s);
    }
    public void deleteService(Long id) {
        if (!serviceHebergementRepository.existsById(id)) {
            throw new HebergementException("Service introuvable.", 404);
        }
        serviceHebergementRepository.deleteById(id);
    }
    public ServiceHebergement uploadServicePhoto(Long id, MultipartFile photo) {
        ServiceHebergement s = getServiceById(id);
        try {
            String url = storageService.uploadFile(photo, "services");
            s.setImageUrl(url);
            return serviceHebergementRepository.save(s);
        } catch (Exception e) {
            log.error("Erreur upload photo service {} : {}", id, e.getMessage());
            throw new HebergementException("Erreur lors de l'upload de la photo.", 500);
        }
    }
    @Transactional(readOnly = true)
    public List<ServiceHebergement> getServicesByHotel(Long hotelId) {
        return serviceHebergementRepository.findByHotelId(hotelId);
    }
    @Transactional(readOnly = true)
    public ServiceHebergement getServiceById(Long id) {
        return serviceHebergementRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Service introuvable.", 404));
    }
    public HebergementDto.ServiceResponse toServiceResponse(ServiceHebergement s) {
        return HebergementDto.ServiceResponse.builder()
                .id(s.getId()).nom(s.getNom()).description(s.getDescription())
                .categorie(s.getCategorie()).prix(s.getPrix()).duree(s.getDuree())
                .capaciteMax(s.getCapaciteMax()).imageUrl(s.getImageUrl())
                .isActive(s.getIsActive()).hotelId(s.getHotel().getId())
                .build();
    }
    public HebergementDto.ApiResponse<?> completeProfile(
            String userId,
            String chambresJson,
            String infosFinancieresJson,
            String nomEtablissement,
            String ville,
            String adresse,
            String codePostal,
            String telephone,
            Integer etoiles,
            Double latitude,
            Double longitude,
            String equipements,
            String servicesInclus,
            MultipartFile[] photos,
            MultipartFile[] documents) {
        try {
            Long userIdLong = Long.parseLong(userId);
            List<Hebergement> hebergements = hebergementRepository.findByUserId(userIdLong);
            Hebergement hebergement;
            String nomFinal = (nomEtablissement != null && !nomEtablissement.isBlank())
                    ? nomEtablissement
                    : "Hebergement " + userIdLong;
            String villeFinal = (ville != null && !ville.isBlank()) ? ville : "A completer";
            String adresseFinal = (adresse != null && !adresse.isBlank()) ? adresse : "A completer";
            if (hebergements.isEmpty()) {
                log.info("Creation automatique hebergement pour userId={}", userIdLong);
                String slug = generateSlug(nomFinal);
                hebergement = Hebergement.builder()
                        .nom(nomFinal)
                        .adresse(adresseFinal)
                        .ville(villeFinal)
                        .pays("Maroc")
                        .codePostal(codePostal)
                        .telephone(telephone)
                        .etoiles(etoiles)
                        .latitude(latitude)
                        .longitude(longitude)
                        .equipements(equipements)
                        .servicesInclus(servicesInclus)
                        .slug(slug)
                        .userId(userIdLong)
                        .heureCheckin("15:00")
                        .heureCheckout("11:00")
                        .devise("MAD")
                        .status(Hebergement.HebergementStatus.PENDING_APPROVAL)
                        .isActive(true)
                        .build();
                hebergement = hebergementRepository.save(hebergement);
                log.info("Hebergement cree ID={} nom={}", hebergement.getId(), nomFinal);
            } else {
                hebergement = hebergements.get(0);
                if (hebergement.getNom() == null
                        || hebergement.getNom().startsWith("Hebergement ")
                        || hebergement.getNom().startsWith("Hotel ")) {
                    hebergement.setNom(nomFinal);
                }
                if (hebergement.getVille() == null || hebergement.getVille().equals("A completer")) {
                    hebergement.setVille(villeFinal);
                }
                if (hebergement.getAdresse() == null || hebergement.getAdresse().equals("A completer")) {
                    hebergement.setAdresse(adresseFinal);
                }
                if (hebergement.getCodePostal() == null && codePostal != null) hebergement.setCodePostal(codePostal);
                if (hebergement.getTelephone() == null && telephone != null) hebergement.setTelephone(telephone);
                if (hebergement.getEtoiles() == null && etoiles != null) hebergement.setEtoiles(etoiles);
                if (hebergement.getLatitude() == null && latitude != null) hebergement.setLatitude(latitude);
                if (hebergement.getLongitude() == null && longitude != null) hebergement.setLongitude(longitude);
                if (hebergement.getEquipements() == null && equipements != null) hebergement.setEquipements(equipements);
                if (hebergement.getServicesInclus() == null && servicesInclus != null) hebergement.setServicesInclus(servicesInclus);
                log.info("Hebergement trouve ID={}", hebergement.getId());
            }
            if (chambresJson != null && !chambresJson.isBlank() && !chambresJson.equals("[]")) {
                HebergementDto.ChambreData[] chambresArray = objectMapper.readValue(chambresJson, HebergementDto.ChambreData[].class);
                for (HebergementDto.ChambreData chambreData : chambresArray) {
                    BigDecimal prixBase;
                    try { prixBase = new BigDecimal(chambreData.getTarif() != null ? chambreData.getTarif() : "0"); }
                    catch (NumberFormatException e) { prixBase = BigDecimal.ZERO; }
                    ChambreType chambreType = ChambreType.builder()
                            .nom(chambreData.getType()).prixBase(prixBase)
                            .capaciteAdultes(chambreData.getCapacite() != null ? chambreData.getCapacite() : 2)
                            .capaciteEnfants(0)
                            .amenities(chambreData.getEquipChambre() != null ? String.join(",", chambreData.getEquipChambre()) : "")
                            .hotel(hebergement).build();
                    ChambreType savedType = chambreTypeRepository.save(chambreType);
                    int nb = chambreData.getNbChambres() != null ? chambreData.getNbChambres() : 1;
                    for (int i = 0; i < nb; i++) {
                        Chambre chambre = Chambre.builder()
                                .numero(chambreData.getType().substring(0, Math.min(3, chambreData.getType().length())).toUpperCase() + "-" + (i + 1))
                                .chambreType(savedType).status(Chambre.ChambreStatus.DISPONIBLE)
                                .statusChangedAt(LocalDateTime.now()).isActive(true).build();
                        chambreRepository.save(chambre);
                    }
                }
            }
            if (photos != null) {
                for (int i = 0; i < photos.length; i++) {
                    MultipartFile photoFile = photos[i];
                    if (photoFile != null && !photoFile.isEmpty()) {
                        try {
                            String photoUrl = storageService.uploadFile(photoFile, "photos");
                            photoRepository.save(Photo.builder().url(photoUrl).nomFichier(photoFile.getOriginalFilename())
                                    .ordre(i).estPrincipale(i == 0).hotel(hebergement).build());
                        } catch (Exception e) { log.warn("Erreur upload photo {}: {}", i, e.getMessage()); }
                    }
                }
            }
            if (documents != null) {
                for (MultipartFile file : documents) {
                    if (file != null && !file.isEmpty()) {
                        try {
                            String docUrl = storageService.uploadFile(file, "documents");
                            String name = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
                            documentRepository.save(Document.builder().typeDocument(name).url(docUrl)
                                    .nomFichier(name).estObligatoire(true).hotel(hebergement).build());
                        } catch (Exception e) { log.warn("Erreur upload document: {}", e.getMessage()); }
                    }
                }
            }
            if (infosFinancieresJson != null && !infosFinancieresJson.isBlank()) {
                HebergementDto.InfosFinancieres inf = objectMapper.readValue(infosFinancieresJson, HebergementDto.InfosFinancieres.class);
                if (inf.getIban() != null) hebergement.setIban(inf.getIban());
            }
            Hebergement saved = hebergementRepository.save(hebergement);
            return HebergementDto.ApiResponse.ok("Dossier complet recu !",
                    Map.of("hebergementId", saved.getId(), "status", saved.getStatus()));
        } catch (Exception e) {
            log.error("Erreur complete-profile: {}", e.getMessage(), e);
            return HebergementDto.ApiResponse.error("Erreur : " + e.getMessage());
        }
    }
    @Transactional(readOnly = true)
    public Hebergement getHebergementByUserId(Long userId) {
        List<Hebergement> hebergements = hebergementRepository.findByUserId(userId);
        if (hebergements.isEmpty()) throw new HebergementException("Hebergement non trouve.", 404);
        return hebergements.get(0);
    }
    // ══════════════════════════════════════════════════════
// PHOTOS / DOCUMENTS — gestion individuelle
// ══════════════════════════════════════════════════════
    public Photo addPhoto(Long hotelId, MultipartFile photo, Boolean estPrincipale) {
        Hebergement h = getById(hotelId);
        String url = storageService.uploadFile(photo, "hebergements");
        if (Boolean.TRUE.equals(estPrincipale)) {
            photoRepository.findByHotelId(hotelId).forEach(p -> {
                if (Boolean.TRUE.equals(p.getEstPrincipale())) {
                    p.setEstPrincipale(false);
                    photoRepository.save(p);
                }
            });
        }
        int ordre = photoRepository.findByHotelId(hotelId).size();
        Photo p = Photo.builder()
                .url(url).nomFichier(photo.getOriginalFilename())
                .ordre(ordre).estPrincipale(Boolean.TRUE.equals(estPrincipale))
                .hotel(h).build();
        return photoRepository.save(p);
    }
    public void deletePhoto(Long id) {
        Photo p = photoRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Photo introuvable.", 404));
        try { storageService.deleteFile(p.getUrl()); }
        catch (Exception e) { log.warn("Impossible de supprimer le fichier physique : {}", e.getMessage()); }
        photoRepository.deleteById(id);
    }
    public Photo setPhotoPrincipale(Long id) {
        Photo target = photoRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Photo introuvable.", 404));
        photoRepository.findByHotelId(target.getHotel().getId()).forEach(p -> {
            p.setEstPrincipale(p.getId().equals(id));
            photoRepository.save(p);
        });
        return target;
    }
    public Document addDocument(Long hotelId, MultipartFile document, String typeDocument) {
        Hebergement h = getById(hotelId);
        String url = storageService.uploadFile(document, "documents");
        Document d = Document.builder()
                .typeDocument(typeDocument != null && !typeDocument.isBlank() ? typeDocument : "AUTRE")
                .url(url).nomFichier(document.getOriginalFilename())
                .estObligatoire(false)
                .hotel(h).build();
        return documentRepository.save(d);
    }
    public void deleteDocument(Long id) {
        Document d = documentRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Document introuvable.", 404));
        try { storageService.deleteFile(d.getUrl()); }
        catch (Exception e) { log.warn("Impossible de supprimer le fichier physique : {}", e.getMessage()); }
        documentRepository.deleteById(id);
    }
    public HebergementDto.PhotoResponse toPhotoResponse(Photo p) {
        return HebergementDto.PhotoResponse.builder()
                .id(p.getId()).url(p.getUrl()).nomFichier(p.getNomFichier())
                .ordre(p.getOrdre()).estPrincipale(p.getEstPrincipale())
                .build();
    }
    public HebergementDto.DocumentResponse toDocumentResponse(Document d) {
        return HebergementDto.DocumentResponse.builder()
                .id(d.getId()).typeDocument(d.getTypeDocument())
                .url(d.getUrl()).nomFichier(d.getNomFichier())
                .build();
    }
    // ══════════════════════════════════════════════════════
// TARIFS SAISONNIERS
// ══════════════════════════════════════════════════════
    public TarifSaisonnier createTarifSaisonnier(Long hotelId, HebergementDto.CreateTarifSaisonnierRequest req) {
        if ((req.getChambreTypeId() == null) == (req.getChambreId() == null)) {
            throw new HebergementException("Choisissez soit un type de chambre, soit une chambre precise (pas les deux, pas aucun).", 400);
        }
        if (!req.getDateFin().isAfter(req.getDateDebut())) {
            throw new HebergementException("La date de fin doit etre apres la date de debut.", 400);
        }
        Hebergement hebergement = getById(hotelId);
        ChambreType ct = req.getChambreTypeId() != null ? getChambreTypeById(req.getChambreTypeId()) : null;
        Chambre c = req.getChambreId() != null
                ? chambreRepository.findById(req.getChambreId()).orElseThrow(() -> new HebergementException("Chambre introuvable.", 404))
                : null;
        TarifSaisonnier t = TarifSaisonnier.builder()
                .nom(req.getNom()).hotel(hebergement)
                .chambreType(ct).chambre(c)
                .dateDebut(req.getDateDebut()).dateFin(req.getDateFin())
                .typeAjustement(req.getTypeAjustement()).valeurAjustement(req.getValeurAjustement())
                .priorite(req.getPriorite() != null ? req.getPriorite() : 0)
                .isActive(true).build();
        return tarifSaisonnierRepository.save(t);
    }
    public TarifSaisonnier updateTarifSaisonnier(Long id, HebergementDto.UpdateTarifSaisonnierRequest req) {
        TarifSaisonnier t = getTarifSaisonnierById(id);
        if (req.getNom() != null) t.setNom(req.getNom());
        if (req.getDateDebut() != null) t.setDateDebut(req.getDateDebut());
        if (req.getDateFin() != null) t.setDateFin(req.getDateFin());
        if (req.getTypeAjustement() != null) t.setTypeAjustement(req.getTypeAjustement());
        if (req.getValeurAjustement() != null) t.setValeurAjustement(req.getValeurAjustement());
        if (req.getPriorite() != null) t.setPriorite(req.getPriorite());
        if (req.getIsActive() != null) t.setIsActive(req.getIsActive());
        if (req.getChambreTypeId() != null) {
            t.setChambreType(getChambreTypeById(req.getChambreTypeId()));
            t.setChambre(null);
        }
        if (req.getChambreId() != null) {
            t.setChambre(chambreRepository.findById(req.getChambreId())
                    .orElseThrow(() -> new HebergementException("Chambre introuvable.", 404)));
            t.setChambreType(null);
        }
        if (t.getDateFin() != null && t.getDateDebut() != null && !t.getDateFin().isAfter(t.getDateDebut())) {
            throw new HebergementException("La date de fin doit etre apres la date de debut.", 400);
        }
        return tarifSaisonnierRepository.save(t);
    }
    public void deleteTarifSaisonnier(Long id) {
        if (!tarifSaisonnierRepository.existsById(id)) {
            throw new HebergementException("Tarif saisonnier introuvable.", 404);
        }
        tarifSaisonnierRepository.deleteById(id);
    }
    @Transactional(readOnly = true)
    public List<TarifSaisonnier> getTarifsSaisonniersByHotel(Long hotelId) {
        return tarifSaisonnierRepository.findByHotelId(hotelId);
    }
    @Transactional(readOnly = true)
    public TarifSaisonnier getTarifSaisonnierById(Long id) {
        return tarifSaisonnierRepository.findById(id)
                .orElseThrow(() -> new HebergementException("Tarif saisonnier introuvable.", 404));
    }
    public HebergementDto.TarifSaisonnierResponse toTarifSaisonnierResponse(TarifSaisonnier t) {
        return HebergementDto.TarifSaisonnierResponse.builder()
                .id(t.getId()).nom(t.getNom())
                .chambreTypeId(t.getChambreType() != null ? t.getChambreType().getId() : null)
                .chambreTypeNom(t.getChambreType() != null ? t.getChambreType().getNom() : null)
                .chambreId(t.getChambre() != null ? t.getChambre().getId() : null)
                .chambreNumero(t.getChambre() != null ? t.getChambre().getNumero() : null)
                .dateDebut(t.getDateDebut()).dateFin(t.getDateFin())
                .typeAjustement(t.getTypeAjustement()).valeurAjustement(t.getValeurAjustement())
                .priorite(t.getPriorite()).isActive(t.getIsActive())
                .hotelId(t.getHotel().getId())
                .build();
    }
    public HebergementDto.HebergementResponse toResponse(Hebergement h) {

        List<HebergementDto.ChambreTypeResponse> ctList = chambreTypeRepository.findByHotelId(h.getId())
                .stream().map(this::toChambreTypeResponse).collect(Collectors.toList());
        List<HebergementDto.PhotoResponse> photoList = photoRepository.findByHotelId(h.getId())
                .stream().map(p -> HebergementDto.PhotoResponse.builder()
                        .id(p.getId()).url(p.getUrl()).nomFichier(p.getNomFichier())
                        .ordre(p.getOrdre()).estPrincipale(p.getEstPrincipale()).build()).collect(Collectors.toList());
        List<HebergementDto.DocumentResponse> docList = documentRepository.findByHotelId(h.getId())
                .stream().map(d -> HebergementDto.DocumentResponse.builder()
                        .id(d.getId()).typeDocument(d.getTypeDocument())
                        .url(d.getUrl()).nomFichier(d.getNomFichier()).build()).collect(Collectors.toList());
        return HebergementDto.HebergementResponse.builder()
                .id(h.getId()).nom(h.getNom()).nomLegal(h.getNomLegal())
                .description(h.getDescription()).adresse(h.getAdresse())
                .ville(h.getVille()).pays(h.getPays()).codePostal(h.getCodePostal())
                .telephone(h.getTelephone())
                .commissionTaux(h.getCommissionTaux())
                .email(h.getEmail()).website(h.getWebsite()).etoiles(h.getEtoiles())
                .slug(h.getSlug()).status(h.getStatus()).isActive(h.getIsActive())
                .heureCheckin(h.getHeureCheckin()).heureCheckout(h.getHeureCheckout())
                .devise(h.getDevise()).logoUrl(h.getLogoUrl()).userId(h.getUserId())
                .numeroFiscal(h.getNumeroFiscal()).rc(h.getRc()).patente(h.getPatente())
                .cnss(h.getCnss()).ice(h.getIce())
                .latitude(h.getLatitude()).longitude(h.getLongitude())
                .equipements(h.getEquipements()).servicesInclus(h.getServicesInclus())
                .bookingEngineActif(h.getBookingEngineActif()).bookingEngineDescription(h.getBookingEngineDescription())
                .bookingPageConfig(h.getBookingPageConfig()) .createdAt(h.getCreatedAt()).chambreTypes(ctList)
                .photos(photoList).documents(docList).build();

    }
    // ══════════════════════════════════════════════════════
// LOGS D'ACTIVITE
// ══════════════════════════════════════════════════════
    public ActivityLog logActivite(Long hotelId, Long userId, String userNom,
                                   ActivityLog.Action action, String entite, String description, String details) {
        ActivityLog log = ActivityLog.builder()
                .hotelId(hotelId).userId(userId).userNom(userNom)
                .action(action).entite(entite)
                .description(description).details(details)
                .build();
        return activityLogRepository.save(log);
    }
    @Transactional(readOnly = true)
    public List<ActivityLog> getActivityLogs(Long hotelId, String q, String action, LocalDate dateFrom, LocalDate dateTo) {
        List<ActivityLog> all = activityLogRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
        return all.stream()
                .filter(l -> q == null || q.isBlank()
                        || (l.getUserNom() != null && l.getUserNom().toLowerCase().contains(q.toLowerCase()))
                        || l.getDescription().toLowerCase().contains(q.toLowerCase()))
                .filter(l -> action == null || action.isBlank() || l.getAction().name().equalsIgnoreCase(action))
                .filter(l -> dateFrom == null || !l.getCreatedAt().toLocalDate().isBefore(dateFrom))
                .filter(l -> dateTo == null || !l.getCreatedAt().toLocalDate().isAfter(dateTo))
                .toList();
    }
    public HebergementDto.ActivityLogResponse toActivityLogResponse(ActivityLog l) {
        return HebergementDto.ActivityLogResponse.builder()
                .id(l.getId()).hotelId(l.getHotelId()).userId(l.getUserId()).userNom(l.getUserNom())
                .action(l.getAction()).entite(l.getEntite())
                .description(l.getDescription()).details(l.getDetails())
                .createdAt(l.getCreatedAt())
                .build();
    }
    public HebergementDto.ChambreResponse toChambreResponse(Chambre c) {
        return HebergementDto.ChambreResponse.builder()
                .id(c.getId()).numero(c.getNumero()).etage(c.getEtage())
                .status(c.getStatus()).isActive(c.getIsActive()).notes(c.getNotes())
                .chambreTypeId(c.getChambreType().getId()).chambreTypeNom(c.getChambreType().getNom())
                .prixBase(c.getChambreType().getPrixBase())
                .chambreTypeDescription(c.getChambreType().getDescription())
                .chambreTypeImagesUrls(c.getChambreType().getImagesUrls())
                .capaciteAdultes(c.getChambreType().getCapaciteAdultes())
                .capaciteEnfants(c.getChambreType().getCapaciteEnfants())
                .amenities(c.getChambreType().getAmenities())
                .capacite(c.getCapacite()).prixNuitee(c.getPrixNuitee()).superficie(c.getSuperficie())
                .imageUrl(c.getImageUrl()).equipements(c.getEquipements())
                .statusChangedAt(c.getStatusChangedAt()).statusDureeMinutes(c.getStatusDureeMinutes())
                .build();
    }
    public Hebergement updateBookingEngine(Long id, HebergementDto.UpdateBookingEngineRequest req) {
        Hebergement h = getById(id);
        if (req.getActif() != null) h.setBookingEngineActif(req.getActif());
        if (req.getDescription() != null) h.setBookingEngineDescription(req.getDescription());
        return hebergementRepository.save(h);
    }
    // Vue publique — uniquement les etablissements actifs, approuves, et avec le Booking Engine active
    @Transactional(readOnly = true)
    public Hebergement getPublicBySlug(String slug) {
        Hebergement h = getBySlug(slug);
        if (!Boolean.TRUE.equals(h.getIsActive())
                || h.getStatus() != Hebergement.HebergementStatus.APPROVED
                || !Boolean.TRUE.equals(h.getBookingEngineActif())) {
            throw new HebergementException("Etablissement non disponible.", 404);
        }
        return h;
    }

    public Hebergement updateCommission(Long id, BigDecimal taux) {
        Hebergement h = getById(id);
        h.setCommissionTaux(taux);
        return hebergementRepository.save(h);
    }

    public Hebergement updateInfo(Long id, HebergementDto.UpdateHebergementInfoRequest req) {
        Hebergement h = getById(id);
        if (req.getNom() != null) h.setNom(req.getNom());
        if (req.getNomLegal() != null) h.setNomLegal(req.getNomLegal());
        if (req.getDescription() != null) h.setDescription(req.getDescription());
        if (req.getAdresse() != null) h.setAdresse(req.getAdresse());
        if (req.getVille() != null) h.setVille(req.getVille());
        if (req.getPays() != null) h.setPays(req.getPays());
        if (req.getCodePostal() != null) h.setCodePostal(req.getCodePostal());
        if (req.getTelephone() != null) h.setTelephone(req.getTelephone());
        if (req.getEmail() != null) h.setEmail(req.getEmail());
        if (req.getWebsite() != null) h.setWebsite(req.getWebsite());
        if (req.getEtoiles() != null) h.setEtoiles(req.getEtoiles());
        if (req.getHeureCheckin() != null) h.setHeureCheckin(req.getHeureCheckin());
        if (req.getHeureCheckout() != null) h.setHeureCheckout(req.getHeureCheckout());
        if (req.getNumeroFiscal() != null) h.setNumeroFiscal(req.getNumeroFiscal());
        if (req.getRc() != null) h.setRc(req.getRc());
        if (req.getPatente() != null) h.setPatente(req.getPatente());
        if (req.getCnss() != null) h.setCnss(req.getCnss());
        if (req.getIce() != null) h.setIce(req.getIce());
        if (req.getIban() != null) h.setIban(req.getIban());
        if (req.getLatitude() != null) h.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) h.setLongitude(req.getLongitude());
        if (req.getEquipements() != null) h.setEquipements(req.getEquipements());
        if (req.getServicesInclus() != null) h.setServicesInclus(req.getServicesInclus());
        return hebergementRepository.save(h);
    }
    private String generateSlug(String nom) {
        String slug = Normalizer.normalize(nom, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "").toLowerCase()
                .replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-").replaceAll("^-|-$", "");
        int i = 1; String candidate = slug;
        while (hebergementRepository.existsBySlug(candidate)) candidate = slug + "-" + (i++);
        return candidate;
    }
    public Hebergement updateBookingPageConfig(Long id, String configJson) {
        Hebergement h = getById(id);
        h.setBookingPageConfig(configJson);
        return hebergementRepository.save(h);
    }
}
