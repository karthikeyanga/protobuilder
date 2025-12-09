package com.protobuilder.core.api;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AppEntityDto(
    UUID id,
    UUID appId,
    String name,
    String version,
    Map<String, Object> config,
    Instant createdAt,
    Instant updatedAt
) {}


