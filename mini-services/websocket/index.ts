import { Server } from 'socket.io';
import http from 'http';

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store connected users per dashboard
const dashboardRooms = new Map<string, Set<string>>();

// Mock data for KPIs
const mockKPIs = new Map([
  { id: 'kpi-1', name: 'Revenue', value: 285000, previousValue: 256000, trend: 11.1, color: '#10B981' },
  { id: 'kpi-2', name: 'Users', value: 12847, previousValue: 11234, trend: 14.4, color: '#3B82F6' },
  { id: 'kpi-3', name: 'Conversion', value: 3.42, previousValue: 2.89, trend: 18.3, color: '#8B5CF6' },
]);

// Simulate KPI updates
function simulateKPIUpdates() {
  setInterval(() => {
    mockKPIs.forEach((kpi) => {
      // Random value change
      const change = (Math.random() - 0.5) * 0.1;
      kpi.value = Math.max(0, kpi.value * (1 + change));
      kpi.trend = change * 100;
      
      // Broadcast to all connected clients
      io.emit('kpi:updated', {
        id: kpi.id,
        value: kpi.value,
        trend: kpi.trend,
        timestamp: new Date()
      });
    });
  }, 5000); // Update every 5 seconds
}

console.log(`[WS] WebSocket server running on port ${PORT}`);

console.log(`[WS] Test at http://localhost:${PORT}/health`);

// Health check
http.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    connectedClients: io.engine.clientsCount
  });
});

// Stats endpoint
http.get('/stats', (req, res) => {
  res.json({
    connectedClients: io.engine.clientsCount,
    dashboardRooms: Array.from(dashboardRooms.keys())
  });
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  
  socket.on('dashboard:join', (dashboardId: string) => {
    socket.join(`dashboard:${dashboardId}`);
    
    if (!dashboardRooms.has(dashboardId)) {
      dashboardRooms.set(dashboardId, new Set());
    }
    dashboardRooms.get(dashboardId)?.add(socket.id);
    
    // Send current KPIs
    socket.emit('kpis:state', Array.from(mockKPIs.values()));
    
    console.log(`[WS] Client joined dashboard ${dashboardId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
    dashboardRooms.forEach((sockets) => {
      sockets.delete(socket.id);
    });
  });
  
  socket.on('kpi:update', (data: { id: string; value: number }) => {
    const kpi = mockKPIs.get(data.id);
    if (kpi) {
      kpi.value = data.value;
      io.emit('kpi:updated', {
        id: data.id,
        value: data.value,
        timestamp: new Date()
      });
    }
  });
});

// Start simulation
simulateKPIUpdates();
