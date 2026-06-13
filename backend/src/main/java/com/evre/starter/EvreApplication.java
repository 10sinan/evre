package com.evre.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EvreApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvreApplication.class, args);
    }
}
