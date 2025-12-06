package com.protobuilder.spring.repo;

import com.protobuilder.core.model.AppConnectorRecord;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppConnectorRepository extends JpaRepository<AppConnectorRecord, UUID> {
  List<AppConnectorRecord> findByAppId(UUID appId);
}


