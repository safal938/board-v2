# Quick Test Guide - Focus System in Board-v2

## Prerequisites
Make sure both servers are running:

```powershell
# Terminal 1: Backend Server
cd d:\Office_work\EASL\demofinal\board-v2
node api/server-redis.js

# Terminal 2: Frontend
cd d:\Office_work\EASL\demofinal\board-v2
npm start
```

## Automated Test

Run the automated test script:

```powershell
node test-focus-system.js
```

This will:
1. ✅ Create a test TODO
2. ✅ Send a focus request to the API
3. ✅ Verify the TODO was created
4. 📺 Watch your browser animate to the TODO!

## Manual Tests

### Test 1: Focus on Existing Item

1. Open http://localhost:3000
2. Note the ID of any canvas item (check browser console or hover over items)
3. Send focus request:

```powershell
curl -X POST http://localhost:3001/api/focus `
  -H "Content-Type: application/json" `
  -d '{\"objectId\": \"YOUR-ITEM-ID\"}'
```

**Expected Result**: Canvas smoothly animates to center on that item

### Test 2: Create TODO and Auto-Focus

```powershell
# Create TODO
curl -X POST http://localhost:3001/api/board-items `
  -H "Content-Type: application/json" `
  -d '{
    \"type\": \"todo\",
    \"todoData\": {
      \"title\": \"My New Task List\",
      \"description\": \"Testing focus\",
      \"todos\": [
        {\"text\": \"Task 1\", \"status\": \"todo\"},
        {\"text\": \"Task 2\", \"status\": \"in_progress\"}
      ]
    }
  }'
```

Note the returned `id`, then focus:

```powershell
curl -X POST http://localhost:3001/api/focus `
  -H "Content-Type: application/json" `
  -d '{\"objectId\": \"THE-TODO-ID\"}'
```

**Expected Result**: Canvas animates to the newly created TODO

### Test 3: Custom Zoom and Duration

```powershell
curl -X POST http://localhost:3001/api/focus `
  -H "Content-Type: application/json" `
  -d '{
    \"objectId\": \"YOUR-ITEM-ID\",
    \"focusOptions\": {
      \"zoom\": 1.5,
      \"duration\": 4000
    }
  }'
```

**Expected Result**: Slower animation (4 seconds) with higher zoom (1.5x)

## What to Watch For

### In Browser Console
Look for these logs:

```
🎯 Focus-item event received via SSE: {...}
✅ Item found, focusing: item-id todo
🚀 Calling centerOnItem with: item-id zoom: 1.2 duration: 2000
```

### In Canvas
- Canvas zooms out smoothly
- Pans to center on the target item
- Zooms back in to final zoom level
- Item gets selection border (blue outline)

### In Backend Console
```
🎯 Focus request: item-id
```

## Troubleshooting

### Focus doesn't work
1. **Check SSE connection**: Look for "✅ SSE Connected" in browser console
2. **Verify item exists**: Check if item ID is valid in `/api/board-items`
3. **Check window.centerOnItem**: Should be defined globally

```javascript
// In browser console
window.centerOnItem
// Should return: function(itemId, finalZoom, duration) {...}
```

### Canvas doesn't animate
1. **Verify canvas is initialized**: Canvas component should be mounted
2. **Check viewport state**: Canvas should be interactive (not frozen)
3. **Try zooming manually**: If manual zoom works, focus should too

### Item not found error
- Wait a moment after creating items (SSE propagation delay)
- Verify item was actually created: `GET /api/board-items`
- Check that frontend received `new-item` SSE event

## Success Criteria

✅ Focus API returns `{ success: true }`  
✅ Browser console shows "Focus-item event received"  
✅ Canvas animates smoothly (3-step: zoom out → pan → zoom in)  
✅ Target item is selected (blue border)  
✅ Works for all item types (todo, agent, lab-result, etc.)  

## Next Steps

Once basic focus works:

1. **Test with voice agent**: Configure voice agent to call focus API
2. **Test sub-element focus**: Add data-focus-id to TODO tasks
3. **Test multi-client**: Open two browser windows, focus in one should affect both
4. **Port enhanced TODOs**: Add sub-todos, agent delegation, task IDs from cameraman

## Documentation

- Full details: [FOCUS_SYSTEM_PORTED.md](./FOCUS_SYSTEM_PORTED.md)
- API reference: See README.md → API Reference → Focus Endpoint
- Cameraman comparison: See FOCUS_SYSTEM_ANALYSIS.md (if available)

---

**Happy Testing! 🎉**
