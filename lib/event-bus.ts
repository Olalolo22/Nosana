import { EventEmitter } from 'events';

// Event types for live synchronization
export interface AgentEvent {
  type: 'code-review' | 'iot-device' | 'agent-status' | 'system-metric';
  action: string;
  data: any;
  timestamp: Date;
  requestId?: string;
}

export interface CodeReviewEvent extends AgentEvent {
  type: 'code-review';
  data: {
    repository: string;
    file?: string;
    action: 'repo_scan' | 'diff_review' | 'lint_check';
    status: 'started' | 'completed' | 'error';
    result?: any;
  };
}

export interface IoTDeviceEvent extends AgentEvent {
  type: 'iot-device';
  data: {
    deviceId: string;
    action: 'device_status' | 'device_command';
    status: 'started' | 'completed' | 'error';
    result?: any;
  };
}

export interface AgentStatusEvent extends AgentEvent {
  type: 'agent-status';
  data: {
    status: 'online' | 'offline' | 'busy' | 'idle';
    uptime: number;
    requestsProcessed: number;
    avgResponseTime: number;
  };
}

export interface SystemMetricEvent extends AgentEvent {
  type: 'system-metric';
  data: {
    cpu: number;
    memory: number;
    network: number;
    disk: number;
  };
}

// Event Bus for live synchronization
class NosanaEventBus extends EventEmitter {
  private events: Map<string, AgentEvent[]> = new Map();
  private maxEvents = 1000;

  constructor() {
    super();
    this.setMaxListeners(50);
  }

  // Emit agent events
  emitAgentEvent(event: AgentEvent) {
    // Store event for history
    this.storeEvent(event);
    
    // Emit to listeners
    this.emit('agent-event', event);
    this.emit(event.type, event);
    
    console.log(`[EventBus] Emitted ${event.type} event:`, event.action);
  }

  // Store event in history
  private storeEvent(event: AgentEvent) {
    const key = event.type;
    if (!this.events.has(key)) {
      this.events.set(key, []);
    }
    
    const eventList = this.events.get(key)!;
    eventList.push(event);
    
    // Keep only recent events
    if (eventList.length > this.maxEvents) {
      eventList.splice(0, eventList.length - this.maxEvents);
    }
  }

  // Get event history
  getEventHistory(type?: string, limit = 100): AgentEvent[] {
    if (type) {
      return this.events.get(type)?.slice(-limit) || [];
    }
    
    // Return all events from all types
    const allEvents: AgentEvent[] = [];
    for (const events of this.events.values()) {
      allEvents.push(...events);
    }
    
    return allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Subscribe to specific event types
  subscribeToEvents(types: string[], callback: (event: AgentEvent) => void) {
    types.forEach(type => {
      this.on(type, callback);
    });
    
    return () => {
      types.forEach(type => {
        this.off(type, callback);
      });
    };
  }

  // Get current agent status
  getCurrentStatus(): AgentStatusEvent['data'] {
    const statusEvents = this.getEventHistory('agent-status', 1);
    if (statusEvents.length > 0) {
      return (statusEvents[0] as AgentStatusEvent).data;
    }
    
    // Default status
    return {
      status: 'online',
      uptime: 0,
      requestsProcessed: 0,
      avgResponseTime: 0,
    };
  }

  // Get system metrics
  getCurrentMetrics(): SystemMetricEvent['data'] {
    const metricEvents = this.getEventHistory('system-metric', 1);
    if (metricEvents.length > 0) {
      return (metricEvents[0] as SystemMetricEvent).data;
    }
    
    // Default metrics
    return {
      cpu: 0,
      memory: 0,
      network: 0,
      disk: 0,
    };
  }
}

// Singleton instance
export const eventBus = new NosanaEventBus();

// Helper functions for emitting specific events
export function emitCodeReviewEvent(data: CodeReviewEvent['data']) {
  const event: CodeReviewEvent = {
    type: 'code-review',
    action: data.action,
    data,
    timestamp: new Date(),
  };
  
  eventBus.emitAgentEvent(event);
}

export function emitIoTDeviceEvent(data: IoTDeviceEvent['data']) {
  const event: IoTDeviceEvent = {
    type: 'iot-device',
    action: data.action,
    data,
    timestamp: new Date(),
  };
  
  eventBus.emitAgentEvent(event);
}

export function emitAgentStatusEvent(data: AgentStatusEvent['data']) {
  const event: AgentStatusEvent = {
    type: 'agent-status',
    action: 'status_update',
    data,
    timestamp: new Date(),
  };
  
  eventBus.emitAgentEvent(event);
}

export function emitSystemMetricEvent(data: SystemMetricEvent['data']) {
  const event: SystemMetricEvent = {
    type: 'system-metric',
    action: 'metric_update',
    data,
    timestamp: new Date(),
  };
  
  eventBus.emitAgentEvent(event);
}
