package com.luxtech.hebergement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8080/uploads}")
    private String baseUrl;

    /**
     * Upload un fichier et retourne l'URL d'accès
     *
     * @param file Le fichier à uploader
     * @param folder Le dossier de destination (photos, documents, etc.)
     * @return L'URL du fichier uploadé
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // Valider le fichier
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Le fichier ne peut pas être vide.");
            }

            // Valider la taille (max 10MB)
            long maxSize = 10 * 1024 * 1024; // 10MB
            if (file.getSize() > maxSize) {
                throw new IllegalArgumentException("La taille du fichier dépasse 10MB.");
            }

            // Générer un nom de fichier unique
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID() + "." + extension;

            // Créer le chemin du dossier
            Path folderPath = Paths.get(uploadDir, folder);
            Files.createDirectories(folderPath);

            // Sauvegarder le fichier
            Path filePath = folderPath.resolve(uniqueFilename);
            Files.write(filePath, file.getBytes());

            log.info("Fichier uploadé : {} -> {}", originalFilename, filePath.toString());

            // Retourner l'URL d'accès
            return baseUrl + "/" + folder + "/" + uniqueFilename;

        } catch (IOException e) {
            log.error("Erreur lors de l'upload du fichier", e);
            throw new RuntimeException("Erreur lors de l'upload du fichier : " + e.getMessage());
        }
    }

    /**
     * Supprime un fichier
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extraire le chemin relatif du fichier
            String relativePath = fileUrl.replace(baseUrl + "/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Fichier supprimé : {}", filePath.toString());
            }
        } catch (IOException e) {
            log.error("Erreur lors de la suppression du fichier", e);
            throw new RuntimeException("Erreur lors de la suppression du fichier : " + e.getMessage());
        }
    }

    /**
     * Récupère l'extension d'un fichier
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "unknown";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Valide si le fichier est une image
     */
    public boolean isImage(String filename) {
        String ext = getFileExtension(filename).toLowerCase();
        return ext.matches("jpg|jpeg|png|gif|webp|bmp");
    }

    /**
     * Valide si le fichier est un document
     */
    public boolean isDocument(String filename) {
        String ext = getFileExtension(filename).toLowerCase();
        return ext.matches("pdf|doc|docx|xls|xlsx|jpg|jpeg|png");
    }
}