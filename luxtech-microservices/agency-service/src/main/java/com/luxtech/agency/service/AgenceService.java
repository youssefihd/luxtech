package com.luxtech.agency.service;
import com.luxtech.agency.dto.AgenceDto;
import com.luxtech.agency.entity.Agence;
import com.luxtech.agency.exception.AgenceException;
import com.luxtech.agency.repository.AgenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor @Slf4j @Transactional
public class AgenceService {
    private final AgenceRepository agenceRepository;

    public Agence create(AgenceDto.CreateAgenceRequest req, Long userId) {
        if (req.getEmail() != null && agenceRepository.existsByEmail(req.getEmail()))
            throw new AgenceException("Une agence avec cet email existe déjà.", 409);
        Agence a = Agence.builder()
                .nomAgence(req.getNomAgence()).raisonSociale(req.getRaisonSociale())
                .nomCommercial(req.getNomCommercial()).ice(req.getIce()).patente(req.getPatente())
                .numeroFiscal(req.getNumeroFiscal()).licenceVoyage(req.getLicenceVoyage()).rc(req.getRc())
                .email(req.getEmail()).telephone(req.getTelephone()).telephone2(req.getTelephone2())
                .fax(req.getFax()).adresse(req.getAdresse()).ville(req.getVille()).pays(req.getPays())
                .codePostal(req.getCodePostal()).website(req.getWebsite())
                .status(Agence.AgenceStatus.EN_ATTENTE).userId(userId).build();
        log.info("Agence créée : {}", req.getNomAgence());
        return agenceRepository.save(a);
    }

    @Transactional(readOnly = true)
    public List<Agence> getAll()    { return agenceRepository.findAll(); }

    @Transactional(readOnly = true)
    public Agence getById(Long id)  {
        return agenceRepository.findById(id).orElseThrow(() -> new AgenceException("Agence introuvable.", 404));
    }

    @Transactional(readOnly = true)
    public Agence getByUserId(Long userId) {
        return agenceRepository.findByUserId(userId).orElseThrow(() -> new AgenceException("Agence introuvable.", 404));
    }

    @Transactional(readOnly = true)
    public List<Agence> getPending() { return agenceRepository.findByStatus(Agence.AgenceStatus.EN_ATTENTE); }

    public Agence update(Long id, AgenceDto.CreateAgenceRequest req) {
        Agence a = getById(id);
        if (req.getNomAgence()    != null) a.setNomAgence(req.getNomAgence());
        if (req.getRaisonSociale()!= null) a.setRaisonSociale(req.getRaisonSociale());
        if (req.getNomCommercial()!= null) a.setNomCommercial(req.getNomCommercial());
        if (req.getEmail()        != null) a.setEmail(req.getEmail());
        if (req.getTelephone()    != null) a.setTelephone(req.getTelephone());
        if (req.getTelephone2()   != null) a.setTelephone2(req.getTelephone2());
        if (req.getFax()          != null) a.setFax(req.getFax());
        if (req.getAdresse()      != null) a.setAdresse(req.getAdresse());
        if (req.getVille()        != null) a.setVille(req.getVille());
        if (req.getPays()         != null) a.setPays(req.getPays());
        if (req.getCodePostal()   != null) a.setCodePostal(req.getCodePostal());
        if (req.getWebsite()      != null) a.setWebsite(req.getWebsite());
        if (req.getIce()          != null) a.setIce(req.getIce());
        if (req.getPatente()      != null) a.setPatente(req.getPatente());
        if (req.getNumeroFiscal() != null) a.setNumeroFiscal(req.getNumeroFiscal());
        if (req.getLicenceVoyage()!= null) a.setLicenceVoyage(req.getLicenceVoyage());
        if (req.getRc()           != null) a.setRc(req.getRc());
        return agenceRepository.save(a);
    }

    public Agence configureCommercial(Long id, AgenceDto.AgencyCommercialSettingsRequest request) {
        Agence agence = getById(id);
        agence.setCommissionTaux(request.getCommissionTaux());
        agence.setPlafondCredit(request.getPlafondCredit());
        agence.setCreditEnabled(request.getCreditEnabled());
        return agenceRepository.save(agence);
    }

    public Agence approuver(Long id) {
        Agence a = getById(id); a.setStatus(Agence.AgenceStatus.APPROUVEE);
        a.setIsActive(true); a.setDateValidation(java.time.LocalDateTime.now());
        return agenceRepository.save(a);
    }

    public Agence rejeter(Long id) {
        Agence a = getById(id); a.setStatus(Agence.AgenceStatus.REJETEE); a.setIsActive(false);
        return agenceRepository.save(a);
    }

    public Agence suspendre(Long id) {
        Agence a = getById(id); a.setStatus(Agence.AgenceStatus.SUSPENDUE); a.setIsActive(false);
        return agenceRepository.save(a);
    }

    public AgenceDto.AgenceResponse toResponse(Agence a) {
        return toResponse(a, true);
    }

    public AgenceDto.AgenceResponse toResponse(Agence a, boolean canViewCommercial) {
        return AgenceDto.AgenceResponse.builder()
                .id(a.getId()).nomAgence(a.getNomAgence()).raisonSociale(a.getRaisonSociale())
                .nomCommercial(a.getNomCommercial()).ice(a.getIce()).patente(a.getPatente())
                .numeroFiscal(a.getNumeroFiscal()).licenceVoyage(a.getLicenceVoyage()).rc(a.getRc())
                .email(a.getEmail()).telephone(a.getTelephone()).telephone2(a.getTelephone2()).fax(a.getFax())
                .adresse(a.getAdresse()).ville(a.getVille()).pays(a.getPays()).codePostal(a.getCodePostal()).website(a.getWebsite())
                .commissionTaux(canViewCommercial ? a.getCommissionTaux() : null)
                .plafondCredit(canViewCommercial ? a.getPlafondCredit() : null)
                .soldeActuel(canViewCommercial ? a.getSoldeActuel() : null)
                .creditEnabled(canViewCommercial ? a.getCreditEnabled() : null)
                .status(a.getStatus()).userId(a.getUserId()).logoUrl(a.getLogoUrl())
                .createdAt(a.getCreatedAt()).build();
    }
}
