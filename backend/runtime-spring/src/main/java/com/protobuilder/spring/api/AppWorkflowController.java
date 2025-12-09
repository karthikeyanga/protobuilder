package com.protobuilder.spring.api;

import com.protobuilder.core.api.AppWorkflowDto;
import com.protobuilder.spring.service.AppWorkflowService;
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
@RequestMapping("/api/apps/{appId}/workflows")
public class AppWorkflowController {

  private final AppWorkflowService service;

  public AppWorkflowController(AppWorkflowService service) {
    this.service = service;
  }

  @GetMapping
  public List<AppWorkflowDto> list(@PathVariable("appId") String appId) {
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    return service.list(uuid);
  }

  @GetMapping("/{id}")
  public ResponseEntity<AppWorkflowDto> get(@PathVariable("appId") String appId, @PathVariable("id") String id) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppWorkflowDto dto = service.get(appUuid, uuid);
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  @PostMapping
  public ResponseEntity<AppWorkflowDto> create(@PathVariable("appId") String appId, @Valid @RequestBody CreateWorkflowRequest req) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    AppWorkflowDto dto = service.create(appUuid, req.name(), req.version(), req.config());
    return ResponseEntity.ok(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<AppWorkflowDto> update(@PathVariable("appId") String appId, @PathVariable("id") String id, @Valid @RequestBody UpdateWorkflowRequest req) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppWorkflowDto dto = service.update(appUuid, uuid, req.name(), req.version(), req.config());
    return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable("appId") String appId, @PathVariable("id") String id) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    boolean ok = service.delete(appUuid, uuid);
    return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
  }

  @PostMapping("/{id}/execute")
  public ResponseEntity<WorkflowExecuteResponse> execute(
      @PathVariable("appId") String appId,
      @PathVariable("id") String id,
      @RequestBody(required = false) WorkflowExecuteRequest req
  ) {
    var appUuid = com.protobuilder.spring.util.PathVars.toUuid(appId, "appId");
    var uuid = com.protobuilder.spring.util.PathVars.toUuid(id, "id");
    AppWorkflowDto dto = service.get(appUuid, uuid);
    if (dto == null) {
      return ResponseEntity.notFound().build();
    }
    WorkflowExecuteRequest safeReq = req == null ? new WorkflowExecuteRequest(null, null) : req;
    var response = new WorkflowExecuteResponse(
        200,
        Map.of(
            "workflow", dto.name(),
            "version", dto.version(),
            "inputs", safeReq.inputs() == null ? Map.of() : safeReq.inputs(),
            "pageRef", safeReq.pageRef() == null ? "" : safeReq.pageRef()
        ),
        "Mock workflow execution completed"
    );
    return ResponseEntity.ok(response);
  }

  public record CreateWorkflowRequest(
      @NotBlank String name,
      String version,
      Map<String, Object> config
  ) {}

  public record UpdateWorkflowRequest(
      String name,
      String version,
      Map<String, Object> config
  ) {}

  public record WorkflowExecuteRequest(
      Map<String, Object> inputs,
      String pageRef
  ) {}

  public record WorkflowExecuteResponse(
      int status,
      Map<String, Object> output,
      String message
  ) {}
}


