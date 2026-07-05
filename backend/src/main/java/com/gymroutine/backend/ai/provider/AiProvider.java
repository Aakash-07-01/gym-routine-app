package com.gymroutine.backend.ai.provider;

import com.gymroutine.backend.ai.agent.AiAgentResponse;
import reactor.core.publisher.Flux;

public interface AiProvider {
    String getProviderName();
    
    int getPriority(); // Groq=1, Gemini=2, Mistral=3, HuggingFace=4, Static=99
    
    boolean isAvailable(); // checks CircuitBreakerRegistry + API key presence
    
    AiAgentResponse complete(String systemPrompt, String userPrompt);
    
    Flux<String> stream(String systemPrompt, String userPrompt);
}
