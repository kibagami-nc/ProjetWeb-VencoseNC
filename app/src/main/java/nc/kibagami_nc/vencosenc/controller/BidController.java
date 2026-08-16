package nc.kibagami_nc.vencosenc.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import nc.kibagami_nc.vencosenc.dto.BidDto;
import nc.kibagami_nc.vencosenc.entity.Bid;
import nc.kibagami_nc.vencosenc.entity.Photo;
import nc.kibagami_nc.vencosenc.mapper.BidMapper;
import nc.kibagami_nc.vencosenc.repository.BidRepository;
import nc.kibagami_nc.vencosenc.service.PhotoStorageService;

@RestController
@RequestMapping("/api/bid")
@RequiredArgsConstructor
public class BidController {

    // Nombre maximum d'annonces publiees par utilisateur
    private static final long MAX_BIDS_PER_USER = 4;

    private final BidRepository bidRepository;
    private final BidMapper bidMapper;
    private final PhotoStorageService photoStorageService;

    /*
     * Utilisation du BidDto.java pour l'affichage, suppression, modification et création
     */

    // GET /api/bid -> renvoie la liste de toutes les annonces
    @GetMapping
    public List<BidDto> findAll() {
        return bidRepository.findAll().stream().map(bidMapper::toDto).toList();
    }

    // POST /api/bid -> cree une nouvelle annonce a partir du DTO recu
    // Refuse si l'utilisateur a deja atteint la limite (403)
    @PostMapping
    public BidDto create(@RequestBody BidDto dto) {

        if (dto.getUserId() != null
                && bidRepository.countByUser_IdUser(dto.getUserId()) >= MAX_BIDS_PER_USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Limite de " + MAX_BIDS_PER_USER + " annonces atteinte.");
        }

        Bid bid = bidMapper.toEntity(dto);
        bid.setCreationDate(LocalDateTime.now());

        return bidMapper.toDto(bidRepository.save(bid));
    }

    // GET /api/bid/{id} -> renvoie une annonce precise par son id
    @GetMapping("/{id}")
    public BidDto findById(@PathVariable Long id) {
        return bidMapper.toDto(bidRepository.findById(id).orElseThrow());
    }

    // PUT /api/bid/{id} -> modifie une annonce existante
    @PutMapping("/{id}")
    public BidDto update(@PathVariable Long id, @RequestBody BidDto dto) {

        Bid bid = bidRepository.findById(id).orElseThrow();
        bidMapper.updateEntity(bid, dto);

        return bidMapper.toDto(bidRepository.save(bid));
    }

    // DELETE /api/bid/{id} -> supprime l'annonce correspondante
    // Le cascade JPA supprime les lignes photos ; on efface ensuite les fichiers du disque
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        Bid bid = bidRepository.findById(id).orElseThrow();
        List<String> photoUrls = bid.getPhotos().stream().map(Photo::getPhotoUrl).toList();

        bidRepository.delete(bid);
        photoUrls.forEach(photoStorageService::delete);
    }
}
