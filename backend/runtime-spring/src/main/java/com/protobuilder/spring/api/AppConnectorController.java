package com.protobuilder.spring.api;

import com.protobuilder.core.api.AppConnectorDto;
import com.protobuilder.spring.service.AppConnectorService;
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
@RequestMapping("/api/apps/{appId}/connectors")
public class AppConnectorController {

  private final AppConnectorService service;

  public AppConnectorController(AppConnectorService service) {
    this.service = service;
  }

  @GetMapping
  public List<AppConnectorDto> list(@PathVariable("appId") String appId) {
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    return service.list(uuid);
  }

  @GetMapping("/{id}")
  public ResponseEntity<AppConnectorDto> get(@PathVariable("appId") String appId, @PathVariable("id") String id) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppConnectorDto dto = service.get(appUuid, uuid);
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  @PostMapping
  public ResponseEntity<AppConnectorDto> create(@PathVariable("appId") String appId, @Valid @RequestBody CreateConnectorRequest req) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    AppConnectorDto dto = service.create(appUuid, req.name(), req.version(), req.config());
    return ResponseEntity.ok(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<AppConnectorDto> update(@PathVariable("appId") String appId, @PathVariable("id") String id, @Valid @RequestBody UpdateConnectorRequest req) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppConnectorDto dto = service.update(appUuid, uuid, req.name(), req.version(), req.config());
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  public record CreateConnectorRequest(
      @NotBlank String name,
      String version,
      String config
  ) {}

  public record UpdateConnectorRequest(
      String name,
      String version,
      String config
  ) {}
}


