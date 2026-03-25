package com.gymroutine.backend.config;

import com.gymroutine.backend.model.Exercise;
import com.gymroutine.backend.model.Split;
import com.gymroutine.backend.model.WorkoutDay;
import com.gymroutine.backend.repository.SplitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

        private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

        private final SplitRepository splitRepository;

        public DataSeeder(SplitRepository splitRepository) {
                this.splitRepository = splitRepository;
        }

        @Override
        @Transactional
        public void run(ApplicationArguments args) {
                if (!splitRepository.findByIsTemplateTrue().isEmpty()) {
                        log.info("Templates already seeded. Skipping.");
                        return;
                }
                log.info("Seeding default split templates...");

                seedPPL();
                seedUpperLower();
                seedArnoldSplit();
                seedFullBody();
                seedBroSplit();
                seed531();

                log.info("Default templates seeded successfully.");
        }

        private void seedPPL() {
                Split split = createTemplate("PPL (Push Pull Legs)");
                List<WorkoutDay> days = new ArrayList<>();

                days.add(createDay(split, "Push Day A", 1, List.of(
                                ex("Barbell Bench Press", 4, 8, 80.0, 1),
                                ex("Overhead Press", 3, 10, 40.0, 2),
                                ex("Incline Dumbbell Press", 3, 10, 30.0, 3),
                                ex("Lateral Raises", 4, 15, 10.0, 4),
                                ex("Tricep Pushdowns", 3, 12, 20.0, 5),
                                ex("Overhead Tricep Extension", 3, 12, 15.0, 6))));
                days.add(createDay(split, "Pull Day A", 2, List.of(
                                ex("Barbell Rows", 4, 8, 70.0, 1),
                                ex("Pull-Ups", 3, 10, 0.0, 2),
                                ex("Seated Cable Row", 3, 12, 50.0, 3),
                                ex("Face Pulls", 3, 15, 15.0, 4),
                                ex("Barbell Curls", 3, 10, 30.0, 5),
                                ex("Hammer Curls", 3, 12, 14.0, 6))));
                days.add(createDay(split, "Legs Day A", 3, List.of(
                                ex("Barbell Squat", 4, 8, 100.0, 1),
                                ex("Romanian Deadlift", 3, 10, 80.0, 2),
                                ex("Leg Press", 3, 12, 150.0, 3),
                                ex("Leg Curls", 3, 12, 40.0, 4),
                                ex("Calf Raises", 4, 15, 60.0, 5))));
                days.add(createDay(split, "Push Day B", 4, List.of(
                                ex("Dumbbell Bench Press", 4, 10, 34.0, 1),
                                ex("Arnold Press", 3, 10, 20.0, 2),
                                ex("Cable Flyes", 3, 12, 15.0, 3),
                                ex("Front Raises", 3, 15, 10.0, 4),
                                ex("Skull Crushers", 3, 10, 25.0, 5),
                                ex("Dips", 3, 12, 0.0, 6))));
                days.add(createDay(split, "Pull Day B", 5, List.of(
                                ex("Deadlift", 4, 6, 120.0, 1),
                                ex("Lat Pulldown", 3, 10, 55.0, 2),
                                ex("Dumbbell Rows", 3, 10, 30.0, 3),
                                ex("Reverse Flyes", 3, 15, 8.0, 4),
                                ex("Preacher Curls", 3, 10, 20.0, 5),
                                ex("Incline Dumbbell Curls", 3, 12, 12.0, 6))));
                days.add(createDay(split, "Legs Day B", 6, List.of(
                                ex("Front Squat", 4, 8, 70.0, 1),
                                ex("Bulgarian Split Squats", 3, 10, 20.0, 2),
                                ex("Leg Extensions", 3, 12, 45.0, 3),
                                ex("Glute Ham Raise", 3, 10, 0.0, 4),
                                ex("Seated Calf Raises", 4, 15, 40.0, 5))));

                split.setWorkoutDays(days);
                splitRepository.save(split);
        }

        private void seedUpperLower() {
                Split split = createTemplate("Upper/Lower Split");
                List<WorkoutDay> days = new ArrayList<>();

                days.add(createDay(split, "Upper A — Strength", 1, List.of(
                                ex("Barbell Bench Press", 4, 6, 85.0, 1),
                                ex("Barbell Rows", 4, 6, 75.0, 2),
                                ex("Overhead Press", 3, 8, 45.0, 3),
                                ex("Pull-Ups", 3, 8, 0.0, 4),
                                ex("Barbell Curls", 3, 10, 30.0, 5),
                                ex("Skull Crushers", 3, 10, 25.0, 6))));
                days.add(createDay(split, "Lower A — Strength", 2, List.of(
                                ex("Barbell Squat", 4, 6, 110.0, 1),
                                ex("Romanian Deadlift", 4, 8, 90.0, 2),
                                ex("Leg Press", 3, 10, 160.0, 3),
                                ex("Leg Curls", 3, 12, 40.0, 4),
                                ex("Calf Raises", 4, 15, 60.0, 5))));
                days.add(createDay(split, "Upper B — Hypertrophy", 3, List.of(
                                ex("Dumbbell Bench Press", 3, 12, 30.0, 1),
                                ex("Seated Cable Row", 3, 12, 50.0, 2),
                                ex("Lateral Raises", 4, 15, 10.0, 3),
                                ex("Face Pulls", 3, 15, 15.0, 4),
                                ex("Hammer Curls", 3, 12, 14.0, 5),
                                ex("Tricep Pushdowns", 3, 12, 20.0, 6))));
                days.add(createDay(split, "Lower B — Hypertrophy", 4, List.of(
                                ex("Front Squat", 3, 10, 70.0, 1),
                                ex("Bulgarian Split Squats", 3, 12, 20.0, 2),
                                ex("Leg Extensions", 3, 15, 40.0, 3),
                                ex("Leg Curls", 3, 15, 35.0, 4),
                                ex("Hip Thrusts", 3, 12, 80.0, 5),
                                ex("Seated Calf Raises", 4, 15, 40.0, 6))));

                split.setWorkoutDays(days);
                splitRepository.save(split);
        }

        private void seedArnoldSplit() {
                Split split = createTemplate("Arnold Split");
                List<WorkoutDay> days = new ArrayList<>();

                days.add(createDay(split, "Chest & Back A", 1, List.of(
                                ex("Barbell Bench Press", 4, 8, 80.0, 1),
                                ex("Incline Dumbbell Press", 3, 10, 30.0, 2),
                                ex("Cable Flyes", 3, 12, 15.0, 3),
                                ex("Pull-Ups", 4, 10, 0.0, 4),
                                ex("Barbell Rows", 4, 8, 70.0, 5),
                                ex("T-Bar Row", 3, 10, 50.0, 6))));
                days.add(createDay(split, "Shoulders & Arms A", 2, List.of(
                                ex("Overhead Press", 4, 8, 45.0, 1),
                                ex("Lateral Raises", 4, 15, 10.0, 2),
                                ex("Rear Delt Flyes", 3, 15, 8.0, 3),
                                ex("Barbell Curls", 3, 10, 30.0, 4),
                                ex("Close Grip Bench Press", 3, 10, 50.0, 5),
                                ex("Concentration Curls", 3, 12, 12.0, 6))));
                days.add(createDay(split, "Legs A", 3, List.of(
                                ex("Barbell Squat", 5, 6, 110.0, 1),
                                ex("Leg Press", 3, 12, 160.0, 2),
                                ex("Leg Extensions", 3, 15, 45.0, 3),
                                ex("Leg Curls", 3, 12, 40.0, 4),
                                ex("Standing Calf Raises", 4, 15, 70.0, 5))));
                days.add(createDay(split, "Chest & Back B", 4, List.of(
                                ex("Dumbbell Bench Press", 4, 10, 34.0, 1),
                                ex("Decline Bench Press", 3, 10, 60.0, 2),
                                ex("Pec Deck", 3, 12, 40.0, 3),
                                ex("Lat Pulldown", 4, 10, 55.0, 4),
                                ex("Seated Cable Row", 3, 12, 50.0, 5),
                                ex("Dumbbell Rows", 3, 10, 30.0, 6))));
                days.add(createDay(split, "Shoulders & Arms B", 5, List.of(
                                ex("Arnold Press", 4, 10, 20.0, 1),
                                ex("Cable Lateral Raises", 3, 15, 8.0, 2),
                                ex("Face Pulls", 3, 15, 15.0, 3),
                                ex("Hammer Curls", 3, 12, 14.0, 4),
                                ex("Overhead Tricep Extension", 3, 12, 15.0, 5),
                                ex("Preacher Curls", 3, 10, 20.0, 6))));
                days.add(createDay(split, "Legs B", 6, List.of(
                                ex("Front Squat", 4, 8, 70.0, 1),
                                ex("Romanian Deadlift", 3, 10, 80.0, 2),
                                ex("Walking Lunges", 3, 12, 20.0, 3),
                                ex("Glute Ham Raise", 3, 10, 0.0, 4),
                                ex("Seated Calf Raises", 4, 15, 40.0, 5))));

                split.setWorkoutDays(days);
                splitRepository.save(split);
        }

        private void seedFullBody() {
                Split split = createTemplate("Full Body");
                List<WorkoutDay> days = new ArrayList<>();

                days.add(createDay(split, "Full Body A", 1, List.of(
                                ex("Barbell Squat", 4, 6, 100.0, 1),
                                ex("Barbell Bench Press", 4, 6, 80.0, 2),
                                ex("Barbell Rows", 4, 8, 70.0, 3),
                                ex("Overhead Press", 3, 10, 40.0, 4),
                                ex("Barbell Curls", 3, 10, 30.0, 5),
                                ex("Plank", 3, 0, 0.0, 6))));
                days.add(createDay(split, "Full Body B", 2, List.of(
                                ex("Deadlift", 4, 5, 130.0, 1),
                                ex("Incline Dumbbell Press", 3, 10, 30.0, 2),
                                ex("Pull-Ups", 3, 10, 0.0, 3),
                                ex("Bulgarian Split Squats", 3, 10, 20.0, 4),
                                ex("Lateral Raises", 3, 15, 10.0, 5),
                                ex("Cable Crunches", 3, 15, 25.0, 6))));
                days.add(createDay(split, "Full Body C", 3, List.of(
                                ex("Front Squat", 4, 8, 70.0, 1),
                                ex("Dumbbell Bench Press", 3, 10, 34.0, 2),
                                ex("Seated Cable Row", 3, 12, 50.0, 3),
                                ex("Romanian Deadlift", 3, 10, 80.0, 4),
                                ex("Face Pulls", 3, 15, 15.0, 5),
                                ex("Hanging Leg Raises", 3, 12, 0.0, 6))));

                split.setWorkoutDays(days);
                splitRepository.save(split);
        }

        private void seedBroSplit() {
                Split split = createTemplate("Bro Split");
                List<WorkoutDay> days = new ArrayList<>();

                days.add(createDay(split, "Chest Day", 1, List.of(
                                ex("Barbell Bench Press", 4, 8, 80.0, 1),
                                ex("Incline Dumbbell Press", 3, 10, 30.0, 2),
                                ex("Decline Bench Press", 3, 10, 60.0, 3),
                                ex("Cable Flyes", 3, 12, 15.0, 4),
                                ex("Dips", 3, 12, 0.0, 5))));
                days.add(createDay(split, "Back Day", 2, List.of(
                                ex("Deadlift", 4, 5, 130.0, 1),
                                ex("Pull-Ups", 4, 10, 0.0, 2),
                                ex("Barbell Rows", 4, 8, 70.0, 3),
                                ex("Lat Pulldown", 3, 10, 55.0, 4),
                                ex("Seated Cable Row", 3, 12, 50.0, 5))));
                days.add(createDay(split, "Shoulders Day", 3, List.of(
                                ex("Overhead Press", 4, 8, 45.0, 1),
                                ex("Lateral Raises", 4, 15, 10.0, 2),
                                ex("Front Raises", 3, 12, 10.0, 3),
                                ex("Rear Delt Flyes", 3, 15, 8.0, 4),
                                ex("Shrugs", 4, 12, 40.0, 5))));
                days.add(createDay(split, "Arms Day", 4, List.of(
                                ex("Barbell Curls", 4, 10, 30.0, 1),
                                ex("Close Grip Bench Press", 4, 10, 50.0, 2),
                                ex("Hammer Curls", 3, 12, 14.0, 3),
                                ex("Skull Crushers", 3, 10, 25.0, 4),
                                ex("Preacher Curls", 3, 10, 20.0, 5),
                                ex("Tricep Pushdowns", 3, 12, 20.0, 6))));
                days.add(createDay(split, "Legs Day", 5, List.of(
                                ex("Barbell Squat", 5, 6, 110.0, 1),
                                ex("Leg Press", 3, 12, 160.0, 2),
                                ex("Romanian Deadlift", 3, 10, 80.0, 3),
                                ex("Leg Extensions", 3, 15, 45.0, 4),
                                ex("Leg Curls", 3, 12, 40.0, 5),
                                ex("Standing Calf Raises", 4, 15, 70.0, 6))));

                split.setWorkoutDays(days);
                splitRepository.save(split);
        }

        private void seed531() {
                Split split = createTemplate("5/3/1 Powerlifting");
                List<WorkoutDay> days = new ArrayList<>();

                days.add(createDay(split, "Squat Day", 1, List.of(
                                ex("Barbell Squat (5/3/1)", 3, 5, 100.0, 1),
                                ex("Barbell Squat (BBB 5x10)", 5, 10, 60.0, 2),
                                ex("Leg Press", 3, 12, 120.0, 3),
                                ex("Leg Curls", 3, 12, 40.0, 4),
                                ex("Ab Wheel Rollout", 3, 15, 0.0, 5))));
                days.add(createDay(split, "Bench Day", 2, List.of(
                                ex("Barbell Bench Press (5/3/1)", 3, 5, 80.0, 1),
                                ex("Barbell Bench Press (BBB 5x10)", 5, 10, 50.0, 2),
                                ex("Dumbbell Rows", 5, 10, 30.0, 3),
                                ex("Dips", 3, 12, 0.0, 4),
                                ex("Face Pulls", 3, 15, 15.0, 5))));
                days.add(createDay(split, "Deadlift Day", 3, List.of(
                                ex("Deadlift (5/3/1)", 3, 5, 140.0, 1),
                                ex("Deadlift (BBB 5x10)", 5, 10, 85.0, 2),
                                ex("Good Mornings", 3, 10, 40.0, 3),
                                ex("Hanging Leg Raises", 3, 12, 0.0, 4))));
                days.add(createDay(split, "OHP Day", 4, List.of(
                                ex("Overhead Press (5/3/1)", 3, 5, 45.0, 1),
                                ex("Overhead Press (BBB 5x10)", 5, 10, 30.0, 2),
                                ex("Pull-Ups", 5, 10, 0.0, 3),
                                ex("Lateral Raises", 4, 15, 10.0, 4),
                                ex("Barbell Curls", 3, 10, 30.0, 5))));

                split.setWorkoutDays(days);
                splitRepository.save(split);
        }

        private Split createTemplate(String name) {
                return Split.builder()
                                .name(name)
                                .isDefault(true)
                                .isTemplate(true)
                                .user(null)
                                .workoutDays(new ArrayList<>())
                                .build();
        }

        private WorkoutDay createDay(Split split, String dayName, int order, List<Exercise> exercises) {
                WorkoutDay day = WorkoutDay.builder()
                                .split(split)
                                .dayName(dayName)
                                .dayOrder(order)
                                .exercises(new ArrayList<>())
                                .build();
                exercises.forEach(e -> {
                        e.setWorkoutDay(day);
                        day.getExercises().add(e);
                });
                return day;
        }

        private Exercise ex(String name, int sets, int reps, double weight, int order) {
                return Exercise.builder()
                                .name(name)
                                .sets(sets)
                                .reps(reps)
                                .weight(weight)
                                .orderIndex(order)
                                .isDone(false)
                                .build();
        }
}
