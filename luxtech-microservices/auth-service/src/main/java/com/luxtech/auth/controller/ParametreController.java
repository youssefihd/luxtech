package com.luxtech.auth.controller;

import com.luxtech.auth.service.ParametreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/admin/parametres")
@RequiredArgsConstructor
public class ParametreController {

    private final ParametreService parametreService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTous() {
        return ResponseEntity.ok(parametreService.getTous());
    }

    @GetMapping("/{categorie}")
    public ResponseEntity<Map<String, Object>> getByCategorie(
            @PathVariable String categorie) {
        return ResponseEntity.ok(parametreService.getByCategorie(categorie));
    }

    @PutMapping
    public ResponseEntity<Void> sauvegarder(
            @RequestBody Map<String, Object> parametres) {
        parametreService.sauvegarder(parametres);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{categorie}")
    public ResponseEntity<Void> sauvegarderCategorie(
            @PathVariable String categorie,
            @RequestBody Map<String, Object> valeurs) {
        parametreService.sauvegarderCategorie(categorie, valeurs);
        return ResponseEntity.ok().build();
    }
}