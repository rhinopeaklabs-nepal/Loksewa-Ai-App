import { BaseController } from "../../../core/base/BaseController";

export class AnalyticsController extends BaseController {
  async getStats(query: { period?: string }) {
    return {
      period: query.period ?? "30d",
      questionsAnswered: 0,
      accuracy: 0,
      studyMinutes: 0,
      streakDays: 0
    };
  }

  async getWeaknesses() {
    return {
      items: [],
      message: "Weak areas are calculated from mock test answer history."
    };
  }

  async getRecommendations() {
    return {
      items: ["Practice verified MCQs", "Review flashcards", "Take one timed mock test"],
      generatedAt: new Date().toISOString()
    };
  }

  routes() {
    return {
      stats: "GET /api/analytics/stats",
      weaknesses: "GET /api/analytics/weaknesses",
      recommendations: "GET /api/analytics/recommendations"
    };
  }
}
