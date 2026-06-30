import { z } from 'zod';

const DeviceStatusSchema = z.object({
  device_id: z.string(),
  device_type: z.enum(['sensor', 'actuator', 'camera', 'smart_home', 'industrial']).optional(),
});

interface DeviceStatus {
  deviceId: string;
  deviceType?: string;
  isOnline: boolean;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
  humidity?: number;
  uptime: number;
  version: string;
  metadata: Record<string, any>;
}

interface DeviceStatusResult {
  device: DeviceStatus;
  health: {
    overall: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  };
  timestamp: Date;
  responseTime: number;
}

// Mock device registry for demonstration
const deviceRegistry = new Map<string, DeviceStatus>();

// Initialize some mock devices
function initializeMockDevices() {
  const mockDevices: DeviceStatus[] = [
    {
      deviceId: 'sensor-001',
      deviceType: 'sensor',
      isOnline: true,
      lastSeen: new Date(Date.now() - 30000), // 30 seconds ago
      status: 'active',
      batteryLevel: 85,
      signalStrength: -45,
      temperature: 22.5,
      humidity: 45,
      uptime: 86400, // 24 hours
      version: '1.2.3',
      metadata: {
        location: 'office-room-1',
        manufacturer: 'IoT Corp',
        model: 'TempSensor Pro',
      },
    },
    {
      deviceId: 'actuator-001',
      deviceType: 'actuator',
      isOnline: false,
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'error',
      batteryLevel: 15,
      signalStrength: -80,
      uptime: 172800, // 48 hours
      version: '2.1.0',
      metadata: {
        location: 'warehouse-door-1',
        manufacturer: 'SmartActuators Inc',
        model: 'DoorController 3000',
        lastError: 'Communication timeout',
      },
    },
    {
      deviceId: 'camera-001',
      deviceType: 'camera',
      isOnline: true,
      lastSeen: new Date(Date.now() - 5000), // 5 seconds ago
      status: 'active',
      signalStrength: -35,
      uptime: 604800, // 7 days
      version: '3.0.1',
      metadata: {
        location: 'entrance-lobby',
        manufacturer: 'SecureVision',
        model: 'IP Camera HD',
        recording: true,
        motionDetection: true,
      },
    },
    {
      deviceId: 'smart-switch-001',
      deviceType: 'smart_home',
      isOnline: true,
      lastSeen: new Date(Date.now() - 10000), // 10 seconds ago
      status: 'active',
      signalStrength: -40,
      uptime: 2592000, // 30 days
      version: '1.5.2',
      metadata: {
        location: 'living-room',
        manufacturer: 'HomeSmart',
        model: 'WiFi Switch',
        powerConsumption: 0.5,
        connectedLoads: ['living-room-lights'],
      },
    },
    {
      deviceId: 'industrial-sensor-001',
      deviceType: 'industrial',
      isOnline: true,
      lastSeen: new Date(Date.now() - 15000), // 15 seconds ago
      status: 'maintenance',
      signalStrength: -55,
      temperature: 45.2,
      humidity: 78,
      uptime: 5184000, // 60 days
      version: '4.2.1',
      metadata: {
        location: 'factory-floor-a',
        manufacturer: 'Industrial IoT Solutions',
        model: 'TempHumidity Pro',
        calibrationDate: '2024-01-15',
        nextMaintenance: '2024-04-15',
      },
    },
  ];

  mockDevices.forEach(device => {
    deviceRegistry.set(device.deviceId, device);
  });
}

// Initialize mock devices on module load
initializeMockDevices();

