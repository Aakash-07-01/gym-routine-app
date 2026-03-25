package com.gymroutine.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "youtube_cache")
public class YoutubeCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exercise_name", unique = true, nullable = false)
    private String exerciseName;

    @Column(name = "video_id", nullable = false)
    private String videoId;

    @Column(name = "video_title", nullable = false)
    private String videoTitle;

    @Column(name = "cached_at", nullable = false)
    private LocalDateTime cachedAt;

    @PrePersist
    protected void onCache() {
        cachedAt = LocalDateTime.now();
    }

    public YoutubeCache() {
    }

    public YoutubeCache(Long id, String exerciseName, String videoId, String videoTitle, LocalDateTime cachedAt) {
        this.id = id;
        this.exerciseName = exerciseName;
        this.videoId = videoId;
        this.videoTitle = videoTitle;
        this.cachedAt = cachedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getVideoTitle() {
        return videoTitle;
    }

    public void setVideoTitle(String videoTitle) {
        this.videoTitle = videoTitle;
    }

    public LocalDateTime getCachedAt() {
        return cachedAt;
    }

    public void setCachedAt(LocalDateTime cachedAt) {
        this.cachedAt = cachedAt;
    }

    public static YoutubeCacheBuilder builder() {
        return new YoutubeCacheBuilder();
    }

    public static class YoutubeCacheBuilder {
        private Long id;
        private String exerciseName;
        private String videoId;
        private String videoTitle;
        private LocalDateTime cachedAt;

        public YoutubeCacheBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public YoutubeCacheBuilder exerciseName(String exerciseName) {
            this.exerciseName = exerciseName;
            return this;
        }

        public YoutubeCacheBuilder videoId(String videoId) {
            this.videoId = videoId;
            return this;
        }

        public YoutubeCacheBuilder videoTitle(String videoTitle) {
            this.videoTitle = videoTitle;
            return this;
        }

        public YoutubeCacheBuilder cachedAt(LocalDateTime cachedAt) {
            this.cachedAt = cachedAt;
            return this;
        }

        public YoutubeCache build() {
            YoutubeCache c = new YoutubeCache();
            c.id = this.id;
            c.exerciseName = this.exerciseName;
            c.videoId = this.videoId;
            c.videoTitle = this.videoTitle;
            c.cachedAt = this.cachedAt;
            return c;
        }
    }
}
