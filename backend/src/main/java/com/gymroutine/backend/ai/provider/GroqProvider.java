package com.gymroutine.backend.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymroutine.backend.ai.AiProviderException;
import com.gymroutine.backend.ai.agent.AiAgentResponse;
import com.gymroutine.backend.ai.circuit.CircuitBreakerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
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
public class GroqProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GroqProvider.class);
    private static final String PROVIDER_NAME = "GROQ";
    private static final String BASE_URL = "https://api.groq.com/openai/v1";
    private static final String MODEL = "llama-3.3-70b-versatile";
    private static final String FAST_MODEL = "llama-3.1-8b-instant";

    @Value("${ai.groq.api-key:}")
    private String apiKey;

    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GroqProvider(CircuitBreakerRegistry circuitBreakerRegistry, WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
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
        return 2;
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !circuitBreakerRegistry.isOpen(PROVIDER_NAME);
    }

    @Override
    public AiAgentResponse complete(String systemPrompt, String userPrompt) {
        if (!isAvailable()) {
            throw new AiProviderException("Groq provider is not available");
        }

        long startTime = System.currentTimeMillis();
        
        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            )
        );

        try {
            JsonNode responseNode = webClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            String content = responseNode.path("choices").get(0).path("message").path("content").asText();
            int promptTokens = responseNode.path("usage").path("prompt_tokens").asInt(0);
            int completionTokens = responseNode.path("usage").path("completion_tokens").asInt(0);

            circuitBreakerRegistry.recordSuccess(PROVIDER_NAME);

            return AiAgentResponse.builder()
                    .content(content)
                    .providerUsed(PROVIDER_NAME)
                    .modelUsed(MODEL)
                    .tokensUsed(promptTokens + completionTokens)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .build();

        } catch (Exception e) {
            log.error("Groq API error", e);
            circuitBreakerRegistry.recordFailure(PROVIDER_NAME);
            throw new AiProviderException("Failed to call Groq API", e);
        }
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt) {
        if (!isAvailable()) {
            return Flux.error(new AiProviderException("Groq provider is not available"));
        }

        Map<String, Object> requestBody = Map.of(
            "model", FAST_MODEL,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "stream", true
        );

        return webClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
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
                        JsonNode delta = node.path("choices").get(0).path("delta");
                        if (delta.has("content")) {
                            return delta.get("content").asText();
                        }
                    } catch (Exception e) {
                        // ignore parsing errors for partial chunks
                    }
                    return null;
                })
                .doOnComplete(() -> circuitBreakerRegistry.recordSuccess(PROVIDER_NAME))
                .onErrorResume(e -> {
                    log.error("Groq stream error", e);
                    circuitBreakerRegistry.recordFailure(PROVIDER_NAME);
                    return Flux.error(new AiProviderException("Failed to stream from Groq API", e));
                });
    }
}
