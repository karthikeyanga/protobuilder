package com.protobuilder.spring.api;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the builder and runtime SPA assets from the same process as the APIs.
 * <p>
 * Defaults look for built bundles under ../frontend/apps/{builder,runtime}/dist relative to the backend module.
 * Override with env vars FRONTEND_BUILDER_DIST / FRONTEND_RUNTIME_DIST or corresponding Spring properties.
 */
@Controller
public class StaticAssetController {

  private final Path builderRoot;
  private final Path runtimeRoot;

  public StaticAssetController(
      @Value("${frontend.builder.path:../frontend/apps/builder/dist}") String builderPath,
      @Value("${frontend.runtime.path:../frontend/apps/runtime/dist}") String runtimePath) {
    this.builderRoot = Paths.get(builderPath).toAbsolutePath().normalize();
    this.runtimeRoot = Paths.get(runtimePath).toAbsolutePath().normalize();
  }

  @GetMapping({"/builder", "/builder/", "/builder/**"})
  public ResponseEntity<Resource> serveBuilder(HttpServletRequest request) throws IOException {
    return serveSpa(request, builderRoot, "builder");
  }

  @GetMapping({"/", "/app", "/app/", "/app/**"})
  public ResponseEntity<Resource> serveRuntime(HttpServletRequest request) throws IOException {
    return serveSpa(request, runtimeRoot, "app");
  }

  private ResponseEntity<Resource> serveSpa(HttpServletRequest request, Path root, String prefix) throws IOException {
    if (!Files.exists(root)) {
      return ResponseEntity.notFound().build();
    }

    String rawPath = Objects.toString(request.getRequestURI(), "");
    String pathWithinSpa = stripPrefix(rawPath, prefix);
    if (pathWithinSpa.isBlank()) {
      pathWithinSpa = "index.html";
    }

    Path candidate = root.resolve(pathWithinSpa).normalize();
    if (!candidate.startsWith(root) || Files.isDirectory(candidate) || !Files.exists(candidate)) {
      candidate = root.resolve("index.html").normalize();
    }

    if (!Files.exists(candidate)) {
      return ResponseEntity.notFound().build();
    }

    Resource resource = new FileSystemResource(candidate);
    String contentType = Files.probeContentType(candidate);
    if (contentType == null && candidate.getFileName().toString().endsWith(".js")) {
      contentType = "application/javascript";
    }

    return ResponseEntity
        .ok()
        .contentType(MediaType.parseMediaType(contentType != null ? contentType : "text/html"))
        .body(resource);
  }

  private String stripPrefix(String uri, String prefix) {
    String path = uri == null ? "" : uri;
    if (prefix != null && !prefix.isBlank()) {
      String fullPrefix = "/" + prefix;
      if (path.startsWith(fullPrefix)) {
        path = path.substring(fullPrefix.length());
      }
    }
    // remove leading slash if present after prefix removal
    return path.replaceFirst("^/+", "");
  }
}


