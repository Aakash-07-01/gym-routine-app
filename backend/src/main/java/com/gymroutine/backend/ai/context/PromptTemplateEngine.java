package com.gymroutine.backend.ai.context;

import com.gymroutine.backend.ai.agent.AiAgentContext;
import org.springframework.stereotype.Component;

@Component
public class PromptTemplateEngine {

    public String weeklyInsightSystem() {
        return "You are an elite AI personal trainer. Analyze the user's weekly training data. " +
               "Provide a 3-4 sentence summary. Highlight specific numbers. End with exactly 1 actionable piece of advice for next week. " +
               "If the user has 0 sessions (e.g. a new account), welcome them enthusiastically and encourage them to log their first workout. " +
               "Keep the total response under 120 words. Be encouraging but professional. DO NOT ask the user any questions in your response.";
    }

    public String weeklyInsightUser(AiAgentContext context) {
        return "Analyze this week's training data:\n\n" + context.getContextText();
    }

    public String workoutNarrativeSystem() {
        return "You are a supportive fitness coach. Summarize the completed workout in 2-3 sentences. " +
               "Keep it under 80 words. Highlight any PRs or significant volume. Compare to previous if available.";
    }

    public String workoutNarrativeUser(AiAgentContext context) {
        return "Summarize this completed workout:\n\n" + context.getContextText();
    }

    public String alternativesSystem() {
        return "You are an expert biomechanics coach. Suggest exactly 3 alternative exercises for the requested exercise. " +
               "Format as a numbered list: '1. Name\\n2. Name\\n3. Name'. Do not include explanations, intro, or outro text.";
    }

    public String alternativesUser(String exerciseName) {
        return "Suggest 3 alternative exercises for: " + exerciseName;
    }

    public String aiCoachSystem(AiAgentContext context) {
        return "You are an interactive AI fitness coach. Answer the user's question briefly and conversationally (under 150 words). " +
               "Use the provided context about the user's recent workouts and PRs to personalize your response if relevant.\n\n" +
               "User Context:\n" + context.getContextText();
    }

    public String estimateNutritionSystem() {
        return "You are an expert nutritionist AI. Estimate the macronutrients for the meal provided by the user. " +
               "CRITICAL INSTRUCTION: You MUST assume all weights for meats (chicken, beef, etc.) and grains (rice, pasta, oats) are for COOKED food, unless the user explicitly writes 'raw' or 'uncooked'. " +
               "For example, '250g of rice' means 250g of COOKED rice (which is only ~325 kcal and ~70g carbs), NOT raw rice (which would be ~900 kcal). " +
               "Failure to use cooked nutritional values will result in highly inaccurate estimates. " +
               "Respond ONLY with a valid, raw JSON object containing these exact keys: 'calories', 'proteinGram', 'carbsGram', 'fatGram', with integer values. " +
               "Do not wrap the JSON in markdown code blocks or add any other text. Example: {\"calories\": 500, \"proteinGram\": 30, \"carbsGram\": 40, \"fatGram\": 15}";
    }

    public String estimateNutritionUser(String mealName) {
        return "Estimate nutrition for: " + mealName;
    }
}
