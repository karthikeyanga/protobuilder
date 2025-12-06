package com.protobuilder.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.protobuilder")
public class ProtoBuilderApplication {
  public static void main(String[] args) {
    SpringApplication.run(ProtoBuilderApplication.class, args);
  }
}


