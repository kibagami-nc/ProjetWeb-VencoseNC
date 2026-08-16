package nc.kibagami_nc.vencosenc.service;

import org.springframework.web.multipart.MultipartFile;

public interface PhotoStorageService {

    // Enregistre le fichier sur le disque et renvoie son URL publique (/uploads/xxx.jpg)
    String store(MultipartFile file);

    // Supprime le fichier correspondant a une URL publique (ignore les URLs externes)
    void delete(String photoUrl);
}
