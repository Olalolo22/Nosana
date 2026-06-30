import { z } from 'zod';

const DeviceCommandSchema = z.object({
  device_id: z.string(),
  command: z.enum(['on', 'off', 'reset', 'status', 'custom']),
  custom_command: z.string().optional(),
  parameters: z.record(z.any()).optional(),
});

interface CommandResult {
  deviceId: string;
  command: string;
  success: boolean;
  response: string;
  executionTime: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface DeviceCommandResult {
  result: CommandResult;
  deviceStatus: {
    isOnline: boolean;
    status: string;
    lastCommand: string;
    lastCommandTime: Date;
  };
  recommendations: string[];
}

// Mock device command registry
const deviceCommandHistory = new Map<string, CommandResult[]>();
const deviceStates = new Map<string, { isOnline: boolean; status: string; lastCommand: string; lastCommandTime: Date }>();

// Initialize mock device states
function initializeDeviceStates() {
  const mockDevices = [
    'sensor-001',
    'actuator-001', 
    'camera-001',
    'smart-switch-001',
    'industrial-sensor-001',
  ];

  mockDevices.forEach(deviceId => {
    deviceStates.set(deviceId, {
      isOnline: true,
      status: 'idle',
      lastCommand: '',
      lastCommandTime: new Date(Date.now() - 3600000), // 1 hour ago
    });
  });
}

// Initialize device states on module load
initializeDeviceStates();

export async function deviceCommandTool(args: unknown) {
  try {
    const { device_id, command, custom_command, parameters } = DeviceCommandSchema.parse(args);
    
    const startTime = Date.now();
    
    // Validate custom command
    if (command === 'custom' && !custom_command) {
      throw new Error('Custom command is required when command type is "custom"');
    }
    
    // Check if device exists
    const deviceState = deviceStates.get(device_id);
    if (!deviceState) {
      throw new Error(`Device not found: ${device_id}`);
    }
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    
    const result = await executeDeviceCommand(device_id, command, custom_command, parameters);
    const executionTime = Date.now() - startTime;
    
    // Update device state
    deviceState.lastCommand = command;
    deviceState.lastCommandTime = new Date();
    
    // Store command in history
    const commandHistory = deviceCommandHistory.get(device_id) || [];
    commandHistory.push(result);
    if (commandHistory.length > 100) {
      commandHistory.shift(); // Keep only last 100 commands
    }
    deviceCommandHistory.set(device_id, commandHistory);
    
    const recommendations = generateCommandRecommendations(result, deviceState);
    
    const finalResult: DeviceCommandResult = {
      result: {
        ...result,
        executionTime,
      },
      deviceStatus: deviceState,
      recommendations,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(finalResult, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error in device_command tool:', error);
    throw new Error(`Failed to execute device command: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function executeDeviceCommand(
  deviceId: string,
  command: string,
  customCommand?: string,
  parameters?: Record<string, any>
): Promise<CommandResult> {
  const deviceState = deviceStates.get(deviceId)!;
  
  // Simulate device offline scenario
  if (Math.random() < 0.05) { // 5% chance of device being offline
    deviceState.isOnline = false;
    throw new Error('Device is offline and cannot receive commands');
  }
  
  deviceState.isOnline = true;
  
  let success = true;
  let response = '';
  let metadata: Record<string, any> = {};
  
  switch (command) {
    case 'on':
      if (deviceId.includes('switch') || deviceId.includes('actuator')) {
        response = 'Device powered on successfully';
        deviceState.status = 'active';
        metadata = { powerState: true, timestamp: new Date().toISOString() };
      } else if (deviceId.includes('camera')) {
        response = 'Camera recording started';
        deviceState.status = 'recording';
        metadata = { recording: true, resolution: '1080p', fps: 30 };
      } else {
        response = 'Device activated';
        deviceState.status = 'active';
        metadata = { activated: true };
      }
      break;
      
    case 'off':
      if (deviceId.includes('switch') || deviceId.includes('actuator')) {
        response = 'Device powered off successfully';
        deviceState.status = 'inactive';
        metadata = { powerState: false, timestamp: new Date().toISOString() };
      } else if (deviceId.includes('camera')) {
        response = 'Camera recording stopped';
        deviceState.status = 'idle';
        metadata = { recording: false, lastRecordingDuration: '2h 15m' };
      } else {
        response = 'Device deactivated';
        deviceState.status = 'inactive';
        metadata = { activated: false };
      }
      break;
      
    case 'reset':
      response = 'Device reset completed successfully';
      deviceState.status = 'idle';
      metadata = {
        resetType: 'soft',
        uptime: 0,
        resetReason: 'user_command',
        timestamp: new Date().toISOString(),
      };
      break;
      
    case 'status':
      response = 'Device status retrieved';
      deviceState.status = deviceState.status;
      metadata = {
        isOnline: deviceState.isOnline,
        status: deviceState.status,
        lastCommand: deviceState.lastCommand,
        uptime: Math.floor(Math.random() * 86400), // Random uptime
        version: '1.0.0',
        temperature: deviceId.includes('sensor') ? Math.floor(Math.random() * 30 + 15) : undefined,
        humidity: deviceId.includes('sensor') ? Math.floor(Math.random() * 50 + 30) : undefined,
      };
      break;
      
    case 'custom':
      if (!customCommand) {
        throw new Error('Custom command is required');
      }
      
      // Simulate custom command processing
      response = `Custom command "${customCommand}" executed successfully`;
      deviceState.status = 'processing';
      metadata = {
        customCommand,
        parameters: parameters || {},
        executionTime: Math.floor(Math.random() * 1000 + 100),
        timestamp: new Date().toISOString(),
      };
      
      // Simulate some custom commands
      if (customCommand.toLowerCase().includes('calibrate')) {
        response = 'Device calibration completed';
        metadata.calibrationResult = 'success';
        metadata.accuracy = 0.99;
      } else if (customCommand.toLowerCase().includes('update')) {
        response = 'Firmware update initiated';
        metadata.updateProgress = 0;
        metadata.estimatedTime = '5 minutes';
      } else if (customCommand.toLowerCase().includes('diagnostic')) {
        response = 'Diagnostic completed - no issues found';
        metadata.diagnosticResults = {
          memory: 'OK',
          storage: 'OK',
          network: 'OK',
          sensors: 'OK',
        };
      }
      break;
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
  
  // Simulate occasional command failures
  if (Math.random() < 0.1) { // 10% chance of failure
    success = false;
    response = 'Command execution failed - device busy';
    metadata.error = 'DEVICE_BUSY';
    metadata.retryAfter = 30;
  }
  
  return {
    deviceId,
    command,
    success,
    response,
    executionTime: 0, // Will be set by caller
    timestamp: new Date(),
    metadata,
  };
}

function generateCommandRecommendations(result: CommandResult, deviceState: any): string[] {
  const recommendations: string[] = [];
  
  if (!result.success) {
    recommendations.push('Command failed - check device connectivity and try again');
    recommendations.push('Consider checking device logs for more details');
    return recommendations;
  }
  
  // Success-based recommendations
  switch (result.command) {
    case 'on':
      recommendations.push('Device is now active - monitor for proper operation');
      if (result.deviceId.includes('camera')) {
        recommendations.push('Verify recording quality and storage space');
      }
      break;
      
    case 'off':
      recommendations.push('Device is now inactive - ensure this is intentional');
      recommendations.push('Consider scheduling automatic power-on if needed');
      break;
      
    case 'reset':
      recommendations.push('Device reset completed - verify all functions are working');
      recommendations.push('Check device configuration after reset');
      recommendations.push('Monitor device stability over the next few hours');
      break;
      
    case 'status':
      recommendations.push('Device status retrieved - review all metrics');
      if (result.metadata?.temperature && result.metadata.temperature > 40) {
        recommendations.push('Device temperature is high - ensure proper ventilation');
      }
      break;
      
    case 'custom':
      recommendations.push('Custom command executed - verify expected behavior');
      if (result.metadata?.customCommand?.toLowerCase().includes('update')) {
        recommendations.push('Firmware update in progress - do not power off device');
        recommendations.push('Monitor update progress and device stability');
      }
      break;
  }
  
  // General recommendations based on command history
  const commandHistory = deviceCommandHistory.get(result.deviceId) || [];
  const recentCommands = commandHistory.slice(-10);
  const resetCount = recentCommands.filter(cmd => cmd.command === 'reset').length;
  
  if (resetCount > 2) {
    recommendations.push('Multiple resets detected - investigate underlying issues');
  }
  
  const failureCount = recentCommands.filter(cmd => !cmd.success).length;
  if (failureCount > 3) {
    recommendations.push('High command failure rate - check device health and connectivity');
  }
  
  return recommendations;
}
