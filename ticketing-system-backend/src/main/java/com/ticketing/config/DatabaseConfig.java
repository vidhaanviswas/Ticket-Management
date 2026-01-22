package com.ticketing.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        // If DATABASE_URL is not set or empty, use default Spring Boot properties
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            return DataSourceBuilder.create().build();
        }

        // Check if DATABASE_URL is already in JDBC format
        if (databaseUrl.startsWith("jdbc:")) {
            return DataSourceBuilder.create()
                    .url(databaseUrl)
                    .build();
        }

        // Parse PostgreSQL URI format: postgresql://user:password@host:port/dbname
        try {
            URI dbUri = new URI(databaseUrl);
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":").length > 1 
                    ? dbUri.getUserInfo().split(":")[1] 
                    : "";
            String host = dbUri.getHost();
            int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
            String path = dbUri.getPath();
            String dbName = path.startsWith("/") ? path.substring(1) : path;

            String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);

            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid DATABASE_URL format", e);
        }
    }
}
