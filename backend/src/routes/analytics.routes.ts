import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { AnalyticsController } from "../domains/analytics/controllers/AnalyticsController";

interface AnalyticsRoutesOptions extends FastifyPluginOptions {
  analyticsController: AnalyticsController;
}

export async function analyticsRoutes(
  fastify: FastifyInstance,
  opts: AnalyticsRoutesOptions
): Promise<void> {
  const { analyticsController } = opts;

  fastify.get("/api/analytics/stats", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["7d", "30d", "90d", "1y"],
            default: "30d"
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as { period?: string };
      const result = await analyticsController.getStats(query);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get stats";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/analytics/weaknesses", async (_request, reply) => {
    try {
      const result = await analyticsController.getWeaknesses();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get weaknesses";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/analytics/recommendations", async (_request, reply) => {
    try {
      const result = await analyticsController.getRecommendations();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get recommendations";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });
}