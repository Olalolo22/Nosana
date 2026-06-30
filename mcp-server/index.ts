#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import our custom tools
import { repoScanTool } from './tools/repo_scan.js';
import { diffReviewTool } from './tools/diff_review.js';
import { lintCheckTool } from './tools/lint_check.js';
import { deviceStatusTool } from './tools/device_status.js';
import { deviceCommandTool } from './tools/device_command.js';

// Tool definitions
const tools: Tool[] = [
  {
    name: 'repo_scan',
    description: 'Scan a repository structure and detect files for code review',
    inputSchema: {
      type: 'object',
      properties: {
        repo_path: {
          type: 'string',
          description: 'Path to the repository to scan',
        },
        file_extensions: {
          type: 'array',
          items: { type: 'string' },
          description: 'File extensions to include in scan (e.g., [".js", ".ts", ".tsx"])',
          default: ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs'],
        },
      },
      required: ['repo_path'],
    },
  },
  {
    name: 'diff_review',
    description: 'Analyze code diffs for issues, bugs, and improvements',
    inputSchema: {
      type: 'object',
      properties: {
        diff_content: {
          type: 'string',
          description: 'The git diff content to analyze',
        },
        file_path: {
          type: 'string',
          description: 'Path to the file being modified',
        },
        review_focus: {
          type: 'string',
          enum: ['security', 'performance', 'readability', 'best_practices', 'all'],
          description: 'Focus area for the review',
          default: 'all',
        },
      },
      required: ['diff_content', 'file_path'],
    },
  },
  {
    name: 'lint_check',
    description: 'Run linting rules and return results with suggestions',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the file to lint',
        },
        linter_type: {
          type: 'string',
          enum: ['eslint', 'prettier', 'typescript', 'python', 'all'],
          description: 'Type of linter to use',
          default: 'all',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'device_status',
    description: 'Check if IoT device is online/offline and get status information',
    inputSchema: {
      type: 'object',
      properties: {
        device_id: {
          type: 'string',
          description: 'Unique identifier for the IoT device',
        },
        device_type: {
          type: 'string',
          enum: ['sensor', 'actuator', 'camera', 'smart_home', 'industrial'],
          description: 'Type of IoT device',
        },
      },
      required: ['device_id'],
    },
  },
  {
    name: 'device_command',
    description: 'Send commands to IoT devices (on/off, reset, custom commands)',
    inputSchema: {
      type: 'object',
      properties: {
        device_id: {
          type: 'string',
          description: 'Unique identifier for the IoT device',
        },
        command: {
          type: 'string',
          enum: ['on', 'off', 'reset', 'status', 'custom'],
          description: 'Command to send to the device',
        },
        custom_command: {
          type: 'string',
          description: 'Custom command payload (required when command is "custom")',
        },
        parameters: {
          type: 'object',
          description: 'Additional parameters for the command',
        },
      },
      required: ['device_id', 'command'],
    },
  },
];

// MCP Server implementation
class NosanaMCPAgent {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'nosana-agents-102-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'repo_scan':
            return await repoScanTool(args);
          
          case 'diff_review':
            return await diffReviewTool(args);
          
          case 'lint_check':
            return await lintCheckTool(args);
          
          case 'device_status':
            return await deviceStatusTool(args);
          
          case 'device_command':
            return await deviceCommandTool(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Nosana MCP Agent server running on stdio');
  }
}

// Start the server
const server = new NosanaMCPAgent();
server.run().catch(console.error);
