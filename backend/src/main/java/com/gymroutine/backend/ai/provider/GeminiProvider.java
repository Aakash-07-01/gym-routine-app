package com.gymroutine.backend.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymroutine.backend.ai.AiProviderException;
import com.gymroutine.backend.ai.agent.AiAgentResponse;
import com.gymroutine.backend.ai.circuit.CircuitBreakerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

import java.time.Duration;
import reactor.netty.http.client.HttpClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

@Service
public class GeminiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiProvider.class);
    private static final String PROVIDER_NAME = "GEMINI";
    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    private static final String MODEL = "gemini-2.0-flash-lite";
    private static final String STREAM_MODEL = "gemini-1.5-flash-8b";

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiProvider(CircuitBreakerRegistry circuitBreakerRegistry, WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.circuitBreakerRegistry = circuitBreakerRegistry;
        HttpClient httpClient = HttpClient.create().responseTimeout(Duration.ofSeconds(15));
        this.webClient = webClientBuilder.baseUrl(BASE_URL)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public int getPriority() {
        return 1;
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !circuitBreakerRegistry.isOpen(PROVIDER_NAME);
    }

    private Map<String, Object> buildGeminiRequest(String systemPrompt, String userPrompt) {
        return Map.of(
            "system_instruction", Map.of(
                "parts", List.of(Map.of("text", systemPrompt))
            ),
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", userPrompt)))
            )
        );
    }

    @Override
    public AiAgentResponse complete(String systemPrompt, String userPrompt) {
        if (!isAvailable()) {
            throw new AiProviderException("Gemini provider is not available");
        }

        long startTime = System.currentTimeMillis();
        Map<String, Object> requestBody = buildGeminiRequest(systemPrompt, userPrompt);

        try {
            JsonNode responseNode = webClient.post()
                    .uri("/models/" + MODEL + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            String content = responseNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            circuitBreakerRegistry.recordSuccess(PROVIDER_NAME);

            return AiAgentResponse.builder()
                    .content(content)
                    .providerUsed(PROVIDER_NAME)
                    .modelUsed(MODEL)
                    .tokensUsed(0) // Gemini API doesn't always return token counts easily in the same structure
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .build();

        } catch (Exception e) {
            log.error("Gemini API error", e);
            circuitBreakerRegistry.recordFailure(PROVIDER_NAME);
            throw new AiProviderException("Failed to call Gemini API", e);
        }
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt) {
        if (!isAvailable()) {
            return Flux.error(new AiProviderException("Gemini provider is not available"));
        }

        Map<String, Object> requestBody = buildGeminiRequest(systemPrompt, userPrompt);

        return webClient.post()
                .uri("/models/" + STREAM_MODEL + ":streamGenerateContent?alt=sse&key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .mapNotNull(chunk -> {
                    if (chunk.startsWith("data: ")) {
                        chunk = chunk.substring(6);
                    } else if (chunk.startsWith("data:")) {
                        chunk = chunk.substring(5);
                    }
                    chunk = chunk.trim();
                    if (chunk.isEmpty() || chunk.equals("[DONE]")) {
                        return null;
                    }
                    try {
                        JsonNode node = objectMapper.readTree(chunk);
                        if (node.has("candidates") && node.get("candidates").isArray() && node.get("candidates").size() > 0) {
                            JsonNode parts = node.get("candidates").get(0).path("content").path("parts");
                            if (parts.isArray() && parts.size() > 0) {
                                return parts.get(0).path("text").asText();
                            }
                        }
                    } catch (Exception e) {
                        // ignore parsing errors
                    }
                    return null;
                })
                .doOnComplete(() -> circuitBreakerRegistry.recordSuccess(PROVIDER_NAME))
                .onErrorResume(e -> {
                    log.error("Gemini stream error", e);
                    circuitBreakerRegistry.recordFailure(PROVIDER_NAME);
                    return Flux.error(new AiProviderException("Failed to stream from Gemini API", e));
                });
    }
}
