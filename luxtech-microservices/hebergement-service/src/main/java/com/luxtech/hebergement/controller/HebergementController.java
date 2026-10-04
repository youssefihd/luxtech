package com.luxtech.hebergement.controller;

import com.luxtech.hebergement.dto.HebergementDto;
import com.luxtech.hebergement.entity.*;
import com.luxtech.hebergement.service.HebergementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;


@RestController @RequestMapping("/api/hebergement") @RequiredArgsConstructor
public class HebergementController {
    private final HebergementService hebergementService;

    @PostMapping("/hebergements")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> create(
            @Valid @RequestBody HebergementDto.CreateHebergementRequest req,
            @RequestHeader("X-User-Id") String userId) {
        Hebergement h = hebergementService.createHebergement(req, Long.parseLong(userId));
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("Hebergement cree.", hebergementService.toResponse(h)));
    }

    @GetMapping("/hebergements")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.HebergementResponse>>> getAll() {
        List<HebergementDto.HebergementResponse> list = hebergementService.getAll().stream().map(hebergementService::toResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @PatchMapping("/hebergements/{id}/commission")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> updateCommission(
            @PathVariable("id") Long id, @Valid @RequestBody HebergementDto.UpdateCommissionRequest req) {
        Hebergement h = hebergementService.updateCommission(id, req.getCommissionTaux());
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Commission mise a jour.", hebergementService.toResponse(h)));
    }

    @GetMapping("/hebergements/active")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.HebergementResponse>>> getActive() {
        List<HebergementDto.HebergementResponse> list = hebergementService.getAllActive().stream().map(hebergementService::toResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/hebergements/my")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.HebergementResponse>>> myHebergements(
            @RequestHeader("X-User-Id") String userId) {
        List<HebergementDto.HebergementResponse> list = hebergementService.getByUserId(Long.parseLong(userId)).stream().map(hebergementService::toResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/hebergements/search")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.HebergementResponse>>> search(@RequestParam String q) {
        List<HebergementDto.HebergementResponse> list = hebergementService.search(q).stream().map(hebergementService::toResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/hebergements/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", hebergementService.toResponse(hebergementService.getById(id))));
    }

    @GetMapping("/hebergements/by-user/{userId}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> getByUserId(
            @PathVariable("userId") Long userId) {
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK",
                hebergementService.toResponse(hebergementService.getHebergementByUserId(userId))));
    }

    @GetMapping("/hebergements/slug/{slug}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", hebergementService.toResponse(hebergementService.getBySlug(slug))));
    }

    @PutMapping("/hebergements/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> update(
            @PathVariable Long id, @RequestBody HebergementDto.CreateHebergementRequest req) {
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Mis a jour.", hebergementService.toResponse(hebergementService.update(id, req))));
    }

    @PostMapping("/hebergements/{id}/approve")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Approuve.", hebergementService.toResponse(hebergementService.approve(id))));
    }

    @PostMapping("/hebergements/{id}/suspend")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> suspend(@PathVariable Long id) {
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Suspendu.", hebergementService.toResponse(hebergementService.suspend(id))));
    }

    @PostMapping("/hebergements/{hebergementId}/chambre-types")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ChambreTypeResponse>> createChambreType(
            @PathVariable Long hebergementId, @Valid @RequestBody HebergementDto.CreateChambreTypeRequest req) {
        ChambreType ct = hebergementService.createChambreType(hebergementId, req);
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("Type cree.", hebergementService.toChambreTypeResponse(ct)));
    }

    @PutMapping("/chambre-types/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ChambreTypeResponse>> updateChambreType(
            @PathVariable Long id, @RequestBody HebergementDto.UpdateChambreTypeRequest req) {
        ChambreType ct = hebergementService.updateChambreType(id, req);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Type mis a jour.", hebergementService.toChambreTypeResponse(ct)));
    }

    @PostMapping(value = "/chambre-types/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ChambreTypeResponse>> uploadChambreTypePhoto(
            @PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        ChambreType ct = hebergementService.uploadChambreTypePhoto(id, photo);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Photo mise a jour.", hebergementService.toChambreTypeResponse(ct)));
    }

    @GetMapping("/hebergements/{hebergementId}/chambre-types")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.ChambreTypeResponse>>> getChambreTypes(
            @PathVariable Long hebergementId) {
        List<HebergementDto.ChambreTypeResponse> list = hebergementService.getChambreTypesByHotel(hebergementId)
                .stream().map(hebergementService::toChambreTypeResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @DeleteMapping("/chambre-types/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<Void>> deleteChambreType(@PathVariable Long id) {
        hebergementService.deleteChambreType(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Supprime.", null));
    }

    @PostMapping("/chambres")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ChambreResponse>> createChambre(
            @Valid @RequestBody HebergementDto.CreateChambreRequest req) {
        Chambre c = hebergementService.createChambre(req);
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("Chambre creee.", hebergementService.toChambreResponse(c)));
    }

    @PutMapping("/chambres/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ChambreResponse>> updateChambre(
            @PathVariable Long id, @RequestBody HebergementDto.UpdateChambreRequest req) {
        Chambre c = hebergementService.updateChambre(id, req);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Chambre mise a jour.", hebergementService.toChambreResponse(c)));
    }

    @PostMapping(value = "/chambres/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ChambreResponse>> uploadChambrePhoto(
            @PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        Chambre c = hebergementService.uploadChambrePhoto(id, photo);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Photo mise a jour.", hebergementService.toChambreResponse(c)));
    }

    @DeleteMapping("/chambres/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<Void>> deleteChambre(@PathVariable Long id) {
        hebergementService.deleteChambre(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Chambre supprimee.", null));
    }

    @GetMapping("/hebergements/{hebergementId}/chambres")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.ChambreResponse>>> getChambres(
            @PathVariable Long hebergementId) {
        List<HebergementDto.ChambreResponse> list = hebergementService.getChambresByHotel(hebergementId)
                .stream().map(hebergementService::toChambreResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @PatchMapping("/chambres/{id}/status")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ChambreResponse>> updateStatus(
            @PathVariable Long id, @RequestParam Chambre.ChambreStatus status,
            @RequestParam(required = false) Integer dureeMinutes) {
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Statut mis a jour.",
                hebergementService.toChambreResponse(hebergementService.updateChambreStatus(id, status, dureeMinutes))));
    }

    @PostMapping("/hebergements/{hotelId}/services")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ServiceResponse>> createService(
            @PathVariable Long hotelId, @Valid @RequestBody HebergementDto.CreateServiceRequest req) {
        ServiceHebergement s = hebergementService.createService(hotelId, req);
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("Service cree.", hebergementService.toServiceResponse(s)));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ServiceResponse>> updateService(
            @PathVariable Long id, @RequestBody HebergementDto.UpdateServiceRequest req) {
        ServiceHebergement s = hebergementService.updateService(id, req);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Service mis a jour.", hebergementService.toServiceResponse(s)));
    }

    @PatchMapping("/services/{id}/toggle-status")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ServiceResponse>> toggleServiceStatus(@PathVariable Long id) {
        ServiceHebergement s = hebergementService.toggleServiceStatus(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Statut modifie.", hebergementService.toServiceResponse(s)));
    }

    @PostMapping(value = "/services/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ServiceResponse>> uploadServicePhoto(
            @PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        ServiceHebergement s = hebergementService.uploadServicePhoto(id, photo);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Photo mise a jour.", hebergementService.toServiceResponse(s)));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<Void>> deleteService(@PathVariable Long id) {
        hebergementService.deleteService(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Service supprime.", null));
    }

    @GetMapping("/hebergements/{hotelId}/services")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.ServiceResponse>>> getServices(
            @PathVariable Long hotelId) {
        List<HebergementDto.ServiceResponse> list = hebergementService.getServicesByHotel(hotelId)
                .stream().map(hebergementService::toServiceResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ServiceResponse>> getServiceById(
            @PathVariable Long id) {
        ServiceHebergement s = hebergementService.getServiceById(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", hebergementService.toServiceResponse(s)));
    }

    // ── Tarifs saisonniers ────────────────────────────────────
    @PostMapping("/hebergements/{hotelId}/tarifs-saisonniers")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.TarifSaisonnierResponse>> createTarifSaisonnier(
            @PathVariable Long hotelId, @Valid @RequestBody HebergementDto.CreateTarifSaisonnierRequest req) {
        TarifSaisonnier t = hebergementService.createTarifSaisonnier(hotelId, req);
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("Tarif cree.", hebergementService.toTarifSaisonnierResponse(t)));
    }

    @PutMapping("/tarifs-saisonniers/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.TarifSaisonnierResponse>> updateTarifSaisonnier(
            @PathVariable Long id, @RequestBody HebergementDto.UpdateTarifSaisonnierRequest req) {
        TarifSaisonnier t = hebergementService.updateTarifSaisonnier(id, req);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Tarif mis a jour.", hebergementService.toTarifSaisonnierResponse(t)));
    }

    @DeleteMapping("/tarifs-saisonniers/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<Void>> deleteTarifSaisonnier(@PathVariable Long id) {
        hebergementService.deleteTarifSaisonnier(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Tarif supprime.", null));
    }

    @GetMapping("/hebergements/{hotelId}/tarifs-saisonniers")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.TarifSaisonnierResponse>>> getTarifsSaisonniers(
            @PathVariable Long hotelId) {
        List<HebergementDto.TarifSaisonnierResponse> list = hebergementService.getTarifsSaisonniersByHotel(hotelId)
                .stream().map(hebergementService::toTarifSaisonnierResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @PostMapping(value = "/complete-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HebergementDto.ApiResponse<?>> completeProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam("chambres") String chambresJson,
            @RequestParam("infosFinancieres") String infosFinancieresJson,
            @RequestParam(value = "nomEtablissement", required = false) String nomEtablissement,
            @RequestParam(value = "ville", required = false) String ville,
            @RequestParam(value = "adresse", required = false) String adresse,
            @RequestParam(value = "codePostal", required = false) String codePostal,
            @RequestParam(value = "telephone", required = false) String telephone,
            @RequestParam(value = "etoiles", required = false) Integer etoiles,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "equipements", required = false) String equipements,
            @RequestParam(value = "servicesInclus", required = false) String servicesInclus,
            @RequestParam(value = "photos", required = false) MultipartFile[] photos,
            @RequestParam(value = "documents", required = false) MultipartFile[] documents) {
        HebergementDto.ApiResponse<?> response = hebergementService.completeProfile(
                userId, chambresJson, infosFinancieresJson, nomEtablissement, ville,
                adresse, codePostal, telephone, etoiles, latitude, longitude,
                equipements, servicesInclus, photos, documents);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PatchMapping("/hebergements/{id}/booking-engine")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> updateBookingEngine(
            @PathVariable Long id, @RequestBody HebergementDto.UpdateBookingEngineRequest req) {
        Hebergement h = hebergementService.updateBookingEngine(id, req);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Parametres mis a jour.", hebergementService.toResponse(h)));
    }

    @GetMapping("/public/{slug}")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> getPublicBySlug(
            @PathVariable("slug") String slug) {
        Hebergement h = hebergementService.getPublicBySlug(slug);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", hebergementService.toResponse(h)));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("hebergement-service UP");
    }

    @PostMapping("/hebergements/{hotelId}/activity-logs")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.ActivityLogResponse>> createActivityLog(
            @PathVariable("hotelId") Long hotelId, @Valid @RequestBody HebergementDto.CreateActivityLogRequest req) {
        ActivityLog l = hebergementService.logActivite(hotelId, req.getUserId(), req.getUserNom(),
                req.getAction(), req.getEntite(), req.getDescription(), req.getDetails());
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("OK", hebergementService.toActivityLogResponse(l)));
    }

    @PostMapping(value = "/hebergements/{hotelId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.PhotoResponse>> addPhoto(
            @PathVariable("hotelId") Long hotelId, @RequestParam("photo") MultipartFile photo,
            @RequestParam(value = "estPrincipale", required = false) Boolean estPrincipale) {
        Photo p = hebergementService.addPhoto(hotelId, photo, estPrincipale);
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("Photo ajoutee.", hebergementService.toPhotoResponse(p)));
    }

    @DeleteMapping("/photos/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<Void>> deletePhoto(@PathVariable("id") Long id) {
        hebergementService.deletePhoto(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Photo supprimee.", null));
    }

    @PatchMapping("/photos/{id}/principale")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.PhotoResponse>> setPhotoPrincipale(@PathVariable("id") Long id) {
        Photo p = hebergementService.setPhotoPrincipale(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Photo principale definie.", hebergementService.toPhotoResponse(p)));
    }

    @PostMapping(value = "/hebergements/{hotelId}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.DocumentResponse>> addDocument(
            @PathVariable("hotelId") Long hotelId, @RequestParam("document") MultipartFile document,
            @RequestParam(value = "typeDocument", required = false) String typeDocument) {
        Document d = hebergementService.addDocument(hotelId, document, typeDocument);
        return ResponseEntity.status(201).body(HebergementDto.ApiResponse.ok("Document ajoute.", hebergementService.toDocumentResponse(d)));
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<HebergementDto.ApiResponse<Void>> deleteDocument(@PathVariable("id") Long id) {
        hebergementService.deleteDocument(id);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Document supprime.", null));
    }

    @GetMapping("/hebergements/{hotelId}/activity-logs")
    public ResponseEntity<HebergementDto.ApiResponse<List<HebergementDto.ActivityLogResponse>>> getActivityLogs(
            @PathVariable("hotelId") Long hotelId,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "dateFrom", required = false) String dateFrom,
            @RequestParam(value = "dateTo", required = false) String dateTo) {
        List<HebergementDto.ActivityLogResponse> list = hebergementService.getActivityLogs(
                        hotelId, q, action,
                        dateFrom != null ? LocalDate.parse(dateFrom) : null,
                        dateTo != null ? LocalDate.parse(dateTo) : null)
                .stream().map(hebergementService::toActivityLogResponse).toList();
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("OK", list));
    }

    @PatchMapping("/hebergements/{id}/info")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> updateInfo(
            @PathVariable("id") Long id, @RequestBody HebergementDto.UpdateHebergementInfoRequest req) {
        Hebergement h = hebergementService.updateInfo(id, req);
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Informations mises a jour.", hebergementService.toResponse(h)));
    }

    @PatchMapping("/hebergements/{id}/booking-page-config")
    public ResponseEntity<HebergementDto.ApiResponse<HebergementDto.HebergementResponse>> updateBookingPageConfig(
            @PathVariable("id") Long id, @Valid @RequestBody HebergementDto.UpdateBookingPageConfigRequest req) {
        Hebergement h = hebergementService.updateBookingPageConfig(id, req.getBookingPageConfig());
        return ResponseEntity.ok(HebergementDto.ApiResponse.ok("Configuration enregistree.", hebergementService.toResponse(h)));
    }

}
