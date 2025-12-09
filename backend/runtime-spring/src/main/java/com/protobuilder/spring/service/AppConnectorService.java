package com.protobuilder.spring.service;

import com.protobuilder.core.api.AppConnectorDto;
import com.protobuilder.core.model.AppConnectorRecord;
import com.protobuilder.core.service.AppConnectorMapper;
import com.protobuilder.spring.repo.AppConnectorRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppConnectorService {
  private final AppConnectorRepository repo;

  public AppConnectorService(AppConnectorRepository repo) {
    this.repo = repo;
  }

  @Transactional(readOnly = true)
  public List<AppConnectorDto> list(UUID appId) {
    return repo.findByAppId(appId).stream().map(AppConnectorMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public AppConnectorDto get(UUID appId, UUID id) {
    return repo.findById(id).filter(c -> c.getAppId().equals(appId)).map(AppConnectorMapper::toDto).orElse(null);
  }

  @Transactional
  public AppConnectorDto create(UUID appId, String name, String version, java.util.Map<String, Object> config) {
    AppConnectorRecord rec = new AppConnectorRecord();
    rec.setId(UUID.randomUUID());
    rec.setAppId(appId);
    rec.setName(name);
    rec.setVersion(version == null || version.isBlank() ? "0.0.1" : version);
    rec.setConfig(config == null ? java.util.Collections.emptyMap() : config);
    rec.setCreatedAt(Instant.now());
    rec.setUpdatedAt(rec.getCreatedAt());
    return AppConnectorMapper.toDto(repo.save(rec));
  }

  @Transactional
  public AppConnectorDto update(UUID appId, UUID id, String name, String version, java.util.Map<String, Object> config) {
    AppConnectorRecord rec = repo.findById(id).orElse(null);
    if (rec == null || !rec.getAppId().equals(appId)) return null;
    if (name != null) rec.setName(name);
    if (version != null) rec.setVersion(version);
    if (config != null) rec.setConfig(config);
    rec.setUpdatedAt(Instant.now());
    return AppConnectorMapper.toDto(repo.save(rec));
  }

  @Transactional
  public boolean delete(UUID appId, UUID id) {
    AppConnectorRecord rec = repo.findById(id).orElse(null);
    if (rec == null || !rec.getAppId().equals(appId)) return false;
    repo.deleteById(id);
    return true;
  }
}


