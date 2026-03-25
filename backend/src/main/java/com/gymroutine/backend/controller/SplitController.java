package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.Split;
import com.gymroutine.backend.service.SplitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/splits")
public class SplitController {

    private final SplitService splitService;

    public SplitController(SplitService splitService) {
        this.splitService = splitService;
    }

    @GetMapping
    public ResponseEntity<List<Split>> getUserSplits(Authentication authentication) {
        return ResponseEntity.ok(splitService.getUserSplits(authentication.getName()));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<Split>> getTemplates() {
        return ResponseEntity.ok(splitService.getTemplates());
    }

    @PostMapping
    public ResponseEntity<Split> createSplit(@RequestBody Split split, Authentication authentication) {
        return ResponseEntity.ok(splitService.createSplit(authentication.getName(), split));
    }

    @PostMapping("/load-template/{templateId}")
    public ResponseEntity<Split> loadTemplate(@PathVariable Long templateId, Authentication authentication) {
        return ResponseEntity.ok(splitService.loadTemplate(templateId, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Split> updateSplit(@PathVariable Long id, @RequestBody Split split,
            Authentication authentication) {
        return ResponseEntity.ok(splitService.updateSplit(id, split, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSplit(@PathVariable Long id, Authentication authentication) {
        splitService.deleteSplit(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
