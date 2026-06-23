import { describe, it, expect, vi } from "vitest";

export interface MockChannelCallback {
  (status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED"): void;
}

export interface MockChannel {
  on: (
    event: string,
    filter: unknown,
    callback: (payload: unknown) => void
  ) => MockChannel;
  subscribe: (statusCallback?: MockChannelCallback) => MockChannel;
  unsubscribe?: () => void;
}

export function createMockSupabaseChannel(name: string): MockChannel {
  const handlers: Map<string, (payload: unknown) => void> = new Map();
  let statusCallback: MockChannelCallback | undefined;

  const channel: MockChannel = {
    on: (event: string, filter: unknown, callback: (payload: unknown) => void) => {
      handlers.set(event, callback);
      return channel;
    },
    subscribe: (cb?: MockChannelCallback) => {
      statusCallback = cb;
      return channel;
    },
  };

  return channel;
}

export function createMockSupabaseClient() {
  const channels = new Map<string, MockChannel>();

  return {
    channel: (name: string) => {
      if (!channels.has(name)) {
        channels.set(name, createMockSupabaseChannel(name));
      }
      return channels.get(name)!;
    },
    removeChannel: (channel: MockChannel) => {
      for (const [name, ch] of channels.entries()) {
        if (ch === channel) {
          channels.delete(name);
          break;
        }
      }
    },
    auth: {
      setSession: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue(undefined),
    },
  };
}
