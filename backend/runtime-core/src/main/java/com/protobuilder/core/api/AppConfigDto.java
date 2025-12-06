package com.protobuilder.core.api;

import java.time.Instant;
import java.util.UUID;

public record AppConfigDto(
    UUID id,
    String name,
    String version,
    String config,
    Instant createdAt,
    Instant updatedAt
) {}


