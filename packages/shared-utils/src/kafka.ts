// Kafka producer and consumer
import { Kafka, type Producer, type Consumer, type EachMessagePayload, logLevel } from "kafkajs";
import { getConfig } from "./config.js";
import { logger } from "./logger.js";
import type { BaseEvent, LoksewaEvent } from "@loksewa/shared-types";

let kafka: Kafka | null = null;
let producer: Producer | null = null;

function getKafka(): Kafka {
  if (kafka) return kafka;
  const config = getConfig();

  kafka = new Kafka({
    clientId: config.KAFKA_CLIENT_ID || config.SERVICE_NAME,
    brokers: config.KAFKA_BROKERS.split(","),
    logLevel: logLevel.WARN,
    retry: { initialRetryTime: 300, retries: 5 },
  });

  return kafka;
}

export async function getProducer(): Promise<Producer> {
  if (producer) return producer;
  const p = getKafka().producer({
    allowAutoTopicCreation: true,
    idempotent: true,
    maxInFlightRequests: 5,
  });
  await p.connect();
  producer = p;
  return p;
}

export async function publishEvent<T extends LoksewaEvent>(
  topic: string,
  event: T
): Promise<void> {
  try {
    const p = await getProducer();
    await p.send({
      topic,
      messages: [
        {
          key: event.user_id || event.event_id,
          value: JSON.stringify(event),
          headers: {
            event_type: event.event_type,
            event_version: String(event.event_version),
            occurred_at: event.occurred_at,
          },
        },
      ],
    });
    logger.debug({ topic, event_type: event.event_type, event_id: event.event_id }, "Event published");
  } catch (err) {
    logger.error({ err, topic, event_type: event.event_type }, "Failed to publish event");
    throw err;
  }
}

export function createConsumer(groupId: string): Consumer {
  return getKafka().consumer({
    groupId,
    sessionTimeout: 30_000,
    heartbeatInterval: 3_000,
    allowAutoTopicCreation: true,
  });
}

export async function consume(
  consumer: Consumer,
  topics: string[],
  handler: (event: BaseEvent, payload: EachMessagePayload) => Promise<void>
): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topics, fromBeginning: false });

  await consumer.run({
    eachMessage: async (payload) => {
      const value = payload.message.value?.toString();
      if (!value) return;
      try {
        const event = JSON.parse(value) as BaseEvent;
        await handler(event, payload);
      } catch (err) {
        logger.error({ err, topic: payload.topic, offset: payload.message.offset }, "Consumer handler failed");
      }
    },
  });
}

export async function closeKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
