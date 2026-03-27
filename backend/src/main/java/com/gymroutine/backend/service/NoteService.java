package com.gymroutine.backend.service;

import com.gymroutine.backend.model.DailyNote;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.DailyNoteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoteService {
    private final DailyNoteRepository repo;

    public NoteService(DailyNoteRepository repo) {
        this.repo = repo;
    }

    public DailyNote saveNote(User user, DailyNote note) {
        note.setUser(user);
        if (note.getDate() == null) {
            note.setDate(java.time.LocalDate.now());
        }

        // Mock AI Insight Generation
        String text = note.getContent().toLowerCase();
        String generatedInsight = "Consistency is key. Great job logging your thoughts.";

        if (text.contains("tired") || text.contains("exhausted") || text.contains("fatigue")
                || note.getEnergyLevel() <= 2) {
            generatedInsight = "AI Insight: High fatigue detected. Consider taking a rest day or prioritizing hydration and deep sleep tonight.";
        } else if (text.contains("strong") || text.contains("pr") || text.contains("easy")
                || note.getEnergyLevel() >= 4) {
            generatedInsight = "AI Insight: You are peaking! Your energy is high. Tomorrow is a great day to attempt a new Personal Record.";
        } else if (text.contains("sore") || text.contains("pain") || text.contains("hurt")) {
            generatedInsight = "AI Insight: Muscle soreness detected. Ensure you are hitting your protein targets and consider light active recovery (e.g., walking) instead of heavy lifting.";
        } else if (text.contains("hungry") || text.contains("starving")) {
            generatedInsight = "AI Insight: Appetite signals indicate potential caloric deficit. Check if this aligns with your goal: "
                    + user.getPrimaryGoal() + ".";
        }

        note.setAiInsight(generatedInsight);

        return repo.save(note);
    }

    public List<DailyNote> getNotes(User user) {
        return repo.findAllByUserOrderByDateDesc(user);
    }
}
