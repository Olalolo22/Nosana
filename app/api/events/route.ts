import { NextRequest } from 'next/server';
import { eventBus, AgentEvent } from '@/lib/event-bus';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const types = searchParams.get('types')?.split(',') || ['code-review', 'iot-device', 'agent-status', 'system-metric'];
  const limit = parseInt(searchParams.get('limit') || '100');

  // Create a readable stream for Server-Sent Events
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const initialEvents = eventBus.getEventHistory(undefined, limit);
      const initialData = {
        type: 'initial',
        events: initialEvents,
        timestamp: new Date().toISOString(),
      };
      
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
      );

      // Set up event listener for real-time updates
      const handleEvent = (event: AgentEvent) => {
        if (types.includes(event.type)) {
          const data = {
            type: 'update',
            event,
            timestamp: new Date().toISOString(),
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        }
      };

      // Subscribe to events
      const unsubscribe = eventBus.subscribeToEvents(types, handleEvent);

      // Cleanup function
      const cleanup = () => {
        unsubscribe();
        controller.close();
      };

      // Handle client disconnect
      request.signal.addEventListener('abort', cleanup);
      
      // Keep connection alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`)
          );
        } catch (error) {
          clearInterval(heartbeat);
          cleanup();
        }
      }, 30000); // Heartbeat every 30 seconds

      // Cleanup heartbeat on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, action, data } = body;

    // Validate event data
    if (!type || !action || !data) {
      return Response.json(
        { error: 'Missing required fields: type, action, data' },
        { status: 400 }
      );
    }

    // Emit the event
    const event: AgentEvent = {
      type,
      action,
      data,
      timestamp: new Date(),
    };

    eventBus.emitAgentEvent(event);

    return Response.json({
      success: true,
      eventId: event.timestamp.getTime(),
      timestamp: event.timestamp.toISOString(),
    });

  } catch (error) {
    console.error('Error handling POST request:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
