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

### Manual Positioning

Create an agent result card at specific coordinates:

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

### Auto-positioned Agent

Let the system automatically position the agent in the Task Management Zone:

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Auto-Positioned Analysis",
    "content": "# Risk Assessment\n\n## Risk Level: HIGH\n\n### Factors\n1. **Medication Interaction**\n   - Multiple hepatotoxic agents\n   - Monitoring gap identified\n\n2. **Clinical Symptoms**\n   - Worsening fatigue\n   - Timeline correlation\n\n### Probability: 75%\n\n### Actions Required\n- Urgent LFT panel\n- Hepatology referral"
  }' | jq
```

---

## 4. Create Todo List

### Manual Positioning

Create a todo list with multiple items at specific coordinates:

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

### Auto-positioned Todo

Let the system automatically position the todo in the Task Management Zone:

```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Auto-Positioned Tasks",
    "description": "System will find the best position",
    "todo_items": [
      {"text": "Medication adherence", "status": "done"},
      {"text": "Dietary modifications", "status": "in_progress"},
      {"text": "Exercise recommendations", "status": "todo"},
      {"text": "Warning signs to watch", "status": "todo"}
    ]
  }' | jq
```

---

## 6. Create Lab Result

### Manual Positioning

Create a lab result card with optimal status at specific coordinates:

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

### Auto-positioned Lab Results

Let the system automatically position lab results in the Task Management Zone:

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
    "trend": "up"
  }' | jq
```

Create critical lab result (auto-positioned):

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
    "trend": "up"
  }' | jq
```

**Note**: The `range.min` must be less than `range.max`. For critical values outside the normal range, set `min` to the lowest possible value and `max` to the highest possible value, then use `criticalMin` and `criticalMax` to define the critical thresholds.

---

## 7. Create EHR Data Item

### Auto-positioned EHR Data (Retrieved Data Zone)

Create EHR data items that are automatically positioned in the Retrieved Data Zone:

```bash
curl -X POST http://localhost:3001/api/ehr-data \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Patient Vitals - Emergency Department",
    "content": "BP: 140/90 mmHg, HR: 95 bpm, Temp: 38.2°C, SpO2: 96%",
    "dataType": "vitals",
    "source": "Nervecentre"
  }' | jq
```

Create clinical notes EHR data:

```bash
curl -X POST http://localhost:3001/api/ehr-data \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Discharge Summary",
    "content": "Patient admitted with chest pain. ECG normal. Troponin negative. Discharged with follow-up cardiology appointment.",
    "dataType": "clinical-notes",
    "source": "Medilogik"
  }' | jq
```

### Manual Positioning

Create EHR data with specific coordinates:

```bash
curl -X POST http://localhost:3001/api/ehr-data \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lab Results - Biochemistry",
    "content": "Na: 142 mmol/L, K: 4.1 mmol/L, Urea: 5.2 mmol/L, Creatinine: 85 μmol/L",
    "dataType": "laboratory",
    "source": "ICE",
    "x": 4300,
    "y": -4400,
    "width": 450,
    "height": 320
  }' | jq
```

**Note**: EHR data items without coordinates are automatically positioned in the Retrieved Data Zone (x: 4200-6200, y: -4600 to -2500) using the same intelligent grid layout as the Task Management Zone.

### Example: Complete EHR Data Workflow

```bash
# Create multiple EHR data items to see auto-positioning in action
echo "Creating EHR data items in Retrieved Data Zone..."

# Patient vitals from Nervecentre
curl -s -X POST http://localhost:3001/api/ehr-data \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Department Vitals",
    "content": "BP: 140/90 mmHg\nHR: 95 bpm\nTemp: 38.2°C\nSpO2: 96%\nRR: 22/min",
    "dataType": "vitals",
    "source": "Nervecentre"
  }' | jq '.id'

# Lab results from ICE
curl -s -X POST http://localhost:3001/api/ehr-data \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Biochemistry Panel",
    "content": "Sodium: 142 mmol/L (136-145)\nPotassium: 4.1 mmol/L (3.5-5.1)\nUrea: 5.2 mmol/L (2.5-7.5)\nCreatinine: 85 μmol/L (62-106)",
    "dataType": "laboratory",
    "source": "ICE"
  }' | jq '.id'

# Clinical notes from Medilogik
curl -s -X POST http://localhost:3001/api/ehr-data \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Discharge Summary",
    "content": "Patient presented with chest pain. ECG showed normal sinus rhythm. Troponin levels negative at 0, 6, and 12 hours. Stress test scheduled as outpatient. Discharged with cardiology follow-up in 2 weeks.",
    "dataType": "clinical-notes",
    "source": "Medilogik"
  }' | jq '.id'

