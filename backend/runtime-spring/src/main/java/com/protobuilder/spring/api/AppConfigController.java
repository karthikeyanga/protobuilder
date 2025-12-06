package com.protobuilder.spring.api;

import com.protobuilder.core.api.AppConfigDto;
import com.protobuilder.spring.service.AppConfigService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/apps")
public class AppConfigController {

  private final AppConfigService service;

  public AppConfigController(AppConfigService service) {
    this.service = service;
  }

  @GetMapping
  public List<AppConfigDto> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public ResponseEntity<AppConfigDto> get(@PathVariable("id") String id) {
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "appId");
    AppConfigDto dto = service.get(uuid);
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  @PostMapping
  public ResponseEntity<AppConfigDto> create(@Valid @RequestBody CreateAppRequest req) {
    AppConfigDto dto = service.create(req.name(), req.version(), req.config());
    return ResponseEntity.ok(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<AppConfigDto> update(@PathVariable("id") String id, @Valid @RequestBody UpdateAppRequest req) {
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "appId");
    AppConfigDto dto = service.update(uuid, req.name(), req.version(), req.config());
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable("id") String id) {
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "appId");
    boolean ok = service.softDelete(uuid);
    return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
  }

  public record CreateAppRequest(
      @NotBlank String name,
      String version,
      String config
  ) {}

  public record UpdateAppRequest(
      String name,
      String version,
      String config
  ) {}
}


