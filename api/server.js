const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// SSE endpoint to push focus events to the frontend
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // Allow CORS for SSE explicitly if proxying is not used
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Flush headers immediately
  if (res.flushHeaders) res.flushHeaders();

  // Initial event to confirm connection
  res.write("event: connected\n");
  res.write('data: "ok"\n\n');

  sseClients.add(res);

  // Keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\n`);
      res.write(`data: ${Date.now()}\n\n`);
    } catch (_) {
      // Ignore write errors, cleanup will remove the client
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    try {
      res.end();
    } catch (_) {}
  });
});

// Data file path - store outside src/ to avoid triggering React HMR
const DATA_FILE = path.join(__dirname, "data", "boardItems.json");

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Load board items from file
const loadBoardItems = async () => {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.log("No existing data file, using default data");
    return [
      {
        id: "ehr-item-1",
        type: "ehr",
        x: 3200,
        y: 3200,
        width: 550,
        height: 450,
        content: "EHR Data",
        color: "#e8f5e8",
        rotation: 0,
        ehrData: {
          encounter_id: "enc_2025_03_18_rheum_001",
          source_system: "OracleHealth EHR",
          patient: {
            id: "pt_000392",
            mrn: "MRN-7342291",
            name: "John McAllister",
            dob: "1972-06-22",
            age: 52,
            sex: "Female",
          },
          encounter_metadata: {
            date: "2025-03-18",
            time: "10:30",
            type: "Outpatient",
            clinic: "Rheumatology Clinic A",
            location: "Summit Medical Center, 4F",
            clinician: "Dr. Elizabeth Hayes",
            specialty: "Rheumatology",
            visit_reason:
              "RA disease activity reassessment and methotrexate monitoring",
          },
        },
      },
    ];
  }
};

// Save board items to file
const saveBoardItems = async (items) => {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2));
    console.log(`💾 Saved ${items.length} items to file`);
    return true;
  } catch (error) {
    console.error("Error saving board items:", error);
    throw error;
  }
};

// Collision detection function
const checkCollision = (item1, item2) => {
  // Two rectangles overlap if they don't satisfy any of these conditions:
  // 1. item1 is completely to the left of item2
  // 2. item1 is completely to the right of item2
  // 3. item1 is completely above item2
  // 4. item1 is completely below item2

  const noCollision =
    item1.x + item1.width <= item2.x || // item1 is completely to the left
    item2.x + item2.width <= item1.x || // item1 is completely to the right
    item1.y + item1.height <= item2.y || // item1 is completely above
    item2.y + item2.height <= item1.y; // item1 is completely below

  const hasCollision = !noCollision;

  if (hasCollision) {
    console.log(
      `💥 Collision detected: Item1(${item1.x},${item1.y},${item1.width},${item1.height}) vs Item2(${item2.x},${item2.y},${item2.width},${item2.height})`
    );
  }

  return hasCollision;
};

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

