package com.gymroutine.backend.ai.agent;

import com.gymroutine.backend.ai.AiInsight;
import com.gymroutine.backend.ai.AiInsightRepository;
import com.gymroutine.backend.ai.AiProviderException;
import com.gymroutine.backend.ai.circuit.CircuitBreakerRegistry;
import com.gymroutine.backend.ai.context.PromptTemplateEngine;
import com.gymroutine.backend.ai.context.WorkoutContextBuilder;
import com.gymroutine.backend.ai.provider.AiProvider;
import com.gymroutine.backend.ai.provider.StaticInsightProvider;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.model.NutritionLog;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymroutine.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AiAgentOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(AiAgentOrchestrator.class);

    private final List<AiProvider> providers;
    private final WorkoutContextBuilder contextBuilder;
    private final PromptTemplateEngine promptEngine;
    private final AiInsightRepository insightRepo;
    private final UserRepository userRepo;
    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final StaticInsightProvider staticProvider;

    public AiAgentOrchestrator(List<AiProvider> providers,
                               WorkoutContextBuilder contextBuilder,
                               PromptTemplateEngine promptEngine,
                               AiInsightRepository insightRepo,
                               UserRepository userRepo,
                               CircuitBreakerRegistry circuitBreakerRegistry,
                               StaticInsightProvider staticProvider) {
        this.providers = providers.stream()
                .sorted(Comparator.comparingInt(AiProvider::getPriority))
                .collect(Collectors.toList());
        this.contextBuilder = contextBuilder;
        this.promptEngine = promptEngine;
        this.insightRepo = insightRepo;
        this.userRepo = userRepo;
        this.circuitBreakerRegistry = circuitBreakerRegistry;
        this.staticProvider = staticProvider;
    }

    public AiAgentResponse generateWeeklyInsight(Long userId) {
        AiAgentContext context = contextBuilder.buildWeeklyContext(userId);
        String systemPrompt = promptEngine.weeklyInsightSystem();
        String userPrompt = promptEngine.weeklyInsightUser(context);

        AiAgentResponse response = executeWithFallback(systemPrompt, userPrompt);

        User user = userRepo.findById(userId).orElseThrow();
        LocalDate weekStart = LocalDate.now().with(WeekFields.ISO.dayOfWeek(), 1); // Monday
        
        AiInsight insight = new AiInsight(
                user,
                response.getContent(),
                "WEEKLY_SUMMARY",
                response.getProviderUsed(),
                response.getModelUsed(),
                weekStart,
                null,
                null
        );
        insightRepo.save(insight);

        return response;
    }

    @Async
    public CompletableFuture<AiAgentResponse> generateWorkoutNarrative(Long sessionId, Long userId) {
        AiAgentContext context = contextBuilder.buildSessionContext(sessionId, userId);
        String systemPrompt = promptEngine.workoutNarrativeSystem();
        String userPrompt = promptEngine.workoutNarrativeUser(context);

        AiAgentResponse response = executeWithFallback(systemPrompt, userPrompt);

        User user = userRepo.findById(userId).orElseThrow();
        AiInsight insight = new AiInsight(
                user,
                response.getContent(),
                "WORKOUT_NARRATIVE",
                response.getProviderUsed(),
                response.getModelUsed(),
                null,
                sessionId,
                null
        );
        insightRepo.save(insight);

        return CompletableFuture.completedFuture(response);
    }

    public List<String> suggestAlternatives(String exerciseName) {
        String systemPrompt = promptEngine.alternativesSystem();
        String userPrompt = promptEngine.alternativesUser(exerciseName);

        AiAgentResponse response = executeWithFallback(systemPrompt, userPrompt);
        
        // Parse response: split by \n, strip numbers
        return Arrays.stream(response.getContent().split("\\n"))
                .map(line -> line.replaceAll("^\\d+\\.\\s*", "").trim())
                .filter(line -> !line.isEmpty())
                .limit(3)
                .collect(Collectors.toList());
    }

    public Flux<String> streamChat(String userMessage, Long userId) {
        AiAgentContext context = contextBuilder.buildChatContext(userId);
        String systemPrompt = promptEngine.aiCoachSystem(context);

        Flux<String> result = Flux.error(new AiProviderException("Initial trigger"));

        for (AiProvider provider : providers) {
            if (provider.isAvailable()) {
                Flux<String> providerFlux = Flux.defer(() -> provider.stream(systemPrompt, userMessage));
                result = result.onErrorResume(e -> {
                    log.warn("Trying provider: {}", provider.getProviderName());
                    return providerFlux;
                });
            }
        }
        
        Flux<String> staticFlux = Flux.defer(() -> staticProvider.stream(systemPrompt, userMessage));
        return result.onErrorResume(e -> {
            log.warn("Falling back to static provider");
            return staticFlux;
        }).doOnNext(token -> log.info("EMITTING TOKEN TO CLIENT: '{}'", token));
    }

    public String generateNoteInsight(String userNote) {
        String systemPrompt = "You are an elite fitness AI coach analyzing a user's daily check-in note. " +
                "Provide a brief, encouraging, and actionable fitness insight based strictly on their text. " +
                "If the note is too short, simply provide a general encouraging fitness tip. " +
                "CRITICAL INSTRUCTION: You MUST NOT ask any questions. Do not use question marks. The user cannot reply. " +
                "Keep your response under 3 sentences.";
        AiAgentResponse response = executeWithFallback(systemPrompt, userNote);
        return response.getContent();
    }

    public NutritionLog estimateMacrosForMeal(String mealName) {
        String systemPrompt = promptEngine.estimateNutritionSystem();
        String userPrompt = promptEngine.estimateNutritionUser(mealName);

        AiAgentResponse response = executeWithFallback(systemPrompt, userPrompt);
        NutritionLog log = new NutritionLog();
        log.setMealName(mealName);

        try {
            ObjectMapper mapper = new ObjectMapper();
            String content = response.getContent();
            int startIndex = content.indexOf('{');
            int endIndex = content.lastIndexOf('}');
            
            if (startIndex >= 0 && endIndex >= startIndex) {
                String json = content.substring(startIndex, endIndex + 1);
                Map<String, Integer> macros = mapper.readValue(json, Map.class);
                log.setCalories(macros.getOrDefault("calories", 0));
                log.setProteinGram(macros.getOrDefault("proteinGram", 0));
                log.setCarbsGram(macros.getOrDefault("carbsGram", 0));
                log.setFatGram(macros.getOrDefault("fatGram", 0));
            } else {
                throw new IllegalStateException("No JSON object found in response");
            }
        } catch (Exception e) {
            log.setCalories(0);
            log.setProteinGram(0);
            log.setCarbsGram(0);
            log.setFatGram(0);
        }
        return log;
    }

    private AiAgentResponse executeWithFallback(String systemPrompt, String userPrompt) {
        for (AiProvider provider : providers) {
            if (provider.isAvailable()) {
                try {
                    return provider.complete(systemPrompt, userPrompt);
                } catch (AiProviderException e) {
                    log.warn("Provider {} failed. Trying next.", provider.getProviderName());
                }
            }
        }
        return staticProvider.complete(systemPrompt, userPrompt);
    }

    public Map<String, CircuitBreakerRegistry.ProviderState> getProviderHealthStatus() {
        return circuitBreakerRegistry.getAllStates();
    }
}
