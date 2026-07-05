package com.gymroutine.backend.ai;

import com.gymroutine.backend.ai.agent.AiAgentResponse;

import java.time.LocalDateTime;

public class AiInsightResponse {
    private String content;
    private String providerUsed;
    private String modelUsed;
    private String insightType;
    private LocalDateTime generatedAt;

    public AiInsightResponse() {}

    public AiInsightResponse(String content, String providerUsed, String modelUsed, String insightType, LocalDateTime generatedAt) {
        this.content = content;
        this.providerUsed = providerUsed;
        this.modelUsed = modelUsed;
        this.insightType = insightType;
        this.generatedAt = generatedAt;
    }

    public static AiInsightResponse from(AiInsight entity) {
        return new AiInsightResponse(
                entity.getContent(),
                entity.getProviderUsed(),
                entity.getModelUsed(),
                entity.getInsightType(),
                entity.getGeneratedAt()
        );
    }

    public static AiInsightResponse fromAgent(AiAgentResponse response, String type) {
        return new AiInsightResponse(
                response.getContent(),
                response.getProviderUsed(),
                response.getModelUsed(),
                type,
                LocalDateTime.now()
        );
    }

    public String getContent() { return content; }
    public String getProviderUsed() { return providerUsed; }
    public String getModelUsed() { return modelUsed; }
    public String getInsightType() { return insightType; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    
    public void setContent(String content) { this.content = content; }
    public void setProviderUsed(String providerUsed) { this.providerUsed = providerUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }
    public void setInsightType(String insightType) { this.insightType = insightType; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