// Legacy collision detection for non-API items - Find non-overlapping position for new item
const findNonOverlappingPosition = (newItem, existingItems) => {
  const padding = 20; // Minimum gap between items
  const maxAttempts = 50; // Prevent infinite loops
  let attempts = 0;

  // Start with the original position
  let testX = newItem.x;
  let testY = newItem.y;

  // If no position specified, start at a random location
  if (!newItem.x || !newItem.y) {
    testX = Math.random() * 8000 + 100;
    testY = Math.random() * 7000 + 100;
  }

  console.log(
    `🔍 Checking collision for new item at (${testX}, ${testY}) with ${existingItems.length} existing items`
  );

  // Log all existing items for debugging
  existingItems.forEach((item, index) => {
    console.log(
      `  Existing item ${index}: ${item.id} at (${item.x}, ${item.y}) size (${item.width}, ${item.height})`
    );
  });

  while (attempts < maxAttempts) {
    let hasCollision = false;
    let collidingItem = null;

    // Check collision with all existing items
    for (const existingItem of existingItems) {
      const testItem = {
        x: testX,
        y: testY,
        width: newItem.width,
        height: newItem.height,
      };

      if (checkCollision(testItem, existingItem)) {
        console.log(
          `⚠️  Collision detected with existing item ${existingItem.id} at (${existingItem.x}, ${existingItem.y})`
        );
        hasCollision = true;
        collidingItem = existingItem;
        break;
      }
    }

    // If no collision found, use this position
    if (!hasCollision) {
      console.log(`✅ No collision found, using position (${testX}, ${testY})`);
      return { x: testX, y: testY };
    }

    // Move to next position (below existing items)
    // Strategy: Find the bottom-most item and place below it
    let maxBottom = 0;
    for (const existingItem of existingItems) {
      const bottom = existingItem.y + existingItem.height;
      if (bottom > maxBottom) {
        maxBottom = bottom;
      }
    }

    // Place below the bottom-most item with padding
    testY = maxBottom + padding;

    console.log(
      `📍 Moving to position below bottom-most item: (${testX}, ${testY})`
    );

    // If we're too far down, try a new random X position
    if (testY > 8000) {
      testX = Math.random() * 8000 + 100;
      testY = Math.random() * 7000 + 100;
      console.log(
        `🔄 Canvas too crowded, trying new random position: (${testX}, ${testY})`
      );
    }

    attempts++;
  }

  // If we couldn't find a non-overlapping position, use the last calculated position
  console.log(
    `⚠️  Could not find non-overlapping position after ${attempts} attempts, using fallback position (${testX}, ${testY})`
  );
  return { x: testX, y: testY };
};

// Helper function to update height in source data file
const updateSourceDataHeight = async (itemId, newHeight) => {
  try {
    const sourceDataPath = path.join(
      __dirname,
      "..",
      "src",
      "data",
      "boardItems.json"
    );
    const sourceData = await fs.readFile(sourceDataPath, "utf8");
    const sourceItems = JSON.parse(sourceData);

    const itemIndex = sourceItems.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      sourceItems[itemIndex].height = newHeight;
      await fs.writeFile(sourceDataPath, JSON.stringify(sourceItems, null, 2));
      console.log(
        `📏 Updated height for item ${itemId} in source data: ${newHeight}px`
      );
    }
  } catch (error) {
    console.log("Could not update source data height:", error.message);
  }
};

// GET /api/board-items - Get all board items (merged from both sources)
app.get("/api/board-items", async (req, res) => {
  try {
    // Load items from backend storage
    const backendItems = await loadBoardItems();

    // Load items from source data
    const sourceDataPath = path.join(
      __dirname,
      "..",
      "src",
      "data",
      "boardItems.json"
    );
    let sourceItems = [];
    try {
      const sourceData = await fs.readFile(sourceDataPath, "utf8");
      sourceItems = JSON.parse(sourceData);
    } catch (error) {
      console.log("Source data not found, using only backend items");
    }

    // Merge items, avoiding duplicates by ID
    const sourceIds = new Set(sourceItems.map((item) => item.id));
    const uniqueBackendItems = backendItems.filter(
      (item) => !sourceIds.has(item.id)
    );
    const mergedItems = [...sourceItems, ...uniqueBackendItems];

    console.log(
      `📊 Merged board items: ${sourceItems.length} source + ${uniqueBackendItems.length} unique backend = ${mergedItems.length} total`
    );

    res.json(mergedItems);
  } catch (error) {
    console.error("Error loading board items:", error);
    res.status(500).json({ error: "Failed to load board items" });
  }
});

