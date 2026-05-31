import { EventEmitter2 } from "eventemitter2";

export class EventEmitter {
  private readonly bus = new EventEmitter2({ wildcard: true, delimiter: "." });

  on<TPayload>(eventName: string, handler: (payload: TPayload) => void | Promise<void>): void {
    this.bus.on(eventName, handler);
  }

  async emit<TPayload>(eventName: string, payload: TPayload): Promise<void> {
    await this.bus.emitAsync(eventName, payload);
  }
}

export const domainEventEmitter = new EventEmitter();
