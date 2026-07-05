package com.gymroutine.backend.service;

import com.gymroutine.backend.model.DailyNote;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.DailyNoteRepository;
import com.gymroutine.backend.ai.agent.AiAgentOrchestrator;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoteService {
    private final DailyNoteRepository repo;
    private final AiAgentOrchestrator aiAgentOrchestrator;

    public NoteService(DailyNoteRepository repo, AiAgentOrchestrator aiAgentOrchestrator) {
        this.repo = repo;
        this.aiAgentOrchestrator = aiAgentOrchestrator;
    }

    public DailyNote saveNote(User user, DailyNote note) {
        note.setUser(user);
        if (note.getDate() == null) {
            note.setDate(java.time.LocalDate.now());
        }

        if (note.getEnergyLevel() == null) {
            note.setEnergyLevel(3);
        }

        // Real AI Insight Generation
        String text = note.getContent() != null ? note.getContent() : "";
        String generatedInsight = "Consistency is key. Great job logging your thoughts.";
        
        if (!text.trim().isEmpty()) {
            try {
                generatedInsight = aiAgentOrchestrator.generateNoteInsight(text);
                // Prefix with AI Insight to maintain UI style if needed, 
                // but the prompt says we shouldn't use if-else.
                // Let's just use the raw response.
            } catch (Exception e) {
                generatedInsight = "AI Insight unavailable at the moment. Keep up the good work!";
            }
        }

        note.setAiInsight(generatedInsight);

        return repo.save(note);
    }

    public List<DailyNote> getNotes(User user) {
        return repo.findAllByUserOrderByDateDesc(user);
    }
}
