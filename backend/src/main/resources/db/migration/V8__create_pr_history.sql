CREATE TABLE pr_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    max_weight DOUBLE PRECISION,
    max_reps_at_weight INT,
    date_achieved TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE workout_logs ALTER COLUMN day_id DROP NOT NULL;
