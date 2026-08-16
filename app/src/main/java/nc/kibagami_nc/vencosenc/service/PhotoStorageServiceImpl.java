package nc.kibagami_nc.vencosenc.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/*
 * Stockage des photos sur le disque.
 *
 * Compatible Windows (dev) et Linux (prod) :
 * - le dossier vient de la propriete "app.upload-dir" (surchargable en prod
 *   via la variable d'environnement APP_UPLOAD_DIR, ex: /var/lib/vencosenc/uploads)
 * - les chemins sont manipules via java.nio.Path (jamais de separateur code en dur)
 * - les fichiers sont renommes en UUID : pas de collision, pas de probleme de
 *   casse/accents/espaces sur Linux, et pas de path traversal possible
 */
@Service
public class PhotoStorageServiceImpl implements PhotoStorageService {

    // Prefixe public sous lequel WebConfig expose le dossier d'upload
    public static final String PUBLIC_PATH = "/uploads/";

    // Types d'images acceptes -> extension utilisee sur le disque
    private static final Map<String, String> ALLOWED_TYPES = Map.of(
        MediaType.IMAGE_JPEG_VALUE, ".jpg",
        MediaType.IMAGE_PNG_VALUE, ".png",
        "image/webp", ".webp"
    );

    private final Path uploadDir;

    public PhotoStorageServiceImpl(@Value("${app.upload-dir}") String uploadDir) {
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            // Cree le dossier au demarrage s'il n'existe pas (idempotent)
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de creer le dossier d'upload : " + this.uploadDir, e);
        }
    }

    @Override
    public String store(MultipartFile file) {

        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Format d'image non supporte (JPEG, PNG ou WebP attendu).");
        }

        String filename = UUID.randomUUID() + extension;
        try {
            file.transferTo(uploadDir.resolve(filename));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Echec de l'enregistrement du fichier.", e);
        }

        return PUBLIC_PATH + filename;
    }

    @Override
    public void delete(String photoUrl) {

        // URLs externes (donnees de demo https://...) : rien a supprimer sur le disque
        if (photoUrl == null || !photoUrl.startsWith(PUBLIC_PATH)) return;

        Path target = uploadDir.resolve(photoUrl.substring(PUBLIC_PATH.length())).normalize();
        if (!target.startsWith(uploadDir)) return; // securite : jamais en dehors du dossier

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            // Suppression "best effort" : un fichier orphelin n'empeche pas l'app de fonctionner
        }
    }
}
