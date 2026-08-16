package nc.kibagami_nc.vencosenc.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BidDto {

    private Long idBid;
    private String title;
    private String description;
    private Integer price;
    private String location;
    private LocalDateTime creationDate;
    private Long userId;
    private String userFirstName;
    private String userLastName;

    // Photos de l'annonce, triees par id (la premiere sert de vignette cote front)
    private List<PhotoDto> photos = List.of();
}
