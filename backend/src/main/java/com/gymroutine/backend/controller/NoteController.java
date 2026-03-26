package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.DailyNote;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService service;

    public NoteController(NoteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DailyNote>> getNotes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getNotes(user));
    }

    @PostMapping
    public ResponseEntity<DailyNote> saveNote(@AuthenticationPrincipal User user, @RequestBody DailyNote note) {
        return ResponseEntity.ok(service.saveNote(user, note));
    }
}
