package com.protobuilder.core.api;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.UUID;

public record AppConfigDto(
    UUID id,
    String name,
    String version,
    JsonNode config,
    Instant createdAt,
    Instant updatedAt
) {}


