# Canvas API Commands

Complete guide for interacting with the Canvas API using curl commands.

## Base URL

```bash
BASE_URL="http://localhost:3001"
```

---

## 1. Health Check

Check if the server is running:

```bash
curl -s http://localhost:3001/api/health | jq
```

---

## 2. Get All Board Items

Retrieve all items on the canvas:

```bash
curl -s http://localhost:3001/api/board-items | jq
```

Get just the count:

```bash
curl -s http://localhost:3001/api/board-items | jq 'length'
```

Get item types:

```bash
curl -s http://localhost:3001/api/board-items | jq 'map(.type) | unique'
```

---

## 3. Enhanced TODO System

### Create Enhanced TODO with Agent Delegation

Create a complex TODO with AI agent assignment and hierarchical sub-tasks:

```bash
curl -X POST http://localhost:3001/api/enhanced-todo \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Patient Care Coordination Tasks",
    "description": "Critical tasks for patient care coordination with AI agent delegation",
    "todos": [
      {
        "text": "Review patient'\''s latest lab results and identify any critical values",
        "status": "executing",
        "agent": "Lab Analysis Agent"
      },
      {
        "id": "custom-task-001",
        "text": "Generate medication reconciliation report",
        "status": "pending",
        "agent": "Medication Management Agent",
        "subTodos": [
          {
            "text": "Review current medications",
            "status": "finished"
          },
          {
            "text": "Check for drug interactions",
            "status": "executing"
          },
          {
            "text": "Generate final report",
            "status": "pending"
          }
        ]
      },
      {
        "text": "Schedule follow-up appointment",
        "status": "finished",
        "agent": "Scheduling Agent"
      }
    ],
    "x": 1000,
    "y": 100
  }'
```

### Auto-positioned Enhanced TODO

Let the system automatically position the TODO in the Task Management Zone:

```bash
curl -X POST http://localhost:3001/api/enhanced-todo \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Auto-Positioned Tasks",
    "description": "System will find the best position",
    "todos": [
      {
        "text": "Auto-positioned task",
        "status": "pending",
        "agent": "Auto Agent"
      }
    ]
  }'
```

---

## 4. Precision Focus System

### Basic Focus on Item

Focus on a specific canvas item:

```bash
curl -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "dashboard-item-1759853783245-patient-context"
  }'
```

### Sub-Element Focus with Custom Options

Focus on a specific element within a component with custom zoom and highlighting:

```bash
curl -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "dashboard-item-1759853783245-patient-context",
    "subElement": "medication-timeline",
    "focusOptions": {
      "zoom": 1.8,
      "duration": 1200,
      "highlight": true
    }
  }'
```

### Focus on Lab Result

Focus on a specific lab result element:

```bash
curl -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "dashboard-item-lab-table",
    "subElement": "lab-result-hemoglobin",
    "focusOptions": {
      "zoom": 2.0,
      "duration": 1000,
      "highlight": true
    }
  }'
```

---

## 5. Create Agent Item

Create an agent result card at viewport center:

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Patient Assessment",
    "content": "# Clinical Assessment\n\n## Key Findings\n- Patient shows improvement\n- Vital signs stable\n- Continue current treatment\n\n## Recommendations\n- Follow-up in 2 weeks\n- Monitor lab results",
    "x": 400,
    "y": 300
  }' | jq
```

Create agent with markdown formatting:

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Risk Analysis",
    "content": "# Risk Assessment\n\n## Risk Level: HIGH\n\n### Factors\n1. **Medication Interaction**\n   - Multiple hepatotoxic agents\n   - Monitoring gap identified\n\n2. **Clinical Symptoms**\n   - Worsening fatigue\n   - Timeline correlation\n\n### Probability: 75%\n\n### Actions Required\n- Urgent LFT panel\n- Hepatology referral",
    "x": 950,
    "y": 300
  }' | jq
```

---

## 4. Create Todo List

Create a todo list with multiple items:

