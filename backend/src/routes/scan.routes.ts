import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { ScanController } from "../domains/scan/controllers/ScanController";

interface ScanRoutesOptions extends FastifyPluginOptions {
  scanController: ScanController;
}

export async function scanRoutes(
  fastify: FastifyInstance,
  opts: ScanRoutesOptions
): Promise<void> {
  const { scanController } = opts;

  fastify.post("/api/scan", {
    schema: {
      body: {
        type: "object",
        required: ["imageUrl"],
        properties: {
          imageUrl: { type: "string", format: "uri" },
          subjectId: { type: "string" },
          options: {
            type: "object",
            properties: {
              language: { type: "string", enum: ["en", "ne"] },
              enhance: { type: "boolean", default: true }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const body = request.body as { imageUrl: string; subjectId?: string; options?: object };
      const result = await scanController.createJob(body);
      return reply.status(202).send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create scan job";
      return reply.status(400).send({ success: false, error: { code: "CREATE_FAILED", message } });
    }
  });

  fastify.get("/api/scan/:id/result", {
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await scanController.getResult(id);
      return reply.send({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Scan result not found";
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message } });
    }
  });
}