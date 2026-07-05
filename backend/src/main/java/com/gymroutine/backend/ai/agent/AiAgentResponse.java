package com.gymroutine.backend.ai.agent;

public class AiAgentResponse {
    private String content;
    private String providerUsed;
    private String modelUsed;
    private int tokensUsed;
    private long latencyMs;

    private AiAgentResponse(Builder builder) {
        this.content = builder.content;
        this.providerUsed = builder.providerUsed;
        this.modelUsed = builder.modelUsed;
        this.tokensUsed = builder.tokensUsed;
        this.latencyMs = builder.latencyMs;
    }

    public String getContent() { return content; }
    public String getProviderUsed() { return providerUsed; }
    public String getModelUsed() { return modelUsed; }
    public int getTokensUsed() { return tokensUsed; }
    public long getLatencyMs() { return latencyMs; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String content;
        private String providerUsed;
        private String modelUsed;
        private int tokensUsed;
        private long latencyMs;

        public Builder content(String content) {
            this.content = content;
            return this;
        }

        public Builder providerUsed(String providerUsed) {
            this.providerUsed = providerUsed;
            return this;
        }

        public Builder modelUsed(String modelUsed) {
            this.modelUsed = modelUsed;
            return this;
        }

        public Builder tokensUsed(int tokensUsed) {
            this.tokensUsed = tokensUsed;
            return this;
        }

        public Builder latencyMs(long latencyMs) {
            this.latencyMs = latencyMs;
            return this;
        }

        public AiAgentResponse build() {
            return new AiAgentResponse(this);
        }
    }
}