export async function deviceStatusTool(args: unknown) {
  try {
    const { device_id, device_type } = DeviceStatusSchema.parse(args);
    
    const startTime = Date.now();
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    const device = await getDeviceStatus(device_id, device_type);
    const health = analyzeDeviceHealth(device);
    const responseTime = Date.now() - startTime;

    const result: DeviceStatusResult = {
      device,
      health,
      timestamp: new Date(),
      responseTime,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error in device_status tool:', error);
    throw new Error(`Failed to get device status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getDeviceStatus(deviceId: string, deviceType?: string): Promise<DeviceStatus> {
  // Check if device exists in registry
  const device = deviceRegistry.get(deviceId);
  
  if (!device) {
    throw new Error(`Device not found: ${deviceId}`);
  }
  
  // Simulate device type validation if provided
  if (deviceType && device.deviceType !== deviceType) {
    throw new Error(`Device type mismatch. Expected: ${deviceType}, Found: ${device.deviceType}`);
  }
  
  // Simulate real-time status updates
  const now = Date.now();
  const timeSinceLastSeen = now - device.lastSeen.getTime();
  
  // Update device status based on time since last seen
  if (timeSinceLastSeen > 60000) { // 1 minute
    device.isOnline = false;
    device.status = 'error';
  } else if (timeSinceLastSeen > 30000) { // 30 seconds
    device.status = 'warning';
  }
  
  // Update battery level (simulate gradual discharge)
  if (device.batteryLevel) {
    device.batteryLevel = Math.max(0, device.batteryLevel - Math.random() * 0.1);
  }
  
  // Update signal strength (simulate fluctuations)
  if (device.signalStrength) {
    device.signalStrength = device.signalStrength + (Math.random() - 0.5) * 5;
  }
  
  // Update environmental readings for sensors
  if (device.deviceType === 'sensor' || device.deviceType === 'industrial') {
    if (device.temperature !== undefined) {
      device.temperature = device.temperature + (Math.random() - 0.5) * 0.5;
    }
    if (device.humidity !== undefined) {
      device.humidity = Math.max(0, Math.min(100, device.humidity + (Math.random() - 0.5) * 2));
    }
  }
  
  // Update last seen time
  device.lastSeen = new Date();
  
  return device;
}

function analyzeDeviceHealth(device: DeviceStatus): {
  overall: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  // Check online status
  if (!device.isOnline) {
    issues.push('Device is offline');
    overall = 'critical';
    recommendations.push('Check network connectivity and power supply');
  }
  
  // Check battery level
  if (device.batteryLevel !== undefined) {
    if (device.batteryLevel < 10) {
      issues.push('Critical battery level');
      overall = 'critical';
      recommendations.push('Replace or charge battery immediately');
    } else if (device.batteryLevel < 20) {
      issues.push('Low battery level');
      overall = overall === 'critical' ? 'critical' : 'warning';
      recommendations.push('Schedule battery replacement soon');
    }
  }
  
  // Check signal strength
  if (device.signalStrength !== undefined) {
    if (device.signalStrength < -80) {
      issues.push('Poor signal strength');
      overall = overall === 'critical' ? 'critical' : 'warning';
      recommendations.push('Check antenna placement and signal interference');
    } else if (device.signalStrength < -60) {
      issues.push('Weak signal strength');
      overall = overall === 'critical' ? 'critical' : 'warning';
      recommendations.push('Consider signal booster or repositioning device');
    }
  }
  
  // Check device status
  if (device.status === 'error') {
    issues.push('Device in error state');
    overall = 'critical';
    recommendations.push('Check device logs and restart if necessary');
  } else if (device.status === 'maintenance') {
    issues.push('Device requires maintenance');
    overall = overall === 'critical' ? 'critical' : 'warning';
    recommendations.push('Schedule maintenance as soon as possible');
  }
  
  // Check uptime for potential issues
  if (device.uptime > 2592000) { // 30 days
    issues.push('Device has been running for over 30 days');
    overall = overall === 'critical' ? 'critical' : 'warning';
    recommendations.push('Consider scheduled restart for optimal performance');
  }
  
  // Device-specific checks
  if (device.deviceType === 'sensor') {
    if (device.temperature !== undefined && (device.temperature < -10 || device.temperature > 60)) {
      issues.push('Temperature reading outside normal range');
      overall = overall === 'critical' ? 'critical' : 'warning';
      recommendations.push('Verify sensor calibration and environment conditions');
    }
    
    if (device.humidity !== undefined && (device.humidity < 0 || device.humidity > 100)) {
      issues.push('Humidity reading outside valid range');
      overall = overall === 'critical' ? 'critical' : 'warning';
      recommendations.push('Check humidity sensor for damage or calibration issues');
    }
  }
  
  // If no issues found, add positive recommendations
  if (issues.length === 0) {
    recommendations.push('Device is operating normally');
    if (device.batteryLevel && device.batteryLevel > 50) {
      recommendations.push('Battery level is healthy');
    }
    if (device.signalStrength && device.signalStrength > -50) {
      recommendations.push('Signal strength is excellent');
    }
  }
  
  return {
    overall,
    issues,
    recommendations,
  };
}