// POST /api/board-items - Create a new board item
app.post("/api/board-items", async (req, res) => {
  try {
    const {
      type,
      componentType,
      x,
      y,
      width,
      height,
      content,
      color,
      rotation,
      ehrData,
    } = req.body;

    // Validate required fields
    if (!type) {
      return res.status(400).json({ error: "Type is required" });
    }

    // Generate unique ID
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Set default values based on type
    let defaultWidth, defaultHeight, defaultColor, defaultContent;

    if (type === "component") {
      // Component-specific defaults
      switch (componentType) {
        case "PatientContext":
          defaultWidth = 1600;
          defaultHeight = 300;
          break;
        case "EncounterTimeline":
          defaultWidth = 1600;
          defaultHeight = 400;
          break;
        case "AdverseEventAnalytics":
          defaultWidth = 1600;
          defaultHeight = 500;
          break;
        case "LabTable":
        case "LabChart":
        case "DifferentialDiagnosis":
          defaultWidth = 520;
          defaultHeight = 400;
          break;
        default:
          defaultWidth = 600;
          defaultHeight = 400;
      }
      defaultColor = "#ffffff";
      defaultContent = content || {};
    } else {
      // Legacy item types
      defaultWidth = type === "text" ? 200 : type === "ehr" ? 550 : 150;
      defaultHeight = type === "text" ? 100 : type === "ehr" ? 450 : 150;
      defaultColor =
        type === "sticky" ? "#ffeb3b" : type === "ehr" ? "#e8f5e8" : "#2196f3";
      defaultContent =
        type === "text"
          ? "Double click to edit"
          : type === "ehr"
          ? "EHR Data"
          : "";
    }

    // Create new board item
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
      ehrData: type === "ehr" ? ehrData || {} : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Load existing items and add new one
    const existingItems = await loadBoardItems();
    const updatedItems = [...existingItems, newItem];

    // Save updated items
    await saveBoardItems(updatedItems);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating board item:", error);
    res.status(500).json({ error: "Failed to create board item" });
  }
});

// PUT /api/board-items/:id - Update a board item
app.put("/api/board-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const items = await loadBoardItems();
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Board item not found" });
    }

    // Update the item
    items[itemIndex] = {
      ...items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveBoardItems(items);

    // If height was updated, also update the source data file
    if (updates.height !== undefined) {
      await updateSourceDataHeight(id, updates.height);
    }

    res.json(items[itemIndex]);
  } catch (error) {
    console.error("Error updating board item:", error);
    res.status(500).json({ error: "Failed to update board item" });
  }
});

// DELETE /api/board-items/:id - Delete a board item
app.delete("/api/board-items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const items = await loadBoardItems();
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === items.length) {
      return res.status(404).json({ error: "Board item not found" });
    }

    await saveBoardItems(filteredItems);

    res.json({ message: "Board item deleted successfully" });
  } catch (error) {
    console.error("Error deleting board item:", error);
    res.status(500).json({ error: "Failed to delete board item" });
  }
});

