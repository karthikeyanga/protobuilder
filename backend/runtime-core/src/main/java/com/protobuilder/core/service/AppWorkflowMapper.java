package com.protobuilder.core.service;

import com.protobuilder.core.api.AppWorkflowDto;
import com.protobuilder.core.model.AppWorkflowRecord;

public class AppWorkflowMapper {
  public static AppWorkflowDto toDto(AppWorkflowRecord record) {
    return new AppWorkflowDto(
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


