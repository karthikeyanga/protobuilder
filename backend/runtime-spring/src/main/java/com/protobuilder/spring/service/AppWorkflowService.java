package com.protobuilder.spring.service;

import com.protobuilder.core.api.AppWorkflowDto;
import com.protobuilder.core.model.AppWorkflowRecord;
import com.protobuilder.core.service.AppWorkflowMapper;
import com.protobuilder.spring.repo.AppWorkflowRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppWorkflowService {
  private final AppWorkflowRepository repo;

  public AppWorkflowService(AppWorkflowRepository repo) {
    this.repo = repo;
  }

  @Transactional(readOnly = true)
  public List<AppWorkflowDto> list(UUID appId) {
    return repo.findByAppId(appId).stream().map(AppWorkflowMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public AppWorkflowDto get(UUID appId, UUID id) {
    return repo.findById(id).filter(w -> w.getAppId().equals(appId)).map(AppWorkflowMapper::toDto).orElse(null);
  }

  @Transactional
  public AppWorkflowDto create(UUID appId, String name, String version, String config) {
    AppWorkflowRecord rec = new AppWorkflowRecord();
    rec.setId(UUID.randomUUID());
    rec.setAppId(appId);
    rec.setName(name);
    rec.setVersion(version == null || version.isBlank() ? "0.0.1" : version);
    rec.setConfig(config);
    rec.setCreatedAt(Instant.now());
    rec.setUpdatedAt(rec.getCreatedAt());
    return AppWorkflowMapper.toDto(repo.save(rec));
  }

  @Transactional
  public AppWorkflowDto update(UUID appId, UUID id, String name, String version, String config) {
    AppWorkflowRecord rec = repo.findById(id).orElse(null);
    if (rec == null || !rec.getAppId().equals(appId)) return null;
    if (name != null) rec.setName(name);
    if (version != null) rec.setVersion(version);
    if (config != null) rec.setConfig(config);
    rec.setUpdatedAt(Instant.now());
    return AppWorkflowMapper.toDto(repo.save(rec));
  }
}