echo "All EHR data items created and auto-positioned in Retrieved Data Zone!"
```

---

## 8. Focus on Item

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

## 8. Reset Server Cache

Force reload data from file (clears in-memory items):

```bash
curl -X POST http://localhost:3001/api/reset-cache | jq
```

---

## 9. Server-Sent Events (SSE)

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

## 10. Batch Operations

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

## 11. Query and Filter Items

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

## 12. Auto Positioning System

The system automatically positions API-created items (agents, todos, lab results) in the **Task Management Zone** when no coordinates are provided.

### Task Management Zone

- **Location**: x: 4200, y: 0
- **Size**: 2000px × 2100px
- **Grid Layout**: Intelligent grid positioning with collision detection
- **Item Spacing**: 60px padding, 560px column width, 490px row height

### How Auto Positioning Works

1. **Grid-based Layout**: Items are arranged in a grid pattern within the Task Management Zone
2. **Collision Detection**: System checks for existing items and finds the next available position
3. **Left-to-Right, Top-to-Bottom**: Fills positions systematically
4. **Overflow Handling**: If grid is full, items stack vertically in the first column

### Manual vs Auto Positioning

**Auto Positioning** (recommended):

```json
{
  "title": "My Item",
  "content": "Content here"
  // No x, y coordinates - system auto-positions
}
```

**Manual Positioning**:

```json
{
  "title": "My Item",
  "content": "Content here",
  "x": 1000,
  "y": 500
}
```

### Zone Configuration

The canvas is divided into zones defined in `src/data/zone-config.json`:

- **Adverse Events Zone**: x: 0, y: 0 (4000×2100px)
- **Raw EHR Data Zone**: x: 0, y: -4600 (4000×3000px)
- **Data Zone**: x: 0, y: -1300 (4000×1000px)
- **Task Management Zone**: x: 4200, y: 0 (2000×2100px) - API items auto-positioned here

---

## 13. Task Zone Management

### Clear Task Zone

Remove all API-created items from the Task Management Zone:

```bash
curl -X DELETE http://localhost:3001/api/task-zone | jq
```

This removes only API-created items (agents, todos, lab results) from the Task Management Zone, leaving other items untouched.

---

## 14. Complete Example Workflow

### Auto-Positioning Workflow

```bash
#!/bin/bash

# 1. Check server health
echo "=== Checking server health ==="
curl -s http://localhost:3001/api/health | jq

# 2. Clear Task Zone (optional - removes existing API items)
echo -e "\n=== Clearing Task Zone ==="
curl -s -X DELETE http://localhost:3001/api/task-zone | jq

# 3. Create auto-positioned items (no coordinates needed)
echo -e "\n=== Creating auto-positioned agent ==="
AGENT_ID=$(curl -s -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Patient Assessment",
    "content": "# Clinical Assessment\n\n## Key Findings\n- Patient showing improvement\n- Vital signs stable"
  }' | jq -r '.id')

echo "Created auto-positioned agent: $AGENT_ID"

echo -e "\n=== Creating auto-positioned todo ==="
TODO_ID=$(curl -s -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clinical Tasks",
    "description": "Auto-positioned in Task Zone",
    "todo_items": [
      "Review lab results",
      "Update care plan",
      "Schedule follow-up"
    ]
  }' | jq -r '.id')

echo "Created auto-positioned todo: $TODO_ID"

echo -e "\n=== Creating auto-positioned lab result ==="
LAB_ID=$(curl -s -X POST http://localhost:3001/api/lab-results \
  -H "Content-Type: application/json" \
  -d '{
    "parameter": "Hemoglobin",
    "value": 12.5,
    "unit": "g/dL",
    "status": "optimal",
    "range": {
      "min": 12,
      "max": 16
    },
    "trend": "stable"
  }' | jq -r '.id')

echo "Created auto-positioned lab result: $LAB_ID"

# 4. View all items in Task Zone
echo -e "\n=== Items in Task Management Zone ==="
curl -s http://localhost:3001/api/board-items | jq '[.[] | select(.x >= 4200 and .x < 6200 and .y >= 0 and .y < 2100) | {id, type, x, y, title: (.agentData.title // .todoData.title // .labResultData.parameter)}]'

# 5. Focus on the Task Management Zone
echo -e "\n=== Focusing on Task Zone ==="
curl -s -X POST http://localhost:3001/api/focus \
  -H "Content-Type: application/json" \
  -d "{\"itemId\":\"$AGENT_ID\"}" | jq

echo -e "\n=== Auto-positioning workflow complete ==="
```

Save this as `auto-workflow.sh`, make it executable with `chmod +x auto-workflow.sh`, and run with `./auto-workflow.sh`.

---

## 15. Auto Positioning Benefits

### Why Use Auto Positioning?

1. **Organized Layout**: Items are automatically arranged in a clean grid within their designated zones
2. **No Collision Issues**: System prevents overlapping items automatically
3. **Consistent Spacing**: Uniform gaps between items for better readability
4. **Scalable**: Works with any number of items - system handles overflow intelligently
5. **Zone-based Organization**: API items are grouped together in their dedicated zones (Task Management Zone for operational items, Retrieved Data Zone for EHR data)

### When to Use Manual Positioning

- **Specific Layout Requirements**: When you need items in exact locations
- **Integration with Existing Items**: When positioning relative to pre-existing canvas elements
- **Custom Workflows**: When building specialized layouts outside the standard zones

### Best Practices

- **Default to Auto Positioning**: Let the system handle positioning for most API calls
- **Use Manual Positioning Sparingly**: Only when you have specific layout requirements
- **Clear Task Zone Periodically**: Use `DELETE /api/task-zone` to reset the layout when needed
- **Monitor Zone Capacity**: The Task Zone can hold approximately 20 items in the standard grid

---

## Notes

- All POST requests require `Content-Type: application/json` header
- Use `jq` for pretty-printing JSON responses (install with `brew install jq` on macOS)
- The `-s` flag in curl makes it silent (no progress bar)
- The `-N` flag in curl disables buffering (needed for SSE)
- Item IDs are auto-generated in format: `item-{timestamp}-{random}`
- **Auto Positioning**: Omit `x` and `y` coordinates to use intelligent auto-positioning in designated zones
- **Manual Positioning**: Include `x` and `y` coordinates for specific placement
- **Task Zone**: API items (agents, todos, lab results) are automatically organized in the Task Management Zone (x: 4200-6200, y: 0-2100)
- **Retrieved Data Zone**: EHR data items are automatically organized in the Retrieved Data Zone (x: 4200-6200, y: -4600 to -2500)
- **Grid Layout**: Auto-positioned items use a 560px × 490px grid with 60px padding in both zones
- **Collision Detection**: System prevents overlapping items when auto-positioning
