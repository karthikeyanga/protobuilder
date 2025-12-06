package com.protobuilder.core.api;

import java.time.Instant;
import java.util.UUID;

public record AppConfigDto(
    UUID id,
    String name,
    String version,
    String config,
    boolean deleted,
    Instant createdAt,
    Instant updatedAt
) {}


