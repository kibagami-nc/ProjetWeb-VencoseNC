package nc.kibagami_nc.vencosenc.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import nc.kibagami_nc.vencosenc.dto.BidDto;
import nc.kibagami_nc.vencosenc.entity.Bid;
import nc.kibagami_nc.vencosenc.entity.Photo;
import nc.kibagami_nc.vencosenc.mapper.BidMapper;
import nc.kibagami_nc.vencosenc.repository.BidRepository;
import nc.kibagami_nc.vencosenc.repository.PhotoRepository;
import nc.kibagami_nc.vencosenc.service.PhotoStorageService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PhotoController {

    // Nombre maximum de photos par annonce
    private static final int MAX_PHOTOS_PER_BID = 6;

    private final BidRepository bidRepository;
    private final PhotoRepository photoRepository;
    private final PhotoStorageService photoStorageService;
    private final BidMapper bidMapper;

    // POST /api/bid/{bidId}/photo -> ajoute une ou plusieurs photos a l'annonce (multipart)
    // Renvoie l'annonce mise a jour (avec sa liste de photos complete)
    @PostMapping("/bid/{bidId}/photo")
    public BidDto upload(@PathVariable Long bidId, @RequestParam("files") List<MultipartFile> files) {

        Bid bid = bidRepository.findById(bidId).orElseThrow();

        if (bid.getPhotos().size() + files.size() > MAX_PHOTOS_PER_BID) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Limite de " + MAX_PHOTOS_PER_BID + " photos par annonce atteinte.");
        }

        for (MultipartFile file : files) {
            Photo photo = new Photo();
            photo.setPhotoUrl(photoStorageService.store(file));
            photo.setBid(bid);
            bid.getPhotos().add(photo); // cascade ALL sur Bid.photos -> insere la ligne
        }

        return bidMapper.toDto(bidRepository.save(bid));
    }

    // DELETE /api/photo/{id} -> supprime une photo (ligne en BDD + fichier sur le disque)
    // Renvoie l'annonce mise a jour
    @DeleteMapping("/photo/{id}")
    public BidDto delete(@PathVariable Long id) {

        Photo photo = photoRepository.findById(id).orElseThrow();
        Bid bid = photo.getBid();

        bid.getPhotos().remove(photo); // orphanRemoval -> supprime la ligne en BDD
        BidDto dto = bidMapper.toDto(bidRepository.save(bid));

        photoStorageService.delete(photo.getPhotoUrl());

        return dto;
    }
}
