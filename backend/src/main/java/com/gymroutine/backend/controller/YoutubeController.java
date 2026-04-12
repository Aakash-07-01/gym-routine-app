package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.YoutubeCache;
import com.gymroutine.backend.service.YoutubeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/youtube")
public class YoutubeController {

    private final YoutubeService youtubeService;

    public YoutubeController(YoutubeService youtubeService) {
        this.youtubeService = youtubeService;
    }

    @GetMapping
    public ResponseEntity<YoutubeCache> getVideo(@RequestParam String exercise) {
        return ResponseEntity.ok(youtubeService.getVideoForExercise(exercise));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, String>>> searchVideos(@RequestParam String q) {
        return ResponseEntity.ok(youtubeService.searchVideos(q));
    }
}
