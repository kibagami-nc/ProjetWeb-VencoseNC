package nc.kibagami_nc.vencosenc.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import nc.kibagami_nc.vencosenc.entity.Bid;

public interface BidRepository extends JpaRepository<Bid, Long> {

    // Nombre total d'annonces publiees par un utilisateur (sert a appliquer la limite)
    long countByUser_IdUser(Long userId);
}
