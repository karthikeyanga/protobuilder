package com.protobuilder.spring.repo;

import com.protobuilder.core.model.AppConfigRecord;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppConfigRepository extends JpaRepository<AppConfigRecord, UUID> {
}


