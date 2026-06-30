#!/usr/bin/env node

import { Agent } from '@mastra/core';
import { z } from 'zod';
import { codeReviewPrompts } from './prompts/code-review.js';
import { iotPrompts } from './prompts/iot-device.js';
// Note: MCP server connection will be handled separately
// import { createMCPServer } from '../mcp-server/index.js';

// Agent configuration
const agentConfig = {
  name: 'Nosana Agent 102',
  version: '1.0.0',
  description: 'AI agent for code review and IoT device management',
  domains: ['code-review', 'iot-device'],
};

// Domain schemas for validation
const CodeReviewSchema = z.object({
  action: z.enum(['scan_repo', 'review_diff', 'check_lint']),
  repo_path: z.string().optional(),
  diff_content: z.string().optional(),
  file_path: z.string().optional(),
  focus: z.enum(['security', 'performance', 'readability', 'best_practices', 'all']).optional(),
});

const IoTDeviceSchema = z.object({
  action: z.enum(['check_status', 'send_command']),
  device_id: z.string(),
  command: z.enum(['on', 'off', 'reset', 'status', 'custom']).optional(),
  custom_command: z.string().optional(),
  parameters: z.record(z.any()).optional(),
});

const AgentRequestSchema = z.object({
  domain: z.enum(['code-review', 'iot-device']),
  task: z.string(),
  context: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
});

interface AgentResponse {
  domain: string;
  task: string;
  result: any;
  recommendations: string[];
  confidence: number;
  executionTime: number;
  timestamp: Date;
}

class NosanaAgent {
  private agent: Agent;
  private mcpServer: any;

  constructor() {
    this.agent = new Agent(agentConfig);
    this.setupAgent();
  }

  private setupAgent() {
    // Register domain handlers
    this.agent.registerDomain('code-review', {
      schema: CodeReviewSchema,
      handler: this.handleCodeReview.bind(this),
      prompts: codeReviewPrompts,
    });

    this.agent.registerDomain('iot-device', {
      schema: IoTDeviceSchema,
      handler: this.handleIoTDevice.bind(this),
      prompts: iotPrompts,
    });

    // Setup MCP server connection (will be implemented)
    this.mcpServer = {
      callTool: async (toolName: string, args: any) => {
        // Mock MCP server response for development
        console.log(`Mock MCP call: ${toolName}`, args);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ mock: true, tool: toolName, args, timestamp: new Date().toISOString() })
          }]
        };
      }
    };
  }

  async handleCodeReview(request: z.infer<typeof CodeReviewSchema>): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      let recommendations: string[] = [];
      let confidence = 0.8;

      // Select appropriate MCP tool based on action
      switch (request.action) {
        case 'scan_repo':
          if (!request.repo_path) {
            throw new Error('Repository path is required for scanning');
          }
          
          result = await this.mcpServer.callTool('repo_scan', {
            repo_path: request.repo_path,
          });
          
          recommendations = [
            'Review the repository structure for organization',
            'Check for proper documentation and README files',
            'Verify consistent coding standards across files',
            'Consider adding automated testing if missing',
          ];
          break;

        case 'review_diff':
          if (!request.diff_content || !request.file_path) {
            throw new Error('Diff content and file path are required for review');
          }
          
          result = await this.mcpServer.callTool('diff_review', {
            diff_content: request.diff_content,
            file_path: request.file_path,
            review_focus: request.focus || 'all',
          });
          
          // Generate recommendations based on review results
          const reviewData = JSON.parse(result.content[0].text);
          recommendations = reviewData.recommendations || [];
          confidence = this.calculateConfidence(reviewData.summary);
          break;

        case 'check_lint':
          if (!request.file_path) {
            throw new Error('File path is required for linting');
          }
          
          result = await this.mcpServer.callTool('lint_check', {
            file_path: request.file_path,
          });
          
          const lintData = JSON.parse(result.content[0].text);
          recommendations = lintData.recommendations || [];
          confidence = this.calculateConfidence(lintData.summary);
          break;

        default:
          throw new Error(`Unknown code review action: ${request.action}`);
      }

      return {
        domain: 'code-review',
        task: request.action,
        result,
        recommendations,
        confidence,
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Error in code review handler:', error);
      throw error;
    }
  }

  async handleIoTDevice(request: z.infer<typeof IoTDeviceSchema>): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      let recommendations: string[] = [];
      let confidence = 0.9;

      // Select appropriate MCP tool based on action
      switch (request.action) {
        case 'check_status':
          result = await this.mcpServer.callTool('device_status', {
            device_id: request.device_id,
          });
          
          const statusData = JSON.parse(result.content[0].text);
          recommendations = statusData.health.recommendations || [];
          confidence = statusData.device.isOnline ? 0.9 : 0.6;
          break;

        case 'send_command':
          if (!request.command) {
            throw new Error('Command is required for device control');
          }
          
          result = await this.mcpServer.callTool('device_command', {
            device_id: request.device_id,
            command: request.command,
            custom_command: request.custom_command,
            parameters: request.parameters,
          });
          
          const commandData = JSON.parse(result.content[0].text);
          recommendations = commandData.recommendations || [];
          confidence = commandData.result.success ? 0.95 : 0.7;
          break;

        default:
          throw new Error(`Unknown IoT device action: ${request.action}`);
      }

      return {
        domain: 'iot-device',
        task: request.action,
        result,
        recommendations,
        confidence,
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Error in IoT device handler:', error);
      throw error;
    }
  }

  private calculateConfidence(summary: any): number {
    if (!summary) return 0.5;
    
    const { totalIssues = 0, criticalIssues = 0, highIssues = 0 } = summary;
    
    if (criticalIssues > 0) return 0.3;
    if (highIssues > 0) return 0.6;
    if (totalIssues > 10) return 0.7;
    if (totalIssues > 5) return 0.8;
    
    return 0.9;
  }

  async processRequest(request: unknown): Promise<AgentResponse> {
    try {
      const validatedRequest = AgentRequestSchema.parse(request);
      
      // Route to appropriate domain handler
      switch (validatedRequest.domain) {
        case 'code-review':
          return await this.handleCodeReview(validatedRequest.context as any);
        case 'iot-device':
          return await this.handleIoTDevice(validatedRequest.context as any);
        default:
          throw new Error(`Unknown domain: ${validatedRequest.domain}`);
      }
    } catch (error) {
      console.error('Error processing agent request:', error);
      throw error;
    }
  }

  async run() {
    console.log('Nosana Agent 102 starting...');
    console.log('Agent configured for domains:', agentConfig.domains);
    
    // Keep the agent running
    process.on('SIGINT', () => {
      console.log('\nShutting down Nosana Agent 102...');
      process.exit(0);
    });
  }
}

// Create and run the agent
const agent = new NosanaAgent();
agent.run().catch(console.error);

export { NosanaAgent };
