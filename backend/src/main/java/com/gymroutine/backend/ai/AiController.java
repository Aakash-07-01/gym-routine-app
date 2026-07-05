package com.gymroutine.backend.ai;

import com.gymroutine.backend.ai.agent.AiAgentOrchestrator;
import com.gymroutine.backend.ai.agent.AiAgentResponse;
import com.gymroutine.backend.ai.circuit.CircuitBreakerRegistry;
import com.gymroutine.backend.model.User;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiAgentOrchestrator orchestrator;
    private final AiInsightRepository insightRepo;

    public AiController(AiAgentOrchestrator orchestrator, AiInsightRepository insightRepo) {
        this.orchestrator = orchestrator;
        this.insightRepo = insightRepo;
    }

    @GetMapping("/insight/weekly")
    public ResponseEntity<AiInsightResponse> getWeeklyInsight(@AuthenticationPrincipal User user) {
        LocalDate thisMonday = LocalDate.now().with(WeekFields.ISO.dayOfWeek(), 1);
        
        return insightRepo.findTopByUserAndInsightTypeAndWeekStart(user, "WEEKLY_SUMMARY", thisMonday)
                .map(insight -> ResponseEntity.ok(AiInsightResponse.from(insight)))
                .orElseGet(() -> {
                    AiAgentResponse response = orchestrator.generateWeeklyInsight(user.getId());
                    return ResponseEntity.ok(AiInsightResponse.fromAgent(response, "WEEKLY_SUMMARY"));
                });
    }

    @PostMapping("/insight/weekly/regenerate")
    public ResponseEntity<AiInsightResponse> regenerateWeeklyInsight(@AuthenticationPrincipal User user) {
        AiAgentResponse response = orchestrator.generateWeeklyInsight(user.getId());
        return ResponseEntity.ok(AiInsightResponse.fromAgent(response, "WEEKLY_SUMMARY"));
    }

    @PostMapping("/session/{sessionId}/narrative")
    public ResponseEntity<Void> generateWorkoutNarrative(@PathVariable Long sessionId, @AuthenticationPrincipal User user) {
        if (insightRepo.findTopBySessionIdAndInsightType(sessionId, "WORKOUT_NARRATIVE").isEmpty()) {
            orchestrator.generateWorkoutNarrative(sessionId, user.getId());
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/exercise/{name}/alternatives")
    public ResponseEntity<List<String>> getExerciseAlternatives(@PathVariable String name, @AuthenticationPrincipal User user) {
        List<String> alternatives = orchestrator.suggestAlternatives(name);
        return ResponseEntity.ok(alternatives);
    }

    @GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamAiChat(@RequestParam String message, @AuthenticationPrincipal User user) {
        // #region agent log
        try (java.io.FileWriter fw = new java.io.FileWriter("E:\\Anti gravity\\gym-routine-app - Copy\\debug-4426f5.log", true)) {
            fw.write("{\"sessionId\":\"4426f5\",\"location\":\"AiController.java:streamAiChat\",\"message\":\"chat stream request\",\"data\":{\"userId\":" + user.getId() + ",\"messageLen\":" + message.length() + "},\"timestamp\":" + System.currentTimeMillis() + ",\"hypothesisId\":\"D\"}\n");
        } catch (Exception ignored) {}
        // #endregion
        return orchestrator.streamChat(message, user.getId())
                .filter(token -> token != null && !token.isEmpty())
                .map(token -> ServerSentEvent.<String>builder()
                        .data(token)
                        .build())
                .concatWith(Flux.just(ServerSentEvent.<String>builder()
                        .event("done")
                        .data("[DONE]")
                        .build()));
    }

    @GetMapping("/provider/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, CircuitBreakerRegistry.ProviderState>> getProviderHealthStatus() {
        return ResponseEntity.ok(orchestrator.getProviderHealthStatus());
    }
}