// POST /api/todos - Create a new TODO board item
app.post("/api/todos", async (req, res) => {
  try {
    const { title, description, todo_items } = req.body || {};

    if (!title || !Array.isArray(todo_items)) {
      return res.status(400).json({
        error: "title (string) and todo_items (array) are required",
      });
    }

    // Normalize todo items: accept strings or { text, status }
    const normalizeStatus = (s) =>
      ["todo", "in_progress", "done"].includes((s || "").toLowerCase())
        ? s.toLowerCase()
        : "todo";
    const todos = todo_items.map((t) => {
      if (typeof t === "string") return { text: t, status: "todo" };
      if (t && typeof t.text === "string")
        return { text: t.text, status: normalizeStatus(t.status) };
      return { text: String(t), status: "todo" };
    });

    // Calculate dynamic height based on todo items
    const calculateTodoHeight = (todos, description) => {
      const baseHeight = 80; // Header + padding
      const itemHeight = 35; // Height per todo item
      const descriptionHeight = description ? 20 : 0; // Extra height for description
      const padding = 20; // Bottom padding

      const totalItems = todos.length;
      const contentHeight =
        baseHeight + totalItems * itemHeight + descriptionHeight + padding;

      return Math.min(Math.max(contentHeight, 200), 600); // Min 200px, max 600px
    };

    // Build item
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const dynamicHeight = calculateTodoHeight(todos, description);

    // Load existing items for positioning BEFORE creating the item
    const existingItems = await loadBoardItems();
    console.log(
      `🔍 Loaded ${existingItems.length} existing items for positioning`
    );

    // Determine position - use Task Zone if no coordinates provided
    let itemX, itemY;
    if (req.body.x !== undefined && req.body.y !== undefined) {
      // Manual positioning - use provided coordinates
      itemX = req.body.x;
      itemY = req.body.y;
      console.log(
        `📍 Using provided coordinates for TODO item at (${itemX}, ${itemY})`
      );
    } else {
      // Auto-positioning - use Task Zone
      const tempItem = { type: "todo", width: 420, height: dynamicHeight };
      const taskPosition = findTaskZonePosition(tempItem, existingItems);
      itemX = taskPosition.x;
      itemY = taskPosition.y;
      console.log(
        `📍 Auto-positioned TODO item in Task Zone at (${itemX}, ${itemY})`
      );
    }

    const newItem = {
      id,
      type: "todo",
      x: itemX,
      y: itemY,
      width: 420,
      height: dynamicHeight,
      content: "Todo List",
      color: "#ffffff",
      rotation: 0,
      todoData: {
        title,
        description: description || "",
        todos,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist
    const items = [...existingItems, newItem];
    await saveBoardItems(items);

    // Notify live clients via SSE (new-item)
    const payload = {
      event: 'new-item',
      item: newItem,
      timestamp: new Date().toISOString(),
      action: "created",
    };
    broadcastSSE(payload);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating todo item:", error);
    res.status(500).json({ error: "Failed to create todo item" });
  }
});

// POST /api/agents - Create a new agent result item
app.post("/api/agents", async (req, res) => {
  try {
    const { title, content } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        error: "title (string) and content (string) are required",
      });
    }

    // Calculate dynamic height based on content
    const calculateHeight = (content) => {
      const baseHeight = 80; // Header + padding
      const lineHeight = 20; // Approximate line height
      const maxWidth = 520; // Container width

      // Estimate lines based on content length and width
      const estimatedLines = Math.ceil(content.length / (maxWidth / 12)); // 12px char width
      const contentHeight = Math.max(estimatedLines * lineHeight, 100); // Minimum 100px

      return Math.min(baseHeight + contentHeight, 800); // Cap at 800px
    };

    // Build item
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const dynamicHeight = calculateHeight(content);

    // Load existing items for positioning BEFORE creating the item
    const existingItems = await loadBoardItems();
    console.log(
      `🔍 Loaded ${existingItems.length} existing items for positioning`
    );

    // Determine position - use Task Zone if no coordinates provided
    let itemX, itemY;
    if (req.body.x !== undefined && req.body.y !== undefined) {
      // Manual positioning - use provided coordinates
      itemX = req.body.x;
      itemY = req.body.y;
      console.log(
        `📍 Using provided coordinates for AGENT item at (${itemX}, ${itemY})`
      );
    } else {
      // Auto-positioning - use Task Zone
      const tempItem = { type: "agent", width: 520, height: dynamicHeight };
      const taskPosition = findTaskZonePosition(tempItem, existingItems);
      itemX = taskPosition.x;
      itemY = taskPosition.y;
      console.log(
        `📍 Auto-positioned AGENT item in Task Zone at (${itemX}, ${itemY})`
      );
    }

    const newItem = {
      id,
      type: "agent",
      x: itemX,
      y: itemY,
      width: 520,
      height: dynamicHeight,
      content: content,
      color: "#ffffff",
      rotation: 0,
      agentData: {
        title,
        markdown: content,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist
    const items = [...existingItems, newItem];
    await saveBoardItems(items);

    // Notify live clients via SSE (new-item)
    const payload = {
      event: 'new-item',
      item: newItem,
      timestamp: new Date().toISOString(),
      action: "created",
    };
    broadcastSSE(payload);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating agent item:", error);
    res.status(500).json({ error: "Failed to create agent item" });
  }
});

// POST /api/lab-results - Create a new lab result board item
app.post("/api/lab-results", async (req, res) => {
  try {
    const { parameter, value, unit, status, range, trend } = req.body || {};

    if (!parameter || !value || !unit || !status || !range) {
      return res.status(400).json({
        error: "parameter, value, unit, status, and range are required",
      });
    }

    // Validate status
    const validStatuses = ["optimal", "warning", "critical"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "status must be one of: optimal, warning, critical",
      });
    }

    // Validate range
    if (!range.min || !range.max || range.min >= range.max) {
      return res.status(400).json({
        error: "range must have valid min and max values where min < max",
      });
    }

    // Build item
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Load existing items for positioning BEFORE creating the item
    const existingItems = await loadBoardItems();
    console.log(
      `🔍 Loaded ${existingItems.length} existing items for positioning`
    );

    // Determine position - use Task Zone if no coordinates provided
    let itemX, itemY;
    if (req.body.x !== undefined && req.body.y !== undefined) {
      // Manual positioning - use provided coordinates
      itemX = req.body.x;
      itemY = req.body.y;
      console.log(
        `📍 Using provided coordinates for LAB RESULT item at (${itemX}, ${itemY})`
      );
    } else {
      // Auto-positioning - use Task Zone
      const tempItem = { type: "lab-result", width: 400, height: 280 };
      const taskPosition = findTaskZonePosition(tempItem, existingItems);
      itemX = taskPosition.x;
      itemY = taskPosition.y;
      console.log(
        `📍 Auto-positioned LAB RESULT item in Task Zone at (${itemX}, ${itemY})`
      );
    }

    const newItem = {
      id,
      type: "lab-result",
      x: itemX,
      y: itemY,
      width: 400,
      height: 280,
      content: parameter,
      color: "#ffffff",
      rotation: 0,
      labResultData: {
        parameter,
        value,
        unit,
        status,
        range,
        trend: trend || "stable",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist
    const items = [...existingItems, newItem];
    await saveBoardItems(items);

    // Notify live clients via SSE (new-item)
    const sseMessage = {
      type: "new-item",
      item: newItem,
    };
    broadcastSSE(sseMessage);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating lab result:", error);
    res.status(500).json({ error: "Failed to create lab result" });
  }
});

// POST /api/components - Create a new dashboard component
app.post("/api/components", async (req, res) => {
  try {
    const { componentType, x, y, width, height, props } = req.body;

    if (!componentType) {
      return res.status(400).json({
        error: "componentType is required",
      });
    }

    // Set default dimensions based on component type
    let defaultWidth, defaultHeight;
    switch (componentType) {
      case "PatientContext":
        defaultWidth = 1600;
        defaultHeight = 300;
        break;
      case "EncounterTimeline":
        defaultWidth = 1600;
        defaultHeight = 400;
        break;
      case "AdverseEventAnalytics":
        defaultWidth = 1600;
        defaultHeight = 500;
        break;
      case "LabTable":
      case "LabChart":
      case "DifferentialDiagnosis":
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
      type: "component",
      componentType,
      x: x || Math.random() * 8000 + 100,
      y: y || Math.random() * 7000 + 100,
      width: width || defaultWidth,
      height: height || defaultHeight,
      content: {
        title: componentType,
        props: props || {},
      },
      color: "#ffffff",
      rotation: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Load existing items for collision detection
    const existingItems = await loadBoardItems();
    console.log(
      `🔍 Loaded ${existingItems.length} existing items for collision detection`
    );

    // Find non-overlapping position
    const finalPosition = findNonOverlappingPosition(newItem, existingItems);
    newItem.x = finalPosition.x;
    newItem.y = finalPosition.y;

    console.log(
      `📍 Positioned new ${componentType} component at (${newItem.x}, ${newItem.y})`
    );

    // Persist
    const items = [...existingItems, newItem];
    await saveBoardItems(items);

    // Notify live clients via SSE
    const payload = {
      event: 'new-item',
      item: newItem,
      timestamp: new Date().toISOString(),
      action: "created",
    };
    broadcastSSE(payload);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating component:", error);
    res.status(500).json({ error: "Failed to create component" });
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
    await saveBoardItems(updatedItems);

    // Broadcast to all connected clients
    const payload = {
      event: 'new-item',
      item: newItem,
      timestamp: new Date().toISOString(),
      action: "created",
    };
    broadcastSSE(payload);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating enhanced todo:', error);
    res.status(500).json({ error: 'Failed to create enhanced todo' });
  }
});

// POST /api/focus - Focus on a specific canvas item (enhanced with sub-element support)
app.post("/api/focus", (req, res) => {
  const { objectId, itemId, subElement, focusOptions } = req.body;
  
  // Support both objectId (legacy) and itemId (new)
  const targetId = itemId || objectId;

  if (!targetId) {
    return res.status(400).json({
      error: "objectId or itemId is required",
    });
  }

  // Default options - higher zoom for sub-elements
  const defaultOptions = {
    zoom: subElement ? 1.5 : 1.2,
    highlight: !!subElement,
    duration: subElement ? 800 : 600,
    scrollIntoView: true
  };
  
  const options = { ...defaultOptions, ...(focusOptions || {}) };

  console.log(`🎯 Focus request: ${targetId}${subElement ? `#${subElement}` : ''}`);

  // Broadcast focus event to all connected SSE clients
  const payload = { 
    event: 'focus',
    objectId: targetId, // Keep legacy field for compatibility
    itemId: targetId,
    subElement: subElement || null,
    focusOptions: options,
    timestamp: new Date().toISOString() 
  };
  
  broadcastSSE(payload);

  // Return success
  res.json({
    success: true,
    message: `Focus event broadcasted`,
    itemId: targetId,
    subElement: subElement || null,
    focusOptions: options
  });
});

// POST /api/reset-cache - Force reload data from file
app.post("/api/reset-cache", async (req, res) => {
  try {
    // Simply reload from file - this clears any in-memory items
    const items = await loadBoardItems();
    console.log(`🔄 Cache reset: loaded ${items.length} items from file`);

    res.json({
      success: true,
      message: `Cache reset successfully. Loaded ${items.length} items from file.`,
      itemCount: items.length,
    });
  } catch (error) {
    console.error("Error resetting cache:", error);
    res.status(500).json({ error: "Failed to reset cache" });
  }
});

// DELETE /api/task-zone - Clear all API items from Task Management Zone
app.delete("/api/task-zone", async (req, res) => {
  try {
    const items = await loadBoardItems();

    // Filter out items in Task Management Zone that are API-created
    const filteredItems = items.filter((item) => {
      const inTaskZone =
        item.x >= TASK_ZONE.x &&
        item.x < TASK_ZONE.x + TASK_ZONE.width &&
        item.y >= TASK_ZONE.y &&
        item.y < TASK_ZONE.y + TASK_ZONE.height;

      const isApiItem =
        item.type === "agent" ||
        item.type === "todo" ||
        item.type === "lab-result";

      // Keep items that are NOT in task zone OR NOT api items
      return !(inTaskZone && isApiItem);
    });

    const removedCount = items.length - filteredItems.length;

    await saveBoardItems(filteredItems);

    console.log(
      `🧹 Cleared ${removedCount} API items from Task Management Zone`
    );

    res.json({
      success: true,
      message: `Cleared ${removedCount} API items from Task Management Zone`,
      removedCount,
      remainingCount: filteredItems.length,
    });
  } catch (error) {
    console.error("Error clearing task zone:", error);
    res.status(500).json({ error: "Failed to clear task zone" });
  }
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    storage: 'file-based',
    redis: 'not configured'
  });
});

// Export for Vercel serverless
module.exports = app;

// Start server (only in local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);
  });
}
