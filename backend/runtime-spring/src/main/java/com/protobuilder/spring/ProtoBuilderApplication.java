package com.protobuilder.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.protobuilder")
@EntityScan(basePackages = "com.protobuilder.core.model")
@EnableJpaRepositories(basePackages = "com.protobuilder.spring.repo")
public class ProtoBuilderApplication {
  public static void main(String[] args) {
    SpringApplication.run(ProtoBuilderApplication.class, args);
  }
}


