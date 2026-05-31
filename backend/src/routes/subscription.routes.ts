import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { SubscriptionController } from "../domains/subscription/controllers/SubscriptionController";

interface SubscriptionRoutesOptions extends FastifyPluginOptions {
  subscriptionController: SubscriptionController;
}

export async function subscriptionRoutes(
  fastify: FastifyInstance,
  opts: SubscriptionRoutesOptions
): Promise<void> {
  const { subscriptionController } = opts;

  fastify.get("/api/subscription/plans", async (_request, reply) => {
    try {
      const result = await subscriptionController.getPlans();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get plans";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.get("/api/subscription/current", async (_request, reply) => {
    try {
      const result = await subscriptionController.getCurrent();
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get subscription";
      return reply.status(500).send({ success: false, error: { code: "FETCH_FAILED", message } });
    }
  });

  fastify.post("/api/subscription/checkout", {
    schema: {
      body: {
        type: "object",
        required: ["planId"],
        properties: {
          planId: { type: "string" },
          successUrl: { type: "string", format: "uri" },
          cancelUrl: { type: "string", format: "uri" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const body = request.body as {
        planId: string;
        successUrl?: string;
        cancelUrl?: string;
      };
      const result = await subscriptionController.checkout(body);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      return reply.status(400).send({ success: false, error: { code: "CHECKOUT_FAILED", message } });
    }
  });
}