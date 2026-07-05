CREATE TABLE ai_provider_health (
    provider VARCHAR(50) PRIMARY KEY,
    failure_count INT NOT NULL DEFAULT 0,
    last_failure_at TIMESTAMP,
    last_success_at TIMESTAMP,
    is_circuit_open BOOLEAN NOT NULL DEFAULT FALSE,
    circuit_open_until TIMESTAMP
);

INSERT INTO ai_provider_health (provider)
VALUES ('GROQ'), ('GEMINI'), ('MISTRAL'), ('HUGGINGFACE');