```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clinical Action Items",
    "description": "Urgent tasks for patient Sarah Miller",
    "todo_items": [
      "Order comprehensive LFT panel",
      "Check Hepatitis serologies",
      "Review medication adherence",
      "Schedule hepatology consult",
      "Follow-up in 2 weeks"
    ],
    "x": 1500,
    "y": 300
  }' | jq
```

Create todo with status tracking:

```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Patient Education",
    "description": "Topics to discuss with patient",
    "todo_items": [
      {"text": "Medication adherence", "status": "done"},
      {"text": "Dietary modifications", "status": "in_progress"},
      {"text": "Exercise recommendations", "status": "todo"},
      {"text": "Warning signs to watch", "status": "todo"}
    ],
    "x": 400,
    "y": 800
  }' | jq
```

---

## 5. Create Lab Result

Create a lab result card with optimal status:

```bash
curl -X POST http://localhost:3001/api/lab-results \
  -H "Content-Type: application/json" \
  -d '{
    "parameter": "Fasting Glucose",
    "value": 95,
    "unit": "mg/dL",
    "status": "optimal",
    "range": {
      "min": 70,
      "max": 100,
      "warningMin": 100,
      "warningMax": 125
    },
    "trend": "stable",
    "x": 400,
    "y": 1200
  }' | jq
```

Create lab result with warning status:

```bash
curl -X POST http://localhost:3001/api/lab-results \
  -H "Content-Type: application/json" \
  -d '{
    "parameter": "C-Reactive Protein (CRP)",
    "value": 28,
    "unit": "mg/L",
    "status": "warning",
    "range": {
      "min": 0,
      "max": 10,
      "warningMin": 3,
      "warningMax": 10
    },
    "trend": "up",
    "x": 850,
    "y": 1200
  }' | jq
```

Create lab result with critical status:

```bash
curl -X POST http://localhost:3001/api/lab-results \
  -H "Content-Type: application/json" \
  -d '{
    "parameter": "ALT (Liver Enzyme)",
    "value": 150,
    "unit": "U/L",
    "status": "critical",
    "range": {
      "min": 7,
      "max": 200,
      "criticalMin": 7,
      "criticalMax": 56
    },
    "trend": "up",
    "x": 1300,
    "y": 1200
  }' | jq
```

**Note**: The `range.min` must be less than `range.max`. For critical values outside the normal range, set `min` to the lowest possible value and `max` to the highest possible value, then use `criticalMin` and `criticalMax` to define the critical thresholds.

---

## 6. Focus on Item

Focus the canvas viewport on a specific item:

```bash
# Replace ITEM_ID with actual item ID
curl -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d '{
    "objectId": "agent-patient-profile-001"
  }' | jq
```

Focus on a specific zone within a dashboard:

```bash
curl -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d '{
    "objectId": "adverse-event-dashboard-1",
    "subComponent": "lab-findings-zone"
  }' | jq
```

Available zones:

- `patient-context-zone`
- `encounter-timeline-zone`
- `adverse-events-zone`
- `lab-findings-zone`
- `lab-trends-zone`
- `differential-diagnosis-zone`

---

## 7. Reset Server Cache

Force reload data from file (clears in-memory items):

```bash
curl -X POST http://localhost:3001/api/reset-cache | jq
```

---

## 8. Server-Sent Events (SSE)

Listen for real-time events:

```bash
curl -N http://localhost:3001/api/events
```

This will show:

- `connected` - Initial connection
- `ping` - Heartbeat every 25 seconds
- `new-item` - When items are created
- `focus-item` - When focus requests are made

---

## 9. Batch Operations

Create multiple items at once:

