CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE splits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE workout_days (
    id BIGSERIAL PRIMARY KEY,
    split_id BIGINT NOT NULL,
    day_name VARCHAR(255) NOT NULL,
    day_order INT NOT NULL,
    FOREIGN KEY (split_id) REFERENCES splits(id) ON DELETE CASCADE
);

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    day_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sets INT,
    reps INT,
    weight DOUBLE PRECISION,
    notes TEXT,
    order_index INT NOT NULL,
    FOREIGN KEY (day_id) REFERENCES workout_days(id) ON DELETE CASCADE
);

CREATE TABLE workout_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    day_id BIGINT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (day_id) REFERENCES workout_days(id) ON DELETE CASCADE
);

CREATE TABLE youtube_cache (
    id BIGSERIAL PRIMARY KEY,
    exercise_name VARCHAR(255) NOT NULL UNIQUE,
    video_id VARCHAR(255) NOT NULL,
    video_title VARCHAR(255) NOT NULL,
    cached_at TIMESTAMP NOT NULL
);
