const createEx = (id, name, sets = 3, reps = "8-12") => ({
    id,
    name,
    sets,
    reps,
    weight: null,
    restSeconds: 90,
    notes: "",
    completed: false
});

export const defaultSplits = [
    {
        id: "ppl-6",
        name: "Push Pull Legs",
        isDefault: true,
        days: [
            {
                id: "ppl-day1",
                name: "Push Day A",
                exercises: [
                    createEx("ppl-d1-1", "Bench Press", 4, 8),
                    createEx("ppl-d1-2", "Overhead Press", 3, 10),
                    createEx("ppl-d1-3", "Incline DB Press", 3, 10),
                    createEx("ppl-d1-4", "Lateral Raises", 4, 15),
                    createEx("ppl-d1-5", "Tricep Pushdown", 3, 12),
                    createEx("ppl-d1-6", "Skull Crushers", 3, 12)
                ]
            },
            {
                id: "ppl-day2",
                name: "Pull Day A",
                exercises: [
                    createEx("ppl-d2-1", "Deadlift", 3, 5),
                    createEx("ppl-d2-2", "Barbell Row", 4, 8),
                    createEx("ppl-d2-3", "Lat Pulldown", 3, 10),
                    createEx("ppl-d2-4", "Face Pulls", 3, 15),
                    createEx("ppl-d2-5", "Barbell Curl", 3, 10),
                    createEx("ppl-d2-6", "Hammer Curl", 3, 12)
                ]
            },
            {
                id: "ppl-day3",
                name: "Leg Day A",
                exercises: [
                    createEx("ppl-d3-1", "Squat", 4, 8),
                    createEx("ppl-d3-2", "Leg Press", 3, 10),
                    createEx("ppl-d3-3", "Romanian Deadlift", 3, 10),
                    createEx("ppl-d3-4", "Leg Curl", 3, 15),
                    createEx("ppl-d3-5", "Calf Raises", 4, 15),
                    createEx("ppl-d3-6", "Leg Extension", 3, 15)
                ]
            },
            {
                id: "ppl-day4",
                name: "Push Day B",
                exercises: [
                    createEx("ppl-d4-1", "Incline Bench", 4, 8),
                    createEx("ppl-d4-2", "DB Shoulder Press", 3, 10),
                    createEx("ppl-d4-3", "Cable Fly", 3, 15),
                    createEx("ppl-d4-4", "Tricep Dips", 3, "AMRAP"),
                    createEx("ppl-d4-5", "Overhead Tricep Extension", 3, 12)
                ]
            },
            {
                id: "ppl-day5",
                name: "Pull Day B",
                exercises: [
                    createEx("ppl-d5-1", "Rack Pull", 4, 8),
                    createEx("ppl-d5-2", "Seated Cable Row", 3, 10),
                    createEx("ppl-d5-3", "Pull Ups", 3, "AMRAP"),
                    createEx("ppl-d5-4", "Reverse Fly", 3, 15),
                    createEx("ppl-d5-5", "Preacher Curl", 3, 10),
                    createEx("ppl-d5-6", "Cable Curl", 3, 12)
                ]
            },
            {
                id: "ppl-day6",
                name: "Leg Day B",
                exercises: [
                    createEx("ppl-d6-1", "Front Squat", 4, 8),
                    createEx("ppl-d6-2", "Hack Squat", 3, 10),
                    createEx("ppl-d6-3", "Walking Lunges", 3, 12),
                    createEx("ppl-d6-4", "Nordic Curl", 3, 10),
                    createEx("ppl-d6-5", "Standing Calf Raise", 4, 15),
                    createEx("ppl-d6-6", "Goblet Squat", 3, 15)
                ]
            }
        ]
    },
    {
        id: "ul-4",
        name: "Upper/Lower",
        isDefault: true,
        days: [
            {
                id: "ul-day1",
                name: "Upper A",
                exercises: [
                    createEx("ul-d1-1", "Bench Press", 4, 8),
                    createEx("ul-d1-2", "Barbell Row", 4, 8),
                    createEx("ul-d1-3", "Overhead Press", 3, 10),
                    createEx("ul-d1-4", "Pull Ups", 3, "AMRAP"),
                    createEx("ul-d1-5", "Lateral Raises", 3, 15),
                    createEx("ul-d1-6", "Bicep Curl", 3, 12),
                    createEx("ul-d1-7", "Tricep Pushdown", 3, 12)
                ]
            },
            {
                id: "ul-day2",
                name: "Lower A",
                exercises: [
                    createEx("ul-d2-1", "Squat", 4, 8),
                    createEx("ul-d2-2", "Romanian Deadlift", 3, 10),
                    createEx("ul-d2-3", "Leg Press", 3, 10),
                    createEx("ul-d2-4", "Leg Curl", 3, 12),
                    createEx("ul-d2-5", "Calf Raises", 4, 15)
                ]
            },
            {
                id: "ul-day3",
                name: "Upper B",
                exercises: [
                    createEx("ul-d3-1", "Incline DB Press", 4, 8),
                    createEx("ul-d3-2", "Seated Cable Row", 4, 8),
                    createEx("ul-d3-3", "DB Shoulder Press", 3, 10),
                    createEx("ul-d3-4", "Lat Pulldown", 3, 10),
                    createEx("ul-d3-5", "Face Pulls", 3, 15),
                    createEx("ul-d3-6", "Hammer Curl", 3, 12)
                ]
            },
            {
                id: "ul-day4",
                name: "Lower B",
                exercises: [
                    createEx("ul-d4-1", "Deadlift", 3, 5),
                    createEx("ul-d4-2", "Front Squat", 3, 10),
                    createEx("ul-d4-3", "Leg Extension", 3, 12),
                    createEx("ul-d4-4", "Walking Lunges", 3, 12),
                    createEx("ul-d4-5", "Standing Calf Raise", 4, 15)
                ]
            }
        ]
    },
    {
        id: "arnold-6",
        name: "Arnold Split",
        isDefault: true,
        days: [
            {
                id: "arn-day1",
                name: "Chest & Back A",
                exercises: [
                    createEx("arn-d1-1", "Bench Press", 4, 8),
                    createEx("arn-d1-2", "Incline Press", 3, 10),
                    createEx("arn-d1-3", "DB Fly", 3, 12),
                    createEx("arn-d1-4", "Barbell Row", 4, 8),
                    createEx("arn-d1-5", "Pull Ups", 3, "AMRAP"),
                    createEx("arn-d1-6", "Seated Cable Row", 3, 10)
                ]
            },
            {
                id: "arn-day2",
                name: "Shoulders & Arms A",
                exercises: [
                    createEx("arn-d2-1", "Overhead Press", 4, 8),
                    createEx("arn-d2-2", "Lateral Raises", 4, 12),
                    createEx("arn-d2-3", "Front Raises", 3, 12),
                    createEx("arn-d2-4", "Barbell Curl", 4, 8),
                    createEx("arn-d2-5", "Skull Crushers", 4, 8),
                    createEx("arn-d2-6", "Tricep Dip", 3, "AMRAP")
                ]
            },
            {
                id: "arn-day3",
                name: "Legs A",
                exercises: [
                    createEx("arn-d3-1", "Squat", 4, 8),
                    createEx("arn-d3-2", "Leg Press", 3, 10),
                    createEx("arn-d3-3", "Leg Curl", 3, 12),
                    createEx("arn-d3-4", "Leg Extension", 3, 12),
                    createEx("arn-d3-5", "Calf Raises", 4, 15)
                ]
            },
            {
                id: "arn-day4",
                name: "Chest & Back B",
                exercises: [
                    createEx("arn-d4-1", "Incline DB Press", 4, 8),
                    createEx("arn-d4-2", "Cable Crossover", 3, 12),
                    createEx("arn-d4-3", "Decline Press", 3, 10),
                    createEx("arn-d4-4", "Deadlift", 3, 5),
                    createEx("arn-d4-5", "T-Bar Row", 3, 10),
                    createEx("arn-d4-6", "Lat Pulldown", 3, 10)
                ]
            },
            {
                id: "arn-day5",
                name: "Shoulders & Arms B",
                exercises: [
                    createEx("arn-d5-1", "Arnold Press", 4, 8),
                    createEx("arn-d5-2", "Upright Row", 3, 10),
                    createEx("arn-d5-3", "Rear Delt Fly", 3, 12),
                    createEx("arn-d5-4", "Preacher Curl", 3, 10),
                    createEx("arn-d5-5", "Overhead Tricep Extension", 3, 10)
                ]
            },
            {
                id: "arn-day6",
                name: "Legs B",
                exercises: [
                    createEx("arn-d6-1", "Front Squat", 4, 8),
                    createEx("arn-d6-2", "Romanian Deadlift", 3, 10),
                    createEx("arn-d6-3", "Hack Squat", 3, 10),
                    createEx("arn-d6-4", "Nordic Curl", 3, 10),
                    createEx("arn-d6-5", "Donkey Calf Raise", 4, 15)
                ]
            }
        ]
    },
    {
        id: "bro-5",
        name: "Bro Split",
        isDefault: true,
        days: [
            {
                id: "bro-day1",
                name: "Chest",
                exercises: [
                    createEx("bro-d1-1", "Bench Press", 4, 8),
                    createEx("bro-d1-2", "Incline DB Press", 4, 10),
                    createEx("bro-d1-3", "Cable Fly", 4, 12),
                    createEx("bro-d1-4", "Decline Press", 3, 10),
                    createEx("bro-d1-5", "Push Ups", 3, "AMRAP"),
                    createEx("bro-d1-6", "Chest Dips", 3, "AMRAP")
                ]
            },
            {
                id: "bro-day2",
                name: "Back",
                exercises: [
                    createEx("bro-d2-1", "Deadlift", 3, 5),
                    createEx("bro-d2-2", "Pull Ups", 4, "AMRAP"),
                    createEx("bro-d2-3", "Barbell Row", 4, 8),
                    createEx("bro-d2-4", "Lat Pulldown", 4, 10),
                    createEx("bro-d2-5", "Seated Cable Row", 3, 12),
                    createEx("bro-d2-6", "Single Arm DB Row", 3, 12)
                ]
            },
            {
                id: "bro-day3",
                name: "Shoulders",
                exercises: [
                    createEx("bro-d3-1", "Overhead Press", 4, 8),
                    createEx("bro-d3-2", "Lateral Raises", 4, 15),
                    createEx("bro-d3-3", "Front Raises", 3, 12),
                    createEx("bro-d3-4", "Rear Delt Fly", 3, 15),
                    createEx("bro-d3-5", "Shrugs", 4, 12),
                    createEx("bro-d3-6", "Arnold Press", 3, 10)
                ]
            },
            {
                id: "bro-day4",
                name: "Arms",
                exercises: [
                    createEx("bro-d4-1", "Barbell Curl", 4, 10),
                    createEx("bro-d4-2", "Hammer Curl", 3, 12),
                    createEx("bro-d4-3", "Preacher Curl", 3, 12),
                    createEx("bro-d4-4", "Skull Crushers", 4, 10),
                    createEx("bro-d4-5", "Tricep Pushdown", 3, 15),
                    createEx("bro-d4-6", "Dips", 3, "AMRAP")
                ]
            },
            {
                id: "bro-day5",
                name: "Legs",
                exercises: [
                    createEx("bro-d5-1", "Squat", 4, 8),
                    createEx("bro-d5-2", "Leg Press", 4, 10),
                    createEx("bro-d5-3", "Romanian Deadlift", 3, 10),
                    createEx("bro-d5-4", "Leg Curl", 4, 12),
                    createEx("bro-d5-5", "Leg Extension", 4, 12),
                    createEx("bro-d5-6", "Calf Raises", 5, 20)
                ]
            }
        ]
    },
    {
        id: "full-3",
        name: "Full Body",
        isDefault: true,
        days: [
            {
                id: "fb-day1",
                name: "Day A",
                exercises: [
                    createEx("fb-d1-1", "Squat", 3, 5),
                    createEx("fb-d1-2", "Bench Press", 3, 5),
                    createEx("fb-d1-3", "Barbell Row", 3, 8),
                    createEx("fb-d1-4", "Overhead Press", 3, 8),
                    createEx("fb-d1-5", "Deadlift", 1, 5),
                    createEx("fb-d1-6", "Plank", 3, "60s")
                ]
            },
            {
                id: "fb-day2",
                name: "Day B",
                exercises: [
                    createEx("fb-d2-1", "Front Squat", 3, 8),
                    createEx("fb-d2-2", "Incline Press", 3, 8),
                    createEx("fb-d2-3", "Pull Ups", 3, "AMRAP"),
                    createEx("fb-d2-4", "DB Shoulder Press", 3, 10),
                    createEx("fb-d2-5", "Romanian Deadlift", 3, 10),
                    createEx("fb-d2-6", "Ab Wheel", 3, 12)
                ]
            },
            {
                id: "fb-day3",
                name: "Day C",
                exercises: [
                    createEx("fb-d3-1", "Hack Squat", 3, 10),
                    createEx("fb-d3-2", "Dips", 3, "AMRAP"),
                    createEx("fb-d3-3", "Seated Cable Row", 3, 10),
                    createEx("fb-d3-4", "Lateral Raises", 3, 15),
                    createEx("fb-d3-5", "Leg Curl", 3, 12),
                    createEx("fb-d3-6", "Hanging Leg Raise", 3, 15)
                ]
            }
        ]
    },
    {
        id: "531-4",
        name: "5/3/1 Powerlifting",
        isDefault: true,
        days: [
            {
                id: "531-day1",
                name: "Press Day",
                exercises: [
                    createEx("531-d1-1", "Overhead Press (5/3/1 sets)", 3, "5/3/1"),
                    createEx("531-d1-2", "DB Overhead Press", 5, 10),
                    createEx("531-d1-3", "Lateral Raises", 3, 15),
                    createEx("531-d1-4", "Tricep Work", 3, 15),
                    createEx("531-d1-5", "Face Pulls", 3, 20)
                ]
            },
            {
                id: "531-day2",
                name: "Deadlift Day",
                exercises: [
                    createEx("531-d2-1", "Deadlift (5/3/1 sets)", 3, "5/3/1"),
                    createEx("531-d2-2", "Romanian Deadlift", 5, 10),
                    createEx("531-d2-3", "Leg Press", 3, 12),
                    createEx("531-d2-4", "Hanging Leg Raise", 3, 15)
                ]
            },
            {
                id: "531-day3",
                name: "Bench Day",
                exercises: [
                    createEx("531-d3-1", "Bench Press (5/3/1 sets)", 3, "5/3/1"),
                    createEx("531-d3-2", "Incline DB Press", 5, 10),
                    createEx("531-d3-3", "DB Row", 5, 10),
                    createEx("531-d3-4", "Bicep Curl", 3, 12),
                    createEx("531-d3-5", "Tricep Pushdown", 3, 12)
                ]
            },
            {
                id: "531-day4",
                name: "Squat Day",
                exercises: [
                    createEx("531-d4-1", "Squat (5/3/1 sets)", 3, "5/3/1"),
                    createEx("531-d4-2", "Front Squat", 5, 10),
                    createEx("531-d4-3", "Leg Curl", 3, 12),
                    createEx("531-d4-4", "Calf Raises", 3, 15),
                    createEx("531-d4-5", "Ab Work", 3, 15)
                ]
            }
        ]
    }
];
