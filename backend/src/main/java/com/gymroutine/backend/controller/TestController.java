package com.gymroutine.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;

@RestController
@RequestMapping("/api/public")
public class TestController {

    private final com.gymroutine.backend.ai.provider.StaticInsightProvider provider;

    public TestController(org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder) {
        this.provider = new com.gymroutine.backend.ai.provider.StaticInsightProvider(webClientBuilder);
    }

    @GetMapping(value = "/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> testSse() {
        return provider.stream("You are an AI", "Hello world this is a test")
                .map(token -> ServerSentEvent.<String>builder().data(token).build());
    }
}
