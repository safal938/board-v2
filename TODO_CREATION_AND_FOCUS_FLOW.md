# TODO Creation and Focus Flow - Complete Technical Documentation

## 🎯 Overview
This document explains how TODOs (and other items like agents, lab results) are created via external agents, displayed on the canvas, saved to storage, and made focusable.

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL AGENT (agent-win-vm3)                       │
│                                                                               │
│  Python/Node.js script calls:                                               │
│  POST https://patientcanvas-ai.vercel.app/api/todos                         │
│                                                                               │
│  Body: {                                                                     │
│    "title": "Lab Work Review",                                              │
│    "description": "Review latest CBC results",                              │
│    "todo_items": ["Check WBC count", "Review RBC", "Check platelets"]      │
│  }                                                                           │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (server-redis.js)                            │
│                    https://patientcanvas-ai.vercel.app                      │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: POST /api/todos receives the request
────────────────────────────────────────────────────────────────────────────────
📍 Lines 369-435 in server-redis.js

1. Validates required fields (title, todo_items array)
2. Normalizes todo items format
3. Calculates dynamic height based on content
4. Generates unique ID: `item-${timestamp}-${random}`

Example ID: "item-1729172400000-x7k2p9"


Step 2: Auto-Positioning in Task Zone
────────────────────────────────────────────────────────────────────────────────
📍 Lines 110-191 in server-redis.js (findTaskZonePosition function)

Task Zone Boundaries:
  x: 4200
  y: 0
  width: 2000
  height: 2100

Grid System:
  - Column width: 560px (520px item + 40px spacing)
  - Row height: 490px (450px item + 40px spacing)
  - Padding: 60px from zone borders

Algorithm:
1. Load existing items from Redis/storage
2. Filter items in Task Zone (todos, agents, lab-results)
3. Create grid matrix to track occupied positions
4. Find first available position (left-to-right, top-to-bottom)
5. If grid full, stack vertically in first column

Output Example:
  itemX: 4260  (Task Zone x + padding)
  itemY: 60    (Task Zone y + row offset)


Step 3: Create TODO Item Object
────────────────────────────────────────────────────────────────────────────────
📍 Lines 410-424 in server-redis.js

const newItem = {
  id: "item-1729172400000-x7k2p9",
  type: 'todo',
  x: 4260,                    // ← From auto-positioning
  y: 60,                      // ← From auto-positioning
  width: 420,
  height: 285,                // ← Dynamic based on content
  content: 'Todo List',
  color: '#ffffff',
  rotation: 0,
  todoData: {
    title: "Lab Work Review",
    description: "Review latest CBC results",
    todos: [
      { text: "Check WBC count", status: "todo" },
      { text: "Review RBC", status: "todo" },
      { text: "Check platelets", status: "todo" }
    ]
  },
  createdAt: "2024-10-17T14:00:00.000Z",
  updatedAt: "2024-10-17T14:00:00.000Z"
}


Step 4: Save to Redis/Storage
────────────────────────────────────────────────────────────────────────────────
📍 Lines 426-431 in server-redis.js

1. Load current items from Redis
2. Append new item to array
3. Save updated array back to Redis
4. Key: 'board:items'
5. Format: JSON stringified array

Redis Storage:
  Key: "board:items"
  Value: "[{item1}, {item2}, ..., {newItem}]"


Step 5: Broadcast SSE Event (new-item)
────────────────────────────────────────────────────────────────────────────────
📍 Lines 433-434 in server-redis.js

broadcastSSE({
  event: 'new-item',
  item: newItem,
  timestamp: "2024-10-17T14:00:00.000Z",
  action: 'created'
});

SSE Message Format:
  event: new-item
  data: {"item":{...}, "timestamp":"...", "action":"created"}


Step 6: Return Response to Agent
────────────────────────────────────────────────────────────────────────────────
Response (201 Created):
{
  id: "item-1729172400000-x7k2p9",
  type: "todo",
  x: 4260,
  y: 60,
  ...todoData
}

Agent receives the item ID for future focus requests!

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (App.tsx + Canvas.tsx)                          │
│                    https://patientcanvas-ai.vercel.app                      │
└─────────────────────────────────────────────────────────────────────────────┘

Step 7: SSE Event Listener Receives new-item Event
────────────────────────────────────────────────────────────────────────────────
📍 Lines 322-341 in App.tsx

es.addEventListener('new-item', (event) => {
  const data = JSON.parse(event.data);
  const newItem = data.item;
  
  console.log('📦 New-item received:', newItem.id);
  console.log('📍 Backend positioned at:', newItem.x, newItem.y);
  
  // Add to state WITHOUT modifying coordinates
  setItems((prev) => {
    if (prev.some((it) => it.id === newItem.id)) return prev;
    return [...prev, newItem];
  });
});

State Update:
  Before: [item1, item2, ...]
  After:  [item1, item2, ..., newItem]


