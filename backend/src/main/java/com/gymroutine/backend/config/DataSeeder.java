package com.gymroutine.backend.config;

import com.gymroutine.backend.model.Exercise;
import com.gymroutine.backend.model.Split;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.model.WorkoutDay;
import com.gymroutine.backend.repository.SplitRepository;
import com.gymroutine.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

        private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

        private final SplitRepository splitRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        private final com.gymroutine.backend.repository.WorkoutLogRepository logRepository;
        private final com.gymroutine.backend.repository.PRRepository prRepository;
        private final com.gymroutine.backend.repository.ExerciseSessionRepository sessionRepository;

        @PersistenceContext
        private EntityManager entityManager;

        public DataSeeder(SplitRepository splitRepository, UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        com.gymroutine.backend.repository.WorkoutLogRepository logRepository,
                        com.gymroutine.backend.repository.PRRepository prRepository,
                        com.gymroutine.backend.repository.ExerciseSessionRepository sessionRepository) {
                this.splitRepository = splitRepository;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.logRepository = logRepository;
                this.prRepository = prRepository;
                this.sessionRepository = sessionRepository;
        }

        @Override
        @Transactional
        public void run(ApplicationArguments args) {
                seedAdmin();

                if (splitRepository.findByIsTemplateTrue().isEmpty()) {
                        log.info("Seeding default split templates...");
                        seedPPL();
                        seedUpperLower();
                        seedArnoldSplit();
                        seedFullBody();
                        seedBroSplit();
                        seed531();
                        log.info("Default templates seeded successfully.");
                } else {
                        log.info("Templates already seeded. Skipping.");
                }

                seedAdminMockData();
        }

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seedAdmin() {
                if (userRepository.findByUsernameIgnoreCase("admin").isEmpty()) {
                        log.info("Seeding default admin user...");
                        User admin = User.builder()
                                        .username("admin")
                                        .fullName("System Administrator")
                                        .email("admin@gymjam.app")
                                        .password(passwordEncoder.encode("AK45ak45"))
                                        .role("ROLE_ADMIN")
                                        .build();
                        userRepository.save(admin);
                }
        }

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seedAdminMockData() {
                User admin = userRepository.findByUsernameIgnoreCase("admin").orElse(null);
                if (admin == null)
                        return;

                if (!logRepository.findByUserIdAndCompletedAtAfter(admin.getId(),
                                java.time.LocalDateTime.now().minusYears(1)).isEmpty()) {
                        return;
                }

                log.info("Seeding structured test data for admin...");
                java.time.LocalDateTime now = java.time.LocalDateTime.now();

                // 90 days of progressive overload
                String[] pushExercises = {"Barbell Bench Press", "Overhead Press", "Incline Dumbbell Press", "Tricep Pushdowns"};
                String[] pullExercises = {"Deadlift", "Barbell Rows", "Pull-Ups", "Barbell Curls"};
                String[] legExercises = {"Barbell Squat", "Leg Press", "Leg Curls", "Calf Raises"};

                String[] dayNames = { "Push Day", "Pull Day", "Leg Day", "Rest", "Push Day", "Pull Day", "Rest" };

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

                // Cache PR map to avoid N+1 queries inside the loop
                java.util.Map<String, com.gymroutine.backend.model.PR> prCache = new java.util.HashMap<>();
                prRepository.findAllByUser(admin).forEach(p -> prCache.put(p.getExerciseName().toLowerCase(), p));

                // Fetch matchDay once outside the loop
                java.util.List<com.gymroutine.backend.model.Split> splits = splitRepository.findAll();
                if (splits.isEmpty() || splits.get(0).getWorkoutDays() == null || splits.get(0).getWorkoutDays().isEmpty()) {
                        log.warn("No splits with workout days found — skipping admin mock data seeding.");
                        return;
                }
                com.gymroutine.backend.model.WorkoutDay matchDay = splits.get(0).getWorkoutDays().get(0);

                int batchSize = 10;
                int count = 0;

                for (int i = 90; i >= 0; i--) {
                        String dName = dayNames[(90 - i) % 7];
                        if (dName.equals("Rest")) continue;

                        com.gymroutine.backend.model.WorkoutLog wl = new com.gymroutine.backend.model.WorkoutLog();
                        wl.setUser(admin);
                        wl.setCompletedAt(now.minusDays(i));
                        wl.setDayName(dName);
                        wl.setWorkoutDay(matchDay);
                        wl = logRepository.save(wl);

                        String[] exercises = dName.equals("Push Day") ? pushExercises :
                                           dName.equals("Pull Day") ? pullExercises : legExercises;

                        double progressionFactor = 1.0 + ((90 - i) * 0.005);

                        for (int j = 0; j < exercises.length; j++) {
                                com.gymroutine.backend.model.ExerciseSession session = new com.gymroutine.backend.model.ExerciseSession();
                                session.setUser(admin);
                                session.setWorkoutLog(wl);
                                session.setExerciseName(exercises[j]);
                                session.setCompletedAt(now.minusDays(i));

                                double baseWeight = j == 0 ? 60.0 : j == 1 ? 40.0 : 20.0;
                                double weight = Math.round((baseWeight * progressionFactor) * 2) / 2.0;

                                session.setSetsCompleted(4);
                                session.setRepsPerSet(8);
                                session.setWeightUsed(weight);

                                List<java.util.Map<String, Object>> setsList = new ArrayList<>();
                                for (int s = 0; s < 4; s++) {
                                        java.util.Map<String, Object> set = new java.util.HashMap<>();
                                        set.put("reps", 8);
                                        set.put("weight", weight);
                                        setsList.add(set);
                                }
                                try {
                                        session.setSetsData(mapper.writeValueAsString(setsList));
                                } catch (Exception e) {}

                                sessionRepository.save(session);

                                // Update PR using cache to avoid repeated DB queries
                                String key = exercises[j].toLowerCase();
                                com.gymroutine.backend.model.PR pr = prCache.get(key);

                                if (pr == null) {
                                        pr = new com.gymroutine.backend.model.PR();
                                        pr.setUser(admin);
                                        pr.setExerciseName(exercises[j]);
                                        pr.setMaxWeight(weight);
                                        pr.setMaxRepsAtWeight(8);
                                        pr.setDateAchieved(now.minusDays(i));
                                        prRepository.save(pr);
                                        prCache.put(key, pr);
                                } else if (weight >= pr.getMaxWeight()) {
                                        pr.setMaxWeight(weight);
                                        pr.setMaxRepsAtWeight(8);
                                        pr.setDateAchieved(now.minusDays(i));
                                        prRepository.save(pr);
                                }
                        }

                        // Flush and clear the persistence context every batchSize days
                        // to prevent the L1 cache from accumulating all entities in memory
                        count++;
                        if (count % batchSize == 0) {
                                entityManager.flush();
                                entityManager.clear();
                                // Re-attach admin and matchDay after clear
                                admin = entityManager.merge(admin);
                                matchDay = entityManager.merge(matchDay);
                        }
                }
                log.info("Finished seeding structured test data for admin.");
        }

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seedPPL() {
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

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seedUpperLower() {
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

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seedArnoldSplit() {
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

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seedFullBody() {
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

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seedBroSplit() {
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

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void seed531() {
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
