// Real-time synchronization layer for 1v1 battles and multiplayer casual games
// Supports WebSocket connection with automatic BroadcastChannel / storage fallback

type MessageHandler = (data: any) => void;

class SyncEngine {
  private ws: WebSocket | null = null;
  private channel: BroadcastChannel | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private currentRoomCode: string | null = null;
  private isConnected: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('devarena_sync_channel');
      this.channel.onmessage = (event) => {
        this.routeMessage(event.data);
      };
    }

    // Also listen to window storage events for fallback across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'devarena_sync_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.routeMessage(data);
          } catch (err) {
            // ignore
          }
        }
      });
    }

    // Try optional WebSocket if server is running
    this.tryConnectWebSocket();
  }

  private tryConnectWebSocket() {
    if (typeof window === 'undefined') return;
    try {
      const wsUrl = window.location.protocol === 'https:' 
        ? `wss://${window.location.host}/ws` 
        : `ws://${window.location.hostname}:3001/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.routeMessage(data);
        } catch (e) {
          console.warn('SyncEngine WS parse error', e);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };

      this.ws.onclose = () => {
        this.isConnected = false;
      };
    } catch (e) {
      this.isConnected = false;
    }
  }

  public joinRoom(roomCode: string, user: { id: string; username: string; avatar: string }) {
    this.currentRoomCode = roomCode;
    this.send('join_room', { roomCode, user });
  }

  public leaveRoom(roomCode: string, userId: string) {
    this.send('leave_room', { roomCode, userId });
    this.currentRoomCode = null;
  }

  public send(event: string, payload: any) {
    const message = {
      event,
      roomCode: this.currentRoomCode,
      payload,
      timestamp: Date.now()
    };

    // 1. Send via BroadcastChannel
    if (this.channel) {
      this.channel.postMessage(message);
    }

    // 2. Send via LocalStorage trigger for older environments
    try {
      localStorage.setItem('devarena_sync_event', JSON.stringify({
        ...message,
        _rnd: Math.random()
      }));
    } catch (e) {
      // ignore
    }

    // 3. Send via WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  private routeMessage(data: any) {
    if (!data || !data.event) return;
    
    // Only process if it matches current room or room is not set
    if (this.currentRoomCode && data.roomCode && data.roomCode !== this.currentRoomCode) {
      return;
    }

    const listeners = this.handlers.get(data.event);
    if (listeners) {
      listeners.forEach(fn => fn(data.payload));
    }

    // Also call wildcard listener
    const wildcards = this.handlers.get('*');
    if (wildcards) {
      wildcards.forEach(fn => fn(data));
    }
  }
}

export const syncEngine = new SyncEngine();

