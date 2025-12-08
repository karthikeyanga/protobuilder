package com.protobuilder.spring.api;

import com.protobuilder.core.api.AppEntityDto;
import com.protobuilder.spring.service.AppEntityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/apps/{appId}/entities")
public class AppEntityController {

  private final AppEntityService service;

  public AppEntityController(AppEntityService service) {
    this.service = service;
  }

  @GetMapping
  public List<AppEntityDto> list(@PathVariable("appId") String appId) {
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    return service.list(uuid);
  }

  @GetMapping("/{id}")
  public ResponseEntity<AppEntityDto> get(@PathVariable("appId") String appId, @PathVariable("id") String id) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppEntityDto dto = service.get(appUuid, uuid);
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  @PostMapping
  public ResponseEntity<AppEntityDto> create(@PathVariable("appId") String appId, @Valid @RequestBody CreateEntityRequest req) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    AppEntityDto dto = service.create(appUuid, req.name(), req.version(), req.config());
    return ResponseEntity.ok(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<AppEntityDto> update(@PathVariable("appId") String appId, @PathVariable("id") String id, @Valid @RequestBody UpdateEntityRequest req) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppEntityDto dto = service.update(appUuid, uuid, req.name(), req.version(), req.config());
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  public record CreateEntityRequest(
      @NotBlank String name,
      String version,
      String config
  ) {}

  public record UpdateEntityRequest(
      String name,
      String version,
      String config
  ) {}
}


