package com.gymroutine.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient youtubeWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl("https://www.googleapis.com/youtube/v3")
                .build();
    }
}
