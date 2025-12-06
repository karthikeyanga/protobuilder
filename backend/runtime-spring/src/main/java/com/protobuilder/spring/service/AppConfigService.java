package com.protobuilder.spring.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.protobuilder.core.api.AppConfigDto;
import com.protobuilder.core.model.AppConfigRecord;
import com.protobuilder.core.service.AppConfigMapper;
import com.protobuilder.spring.repo.AppConfigRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppConfigService {
  private final AppConfigRepository repo;

  public AppConfigService(AppConfigRepository repo) {
    this.repo = repo;
  }

  @Transactional(readOnly = true)
  public List<AppConfigDto> list() {
    return repo.findAll().stream().map(AppConfigMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public AppConfigDto get(UUID id) {
    return repo.findById(id).map(AppConfigMapper::toDto).orElse(null);
  }

  @Transactional
  public AppConfigDto create(String name, String version, JsonNode config) {
    AppConfigRecord rec = new AppConfigRecord();
    rec.setId(UUID.randomUUID());
    rec.setName(name);
    rec.setVersion(version == null || version.isBlank() ? "0.0.1" : version);
    rec.setConfig(config);
    rec.setCreatedAt(Instant.now());
    rec.setUpdatedAt(rec.getCreatedAt());
    return AppConfigMapper.toDto(repo.save(rec));
  }

  @Transactional
  public AppConfigDto update(UUID id, String name, String version, JsonNode config) {
    AppConfigRecord rec = repo.findById(id).orElse(null);
    if (rec == null) return null;
    if (name != null) rec.setName(name);
    if (version != null) rec.setVersion(version);
    if (config != null) rec.setConfig(config);
    rec.setUpdatedAt(Instant.now());
    return AppConfigMapper.toDto(repo.save(rec));
  }
}


