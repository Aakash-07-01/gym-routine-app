package com.gymroutine.backend.service;

import com.gymroutine.backend.model.YoutubeCache;
import com.gymroutine.backend.repository.YoutubeCacheRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class YoutubeService {

    private final YoutubeCacheRepository cacheRepository;
    private final WebClient youtubeWebClient;

    @Value("${youtube.api.key:}")
    private String apiKey;

    public YoutubeService(YoutubeCacheRepository cacheRepository, WebClient youtubeWebClient) {
        this.cacheRepository = cacheRepository;
        this.youtubeWebClient = youtubeWebClient;
    }

    public YoutubeCache getVideoForExercise(String exerciseName) {
        Optional<YoutubeCache> cached = cacheRepository.findByExerciseNameIgnoreCase(exerciseName);
        if (cached.isPresent()) {
            if (cached.get().getCachedAt().isAfter(LocalDateTime.now().minusDays(30))) {
                return cached.get();
            } else {
                cacheRepository.delete(cached.get());
            }
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("YouTube API key not configured");
        }

        YoutubeApiResponse response = youtubeWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("part", "snippet")
                        .queryParam("q", exerciseName + " exercise tutorial")
                        .queryParam("type", "video")
                        .queryParam("maxResults", "1")
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(YoutubeApiResponse.class)
                .block();

        if (response != null && response.getItems() != null && !response.getItems().isEmpty()) {
            YoutubeApiResponse.Item firstItem = response.getItems().get(0);
            YoutubeCache newCache = YoutubeCache.builder()
                    .exerciseName(exerciseName.toLowerCase())
                    .videoId(firstItem.getId().getVideoId())
                    .videoTitle(firstItem.getSnippet().getTitle())
                    .build();
            return cacheRepository.save(newCache);
        }

        throw new RuntimeException("No video found for exercise: " + exerciseName);
    }
}
