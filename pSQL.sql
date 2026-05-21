CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_mobile VARCHAR(20),
    phone_landline VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bids (
    id_bid SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price INT,
    location VARCHAR(30),
    fk_id_user INTEGER NOT NULL,
    FOREIGN KEY (fk_id_user) REFERENCES users(id_user)
);

CREATE TABLE photos (
    id_photo SERIAL PRIMARY KEY,
    photo_url VARCHAR(255) NOT NULL,
    fk_id_bid INTEGER NOT NULL,
    FOREIGN KEY (fk_id_bid) REFERENCES bids(id_bid)
);

CREATE TABLE threads (
    id_thread SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    fk_id_bid INTEGER NOT NULL,
    FOREIGN KEY (fk_id_bid) REFERENCES bids(id_bid)
);

CREATE TABLE messages (
    id_message SERIAL PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fk_id_thread INTEGER NOT NULL,
    fk_id_user INTEGER NOT NULL,
    FOREIGN KEY (fk_id_thread) REFERENCES threads(id_thread),
    FOREIGN KEY (fk_id_user) REFERENCES users(id_user)
);

CREATE TABLE users_threads (
    fk_id_user INTEGER NOT NULL,
    fk_id_thread INTEGER NOT NULL,
    PRIMARY KEY (fk_id_user, fk_id_thread),
    FOREIGN KEY (fk_id_user) REFERENCES users(id_user),
    FOREIGN KEY (fk_id_thread) REFERENCES threads(id_thread)
);

CREATE TABLE roles (
    id_role SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE users_roles (
    fk_id_user INTEGER NOT NULL,
    fk_id_role INTEGER NOT NULL,
    PRIMARY KEY (fk_id_user, fk_id_role),
    FOREIGN KEY (fk_id_user) REFERENCES users(id_user),
    FOREIGN KEY (fk_id_role) REFERENCES roles(id_role)
);


-- ============================================
-- Script d'insertion des données Vencose.nc
-- ============================================

-- 1. Rôles
INSERT INTO roles (role) VALUES
('ADMIN'),
('USER'),
('MODERATOR');

-- 2. Utilisateurs
INSERT INTO users (last_name, first_name, email, phone_mobile, phone_landline, password) VALUES
('Bouille', 'Manley', 'manley.bouille@vencose.nc', '78.45.12', '24.56.78', '$2a$10$abcdefghijklmnopqrstuv'),
('Wamytan', 'Lucas', 'lucas.wamytan@vencose.nc', '85.34.21', NULL, '$2a$10$bcdefghijklmnopqrstuvw'),
('Kabar', 'Sophie', 'sophie.kabar@vencose.nc', '79.12.45', '25.67.89', '$2a$10$cdefghijklmnopqrstuvwx'),
('Tein', 'Jean-Marc', 'jm.tein@vencose.nc', '76.98.32', NULL, '$2a$10$defghijklmnopqrstuvwxy'),
('Poadja', 'Emilie', 'emilie.poadja@vencose.nc', '87.65.43', '26.45.12', '$2a$10$efghijklmnopqrstuvwxyz');

-- 3. Association utilisateurs / rôles
INSERT INTO users_roles (fk_id_user, fk_id_role) VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 2),
(3, 3),
(4, 2),
(5, 2);

-- 4. Annonces
INSERT INTO bids (title, description, price, fk_id_user) VALUES
('iPhone 14 Pro 256Go', 'iPhone 14 Pro en tres bon etat, achete a Noumea il y a 1 an. Boite et chargeur inclus.', 145000, 2),
('VTT Rockrider XC100', 'VTT semi-rigide taille L, parfait pour les sentiers du Mont-Dore. Revise recemment.', 65000, 3),
('Planche de surf 6 pieds 2', 'Shortboard pour vagues moyennes, ideal pour Bourail. Quelques pressions sans gravite.', 35000, 4),
('PC Gamer RTX 3060', 'Tour gaming avec Ryzen 5 5600X, 16Go RAM, RTX 3060. Parfait pour 1080p ultra.', 220000, 1),
('Frigo Samsung 350L', 'Refrigerateur double porte, tres peu servi, cause demenagement metropole.', 75000, 5),
('Cours particuliers Java', 'Etudiant BTS SIO propose cours de programmation Java/Spring Boot. 2500 CFP de l heure.', 2500, 1);

-- 5. Photos
INSERT INTO photos (photo_url, fk_id_bid) VALUES
('/uploads/iphone14pro_1.jpg', 1),
('/uploads/iphone14pro_2.jpg', 1),
('/uploads/iphone14pro_3.jpg', 1),
('/uploads/vtt_rockrider_1.jpg', 2),
('/uploads/vtt_rockrider_2.jpg', 2),
('/uploads/surf_62_1.jpg', 3),
('/uploads/pc_gamer_1.jpg', 4),
('/uploads/pc_gamer_2.jpg', 4),
('/uploads/frigo_samsung_1.jpg', 5),
('/uploads/cours_java_1.jpg', 6);

-- 6. Threads
INSERT INTO threads (title, fk_id_bid) VALUES
('Question sur la batterie iPhone', 1),
('Negociation iPhone 14 Pro', 1),
('Disponibilite du VTT', 2),
('Etat de la planche', 3),
('Configuration PC Gamer', 4),
('Cours Java disponibilites', 6);

-- 7. Association utilisateurs / threads
INSERT INTO users_threads (fk_id_user, fk_id_thread) VALUES
(2, 1),
(3, 1),
(2, 2),
(4, 2),
(3, 3),
(1, 3),
(4, 4),
(5, 4),
(1, 5),
(2, 5),
(1, 6),
(5, 6);

-- 8. Messages
INSERT INTO messages (content, fk_id_thread, fk_id_user) VALUES
('Bonjour, l iPhone est-il toujours disponible ? Quel est l etat de la batterie ?', 1, 3),
('Bonjour Sophie, oui il est dispo. La batterie est a 89% de capacite.', 1, 2),
('Parfait, merci pour la reponse rapide. Je reflechis et reviens vers vous.', 1, 3),
('Salut, accepteriez-vous 130000 CFP au lieu de 145000 ?', 2, 4),
('Bonjour, je peux descendre a 140000 mais pas en dessous, desole.', 2, 2),
('OK pour 140000, on peut se voir a Noumea centre cette semaine ?', 2, 4),
('Vendredi 17h devant la mairie ca vous va ?', 2, 2),
('Bonjour, le VTT est-il encore a vendre ? Je suis sur Noumea.', 3, 1),
('Oui toujours disponible. Vous pouvez venir le voir a Magenta quand vous voulez.', 3, 3),
('Super, je passe demain apres-midi vers 15h si ca vous convient.', 3, 1),
('La planche a-t-elle deja ete reparee ? Et les derives sont fournies ?', 4, 5),
('Jamais reparee, juste des pressions superficielles. FCS II x3 incluses.', 4, 4),
('Le PC tourne bien sur Cyberpunk en ultra ?', 5, 2),
('Oui, environ 70 fps en 1080p ultra avec DLSS qualite. RT desactive par contre.', 5, 1),
('Interesse, vous livrez sur Dumbea ?', 5, 2),
('Bonjour, je debute en Java, vous prenez les grands debutants ?', 6, 5),
('Bien sur, j adapte le rythme. On peut commencer par les bases POO.', 6, 1),
('Genial, vous etes dispo le mercredi soir ?', 6, 5);
