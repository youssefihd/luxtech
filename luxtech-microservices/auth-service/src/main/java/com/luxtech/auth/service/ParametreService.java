package com.luxtech.auth.service;

import com.luxtech.auth.entity.Parametre;
import com.luxtech.auth.repository.ParametreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class ParametreService {

    private final ParametreRepository parametreRepository;

    // Valeurs par défaut
    private static final Map<String, String[]> DEFAULTS = new LinkedHashMap<>() {{
        put("general.nomPlateforme",      new String[]{"LuxTech PMS",           "general"});
        put("general.slogan",             new String[]{"Votre partenaire hôtelier au Maroc", "general"});
        put("general.email",              new String[]{"contact@luxtech.ma",     "general"});
        put("general.telephone",          new String[]{"+212 5XX-XXXXXX",       "general"});
        put("general.adresse",            new String[]{"Casablanca, Maroc",      "general"});
        put("general.siteWeb",            new String[]{"https://luxtech.ma",     "general"});
        put("general.langue",             new String[]{"fr",                     "general"});
        put("general.fuseau",             new String[]{"Africa/Casablanca",      "general"});
        put("general.devise",             new String[]{"MAD",                    "general"});
        put("general.dateFormat",         new String[]{"DD/MM/YYYY",            "general"});
        put("finance.commissionHotel",    new String[]{"5",                      "finance"});
        put("finance.commissionAgence",   new String[]{"8",                      "finance"});
        put("finance.tvaRate",            new String[]{"20",                     "finance"});
        put("finance.fraisService",       new String[]{"2",                      "finance"});
        put("finance.delaiPaiement",      new String[]{"30",                     "finance"});
        put("finance.montantMinReversement", new String[]{"500",                 "finance"});
        put("finance.plafondCredit",      new String[]{"50000",                  "finance"});
        put("finance.modePaiement",       new String[]{"virement",               "finance"});
        put("finance.periodiciteFacturation", new String[]{"mensuelle",          "finance"});
        put("reservation.delaiAnnulation",   new String[]{"48",                  "reservation"});
        put("reservation.delaiConfirmation", new String[]{"24",                  "reservation"});
        put("reservation.avanceMinimum",     new String[]{"20",                  "reservation"});
        put("reservation.dureeMinSejour",    new String[]{"1",                   "reservation"});
        put("reservation.checkInHeure",      new String[]{"14:00",              "reservation"});
        put("reservation.checkOutHeure",     new String[]{"12:00",              "reservation"});
        put("reservation.reservationAutoApprove", new String[]{"false",         "reservation"});
        put("reservation.notifPartenaire",   new String[]{"true",               "reservation"});
        put("reservation.notifClient",       new String[]{"true",               "reservation"});
        put("reservation.modificationAuto",  new String[]{"false",              "reservation"});
        put("plateforme.maintenanceMode",    new String[]{"false",              "plateforme"});
        put("plateforme.inscriptionOuverte", new String[]{"true",               "plateforme"});
        put("plateforme.validationAuto",     new String[]{"false",              "plateforme"});
        put("plateforme.afficherPrix",       new String[]{"true",               "plateforme"});
        put("plateforme.modeCatalogue",      new String[]{"false",              "plateforme"});
        put("plateforme.apiPublique",        new String[]{"false",              "plateforme"});
        put("plateforme.backupAuto",         new String[]{"true",               "plateforme"});
        put("plateforme.debugMode",          new String[]{"false",              "plateforme"});
        put("plateforme.frequenceBackup",    new String[]{"daily",              "plateforme"});
        put("plateforme.retentionDonnees",   new String[]{"365",                "plateforme"});
    }};

    @Transactional(readOnly = true)
    public Map<String, Object> getTous() {
        List<Parametre> parametres = parametreRepository.findAll();
        Map<String, String> existing = parametres.stream()
                .collect(Collectors.toMap(Parametre::getCle, Parametre::getValeur));

        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, String[]> entry : DEFAULTS.entrySet()) {
            result.put(entry.getKey(), existing.getOrDefault(entry.getKey(), entry.getValue()[0]));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getByCategorie(String categorie) {
        Map<String, Object> tous = getTous();
        Map<String, Object> result = new LinkedHashMap<>();
        tous.forEach((k, v) -> {
            if (k.startsWith(categorie + ".")) {
                result.put(k.substring(categorie.length() + 1), v);
            }
        });
        return result;
    }

    public void sauvegarder(Map<String, Object> parametresMap) {
        parametresMap.forEach((cle, valeur) -> {
            String[] defaults = DEFAULTS.get(cle);
            String categorie = defaults != null ? defaults[1] : cle.split("\\.")[0];
            Parametre p = parametreRepository.findById(cle)
                    .orElse(Parametre.builder().cle(cle).categorie(categorie).build());
            p.setValeur(String.valueOf(valeur));
            parametreRepository.save(p);
        });
    }

    public void sauvegarderCategorie(String categorie, Map<String, Object> valeurs) {
        valeurs.forEach((cle, valeur) -> {
            String cleComplete = categorie + "." + cle;
            Parametre p = parametreRepository.findById(cleComplete)
                    .orElse(Parametre.builder().cle(cleComplete).categorie(categorie).build());
            p.setValeur(String.valueOf(valeur));
            parametreRepository.save(p);
        });
    }
}