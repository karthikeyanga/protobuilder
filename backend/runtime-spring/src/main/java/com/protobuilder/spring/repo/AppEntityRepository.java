package com.protobuilder.spring.repo;

import com.protobuilder.core.model.AppEntityRecord;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppEntityRepository extends JpaRepository<AppEntityRecord, UUID> {
  List<AppEntityRecord> findByAppId(UUID appId);
}