Step 8: React Re-renders Canvas with New Item
────────────────────────────────────────────────────────────────────────────────
📍 Canvas.tsx renders all items

<Canvas items={items} ... />
  ↓
items.map(item => {
  if (item.type === 'todo') {
    return <TodoItem
      key={item.id}
      data-item-id={item.id}
      style={{
        position: 'absolute',
        left: item.x,           // ← 4260px
        top: item.y,            // ← 60px
        width: item.width,      // ← 420px
        height: item.height     // ← 285px
      }}
      {...item.todoData}
    />
  }
})

✅ TODO is now visible on canvas at (4260, 60) in Task Zone!

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                        FOCUS FLOW (External Agent)                          │
└─────────────────────────────────────────────────────────────────────────────┘

Step 9: Agent Requests Focus on TODO
────────────────────────────────────────────────────────────────────────────────
Agent calls:
POST https://patientcanvas-ai.vercel.app/api/focus

Body: {
  "itemId": "item-1729172400000-x7k2p9",     // ← ID from Step 6
  "subElement": null,
  "focusOptions": {
    "zoom": 0.8,
    "highlight": false,
    "duration": 2000
  }
}


Step 10: Backend /api/focus Endpoint
────────────────────────────────────────────────────────────────────────────────
📍 Lines 822-851 in server-redis.js

1. Validates itemId is provided
2. Merges default focus options
3. Logs focus request: "🎯 Focus request: item-1729172400000-x7k2p9"
4. Prepares SSE payload:

const payload = {
  objectId: "item-1729172400000-x7k2p9",    // legacy field
  itemId: "item-1729172400000-x7k2p9",
  subElement: null,
  focusOptions: {
    zoom: 0.8,
    highlight: false,
    duration: 2000,
    scrollIntoView: true
  },
  timestamp: "2024-10-17T14:01:00.000Z"
};


Step 11: Broadcast SSE focus-item Event
────────────────────────────────────────────────────────────────────────────────
📍 Line 845 in server-redis.js

broadcastSSE({ event: 'focus-item', ...payload });

SSE Message:
  event: focus-item
  data: {"objectId":"...", "itemId":"...", "subElement":null, "focusOptions":{...}}


Step 12: Frontend Receives focus-item Event
────────────────────────────────────────────────────────────────────────────────
📍 Lines 296-318 in App.tsx

es.addEventListener('focus-item', (event) => {
  console.log('📨 RAW focus-item event received');
  console.log('📨 event.data:', event.data);
  
  const data = JSON.parse(event.data);
  console.log('🎯 PARSED focus-item:', data);
  
  handleFocusRequest({
    objectId: data.objectId || data.itemId,
    subElement: data.subElement,
    focusOptions: data.focusOptions
  });
  
  console.log('✅ handleFocusRequest called');
});


Step 13: handleFocusRequest Processes Focus
────────────────────────────────────────────────────────────────────────────────
📍 Lines 198-254 in App.tsx

handleFocusRequest(request) {
  console.log('🎯🎯🎯 handleFocusRequest ENTRY POINT');
  console.log('📋 Total items:', items.length);
  console.log('📋 Available items:', items.map(i => i.id));
  
  const targetId = request.objectId || request.itemId;
  console.log('🔍 Looking for:', targetId);
  
  const item = items.find(i => i.id === targetId);
  
  if (item) {
    console.log('✅✅✅ Item FOUND!');
    console.log('✅ Item details:', { x: item.x, y: item.y });
    
    // Select the item
    focusOnItem(targetId);
    
    // Get options
    const zoom = request.focusOptions?.zoom || 0.8;
    const duration = request.focusOptions?.duration || 3000;
    
    console.log('🔍 Checking window.centerOnItem:', typeof window.centerOnItem);
    
    // Call global centerOnItem function
    if (window.centerOnItem) {
      console.log('🚀🚀🚀 Calling centerOnItem:', { targetId, zoom, duration });
      window.centerOnItem(targetId, zoom, duration);
      console.log('✅ centerOnItem completed');
    } else {
      console.error('❌ centerOnItem not available');
    }
  } else {
    console.error('❌❌❌ Item NOT FOUND:', targetId);
  }
}


Step 14: window.centerOnItem Animates Canvas
────────────────────────────────────────────────────────────────────────────────
📍 Canvas.tsx (centerOnItem function exposed globally)

window.centerOnItem = (itemId, targetZoom = 0.8, duration = 3000) => {
  console.log('🎯 centerOnItem CALLED:', { itemId, targetZoom, duration });
  
  const item = items.find(i => i.id === itemId);
  if (!item) {
    console.error('❌ Item not found for centering:', itemId);
    return;
  }
  
  console.log('✅ Found item:', item);
  
  // Calculate center position
  const itemCenterX = item.x + item.width / 2;
  const itemCenterY = item.y + item.height / 2;
  
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  
  const newOffsetX = viewportCenterX - itemCenterX * targetZoom;
  const newOffsetY = viewportCenterY - itemCenterY * targetZoom;
  
  console.log('📊 Animation params:', {
    itemCenter: { x: itemCenterX, y: itemCenterY },
    targetOffset: { x: newOffsetX, y: newOffsetY },
    targetZoom
  });
  
  // Animate pan and zoom
  console.log('🎬 Starting focus animation...');
  
  animatePanAndZoom(
    newOffsetX,
    newOffsetY,
    targetZoom,
    duration
  );
  
  console.log('✅ Animation started');
};

