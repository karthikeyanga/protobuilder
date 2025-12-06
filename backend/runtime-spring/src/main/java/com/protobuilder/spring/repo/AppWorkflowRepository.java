package com.protobuilder.spring.repo;

import com.protobuilder.core.model.AppWorkflowRecord;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppWorkflowRepository extends JpaRepository<AppWorkflowRecord, UUID> {
  List<AppWorkflowRecord> findByAppId(UUID appId);
}


