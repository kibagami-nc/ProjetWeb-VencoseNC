package nc.kibagami_nc.vencosenc.dto;

import java.time.LocalDateTime;

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
}
