package com.protobuilder.spring.util;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class PathVars {
  private PathVars() {}

  public static UUID toUuid(String raw, String name) {
    try {
      return UUID.fromString(raw);
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid " + name + " (expected UUID): " + raw);
    }
  }
}


