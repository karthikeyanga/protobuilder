package com.protobuilder.core.service;

import com.protobuilder.core.api.AppConfigDto;
import com.protobuilder.core.model.AppConfigRecord;

public class AppConfigMapper {
  public static AppConfigDto toDto(AppConfigRecord record) {
    return new AppConfigDto(
        record.getId(),
        record.getName(),
        record.getVersion(),
        record.getConfig(),
        record.getCreatedAt(),
        record.getUpdatedAt()
    );
  }
}


