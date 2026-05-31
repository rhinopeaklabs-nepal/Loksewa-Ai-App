import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

export class DataSource {
  readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ["warn", "error"]
    });
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
    logger.info("Prisma connected");
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info("Prisma disconnected");
  }
}

export const dataSource = new DataSource();
