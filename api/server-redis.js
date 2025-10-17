// Vercel-compatible server with Redis KV storage
// This version persists all data to Redis for permanent storage
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Redis client setup
let redisClient = null;
let redisConnected = false;

const getRedisClient = async () => {
  if (redisClient && redisConnected) {
    return redisClient;
  }

  try {
    if (!process.env.REDIS_URL) {
      console.log('⚠️  No REDIS_URL found, using in-memory storage');
      return null;
    }

    redisClient = createClient({ 
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('❌ Redis reconnection failed after 3 attempts');
            return new Error('Redis connection failed');
          }
          return retries * 100;
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      redisConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    redisConnected = false;
    return null;
  }
};

// Simple in-memory list of SSE clients
const sseClients = new Set();

// Helper function to broadcast SSE messages
const broadcastSSE = (message) => {
  const eventType = message.event || 'new-item';
  const data = { ...message };
  delete data.event; // Remove event from data payload
  
  for (const client of sseClients) {
    try {
      client.write(`event: ${eventType}\n`);
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (_) {}
  }
};

// SSE endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (res.flushHeaders) res.flushHeaders();

  res.write('event: connected\n');
  res.write('data: "ok"\n\n');

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\n`);
      res.write(`data: ${Date.now()}\n\n`);
    } catch (_) {}
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    try { res.end(); } catch (_) {}
  });
});

// Task Management Zone boundaries
const TASK_ZONE = {
  x: 4200,
  y: 0,
  width: 2000,
  height: 2100,
};

// Find position within Task Management Zone with proper spacing
const findTaskZonePosition = (newItem, existingItems) => {
  const padding = 60; // Space between items and zone border (increased for better spacing)
  const rowHeight = 490; // Standard row height for items (450px + 40px spacing)
  const colWidth = 560; // Standard column width for items (520px item + 40px spacing)

  // Filter existing items to only those in the Task Management Zone
  const taskZoneItems = existingItems.filter(
    (item) =>
      item.x >= TASK_ZONE.x &&
      item.x < TASK_ZONE.x + TASK_ZONE.width &&
      item.y >= TASK_ZONE.y &&
      item.y < TASK_ZONE.y + TASK_ZONE.height &&
      (item.type === "agent" ||
        item.type === "todo" ||
        item.type === "lab-result")
  );

  console.log(
    `🎯 Finding position in Task Management Zone for ${newItem.type} item`
  );
  console.log(
    `📊 Found ${taskZoneItems.length} existing API items in Task Zone`
  );

  // Calculate grid positions
  const maxCols = Math.floor(TASK_ZONE.width / colWidth);
  const maxRows = Math.floor(TASK_ZONE.height / rowHeight);

  console.log(
    `📐 Grid capacity: ${maxCols} columns × ${maxRows} rows = ${
      maxCols * maxRows
    } positions`
  );

  // Create a grid to track occupied positions
  const grid = Array(maxRows)
    .fill(null)
    .map(() => Array(maxCols).fill(false));

  // Mark occupied positions
  taskZoneItems.forEach((item) => {
    const col = Math.floor((item.x - TASK_ZONE.x) / colWidth);
    const row = Math.floor((item.y - TASK_ZONE.y - 60) / rowHeight); // Adjust for starting Y offset

    if (row >= 0 && row < maxRows && col >= 0 && col < maxCols) {
      grid[row][col] = true;
      console.log(`🔒 Position occupied: row ${row}, col ${col} by ${item.id}`);
    }
  });

  // Find first available position (left to right, top to bottom)
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      if (!grid[row][col]) {
        const x = TASK_ZONE.x + col * colWidth + padding;
        const y = TASK_ZONE.y + row * rowHeight + 60; // Start at 60px from top of zone

        console.log(
          `✅ Found available position: row ${row}, col ${col} at (${x}, ${y})`
        );
        return { x, y };
      }
    }
  }

  // If no grid position available, stack vertically in first column
  const x = TASK_ZONE.x + padding;
  const y = TASK_ZONE.y + 60 + taskZoneItems.length * (rowHeight + padding);

  console.log(`⚠️  Grid full, stacking vertically at (${x}, ${y})`);
  return { x, y };
};

// Load board items from Redis or source data
const loadBoardItems = async () => {
  try {
    const redis = await getRedisClient();
    
    if (redis && redisConnected) {
      // Try to get from Redis first
      const cachedData = await redis.get('board:items');
      if (cachedData) {
        console.log('📦 Loaded items from Redis');
        return JSON.parse(cachedData);
      }
    }

    // Fall back to source data file
    console.log('📂 Loading from source data file...');
    const sourceDataPath = path.join(__dirname, '..', 'src', 'data', 'boardItems.json');
    const sourceData = await fs.readFile(sourceDataPath, 'utf8');
    const items = JSON.parse(sourceData);
    
    // Save to Redis for future use
    if (redis && redisConnected) {
      await redis.set('board:items', JSON.stringify(items));
      console.log('💾 Cached items to Redis');
    }
    
    return items;
  } catch (error) {
    console.error('Error loading board items:', error);
    return [];
  }
};

// Save board items to Redis
const saveBoardItems = async (items) => {
  try {
    const redis = await getRedisClient();
    if (redis && redisConnected) {
      await redis.set('board:items', JSON.stringify(items));
      console.log(`💾 Saved ${items.length} items to Redis`);
      return true;
    } else {
      console.log('⚠️  Redis not available, items will not persist');
      return false;
    }
  } catch (error) {
    console.error('Error saving board items:', error);
    return false;
  }
};

// GET /api/board-items - Get all board items
app.get('/api/board-items', async (req, res) => {
  try {
    const items = await loadBoardItems();
    res.json(items);
  } catch (error) {
    console.error('Error loading board items:', error);
    res.status(500).json({ error: 'Failed to load board items' });
  }
});

// POST /api/board-items - Create a new board item
app.post('/api/board-items', async (req, res) => {
  try {
    const { type, componentType, x, y, width, height, content, color, rotation, ehrData } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let defaultWidth, defaultHeight, defaultColor, defaultContent;
    
    if (type === 'component') {
      switch (componentType) {
        case 'PatientContext':
          defaultWidth = 1600;
          defaultHeight = 300;
          break;
        case 'EncounterTimeline':
          defaultWidth = 1600;
          defaultHeight = 400;
          break;
        case 'AdverseEventAnalytics':
          defaultWidth = 1600;
          defaultHeight = 500;
          break;
        case 'LabTable':
        case 'LabChart':
        case 'DifferentialDiagnosis':
          defaultWidth = 520;
          defaultHeight = 400;
          break;
        default:
          defaultWidth = 600;
          defaultHeight = 400;
      }
      defaultColor = '#ffffff';
      defaultContent = content || {};
    } else {
      defaultWidth = type === 'text' ? 200 : type === 'ehr' ? 550 : 150;
      defaultHeight = type === 'text' ? 100 : type === 'ehr' ? 450 : 150;
      defaultColor = type === 'sticky' ? '#ffeb3b' : type === 'ehr' ? '#e8f5e8' : '#2196f3';
      defaultContent = type === 'text' ? 'Double click to edit' : type === 'ehr' ? 'EHR Data' : '';
    }
    
    const newItem = {
      id,
      type,
      componentType: componentType || undefined,
      x: x || Math.random() * 8000 + 100,
      y: y || Math.random() * 7000 + 100,
      width: width || defaultWidth,
      height: height || defaultHeight,
      content: content || defaultContent,
      color: color || defaultColor,
      rotation: rotation || 0,
      ehrData: type === 'ehr' ? (ehrData || {}) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const items = await loadBoardItems();
    items.push(newItem);
    await saveBoardItems(items);
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating board item:', error);
    res.status(500).json({ error: 'Failed to create board item' });
  }
});

// POST /api/todos - Create a todo (saved to Redis)
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description, todo_items } = req.body || {};

    if (!title || !Array.isArray(todo_items)) {
      return res.status(400).json({
        error: 'title (string) and todo_items (array) are required'
      });
    }

    const todos = todo_items.map((t) => {
      if (typeof t === 'string') return { text: t, status: 'todo' };
      if (t && typeof t.text === 'string') return { text: t.text, status: t.status || 'todo' };
      return { text: String(t), status: 'todo' };
    });

    const calculateTodoHeight = (todos, description) => {
      const baseHeight = 80;
      const itemHeight = 35;
      const descriptionHeight = description ? 20 : 0;
      const padding = 20;
      const totalItems = todos.length;
      const contentHeight = baseHeight + (totalItems * itemHeight) + descriptionHeight + padding;
      return Math.min(Math.max(contentHeight, 200), 600);
    };

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const dynamicHeight = calculateTodoHeight(todos, description);

    // Load existing items for positioning BEFORE creating the item
    const existingItems = await loadBoardItems();
    console.log(`🔍 Loaded ${existingItems.length} existing items for positioning`);

    // Determine position - use Task Zone if no coordinates provided
    let itemX, itemY;
    if (req.body.x !== undefined && req.body.y !== undefined) {
      // Manual positioning - use provided coordinates
      itemX = req.body.x;
      itemY = req.body.y;
      console.log(`📍 Using provided coordinates for TODO item at (${itemX}, ${itemY})`);
    } else {
      // Auto-positioning - use Task Zone
      const tempItem = { type: "todo", width: 420, height: dynamicHeight };
      const taskPosition = findTaskZonePosition(tempItem, existingItems);
      itemX = taskPosition.x;
      itemY = taskPosition.y;
      console.log(`📍 Auto-positioned TODO item in Task Zone at (${itemX}, ${itemY})`);
    }
    
    const newItem = {
      id,
      type: 'todo',
      x: itemX,
      y: itemY,
      width: 420,
      height: dynamicHeight,
      content: 'Todo List',
      color: '#ffffff',
      rotation: 0,
      todoData: {
        title,
        description: description || '',
        todos,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    const saved = await saveBoardItems(items);

    if (!saved) {
      console.warn('⚠️  Todo created but not persisted to Redis');
    }

    // Broadcast via SSE
    const payload = { event: 'new-item', item: newItem, timestamp: new Date().toISOString(), action: 'created' };
    broadcastSSE(payload);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating todo item:', error);
    res.status(500).json({ error: 'Failed to create todo item' });
  }
});

// POST /api/enhanced-todo - Create enhanced todo with agent delegation
app.post('/api/enhanced-todo', async (req, res) => {
  try {
    const { 
      title, 
      description,
      todos,
      x, 
      y, 
      width = 450, 
      height = 'auto',
      color = '#ffffff',
      dataSource = 'Manual Entry'
    } = req.body;

    // Validate required fields
    if (!title || !todos || !Array.isArray(todos)) {
      return res.status(400).json({
        error: 'title and todos array are required'
      });
    }

    // Validate and generate IDs for todo items
    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      
      if (!todo.text || !todo.status || !todo.agent) {
        return res.status(400).json({
          error: 'Each main todo item must have text, status, and agent fields'
        });
      }
      if (!['pending', 'executing', 'finished'].includes(todo.status)) {
        return res.status(400).json({
          error: 'Todo status must be one of: pending, executing, finished'
        });
      }
      
      // Generate unique task ID if not provided
      if (!todo.id) {
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${i}`;
        todo.id = taskId;
        console.log(`🔧 Generated task ID: ${taskId} for task: ${todo.text}`);
      } else {
        console.log(`✅ Using provided task ID: ${todo.id} for task: ${todo.text}`);
      }
      
      // Ensure the ID is set in the todos array
      todos[i] = todo;
      
      // Validate sub-todos if they exist
      if (todo.subTodos && Array.isArray(todo.subTodos)) {
        for (const subTodo of todo.subTodos) {
          if (!subTodo.text || !subTodo.status) {
            return res.status(400).json({
              error: 'Each sub-todo item must have text and status fields'
            });
          }
          if (!['pending', 'executing', 'finished'].includes(subTodo.status)) {
            return res.status(400).json({
              error: 'Sub-todo status must be one of: pending, executing, finished'
            });
          }
        }
      }
    }

    // Generate unique ID
    const id = `enhanced-todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Load existing items for positioning BEFORE creating the item
    const existingItems = await loadBoardItems();
    console.log(`🔍 Loaded ${existingItems.length} existing items for positioning`);

    // Determine position - use Task Zone if no coordinates provided
    let itemX, itemY;
    if (x !== undefined && y !== undefined) {
      // Manual positioning - use provided coordinates
      itemX = x;
      itemY = y;
      console.log(`📍 Using provided coordinates for ENHANCED TODO item at (${itemX}, ${itemY})`);
    } else {
      // Auto-positioning - use Task Zone
      const tempItem = { type: "todo", width: width, height: 400 };
      const taskPosition = findTaskZonePosition(tempItem, existingItems);
      itemX = taskPosition.x;
      itemY = taskPosition.y;
      console.log(`📍 Auto-positioned ENHANCED TODO item in Task Zone at (${itemX}, ${itemY})`);
    }

    // Create the new enhanced todo item
    const newItem = {
      id,
      type: 'todo',
      x: itemX,
      y: itemY,
      width,
      height,
      color,
      description: description || title,
      todoData: {
        title,
        description: description || '',
        todos
      },
      rotation: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`📍 Positioned new enhanced todo at (${newItem.x}, ${newItem.y})`);

    // Save to board items
    const updatedItems = [...existingItems, newItem];
    const saved = await saveBoardItems(updatedItems);

    if (!saved) {
      console.warn('⚠️  Enhanced todo created but not persisted to Redis');
    }

    // Broadcast to all connected clients
    broadcastSSE({ 
      event: 'new-item', 
      item: newItem, 
      timestamp: new Date().toISOString(), 
      action: 'created' 
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating enhanced todo:', error);
    res.status(500).json({ error: 'Failed to create enhanced todo' });
  }
});

// POST /api/agents - Create agent result
app.post('/api/agents', async (req, res) => {
  try {
    const { title, content } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        error: 'title (string) and content (string) are required'
      });
    }

    const calculateHeight = (content) => {
      const baseHeight = 80;
      const lineHeight = 20;
      const maxWidth = 520;
      const estimatedLines = Math.ceil(content.length / (maxWidth / 12));
      const contentHeight = Math.max(estimatedLines * lineHeight, 100);
      return Math.min(baseHeight + contentHeight, 800);
    };

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const dynamicHeight = calculateHeight(content);

    // Load existing items for positioning BEFORE creating the item
    const existingItems = await loadBoardItems();
    console.log(`🔍 Loaded ${existingItems.length} existing items for positioning`);

    // Determine position - use Task Zone if no coordinates provided
    let itemX, itemY;
    if (req.body.x !== undefined && req.body.y !== undefined) {
      // Manual positioning - use provided coordinates
      itemX = req.body.x;
      itemY = req.body.y;
      console.log(`📍 Using provided coordinates for AGENT item at (${itemX}, ${itemY})`);
    } else {
      // Auto-positioning - use Task Zone
      const tempItem = { type: "agent", width: 520, height: dynamicHeight };
      const taskPosition = findTaskZonePosition(tempItem, existingItems);
      itemX = taskPosition.x;
      itemY = taskPosition.y;
      console.log(`📍 Auto-positioned AGENT item in Task Zone at (${itemX}, ${itemY})`);
    }
    
    const newItem = {
      id,
      type: 'agent',
      x: itemX,
      y: itemY,
      width: 520,
      height: dynamicHeight,
      content: content,
      color: '#ffffff',
      rotation: 0,
      agentData: {
        title,
        markdown: content,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    await saveBoardItems(items);

    const payload = { event: 'new-item', item: newItem, timestamp: new Date().toISOString(), action: 'created' };
    broadcastSSE(payload);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating agent item:', error);
    res.status(500).json({ error: 'Failed to create agent item' });
  }
});

// POST /api/lab-results - Create lab result
app.post('/api/lab-results', async (req, res) => {
  try {
    const { parameter, value, unit, status, range, trend } = req.body || {};

    if (!parameter || !value || !unit || !status || !range) {
      return res.status(400).json({
        error: 'parameter, value, unit, status, and range are required'
      });
    }

    const validStatuses = ['optimal', 'warning', 'critical'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'status must be one of: optimal, warning, critical'
      });
    }

    if (!range.min || !range.max || range.min >= range.max) {
      return res.status(400).json({
        error: 'range must have valid min and max values where min < max'
      });
    }

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Load existing items for positioning BEFORE creating the item
    const existingItems = await loadBoardItems();
    console.log(`🔍 Loaded ${existingItems.length} existing items for positioning`);

    // Determine position - use Task Zone if no coordinates provided
    let itemX, itemY;
    if (req.body.x !== undefined && req.body.y !== undefined) {
      // Manual positioning - use provided coordinates
      itemX = req.body.x;
      itemY = req.body.y;
      console.log(`📍 Using provided coordinates for LAB RESULT item at (${itemX}, ${itemY})`);
    } else {
      // Auto-positioning - use Task Zone
      const tempItem = { type: "lab-result", width: 400, height: 280 };
      const taskPosition = findTaskZonePosition(tempItem, existingItems);
      itemX = taskPosition.x;
      itemY = taskPosition.y;
      console.log(`📍 Auto-positioned LAB RESULT item in Task Zone at (${itemX}, ${itemY})`);
    }
    
    const newItem = {
      id,
      type: 'lab-result',
      x: itemX,
      y: itemY,
      width: 400,
      height: 280,
      content: parameter,
      color: '#ffffff',
      rotation: 0,
      labResultData: {
        parameter,
        value,
        unit,
        status,
        range,
        trend: trend || 'stable',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    await saveBoardItems(items);

    broadcastSSE({ event: 'new-item', item: newItem, timestamp: new Date().toISOString(), action: 'created' });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating lab result:', error);
    res.status(500).json({ error: 'Failed to create lab result' });
  }
});

// PUT /api/board-items/:id - Update a board item
app.put('/api/board-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const items = await loadBoardItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Board item not found' });
    }
    
    items[itemIndex] = {
      ...items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await saveBoardItems(items);
    
    res.json(items[itemIndex]);
  } catch (error) {
    console.error('Error updating board item:', error);
    res.status(500).json({ error: 'Failed to update board item' });
  }
});

// DELETE /api/board-items/:id - Delete a board item
app.delete('/api/board-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const items = await loadBoardItems();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return res.status(404).json({ error: 'Board item not found' });
    }
    
    await saveBoardItems(filteredItems);
    
    res.json({ message: 'Board item deleted successfully' });
  } catch (error) {
    console.error('Error deleting board item:', error);
    res.status(500).json({ error: 'Failed to delete board item' });
  }
});

// POST /api/components - Create dashboard component
app.post('/api/components', async (req, res) => {
  try {
    const { componentType, x, y, width, height, props } = req.body;

    if (!componentType) {
      return res.status(400).json({ error: 'componentType is required' });
    }

    let defaultWidth, defaultHeight;
    switch (componentType) {
      case 'PatientContext':
        defaultWidth = 1600;
        defaultHeight = 300;
        break;
      case 'EncounterTimeline':
        defaultWidth = 1600;
        defaultHeight = 400;
        break;
      case 'AdverseEventAnalytics':
        defaultWidth = 1600;
        defaultHeight = 500;
        break;
      case 'LabTable':
      case 'LabChart':
      case 'DifferentialDiagnosis':
        defaultWidth = 520;
        defaultHeight = 400;
        break;
      default:
        defaultWidth = 600;
        defaultHeight = 400;
    }

    const id = `dashboard-item-${componentType.toLowerCase()}-${Date.now()}`;
    
    const newItem = {
      id,
      type: 'component',
      componentType,
      x: x || Math.random() * 8000 + 100,
      y: y || Math.random() * 7000 + 100,
      width: width || defaultWidth,
      height: height || defaultHeight,
      content: {
        title: componentType,
        props: props || {}
      },
      color: '#ffffff',
      rotation: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    await saveBoardItems(items);

    broadcastSSE({ event: 'new-item', item: newItem, timestamp: new Date().toISOString(), action: 'created' });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ error: 'Failed to create component' });
  }
});

// POST /api/focus - Focus item (enhanced with sub-element support)
app.post('/api/focus', (req, res) => {
  const { objectId, itemId, subElement, focusOptions } = req.body;
  
  // Support both objectId (legacy) and itemId (new)
  const targetId = itemId || objectId;
  
  if (!targetId) {
    return res.status(400).json({ error: 'objectId or itemId is required' });
  }
  
  // Default options - higher zoom for sub-elements
  const defaultOptions = {
    zoom: subElement ? 1.5 : 0.8,
    highlight: !!subElement,
    duration: 2000,
    scrollIntoView: true
  };
  
  const options = { ...defaultOptions, ...(focusOptions || {}) };
  
  console.log(`🎯 Focus request: ${targetId}${subElement ? `#${subElement}` : ''}`);
  
  const payload = { 
    objectId: targetId, // Keep legacy field for compatibility
    itemId: targetId,
    subElement: subElement || null,
    focusOptions: options,
    timestamp: new Date().toISOString() 
  };
  
  broadcastSSE({ event: 'focus', ...payload });
  
  res.json({ 
    success: true, 
    message: `Focus event broadcasted`,
    itemId: targetId,
    subElement: subElement || null,
    focusOptions: options
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Canvas Board API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      boardItems: '/api/board-items',
      events: '/api/events (SSE)',
      joinMeeting: '/api/join-meeting'
    },
    documentation: 'https://github.com/your-repo/board-v4-working'
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  const redis = await getRedisClient();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    storage: redisConnected ? 'redis' : 'fallback',
    redis: redisConnected ? 'connected' : 'disconnected'
  });
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);
  });
}