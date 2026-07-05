package com.gymroutine.backend.ai.agent;

import java.util.List;

public class AiAgentContext {
    private Long userId;
    private String userDisplayName;
    private String contextText;
    private int weeklySessionCount;
    private double totalVolumeKg;
    private List<String> recentPrSummaries;

    private AiAgentContext(Builder builder) {
        this.userId = builder.userId;
        this.userDisplayName = builder.userDisplayName;
        this.contextText = builder.contextText;
        this.weeklySessionCount = builder.weeklySessionCount;
        this.totalVolumeKg = builder.totalVolumeKg;
        this.recentPrSummaries = builder.recentPrSummaries;
    }

    public Long getUserId() { return userId; }
    public String getUserDisplayName() { return userDisplayName; }
    public String getContextText() { return contextText; }
    public int getWeeklySessionCount() { return weeklySessionCount; }
    public double getTotalVolumeKg() { return totalVolumeKg; }
    public List<String> getRecentPrSummaries() { return recentPrSummaries; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long userId;
        private String userDisplayName;
        private String contextText;
        private int weeklySessionCount;
        private double totalVolumeKg;
        private List<String> recentPrSummaries;

        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Builder userDisplayName(String userDisplayName) {
            this.userDisplayName = userDisplayName;
            return this;
        }

        public Builder contextText(String contextText) {
            this.contextText = contextText;
            return this;
        }

        public Builder weeklySessionCount(int weeklySessionCount) {
            this.weeklySessionCount = weeklySessionCount;
            return this;
        }

        public Builder totalVolumeKg(double totalVolumeKg) {
            this.totalVolumeKg = totalVolumeKg;
            return this;
        }

        public Builder recentPrSummaries(List<String> recentPrSummaries) {
            this.recentPrSummaries = recentPrSummaries;
            return this;
        }

        public AiAgentContext build() {
            return new AiAgentContext(this);
        }
    }
}
