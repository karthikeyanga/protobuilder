package com.protobuilder.spring.service;

import com.protobuilder.core.api.AppEntityDto;
import com.protobuilder.core.model.AppEntityRecord;
import com.protobuilder.core.service.AppEntityMapper;
import com.protobuilder.spring.repo.AppEntityRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppEntityService {
  private final AppEntityRepository repo;

  public AppEntityService(AppEntityRepository repo) {
    this.repo = repo;
  }

  @Transactional(readOnly = true)
  public List<AppEntityDto> list(UUID appId) {
    return repo.findByAppId(appId).stream().map(AppEntityMapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public AppEntityDto get(UUID appId, UUID id) {
    return repo.findById(id).filter(e -> e.getAppId().equals(appId)).map(AppEntityMapper::toDto).orElse(null);
  }

  @Transactional
  public AppEntityDto create(UUID appId, String name, String version, java.util.Map<String, Object> config) {
    AppEntityRecord rec = new AppEntityRecord();
    rec.setId(UUID.randomUUID());
    rec.setAppId(appId);
    rec.setName(name);
    rec.setVersion(version == null || version.isBlank() ? "0.0.1" : version);
    rec.setConfig(config == null ? java.util.Collections.emptyMap() : config);
    rec.setCreatedAt(Instant.now());
    rec.setUpdatedAt(rec.getCreatedAt());
    return AppEntityMapper.toDto(repo.save(rec));
  }

  @Transactional
  public AppEntityDto update(UUID appId, UUID id, String name, String version, java.util.Map<String, Object> config) {
    AppEntityRecord rec = repo.findById(id).orElse(null);
    if (rec == null || !rec.getAppId().equals(appId)) return null;
    if (name != null) rec.setName(name);
    if (version != null) rec.setVersion(version);
    if (config != null) rec.setConfig(config);
    rec.setUpdatedAt(Instant.now());
    return AppEntityMapper.toDto(repo.save(rec));
  }

  @Transactional
  public boolean delete(UUID appId, UUID id) {
    AppEntityRecord rec = repo.findById(id).orElse(null);
    if (rec == null || !rec.getAppId().equals(appId)) return false;
    repo.deleteById(id);
    return true;
  }
}