animatePanAndZoom() {
  // Smooth CSS transition animation
  // Updates canvas transform: translate(x, y) scale(zoom)
  // Canvas smoothly moves and zooms to show the TODO centered
}

✅ Canvas moves to center the TODO item with smooth animation!

═══════════════════════════════════════════════════════════════════════════════

## 🔍 Key Points for Your Question

### How is TODO updated to canvas?
1. **Backend creates TODO** → Saves to Redis → Broadcasts SSE `new-item` event
2. **Frontend SSE listener** → Receives event → Updates React state
3. **React re-renders** → Canvas component displays TODO at backend-provided coordinates
4. **TODO appears** at Task Zone position (4200-6200, 0-2100 area)

### How is it saved to be focused on?
1. **Saved to Redis** with unique ID: `item-${timestamp}-${random}`
2. **ID returned to agent** in API response
3. **Agent stores ID** for future focus requests
4. **Focus request** uses stored ID → Backend broadcasts focus event
5. **Frontend finds item** in state by ID → Centers viewport on item
6. **Global function** `window.centerOnItem` handles animation

---

## 🎯 Console Logs You Should See

### When TODO is Created:
```
Backend (server-redis.js):
  🎯 Finding position in Task Management Zone for todo item
  📊 Found 3 existing API items in Task Zone
  ✅ Found available position: row 0, col 1 at (4820, 60)
  📍 Auto-positioned TODO item in Task Zone at (4820, 60)
  💾 Saved 15 items to Redis

Frontend (App.tsx):
  📦 New-item event received via SSE: {item: {...}}
  📍 Item positioned by backend at (4820, 60)
```

### When Focus is Requested:
```
Backend (server-redis.js):
  🎯 Focus request: item-1729172400000-x7k2p9

Frontend (App.tsx):
  📨 RAW focus-item event received
  🎯 PARSED focus-item event data: {...}
  🎯🎯🎯 handleFocusRequest ENTRY POINT called
  ✅✅✅ Item FOUND! Focusing: item-1729172400000-x7k2p9
  🚀🚀🚀 Calling centerOnItem

Frontend (Canvas.tsx):
  🎯 centerOnItem CALLED: {itemId: "...", targetZoom: 0.8}
  ✅ Found item: {x: 4820, y: 60, ...}
  🎬 Starting focus animation...
  ✅ Animation started
```

---

## 🚀 Testing the Flow

### 1. Create a TODO:
```bash
curl -X POST https://patientcanvas-ai.vercel.app/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test TODO",
    "description": "Testing the flow",
    "todo_items": ["Task 1", "Task 2", "Task 3"]
  }'
```

### 2. Get the ID from response:
```json
{
  "id": "item-1729172400000-x7k2p9",
  "type": "todo",
  ...
}
```

### 3. Focus on it:
```bash
curl -X POST https://patientcanvas-ai.vercel.app/api/focus \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "item-1729172400000-x7k2p9"
  }'
```

### 4. Watch the canvas center on the TODO! 🎯

---

## 📝 Summary

| Step | Action | Component | Result |
|------|--------|-----------|--------|
| 1 | Agent POSTs to `/api/todos` | Backend API | Validates request |
| 2 | Auto-position in Task Zone | Backend (findTaskZonePosition) | Assigns (x, y) coordinates |
| 3 | Create item object | Backend | Full TODO object with data |
| 4 | Save to Redis | Backend (saveBoardItems) | Persisted storage |
| 5 | Broadcast SSE `new-item` | Backend (broadcastSSE) | Real-time notification |
| 6 | Return item with ID | Backend API | Agent gets item ID |
| 7 | SSE listener receives event | Frontend (App.tsx) | Event captured |
| 8 | Update React state | Frontend (setItems) | State has new item |
| 9 | React re-renders Canvas | Frontend (Canvas.tsx) | TODO visible on canvas |
| 10 | Agent POSTs to `/api/focus` | Backend API | Focus request |
| 11 | Broadcast SSE `focus-item` | Backend (broadcastSSE) | Focus event sent |
| 12 | SSE listener receives event | Frontend (App.tsx) | Focus event captured |
| 13 | handleFocusRequest finds item | Frontend (App.tsx) | Item located in state |
| 14 | window.centerOnItem animates | Frontend (Canvas.tsx) | Canvas centers on TODO ✅ |

The magic is in the **SSE real-time communication** + **Redis persistence** + **React state management** + **Global focus function**! 🎉
