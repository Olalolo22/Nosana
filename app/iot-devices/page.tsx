import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  WifiOff,
  Battery,
  Signal,
  Thermometer,
  Droplets,
  Settings,
  Power,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function IoTDevicesPage() {
  // Mock data for IoT devices
  const devices = [
    {
      id: 'sensor-001',
      name: 'Temperature Sensor',
      type: 'sensor',
      status: 'online',
      location: 'Office Room 1',
      batteryLevel: 85,
      signalStrength: -45,
      temperature: 22.5,
      humidity: 45,
      lastSeen: '2 minutes ago',
      uptime: '24h 15m'
    },
    {
      id: 'actuator-001',
      name: 'Door Controller',
      type: 'actuator',
      status: 'offline',
      location: 'Warehouse Door 1',
      batteryLevel: 15,
      signalStrength: -80,
      lastSeen: '5 minutes ago',
      uptime: '48h 30m',
      error: 'Communication timeout'
    },
    {
      id: 'camera-001',
      name: 'Security Camera',
      type: 'camera',
      status: 'online',
      location: 'Entrance Lobby',
      signalStrength: -35,
      lastSeen: '30 seconds ago',
      uptime: '7d 2h',
      recording: true
    },
    {
      id: 'smart-switch-001',
      name: 'WiFi Switch',
      type: 'smart_home',
      status: 'online',
      location: 'Living Room',
      signalStrength: -40,
      lastSeen: '1 minute ago',
      uptime: '30d 12h',
      powerConsumption: 0.5
    },
    {
      id: 'industrial-sensor-001',
      name: 'Industrial Sensor',
      type: 'industrial',
      status: 'warning',
      location: 'Factory Floor A',
      signalStrength: -55,
      temperature: 45.2,
      humidity: 78,
      lastSeen: '3 minutes ago',
      uptime: '60d 8h',
      maintenance: 'Due for calibration'
    }
  ];

  const deviceStats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    warnings: devices.filter(d => d.status === 'warning').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IoT Devices</h1>
          <p className="text-muted-foreground">
            Monitor and control your connected IoT devices
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button size="sm">
            <Wifi className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Device Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Connected devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deviceStats.online}</div>
            <p className="text-xs text-muted-foreground">
              Active devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{deviceStats.offline}</div>
            <p className="text-xs text-muted-foreground">
              Inactive devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{deviceStats.warnings}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device Management */}
      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">All Devices</TabsTrigger>
          <TabsTrigger value="status-check">Status Check</TabsTrigger>
          <TabsTrigger value="device-command">Device Command</TabsTrigger>
          <TabsTrigger value="fleet-management">Fleet Management</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device List</CardTitle>
              <CardDescription>
                Manage and monitor all connected IoT devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        device.status === 'online' ? 'bg-green-500' :
                        device.status === 'offline' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.id} • {device.location}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {device.lastSeen}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Uptime: {device.uptime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {device.batteryLevel && (
                            <div className="flex items-center space-x-1">
                              <Battery className="w-4 h-4" />
                              <span className="text-sm">{device.batteryLevel}%</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Signal className="w-4 h-4" />
                            <span className="text-sm">{device.signalStrength}dBm</span>
                          </div>
                        </div>
                        {device.temperature && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Thermometer className="w-4 h-4" />
                            <span className="text-sm">{device.temperature}°C</span>
                          </div>
                        )}
                        {device.humidity && (
                          <div className="flex items-center space-x-1">
                            <Droplets className="w-4 h-4" />
                            <span className="text-sm">{device.humidity}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          device.status === 'online' ? 'default' :
                          device.status === 'offline' ? 'destructive' :
                          'secondary'
                        }>
                          {device.status}
                        </Badge>
                        {device.error && (
                          <Badge variant="destructive" className="text-xs">
                            Error
                          </Badge>
                        )}
                        {device.maintenance && (
                          <Badge variant="outline" className="text-xs">
                            Maintenance
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Status Check</CardTitle>
              <CardDescription>
                Check if IoT device is online/offline and get status information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Device ID</label>
                    <input
                      type="text"
                      placeholder="e.g., sensor-001"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Device Type</label>
                    <select className="w-full px-3 py-2 border rounded-md mt-1">
                      <option value="">Select device type</option>
                      <option value="sensor">Sensor</option>
                      <option value="actuator">Actuator</option>
                      <option value="camera">Camera</option>
                      <option value="smart_home">Smart Home</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </div>
                  <Button>Check Status</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device-command" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Command</CardTitle>
              <CardDescription>
                Send commands to IoT devices (on/off, reset, custom commands)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Device ID</label>
                    <input
                      type="text"
                      placeholder="e.g., actuator-001"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Command</label>
                    <select className="w-full px-3 py-2 border rounded-md mt-1">
                      <option value="on">On</option>
                      <option value="off">Off</option>
                      <option value="reset">Reset</option>
                      <option value="status">Status</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Custom Command (if applicable)</label>
                    <input
                      type="text"
                      placeholder="e.g., calibrate, update, diagnostic"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Parameters (JSON)</label>
                    <textarea
                      placeholder='{"key": "value"}'
                      className="w-full px-3 py-2 border rounded-md mt-1 h-20"
                    />
                  </div>
                  <Button>Send Command</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Management</CardTitle>
              <CardDescription>
                Manage multiple devices across different locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Bulk Operations</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Power className="w-4 h-4 mr-2" />
                      Power On All Devices
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset All Devices
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Firmware
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Analytics</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Average Response Time</p>
                      <p className="text-2xl font-bold">1.2s</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold">94.5%</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Active Devices</p>
                      <p className="text-2xl font-bold">{deviceStats.online}/{deviceStats.total}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
