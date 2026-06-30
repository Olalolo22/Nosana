# Nosana Agents 102 Challenge

A production-ready AI agent application featuring an MCP server, Mastra AI agent, and interactive Next.js frontend with real-time synchronization. This project demonstrates two domains: **Code Review Assistant** (primary) and **IoT Device Controller** (secondary).

## 🚀 Features

### Core Components
- **MCP Server** - Custom tools for code review and IoT device management
- **Mastra AI Agent** - Dynamic prompts and intelligent orchestration
- **Next.js Frontend** - Modern UI with real-time synchronization
- **Live Sync Layer** - Server-Sent Events for real-time updates

### Code Review Assistant (Primary Domain)
- **Repository Scanning** - Analyze codebase structure and file organization
- **Diff Review** - Security, performance, and quality analysis of code changes
- **Lint Checking** - Automated code quality and style enforcement
- **Interactive UI** - Repository explorer, diff viewer, and issue tracking

### IoT Device Controller (Secondary Domain)
- **Device Status Monitoring** - Real-time health and performance tracking
- **Device Commands** - Remote control and management capabilities
- **Fleet Management** - Bulk operations and analytics dashboard
- **Predictive Maintenance** - Smart recommendations and alerts

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Mastra        │    │   MCP Server    │
│   Frontend      │◄──►│   Agent         │◄──►│   + Tools       │
│   (Port 3000)   │    │   (Port 3002)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Event Bus     │◄─────────────┘
                        │   (SSE/WS)      │
                        └─────────────────┘
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, MCP SDK, Mastra Core
- **Real-time**: Server-Sent Events, Event Bus
- **Testing**: Jest, Testing Library
- **Deployment**: Docker, Docker Compose, Nginx

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nosana-agents-102-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd mcp-server && npm install && cd ..
   cd agent && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: MCP Server
   cd mcp-server && npm run dev

   # Terminal 2: Mastra Agent
   cd agent && npm run dev

   # Terminal 3: Next.js Frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - MCP Server: http://localhost:3001
   - Agent: http://localhost:3002

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Nginx Proxy: http://localhost:80

## 🔧 Usage

### Code Review Assistant

1. **Repository Scanning**
   - Navigate to `/code-review`
   - Enter repository path
   - Click "Scan Repository"
   - View structure analysis and recommendations

2. **Diff Review**
   - Select "Diff Review" tab
   - Paste git diff content
   - Choose review focus (security, performance, etc.)
   - Get detailed feedback and suggestions

3. **Lint Checking**
   - Select "Lint Check" tab
   - Enter file path
   - Choose linter type
   - Review issues and auto-fix suggestions

### IoT Device Controller

1. **Device Monitoring**
   - Navigate to `/iot-devices`
   - View device status dashboard
   - Check individual device health
   - Monitor fleet analytics

2. **Device Commands**
   - Select "Device Command" tab
   - Choose device and command
   - Send custom commands
   - Monitor execution results

3. **Fleet Management**
   - Use bulk operations
   - Schedule maintenance
   - View performance metrics
   - Manage device groups

### Agent Console

1. **Monitor Agent Activity**
   - Navigate to `/agent`
   - View real-time request processing
   - Check system metrics
   - Review agent logs

2. **Chat Interface**
   - Use the chat interface
   - Ask questions about code or devices
   - Get intelligent responses
   - View conversation history

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Test Structure
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and service testing
- **E2E Tests**: Full workflow testing
- **MCP Tool Tests**: Tool functionality testing

## 📊 Monitoring & Analytics

### Real-time Metrics
- Agent request processing
- Device status updates
- System performance
- Error tracking

### Event Bus
- Server-Sent Events for live updates
- Event history and replay
- Custom event subscriptions
- Performance monitoring

## 🚀 Deployment

### Nosana Network Deployment

1. **Prepare for deployment**
   ```bash
   # Build production images
   docker-compose -f docker-compose.prod.yml build

   # Run health checks
   docker-compose -f docker-compose.prod.yml up --abort-on-container-exit
   ```

2. **Deploy to Nosana Network**
   - Configure Nosana API keys
   - Set up network endpoints
   - Deploy containerized services
   - Monitor deployment status

### Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `3000` |
| `MCP_SERVER_URL` | MCP server endpoint | `http://localhost:3001` |
| `ENABLE_SSE` | Enable Server-Sent Events | `true` |
| `LOG_LEVEL` | Logging level | `info` |

## 📁 Project Structure

```
nosana-agents-102-challenge/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── code-review/       # Code review pages
│   ├── iot-devices/       # IoT device pages
│   ├── agent/            # Agent console
│   └── globals.css       # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Shared utilities
│   ├── utils.ts         # Utility functions
│   └── event-bus.ts     # Event system
├── mcp-server/          # MCP server implementation
│   ├── tools/          # Custom MCP tools
│   └── index.ts        # Server entry point
├── agent/              # Mastra agent
│   ├── prompts/        # Dynamic prompts
│   └── index.ts        # Agent entry point
├── docker-compose.yml  # Container orchestration
├── Dockerfile         # Container configuration
└── README.md         # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Nosana Network** for the challenge framework
- **MCP SDK** for the Model Context Protocol implementation
- **Mastra** for the AI agent framework
- **Next.js** and **React** teams for the excellent frontend tools
- **shadcn/ui** for the beautiful component library

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check the documentation
- Review the code examples
- Contact the development team

---

**Built with ❤️ for the Nosana Agents 102 Challenge**