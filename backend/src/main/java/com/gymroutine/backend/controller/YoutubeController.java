package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.YoutubeCache;
import com.gymroutine.backend.service.YoutubeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
