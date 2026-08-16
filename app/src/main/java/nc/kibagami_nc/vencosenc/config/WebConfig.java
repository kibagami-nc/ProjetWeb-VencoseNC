package nc.kibagami_nc.vencosenc.config;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Configuration web : CORS + exposition des fichiers uploades
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Origines autorisees (le front). En prod : APP_CORS_ALLOWED_ORIGINS=https://mondomaine.nc
    @Value("${app.cors-allowed-origins}")
    private String[] allowedOrigins;

    // Dossier de stockage des photos (le meme que PhotoStorageServiceImpl)
    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }

    // Rend le dossier d'upload accessible en HTTP : GET /uploads/xxx.jpg -> fichier sur le disque.
    // Path/toUri gere les differences Windows / Linux (C:\... vs /var/...).
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String location = Path.of(uploadDir).toAbsolutePath().normalize().toUri().toString();
        if (!location.endsWith("/")) location += "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