```bash
# Create agent
AGENT_ID=$(curl -s -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{"title":"Patient Profile","content":"# Sarah Miller\n\nAge: 43\nDiagnosis: RA","x":400,"y":200}' \
  | jq -r '.id')

echo "Created agent: $AGENT_ID"

# Create todo
TODO_ID=$(curl -s -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Tasks","description":"Clinical tasks","todo_items":["Task 1","Task 2"],"x":950,"y":200}' \
  | jq -r '.id')

echo "Created todo: $TODO_ID"

# Create lab result
LAB_ID=$(curl -s -X POST http://localhost:3001/api/lab-results \
  -H "Content-Type: application/json" \
  -d '{"parameter":"CRP","value":28,"unit":"mg/L","status":"warning","range":{"min":0,"max":10},"x":1500,"y":200}' \
  | jq -r '.id')

echo "Created lab: $LAB_ID"

# Focus on the agent
curl -s -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d "{\"objectId\":\"$AGENT_ID\"}" | jq
```

---

## 10. Query and Filter Items

Get only agent items:

```bash
curl -s http://localhost:3001/api/board-items | jq '[.[] | select(.type == "agent")]'
```

Get only todo items:

```bash
curl -s http://localhost:3001/api/board-items | jq '[.[] | select(.type == "todo")]'
```

Get only lab results:

```bash
curl -s http://localhost:3001/api/board-items | jq '[.[] | select(.type == "lab-result")]'
```

Get items with specific status:

```bash
curl -s http://localhost:3001/api/board-items | jq '[.[] | select(.labResultData.status == "critical")]'
```

Count items by type:

```bash
curl -s http://localhost:3001/api/board-items | jq 'group_by(.type) | map({type: .[0].type, count: length})'
```

---

## 11. Coordinate System

The canvas uses a world coordinate system:

- **Origin**: Top-left (0, 0)
- **X-axis**: Increases to the right
- **Y-axis**: Increases downward
- **Typical viewport**: 1920x1080 pixels
- **Canvas space**: 8000x7000 pixels (default)

### Positioning Tips:

**Top-left quadrant**:

```json
{ "x": 100, "y": 100 }
```

**Center of viewport** (assuming 1920x1080):

```json
{ "x": 960, "y": 540 }
```

**Spread items horizontally**:

```json
{"x": 400, "y": 200}   // Item 1
{"x": 950, "y": 200}   // Item 2
{"x": 1500, "y": 200}  // Item 3
```

**Spread items vertically**:

```json
{"x": 400, "y": 200}   // Item 1
{"x": 400, "y": 700}   // Item 2
{"x": 400, "y": 1200}  // Item 3
```

---

## 12. Complete Example Workflow

```bash
#!/bin/bash

# 1. Check server health
echo "=== Checking server health ==="
curl -s http://localhost:3001/api/health | jq

# 2. Reset cache to load fresh data
echo -e "\n=== Resetting cache ==="
curl -s -X POST http://localhost:3001/api/reset-cache | jq

# 3. Get current items
echo -e "\n=== Current items ==="
curl -s http://localhost:3001/api/board-items | jq 'map({id, type, title: (.agentData.title // .todoData.title // .labResultData.parameter)})'

# 4. Create new agent
echo -e "\n=== Creating agent ==="
AGENT_ID=$(curl -s -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Assessment",
    "content": "# Clinical Notes\n\nPatient showing improvement.",
    "x": 2000,
    "y": 500
  }' | jq -r '.id')

echo "Created agent: $AGENT_ID"

# 5. Focus on the new agent
echo -e "\n=== Focusing on agent ==="
curl -s -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d "{\"objectId\":\"$AGENT_ID\"}" | jq

echo -e "\n=== Done ==="
```

Save this as `workflow.sh`, make it executable with `chmod +x workflow.sh`, and run with `./workflow.sh`.

---

## Notes

- All POST requests require `Content-Type: application/json` header
- Use `jq` for pretty-printing JSON responses (install with `brew install jq` on macOS)
- The `-s` flag in curl makes it silent (no progress bar)
- The `-N` flag in curl disables buffering (needed for SSE)
- Item IDs are auto-generated in format: `item-{timestamp}-{random}`
- Coordinates (x, y) are optional - server will use random positions if not provided
