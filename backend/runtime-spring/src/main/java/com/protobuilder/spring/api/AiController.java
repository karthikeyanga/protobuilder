package com.protobuilder.spring.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

  @PostMapping("/generate")
  public ResponseEntity<AiGenerateResponse> generate(@RequestBody AiGenerateRequest req) {
    // Stubbed response so the frontend can render AI-driven changes and previews.
    var suggestion = new AiGenerateResponse(
        "Generated layout and bindings (mock)",
        """
        AI can update your page. Suggestions include:
        - Add a CRUD form with required validations.
        - Bind form submit to the selected connector.
        - Show a list view with filters and pagination.
        """.trim(),
        Map.of(
            "layout", List.of(
                Map.of("type", "section", "title", "Primary form", "columns", 2),
                Map.of("type", "list", "title", "Recent records")
            ),
            "bindings", Map.of(
                "form.submit", Map.of("action", "callConnector", "connectorId", req.context().getOrDefault("connectorId", "sample")),
                "list.data", Map.of("source", "connector", "path", "$.items")
            )
        ),
        Instant.now().toString()
    );
    return ResponseEntity.ok(suggestion);
  }

  public record AiGenerateRequest(
      String prompt,
      Map<String, Object> context
  ) {}

  public record AiGenerateResponse(
      String title,
      String summary,
      Map<String, Object> suggestion,
      String generatedAt
  ) {}
}

