package nc.kibagami_nc.vencosenc.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import nc.kibagami_nc.vencosenc.entity.Photo;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
}
