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
                .ice(req.getIce()).patente(req.getPatente()).email(req.getEmail())
                .telephone(req.getTelephone()).adresse(req.getAdresse())
                .ville(req.getVille()).pays(req.getPays())
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
        if (req.getTelephone()    != null) a.setTelephone(req.getTelephone());
        if (req.getAdresse()      != null) a.setAdresse(req.getAdresse());
        if (req.getVille()        != null) a.setVille(req.getVille());
        return agenceRepository.save(a);
    }

    public Agence approuver(Long id) {
        Agence a = getById(id); a.setStatus(Agence.AgenceStatus.APPROUVEE);
        return agenceRepository.save(a);
    }

    public Agence rejeter(Long id) {
        Agence a = getById(id); a.setStatus(Agence.AgenceStatus.REJETEE);
        return agenceRepository.save(a);
    }

    public Agence suspendre(Long id) {
        Agence a = getById(id); a.setStatus(Agence.AgenceStatus.SUSPENDUE);
        return agenceRepository.save(a);
    }

    public AgenceDto.AgenceResponse toResponse(Agence a) {
        return AgenceDto.AgenceResponse.builder()
                .id(a.getId()).nomAgence(a.getNomAgence()).raisonSociale(a.getRaisonSociale())
                .ice(a.getIce()).patente(a.getPatente()).email(a.getEmail())
                .telephone(a.getTelephone()).adresse(a.getAdresse())
                .ville(a.getVille()).pays(a.getPays())
                .status(a.getStatus()).userId(a.getUserId()).logoUrl(a.getLogoUrl())
                .createdAt(a.getCreatedAt()).build();
    }
}
