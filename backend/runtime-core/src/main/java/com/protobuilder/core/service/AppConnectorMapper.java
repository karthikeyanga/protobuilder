package com.protobuilder.core.service;

import com.protobuilder.core.api.AppConnectorDto;
import com.protobuilder.core.model.AppConnectorRecord;
import java.util.Map;

public class AppConnectorMapper {
  public static AppConnectorDto toDto(AppConnectorRecord record) {
    return new AppConnectorDto(
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


