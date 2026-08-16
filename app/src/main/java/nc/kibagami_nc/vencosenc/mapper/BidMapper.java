package nc.kibagami_nc.vencosenc.mapper;

import java.util.Comparator;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import nc.kibagami_nc.vencosenc.dto.BidDto;
import nc.kibagami_nc.vencosenc.entity.Bid;
import nc.kibagami_nc.vencosenc.entity.Photo;
import nc.kibagami_nc.vencosenc.entity.User;
import nc.kibagami_nc.vencosenc.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class BidMapper {

    // Sert a retrouver le User a partir du userId du DTO
    private final UserRepository userRepository;
    private final PhotoMapper photoMapper;

    // Convertit une entite Bid en DTO (on garde juste le userId au lieu de tout le User)
    public BidDto toDto(Bid bid) {

        if (bid == null) return null;

        BidDto dto = new BidDto();
        dto.setIdBid(bid.getIdBid());
        dto.setTitle(bid.getTitle());
        dto.setDescription(bid.getDescription());
        dto.setPrice(bid.getPrice());
        dto.setLocation(bid.getLocation());
        dto.setCreationDate(bid.getCreationDate());

        User user = bid.getUser();
        if (user != null) {
            dto.setUserId(user.getIdUser());
            dto.setUserFirstName(user.getFirstName());
            dto.setUserLastName(user.getLastName());
        }

        // Photos triees par id : la premiere ajoutee sert de vignette cote front
        if (bid.getPhotos() != null) {
            dto.setPhotos(bid.getPhotos().stream()
                .sorted(Comparator.comparing(Photo::getIdPhoto))
                .map(photoMapper::toDto)
                .toList());
        }

        return dto;
    }

    // Convertit un DTO en entite Bid (et va chercher le User en BDD via le userId)
    public Bid toEntity(BidDto dto) {

        if (dto == null) return null;

        Bid bid = new Bid();
        bid.setIdBid(dto.getIdBid());
        bid.setTitle(dto.getTitle());
        bid.setDescription(dto.getDescription());
        bid.setPrice(dto.getPrice());
        bid.setLocation(dto.getLocation());
        bid.setCreationDate(dto.getCreationDate());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId()).orElseThrow();
            bid.setUser(user);
        }

        return bid;
    }

    // Met a jour une annonce existante (titre, description, prix et lieu)
    public void updateEntity(Bid bid, BidDto dto) {

        bid.setTitle(dto.getTitle());
        bid.setDescription(dto.getDescription());
        bid.setPrice(dto.getPrice());
        bid.setLocation(dto.getLocation());
    }
}
