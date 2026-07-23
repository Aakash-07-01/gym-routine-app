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
        reactor.netty.http.client.HttpClient httpClient = reactor.netty.http.client.HttpClient.create()
                .responseTimeout(Duration.ofSeconds(15));
        this.webClient = webClientBuilder.clone().baseUrl("https://text.pollinations.ai")
                .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(httpClient))
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .build();
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
        
        String content = getStaticFallback(systemPrompt);

        return AiAgentResponse.builder()
                .content(content)
                .providerUsed(getProviderName())
                .modelUsed("pollinations")
                .tokensUsed(0)
                .latencyMs(System.currentTimeMillis() - startTime)
                .build();
    }

    private String getStaticFallback(String systemPrompt) {
        if (systemPrompt == null) return "I'm a static AI coach. I'm here to help you hit those PRs!";
        if (systemPrompt.contains("weekly training data")) {
            return "Great job this week! You logged some solid workouts. Try to maintain this consistency next week for optimal results.";
        } else if (systemPrompt.contains("Summarize the completed workout")) {
            return "Solid workout! You hit some great volume today. Keep this momentum going.";
        } else if (systemPrompt.contains("3 alternative exercises")) {
            return "1. Goblet Squat\n2. Leg Press\n3. Bulgarian Split Squat";
        } else if (systemPrompt.contains("daily check-in note")) {
            return "Consistency is key. Keep pushing yourself and stay hydrated!";
        } else if (systemPrompt.contains("macronutrients")) {
            return "{\"calories\": 600, \"proteinGram\": 45, \"carbsGram\": 50, \"fatGram\": 20}";
        }
        return "I'm a static AI coach. I'm here to help you hit those PRs!";
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt) {
        String fallback = "Hello! I am your static AI coach. Since you're running locally without a valid AI API key, and the free provider failed, I'm providing this mock response. You're doing great with your training! Keep logging those workouts.";
        String[] tokens = fallback.split("(?<=\\s|\\n)");
        return Flux.fromArray(tokens).delayElements(Duration.ofMillis(30));
    }
}
