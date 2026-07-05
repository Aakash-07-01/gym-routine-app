export type StrengthLevel = 'unranked' | 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite';

export interface ExerciseStandard {
  exerciseName: string;
  muscleIds: string[];
  // Multipliers of bodyweight for a male
  maleMultipliers: {
    beginner: number;
    novice: number;
    intermediate: number;
    advanced: number;
    elite: number;
  };
  // Multipliers of bodyweight for a female
  femaleMultipliers: {
    beginner: number;
    novice: number;
    intermediate: number;
    advanced: number;
    elite: number;
  };
  // Whether the bodyweight itself is added to the 1RM (e.g., Pull-Ups, Dips)
  isBodyweightIncluded?: boolean;
}

// Based loosely on generic strength standards (e.g., symmetricstrength, strengthlevel)
export const STRENGTH_STANDARDS: ExerciseStandard[] = [
  {
    exerciseName: "Barbell Bench Press",
    muscleIds: ["chest", "mid-lower-pectoralis", "upper-pectoralis"],
    maleMultipliers: { beginner: 0.5, novice: 0.8, intermediate: 1.1, advanced: 1.4, elite: 1.8 },
    femaleMultipliers: { beginner: 0.3, novice: 0.5, intermediate: 0.7, advanced: 0.9, elite: 1.2 }
  },
  {
    exerciseName: "Barbell Squat",
    muscleIds: ["quads", "outer-quadricep", "rectus-femoris", "inner-quadricep", "gluteus-maximus"],
    maleMultipliers: { beginner: 0.8, novice: 1.1, intermediate: 1.5, advanced: 1.9, elite: 2.4 },
    femaleMultipliers: { beginner: 0.5, novice: 0.8, intermediate: 1.1, advanced: 1.4, elite: 1.8 }
  },
  {
    exerciseName: "Deadlift",
    muscleIds: ["hamstrings", "lowerback", "glutes", "medial-hamstrings", "lateral-hamstrings"],
    maleMultipliers: { beginner: 1.0, novice: 1.3, intermediate: 1.7, advanced: 2.2, elite: 2.7 },
    femaleMultipliers: { beginner: 0.6, novice: 1.0, intermediate: 1.3, advanced: 1.7, elite: 2.1 }
  },
  {
    exerciseName: "Overhead Press",
    muscleIds: ["shoulders", "anterior-deltoid", "lateral-deltoid"],
    maleMultipliers: { beginner: 0.35, novice: 0.55, intermediate: 0.75, advanced: 0.95, elite: 1.25 },
    femaleMultipliers: { beginner: 0.2, novice: 0.35, intermediate: 0.5, advanced: 0.65, elite: 0.85 }
  },
  {
    exerciseName: "Pull-Ups",
    muscleIds: ["lats", "upper-back", "traps-middle", "lower-trapezius"],
    maleMultipliers: { beginner: 1.0, novice: 1.15, intermediate: 1.35, advanced: 1.6, elite: 1.85 },
    femaleMultipliers: { beginner: 1.0, novice: 1.05, intermediate: 1.15, advanced: 1.3, elite: 1.5 },
    isBodyweightIncluded: true
  },
  {
    exerciseName: "Barbell Curls",
    muscleIds: ["biceps", "long-head-bicep", "short-head-bicep"],
    maleMultipliers: { beginner: 0.2, novice: 0.3, intermediate: 0.45, advanced: 0.6, elite: 0.8 },
    femaleMultipliers: { beginner: 0.1, novice: 0.2, intermediate: 0.3, advanced: 0.4, elite: 0.55 }
  },
  {
    exerciseName: "Tricep Pushdowns",
    muscleIds: ["triceps", "long-head-triceps", "lateral-head-triceps", "medial-head-triceps"],
    maleMultipliers: { beginner: 0.2, novice: 0.35, intermediate: 0.5, advanced: 0.7, elite: 0.9 },
    femaleMultipliers: { beginner: 0.1, novice: 0.2, intermediate: 0.35, advanced: 0.5, elite: 0.7 }
  },
  {
    exerciseName: "Cable Crunches",
    muscleIds: ["abdominals", "obliques"],
    maleMultipliers: { beginner: 0.3, novice: 0.5, intermediate: 0.7, advanced: 1.0, elite: 1.3 },
    femaleMultipliers: { beginner: 0.2, novice: 0.35, intermediate: 0.5, advanced: 0.7, elite: 0.9 }
  },
  {
    exerciseName: "Calf Raises",
    muscleIds: ["calves", "gastrocnemius", "soleus"],
    maleMultipliers: { beginner: 0.4, novice: 0.6, intermediate: 0.8, advanced: 1.1, elite: 1.4 },
    femaleMultipliers: { beginner: 0.25, novice: 0.4, intermediate: 0.6, advanced: 0.8, elite: 1.1 }
  }
];

export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  // Epley formula
  return weight * (1 + reps / 30);
}

export function getStrengthLevel(
  oneRepMax: number, 
  bodyweight: number, 
  gender: string, 
  exercise: ExerciseStandard
): StrengthLevel {
  const isMale = gender?.toLowerCase() !== 'female'; // Default to male standards if undefined
  const mults = isMale ? exercise.maleMultipliers : exercise.femaleMultipliers;
  
  const weightRatio = oneRepMax / bodyweight;

  if (weightRatio >= mults.elite) return 'elite';
  if (weightRatio >= mults.advanced) return 'advanced';
  if (weightRatio >= mults.intermediate) return 'intermediate';
  if (weightRatio >= mults.novice) return 'novice';
  if (weightRatio >= mults.beginner) return 'beginner';
  
  return 'unranked';
}

export const STRENGTH_LEVEL_COLORS: Record<StrengthLevel, string> = {
  unranked: '#64748b',   // Gray
  beginner: '#38bdf8',   // Light Blue
  novice: '#4ade80',     // Green
  intermediate: '#eab308', // Yellow
  advanced: '#f97316',   // Orange
  elite: '#ef4444',      // Red
};
