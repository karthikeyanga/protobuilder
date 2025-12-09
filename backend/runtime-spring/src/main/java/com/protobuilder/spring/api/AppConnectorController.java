package com.protobuilder.spring.api;

import com.protobuilder.core.api.AppConnectorDto;
import com.protobuilder.spring.service.AppConnectorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
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

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable("appId") String appId, @PathVariable("id") String id) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    boolean ok = service.delete(appUuid, uuid);
    return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
  }

  @PostMapping("/{id}/test")
  public ResponseEntity<TestConnectorResponse> test(
      @PathVariable("appId") String appId,
      @PathVariable("id") String id,
      @RequestBody(required = false) TestConnectorRequest req
  ) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppConnectorDto dto = service.get(appUuid, uuid);
    if (dto == null) {
      return ResponseEntity.notFound().build();
    }
    TestConnectorRequest safeReq = req == null ? new TestConnectorRequest(null, null, null, null) : req;
    var response = new TestConnectorResponse(
        200,
        Map.of("x-mock", "proto-builder"),
        Map.of(
            "echo", safeReq.body(),
            "method", safeReq.method() == null ? "GET" : safeReq.method(),
            "path", safeReq.path() == null ? "/" : safeReq.path(),
            "connectorName", dto.name(),
            "version", dto.version()
        ),
        "Mock connector test succeeded"
    );
    return ResponseEntity.ok(response);
  }

  public record CreateConnectorRequest(
      @NotBlank String name,
      String version,
      Map<String, Object> config
  ) {}

  public record UpdateConnectorRequest(
      String name,
      String version,
      Map<String, Object> config
  ) {}

  public record TestConnectorRequest(
      String path,
      String method,
      Map<String, String> headers,
      String body
  ) {}

  public record TestConnectorResponse(
      int status,
      Map<String, String> headers,
      Object body,
      String message
  ) {}
}


