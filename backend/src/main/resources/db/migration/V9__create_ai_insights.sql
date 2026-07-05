CREATE TABLE ai_insights (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    provider_used VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    week_start DATE,
    session_id BIGINT REFERENCES workout_logs(id) ON DELETE SET NULL,
    metadata TEXT
);
