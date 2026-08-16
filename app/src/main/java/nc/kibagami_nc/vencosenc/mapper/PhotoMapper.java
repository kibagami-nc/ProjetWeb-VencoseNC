package nc.kibagami_nc.vencosenc.mapper;

import org.springframework.stereotype.Component;

import nc.kibagami_nc.vencosenc.dto.PhotoDto;
import nc.kibagami_nc.vencosenc.entity.Photo;

@Component
public class PhotoMapper {

    // Convertit une entite Photo en DTO (id + url, le front n'a pas besoin de plus)
    public PhotoDto toDto(Photo photo) {

        if (photo == null) return null;

        PhotoDto dto = new PhotoDto();
        dto.setIdPhoto(photo.getIdPhoto());
        dto.setUrl(photo.getPhotoUrl());

        return dto;
    }
}
