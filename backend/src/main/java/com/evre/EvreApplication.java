package com.evre;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.evre")
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = "com.evre.repository")
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages = "com.evre.model")
@EnableScheduling
public class EvreApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvreApplication.class, args);
    }
}
