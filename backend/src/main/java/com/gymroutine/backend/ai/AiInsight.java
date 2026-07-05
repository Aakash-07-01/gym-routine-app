package com.gymroutine.backend.ai;

import com.gymroutine.backend.model.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insights")
public class AiInsight {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String insightType;

    @Column(nullable = false)
    private String providerUsed;

    private String modelUsed;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    private LocalDate weekStart;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }

    public AiInsight() {}

    public AiInsight(User user, String content, String insightType, String providerUsed, String modelUsed, LocalDate weekStart, Long sessionId, String metadata) {
        this.user = user;
        this.content = content;
        this.insightType = insightType;
        this.providerUsed = providerUsed;
        this.modelUsed = modelUsed;
        this.weekStart = weekStart;
        this.sessionId = sessionId;
        this.metadata = metadata;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getContent() { return content; }
    public String getInsightType() { return insightType; }
    public String getProviderUsed() { return providerUsed; }
    public String getModelUsed() { return modelUsed; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public LocalDate getWeekStart() { return weekStart; }
    public Long getSessionId() { return sessionId; }
    public String getMetadata() { return metadata; }
}
