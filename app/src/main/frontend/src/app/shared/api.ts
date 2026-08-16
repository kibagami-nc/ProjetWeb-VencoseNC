// URL de base du backend Spring.
// Un seul endroit a modifier si l'adresse du serveur change (deploiement, port different...).
export const API_URL = 'http://localhost:8080/api';

// Origine du serveur (sans /api) : sert a construire les URLs des fichiers uploades (/uploads/...)
export const SERVER_URL = API_URL.replace(/\/api$/, '');
