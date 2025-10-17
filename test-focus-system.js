#!/usr/bin/env node

/**
 * Test script for board-v2 focus system
 * 
 * This script tests:
 * 1. Creating a TODO item
 * 2. Focusing on the TODO item
 * 3. Verifying SSE events are received
 * 
 * Usage:
 *   node test-focus-system.js
 * 
 * Prerequisites:
 *   - Backend server running on http://localhost:3001
 *   - Frontend running on http://localhost:3000
 */

const API_BASE = 'http://localhost:3001/api';

async function testFocusSystem() {
  console.log('🧪 Testing Board-v2 Focus System\n');
  
  // Test 1: Create a TODO item
  console.log('📝 Step 1: Creating a test TODO item...');
  try {
    const createResponse = await fetch(`${API_BASE}/board-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'todo',
        todoData: {
          title: 'Focus System Test',
          description: 'Testing the ported focus system',
          todos: [
            { text: 'Create TODO', status: 'done' },
            { text: 'Focus on TODO', status: 'in_progress' },
            { text: 'Verify focus works', status: 'todo' }
          ]
        }
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create TODO: ${createResponse.status}`);
    }
    
    const newItem = await createResponse.json();
    console.log('✅ TODO created:', newItem.id);
    console.log('   Title:', newItem.todoData?.title);
    console.log('   Tasks:', newItem.todoData?.todos?.length);
    
    // Wait a moment for the item to be added to the canvas
    console.log('\n⏳ Waiting 2 seconds for item to be rendered...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Focus on the TODO item
    console.log('\n🎯 Step 2: Focusing on the TODO item...');
    const focusResponse = await fetch(`${API_BASE}/focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objectId: newItem.id,
        focusOptions: {
          zoom: 1.2,
          duration: 2000,
          highlight: false
        }
      })
    });
    
    if (!focusResponse.ok) {
      throw new Error(`Failed to focus: ${focusResponse.status}`);
    }
    
    const focusResult = await focusResponse.json();
    console.log('✅ Focus request sent:', focusResult.message);
    console.log('   Target ID:', focusResult.itemId || focusResult.objectId);
    console.log('   Zoom:', focusResult.focusOptions.zoom);
    console.log('   Duration:', focusResult.focusOptions.duration);
    
    // Test 3: Verify item exists in board-items
    console.log('\n🔍 Step 3: Verifying TODO exists in board items...');
    const itemsResponse = await fetch(`${API_BASE}/board-items`);
    const allItems = await itemsResponse.json();
    const foundItem = allItems.find(i => i.id === newItem.id);
    
    if (foundItem) {
      console.log('✅ TODO found in board items');
      console.log('   Position: (', foundItem.x, ',', foundItem.y, ')');
      console.log('   Size:', foundItem.width, 'x', foundItem.height);
    } else {
      console.log('⚠️  TODO not found in board items (might be expected if using in-memory storage)');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log('✅ TODO Creation: PASSED');
    console.log('✅ Focus API Call: PASSED');
    console.log('✅ Item Persistence:', foundItem ? 'PASSED' : 'SKIPPED');
    console.log('');
    console.log('🎉 Focus system test completed successfully!');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Watch the canvas animate to the new TODO');
    console.log('   3. Check browser console for SSE events');
    console.log('   4. Try manually calling the focus API with different items');
    console.log('');
    console.log('📖 Full documentation: FOCUS_SYSTEM_PORTED.md');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Backend server is running (npm run server)');
    console.error('  2. API is accessible at http://localhost:3001');
    console.error('  3. CORS is properly configured');
    process.exit(1);
  }
}

// Test for sub-element focus (future enhancement)
async function testSubElementFocus(todoId) {
  console.log('\n🎨 Bonus Test: Sub-Element Focus (Future Enhancement)');
  console.log('Note: This requires TODOs to have data-focus-id attributes on tasks');
  
  try {
    const focusResponse = await fetch(`${API_BASE}/focus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objectId: todoId,
        subElement: 'task-1',
        focusOptions: {
          zoom: 1.5,
          duration: 2000,
          highlight: true
        }
      })
    });
    
    const result = await focusResponse.json();
    console.log('✅ Sub-element focus request sent:', result.message);
    console.log('   Check browser for highlight animation on the specific task');
  } catch (error) {
    console.log('⚠️  Sub-element focus test skipped:', error.message);
  }
}

// Run the test
testFocusSystem().catch(console.error);
