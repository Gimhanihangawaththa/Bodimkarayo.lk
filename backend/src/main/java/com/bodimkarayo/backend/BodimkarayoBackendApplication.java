package com.bodimkarayo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;



@SpringBootApplication
@EnableAsync
@EnableJpaRepositories("com.bodimkarayo.backend.repository")
@ComponentScan("com.bodimkarayo.backend")
public class BodimkarayoBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BodimkarayoBackendApplication.class, args);
	}
}

