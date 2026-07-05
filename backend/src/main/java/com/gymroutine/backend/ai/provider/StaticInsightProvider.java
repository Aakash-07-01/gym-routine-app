package com.gymroutine.backend.ai.provider;

import com.gymroutine.backend.ai.agent.AiAgentResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class StaticInsightProvider implements AiProvider {

    private final WebClient webClient;

    public StaticInsightProvider(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://text.pollinations.ai").build();
    }

    @Override
    public String getProviderName() {
        return "POLLINATIONS_FREE";
    }

    @Override
    public int getPriority() {
        return 99; // Fallback
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public AiAgentResponse complete(String systemPrompt, String userPrompt) {
        long startTime = System.currentTimeMillis();
        
        Map<String, Object> requestBody = Map.of(
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            )
        );

        String content;
        try {
            content = webClient.post()
                    .uri("/")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            content = "Sorry, I am currently unable to provide an AI insight due to an error.";
        }

        return AiAgentResponse.builder()
                .content(content)
                .providerUsed(getProviderName())
                .modelUsed("pollinations")
                .tokensUsed(0)
                .latencyMs(System.currentTimeMillis() - startTime)
                .build();
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt) {
        Map<String, Object> requestBody = Map.of(
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            )
        );
        
        return webClient.post()
                .uri("/")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .flatMapMany(fullText -> {
                    // Split the text into tokens keeping spaces and newlines
                    String[] tokens = fullText.split("(?<=\\s|\\n)");
                    return Flux.fromArray(tokens)
                            .delayElements(Duration.ofMillis(30));
                })
                .onErrorResume(e -> Flux.just("Sorry, I am currently unable to provide an AI insight."));
    }
}
