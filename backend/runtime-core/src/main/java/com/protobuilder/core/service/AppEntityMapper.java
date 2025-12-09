package com.protobuilder.core.service;

import com.protobuilder.core.api.AppEntityDto;
import com.protobuilder.core.model.AppEntityRecord;
import java.util.Map;

public class AppEntityMapper {
  public static AppEntityDto toDto(AppEntityRecord record) {
    return new AppEntityDto(
        record.getId(),
        record.getAppId(),
        record.getName(),
        record.getVersion(),
        record.getConfig(),
        record.getCreatedAt(),
        record.getUpdatedAt()
    );
  }
}


