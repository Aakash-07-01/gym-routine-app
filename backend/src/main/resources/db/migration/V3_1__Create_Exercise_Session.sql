CREATE TABLE exercise_session (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workout_log_id BIGINT,
    exercise_name VARCHAR(255),
    sets_completed INT,
    reps_per_set INT,
    weight_used DOUBLE PRECISION,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE
);
