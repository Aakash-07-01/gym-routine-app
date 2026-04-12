package com.gymroutine.backend.service;

import com.gymroutine.backend.model.YoutubeCache;
import com.gymroutine.backend.repository.YoutubeCacheRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

    /**
     * Search YouTube for exercise tutorial videos, returning up to 5 results.
     * API key is kept server-side — never exposed to the frontend.
     */
    public List<Map<String, String>> searchVideos(String query) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "YouTube API key is not configured on the server.");
        }

        try {
            YoutubeApiResponse response = youtubeWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("part", "snippet")
                            .queryParam("q", query + " proper form tutorial")
                            .queryParam("type", "video")
                            .queryParam("maxResults", "5")
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(YoutubeApiResponse.class)
                    .block();

            if (response != null && response.getItems() != null) {
                return response.getItems().stream().map(item -> {
                    Map<String, String> video = new LinkedHashMap<>();
                    video.put("videoId", item.getId().getVideoId());
                    video.put("title", item.getSnippet().getTitle());
                    video.put("channel", item.getSnippet().getChannelTitle());
                    String thumbnail = "";
                    if (item.getSnippet().getThumbnails() != null
                            && item.getSnippet().getThumbnails().getHigh() != null) {
                        thumbnail = item.getSnippet().getThumbnails().getHigh().getUrl();
                    }
                    video.put("thumbnail", thumbnail);
                    return video;
                }).collect(Collectors.toList());
            }

            return Collections.emptyList();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to fetch videos from YouTube: " + e.getMessage());
        }
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
