package com.gymroutine.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymroutine.backend.model.YoutubeCache;
import com.gymroutine.backend.repository.YoutubeCacheRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.web.reactive.function.client.ExchangeStrategies;

@Service
public class YoutubeService {

    private final YoutubeCacheRepository cacheRepository;
    private final WebClient youtubeWebClient;
    private final ObjectMapper objectMapper;

    @Value("${youtube.api.key:}")
    private String apiKey;

    public YoutubeService(YoutubeCacheRepository cacheRepository, WebClient youtubeWebClient,
            ObjectMapper objectMapper) {
        this.cacheRepository = cacheRepository;
        this.youtubeWebClient = youtubeWebClient;
        this.objectMapper = objectMapper;
    }

    private List<Map<String, String>> fallbackScrapeYoutubeVideos(String query) {
        try {
            String url = "https://www.youtube.com/results?search_query="
                    + URLEncoder.encode(query + " tutorial", StandardCharsets.UTF_8);

            ExchangeStrategies strategies = ExchangeStrategies.builder()
                    .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                    .build();
            WebClient scraperClient = WebClient.builder().exchangeStrategies(strategies).build();

            String html = scraperClient.get().uri(url)
                    .header("User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .retrieve().bodyToMono(String.class).block();

            String marker = "var ytInitialData = ";
            int start = html.indexOf(marker);
            if (start == -1)
                return Collections.emptyList();
            start += marker.length();
            int end = html.indexOf(";</script>", start);
            if (end == -1)
                return Collections.emptyList();

            String jsonStr = html.substring(start, end);
            JsonNode root = objectMapper.readTree(jsonStr);

            JsonNode contentsNode = root.path("contents")
                    .path("twoColumnSearchResultsRenderer")
                    .path("primaryContents")
                    .path("sectionListRenderer")
                    .path("contents");

            if (contentsNode.isArray() && !contentsNode.isEmpty()) {
                JsonNode itemSection = contentsNode.get(0).path("itemSectionRenderer").path("contents");
                List<Map<String, String>> results = new ArrayList<>();
                if (itemSection.isArray()) {
                    for (JsonNode item : itemSection) {
                        JsonNode videoRenderer = item.path("videoRenderer");
                        if (!videoRenderer.isMissingNode()) {
                            Map<String, String> video = new LinkedHashMap<>();
                            video.put("videoId", videoRenderer.path("videoId").asText());

                            JsonNode titleRuns = videoRenderer.path("title").path("runs");
                            if (titleRuns.isArray() && !titleRuns.isEmpty()) {
                                video.put("title", titleRuns.get(0).path("text").asText());
                            } else {
                                video.put("title", "Tutorial");
                            }

                            JsonNode ownerRuns = videoRenderer.path("ownerText").path("runs");
                            if (ownerRuns.isArray() && !ownerRuns.isEmpty()) {
                                video.put("channel", ownerRuns.get(0).path("text").asText());
                            } else {
                                video.put("channel", "YouTube Channel");
                            }

                            JsonNode thumbnails = videoRenderer.path("thumbnail").path("thumbnails");
                            if (thumbnails.isArray() && !thumbnails.isEmpty()) {
                                video.put("thumbnail", thumbnails.get(thumbnails.size() - 1).path("url").asText());
                            } else {
                                video.put("thumbnail", "");
                            }
                            results.add(video);
                            if (results.size() >= 5)
                                break;
                        }
                    }
                }
                return results;
            }
        } catch (Exception e) {
            System.err.println("Scraper fallback failed: " + e.getMessage());
        }
        return Collections.emptyList();
    }

    /**
     * Search YouTube for exercise tutorial videos, returning up to 5 results.
     */
    public List<Map<String, String>> searchVideos(String query) {
        if (apiKey == null || apiKey.isBlank()) {
            List<Map<String, String>> scraped = fallbackScrapeYoutubeVideos(query);
            if (!scraped.isEmpty())
                return scraped;

            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "YouTube API key is not configured and fallback scraper failed.");
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

            if (response != null && response.getItems() != null && !response.getItems().isEmpty()) {
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
        } catch (Exception e) {
            System.err.println("YouTube API fetch failed, trying scraper: " + e.getMessage());
            List<Map<String, String>> scraped = fallbackScrapeYoutubeVideos(query);
            if (!scraped.isEmpty())
                return scraped;

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

        List<Map<String, String>> videos = searchVideos(exerciseName);

        if (!videos.isEmpty()) {
            Map<String, String> firstVideo = videos.get(0);
            YoutubeCache newCache = YoutubeCache.builder()
                    .exerciseName(exerciseName.toLowerCase())
                    .videoId(firstVideo.get("videoId"))
                    .videoTitle(firstVideo.get("title"))
                    .build();
            return cacheRepository.save(newCache);
        }

        throw new RuntimeException("No video found for exercise: " + exerciseName);
    }
}
