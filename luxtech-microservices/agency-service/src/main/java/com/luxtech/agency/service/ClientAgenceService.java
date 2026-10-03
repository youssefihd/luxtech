package com.luxtech.agency.service;

import com.luxtech.agency.dto.AgenceDto;
import com.luxtech.agency.entity.ClientAgence;
import com.luxtech.agency.exception.AgenceException;
import com.luxtech.agency.repository.ClientAgenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientAgenceService {
    private final ClientAgenceRepository repository;

    @Transactional(readOnly = true)
    public List<AgenceDto.ClientResponse> list(Long agenceId) {
        return repository.findByAgenceIdOrderByNomAscPrenomAsc(agenceId).stream()
                .map(this::toResponse).toList();
    }

    public AgenceDto.ClientResponse create(Long agenceId, AgenceDto.ClientRequest request) {
        ClientAgence client = new ClientAgence();
        client.setAgenceId(agenceId);
        apply(client, request);
        return toResponse(repository.save(client));
    }

    public AgenceDto.ClientResponse update(Long agenceId, Long clientId, AgenceDto.ClientRequest request) {
        ClientAgence client = getClient(agenceId, clientId);
        apply(client, request);
        return toResponse(repository.save(client));
    }

    public void delete(Long agenceId, Long clientId) {
        repository.delete(getClient(agenceId, clientId));
    }

    private ClientAgence getClient(Long agenceId, Long clientId) {
        return repository.findByIdAndAgenceId(clientId, agenceId)
                .orElseThrow(() -> new AgenceException("Client introuvable.", 404));
    }

    private void apply(ClientAgence client, AgenceDto.ClientRequest request) {
        client.setNom(request.getNom().trim());
        client.setPrenom(request.getPrenom().trim());
        client.setEmail(blankToNull(request.getEmail()));
        client.setTelephone(blankToNull(request.getTelephone()));
        client.setNationalite(blankToNull(request.getNationalite()));
        client.setDateNaissance(request.getDateNaissance());
        client.setAdresse(blankToNull(request.getAdresse()));
        client.setPreferences(blankToNull(request.getPreferences()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AgenceDto.ClientResponse toResponse(ClientAgence client) {
        return AgenceDto.ClientResponse.builder()
                .id(client.getId()).agenceId(client.getAgenceId())
                .nom(client.getNom()).prenom(client.getPrenom()).email(client.getEmail())
                .telephone(client.getTelephone()).nationalite(client.getNationalite())
                .dateNaissance(client.getDateNaissance()).adresse(client.getAdresse())
                .preferences(client.getPreferences()).createdAt(client.getCreatedAt()).build();
    }
}
