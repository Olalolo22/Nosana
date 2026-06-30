import { z } from 'zod';

// IoT Device Management Prompt Templates
export const iotPrompts = {
  // Device status monitoring prompts
  deviceStatus: {
    system: `You are an IoT device management specialist with expertise in monitoring, diagnosing, and maintaining connected devices. Your role is to help operators understand device health and provide actionable insights for device management.

Expertise Areas:
- Device health monitoring and diagnostics
- Network connectivity and signal strength analysis
- Battery life and power management
- Environmental sensor data interpretation
- Predictive maintenance recommendations
- Device lifecycle management

Provide clear, actionable insights that help maintain optimal device performance.`,

    user: (statusData: any) => `Analyze the following device status:

Device ID: ${statusData.deviceId}
Device Type: ${statusData.deviceType || 'Unknown'}
Status: ${statusData.isOnline ? 'Online' : 'Offline'}
Last Seen: ${statusData.lastSeen}
Current Status: ${statusData.status}

Health Metrics:
- Battery Level: ${statusData.batteryLevel || 'N/A'}%
- Signal Strength: ${statusData.signalStrength || 'N/A'} dBm
- Temperature: ${statusData.temperature || 'N/A'}°C
- Humidity: ${statusData.humidity || 'N/A'}%
- Uptime: ${statusData.uptime} seconds

Device Information:
- Version: ${statusData.version}
- Location: ${statusData.metadata?.location || 'Unknown'}
- Manufacturer: ${statusData.metadata?.manufacturer || 'Unknown'}
- Model: ${statusData.metadata?.model || 'Unknown'}

Health Assessment:
Overall Health: ${statusData.health?.overall || 'Unknown'}
Issues Found: ${statusData.health?.issues?.length || 0}
${statusData.health?.issues?.map((issue: string) => `- ${issue}`).join('\n')}

Please provide:
1. Device health analysis
2. Performance assessment
3. Maintenance recommendations
4. Potential issues to watch for
5. Optimization suggestions`,

    schema: z.object({
      healthAnalysis: z.string(),
      performanceScore: z.number().min(0).max(100),
      criticalAlerts: z.array(z.string()),
      maintenanceNeeded: z.boolean(),
      maintenanceItems: z.array(z.object({
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        task: z.string(),
        estimatedTime: z.string(),
        impact: z.string(),
      })),
      optimizationSuggestions: z.array(z.string()),
      predictiveInsights: z.array(z.string()),
      nextActions: z.array(z.string()),
    }),
  },

  // Device command execution prompts
  deviceCommand: {
    system: `You are an IoT device control specialist responsible for safely executing commands on connected devices. You understand device capabilities, safety protocols, and the implications of various device operations.

Responsibilities:
- Safe command execution and validation
- Device capability assessment
- Risk evaluation and mitigation
- Command sequencing and timing
- Error handling and recovery
- Device state management

Ensure all commands are executed safely with proper validation and error handling.`,

    user: (commandData: any) => `Execute device command with the following details:

Device ID: ${commandData.deviceId}
Command: ${commandData.command}
${commandData.customCommand ? `Custom Command: ${commandData.customCommand}` : ''}
${commandData.parameters ? `Parameters: ${JSON.stringify(commandData.parameters)}` : ''}

Command Result:
Success: ${commandData.result.success}
Response: ${commandData.result.response}
Execution Time: ${commandData.result.executionTime}ms

Device Status After Command:
- Online: ${commandData.deviceStatus.isOnline}
- Status: ${commandData.deviceStatus.status}
- Last Command: ${commandData.deviceStatus.lastCommand}
- Last Command Time: ${commandData.deviceStatus.lastCommandTime}

${commandData.result.metadata ? `Metadata: ${JSON.stringify(commandData.result.metadata, null, 2)}` : ''}

Please provide:
1. Command execution analysis
2. Device state verification
3. Safety assessment
4. Follow-up recommendations
5. Monitoring suggestions`,

    schema: z.object({
      executionAnalysis: z.string(),
      safetyStatus: z.enum(['safe', 'warning', 'critical']),
      deviceStateVerified: z.boolean(),
      followUpRequired: z.boolean(),
      followUpActions: z.array(z.object({
        action: z.string(),
        timing: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
        description: z.string(),
      })),
      monitoringRecommendations: z.array(z.string()),
      riskAssessment: z.object({
        level: z.enum(['low', 'medium', 'high']),
        factors: z.array(z.string()),
        mitigation: z.array(z.string()),
      }),
      successMetrics: z.array(z.string()),
    }),
  },

  // Device fleet management prompts
  fleetManagement: {
    system: `You are an IoT fleet management expert responsible for overseeing multiple devices across different locations and use cases. You provide strategic insights for device deployment, maintenance, and optimization at scale.

Fleet Management Expertise:
- Multi-device coordination and orchestration
- Geographic distribution optimization
- Batch operations and bulk commands
- Fleet health monitoring and analytics
- Predictive maintenance scheduling
- Resource allocation and scaling

Focus on operational efficiency, cost optimization, and reliability at scale.`,

    user: (fleetData: any) => `Analyze the following IoT device fleet:

Total Devices: ${fleetData.totalDevices}
Online Devices: ${fleetData.onlineDevices}
Offline Devices: ${fleetData.offlineDevices}
Device Types: ${Object.keys(fleetData.deviceTypes || {}).join(', ')}

Device Distribution:
${Object.entries(fleetData.deviceTypes || {}).map(([type, count]) => 
  `- ${type}: ${count} devices`
).join('\n')}

Health Overview:
- Healthy: ${fleetData.healthCounts?.healthy || 0}
- Warning: ${fleetData.healthCounts?.warning || 0}
- Critical: ${fleetData.healthCounts?.critical || 0}

Geographic Distribution:
${fleetData.locations?.map((loc: any) => 
  `- ${loc.name}: ${loc.deviceCount} devices (${loc.status})`
).join('\n')}

Performance Metrics:
- Average Uptime: ${fleetData.avgUptime}%
- Average Response Time: ${fleetData.avgResponseTime}ms
- Command Success Rate: ${fleetData.successRate}%

Please provide:
1. Fleet health assessment
2. Operational insights
3. Optimization opportunities
4. Maintenance scheduling recommendations
5. Scaling considerations`,

    schema: z.object({
      fleetHealth: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']),
      operationalInsights: z.array(z.string()),
      optimizationOpportunities: z.array(z.object({
        category: z.enum(['performance', 'cost', 'reliability', 'scalability']),
        description: z.string(),
        impact: z.enum(['low', 'medium', 'high']),
        effort: z.enum(['low', 'medium', 'high']),
        timeline: z.string(),
      })),
      maintenanceSchedule: z.array(z.object({
        deviceType: z.string(),
        frequency: z.string(),
        tasks: z.array(z.string()),
        priority: z.enum(['low', 'medium', 'high']),
      })),
      scalingRecommendations: z.array(z.string()),
      costOptimization: z.array(z.string()),
      riskMitigation: z.array(z.string()),
    }),
  },

  // General IoT device prompts
  general: {
    system: `You are an IoT solutions architect and device management specialist. You help organizations design, deploy, and maintain IoT systems that are reliable, secure, and efficient.

Your expertise covers:
- IoT device lifecycle management
- Network architecture and connectivity
- Data collection and analytics
- Security and privacy considerations
- Integration with existing systems
- Regulatory compliance

Provide strategic guidance that balances technical excellence with business objectives.`,

    user: (context: any) => `Provide IoT device management guidance for:

Context: ${context.task}
Priority: ${context.priority}
Domain: IoT Device Management

${context.additionalContext || ''}

Focus on providing comprehensive, strategic guidance that helps optimize IoT device operations while ensuring reliability and security.`,

    schema: z.object({
      strategicAssessment: z.string(),
      keyRecommendations: z.array(z.string()),
      implementationPlan: z.array(z.object({
        phase: z.string(),
        tasks: z.array(z.string()),
        timeline: z.string(),
        resources: z.array(z.string()),
      })),
      riskConsiderations: z.array(z.string()),
      successMetrics: z.array(z.string()),
      longTermVision: z.string(),
    }),
  },
};

// Dynamic prompt selection based on context
export function getIoTPrompt(context: string, data: any) {
  switch (context) {
    case 'check_status':
      return {
        system: iotPrompts.deviceStatus.system,
        user: iotPrompts.deviceStatus.user(data),
        schema: iotPrompts.deviceStatus.schema,
      };
    case 'send_command':
      return {
        system: iotPrompts.deviceCommand.system,
        user: iotPrompts.deviceCommand.user(data),
        schema: iotPrompts.deviceCommand.schema,
      };
    case 'fleet_management':
      return {
        system: iotPrompts.fleetManagement.system,
        user: iotPrompts.fleetManagement.user(data),
        schema: iotPrompts.fleetManagement.schema,
      };
    default:
      return {
        system: iotPrompts.general.system,
        user: iotPrompts.general.user(data),
        schema: iotPrompts.general.schema,
      };
  }
}
