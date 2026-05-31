import { BaseService } from "../../../core/base/BaseService";
import { randomUUID } from "node:crypto";
import type { Payment } from "../entities/Payment";

export class PaymentService extends BaseService {
  constructor() {
    super("PaymentService");
  }

  createPendingPayment(input: Omit<Payment, "id" | "status" | "createdAt" | "updatedAt">): Payment {
    const now = new Date();
    return {
      ...input,
      id: randomUUID(),
      status: "pending",
      createdAt: now,
      updatedAt: now
    };
  }
}
