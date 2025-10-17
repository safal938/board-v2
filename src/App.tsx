import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Canvas from './components/Canvas';
import MeetSidePanel from './components/MeetSidePanel';
import MeetMainStage from './components/MeetMainStage';
import boardItemsData from './data/boardItems.json';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #f5f5f5;
`;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/meet/Sidepanel" element={<MeetSidePanel />} />
        <Route path="/meet/sidepanel" element={<MeetSidePanel />} />
        <Route path="/meet/Mainstage" element={<MeetMainStage />} />
        <Route path="/meet/mainstage" element={<MeetMainStage />} />
        <Route path="/" element={<BoardApp />} />
      </Routes>
    </Router>
  );
}

// Main board application component
function BoardApp() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get API base URL - use env var if set, fallback to production backend
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://patientcanvas-ai.vercel.app';

  // Debug: Log the API base URL on mount
  useEffect(() => {
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
    console.log('🌐 window.location.hostname:', window.location.hostname);
    console.log('🌐 window.location.origin:', window.location.origin);
  }, [API_BASE_URL]);

  // Load items from both backend API and static data
  useEffect(() => {
    const loadItemsFromBothSources = async () => {
      try {
        setIsLoading(true);
        
        // Start with static data from src/data/boardItems.json
        let allItems = [...boardItemsData];
        console.log('📁 Loaded static items:', boardItemsData.length, 'items');
        
        // Try to load additional items from backend API
        try {
          const response = await fetch(`${API_BASE_URL}/api/board-items`);
          if (response.ok) {
            const apiItems = await response.json();
            console.log('🌐 Loaded API items:', apiItems.length, 'items');
            
            // Merge API items with static items, avoiding duplicates
            const staticIds = new Set(boardItemsData.map(item => item.id));
            const uniqueApiItems = apiItems.filter(item => !staticIds.has(item.id));
            
            allItems = [...boardItemsData, ...uniqueApiItems];
            console.log('✅ Combined items:', allItems.length, 'total items');
          } else {
            console.log('⚠️ API not available, using only static data');
          }
        } catch (apiError) {
          console.log('⚠️ API not available, using only static data:', apiError.message);
        }
        
        setItems(allItems);
      } catch (error) {
        console.error('❌ Error loading items:', error);
        setItems(boardItemsData);
      } finally {
        setIsLoading(false);
      }
    };

    loadItemsFromBothSources();
  }, [API_BASE_URL]);

  // Note: Items are now managed by the backend API, no localStorage needed

  const addItem = useCallback((type) => {
    const newItem = {
      id: `item-${Date.now()}`,
      type,
      x: Math.random() * 2000 + 1000,
      y: Math.random() * 2000 + 1000,
      width: type === 'text' ? 200 : type === 'ehr' ? 550 : 150,
      height: type === 'text' ? 100 : type === 'ehr' ? 450 : 150,
      content: type === 'text' ? 'Double click to edit' : type === 'ehr' ? 'EHR Data' : '',
      color: type === 'sticky' ? '#ffeb3b' : type === 'ehr' ? '#e8f5e8' : '#2196f3',
      rotation: 0,
      ehrData: type === 'ehr' ? {
        encounter_id: "EHR_2015_08_10_001",
        patient: {
          id: "P001",
          name: "John McAllister",
          age: 53,
          sex: "Male",
          occupation: "Retired carpenter"
        },
        encounter_metadata: {
          date: "2015-08-10",
          time: "11:00",
          type: "Outpatient",
          clinician: "Dr. Elizabeth Hayes",
          specialty: "Rheumatology"
        },
        chief_complaint: "Bilateral joint pain and swelling.",
        sections: {
          history_of_present_illness: {
            summary: "6-month history of progressive, symmetrical joint pain and swelling in hands and feet, worse in morning (>1h stiffness), with fatigue.",
            details: "Patient reports fatigue impacting daily activities, limited relief with NSAIDs, no fever or systemic symptoms."
          },
          impression: {
            working_diagnosis: "Seropositive Rheumatoid Arthritis (RA), active disease",
            differential_diagnoses: [
              "Psoriatic Arthritis",
              "Systemic Lupus Erythematosus",
              "Crystal Arthropathy"
            ]
          }
        }
      } : null,
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
    
    // If height was updated, sync to backend
    if (updates.height !== undefined) {
      fetch(`${API_BASE_URL}/api/board-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height: updates.height })
      }).catch(() => {});
    }
  }, [API_BASE_URL]);

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  const focusOnItem = useCallback((itemId) => {
    setSelectedItemId(itemId);
  }, []);

  const resetBoard = useCallback(async () => {
    try {
      // Reset to both static data and API data
      let allItems = [...boardItemsData];
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/board-items`);
        if (response.ok) {
          const apiItems = await response.json();
          const staticIds = new Set(boardItemsData.map(item => item.id));
          const uniqueApiItems = apiItems.filter(item => !staticIds.has(item.id));
          allItems = [...boardItemsData, ...uniqueApiItems];
          console.log('✅ Board reset with combined data:', allItems.length, 'items');
        } else {
          console.log('⚠️ API not available for reset, using only static data');
        }
      } catch (apiError) {
        console.log('⚠️ API not available for reset, using only static data');
      }
      
      setItems(allItems);
      setSelectedItemId(null);
    } catch (error) {
      console.error('❌ Error resetting board:', error);
      setItems(boardItemsData);
      setSelectedItemId(null);
    }
  }, [API_BASE_URL]);

  // Handle focus requests from POST requests (simulated)
  const handleFocusRequest = useCallback((request) => {
    console.log('🎯🎯🎯 handleFocusRequest ENTRY POINT called with:', request);
    console.log('📋 Total items in state:', items.length);
    console.log('📋 Available items:', items.map(i => ({ id: i.id, type: i.type })));
    
    const targetId = request.objectId || request.itemId;
    console.log('🔍 Looking for item with ID:', targetId);
    
    const item = items.find(i => i.id === targetId);
    
    if (item) {
      console.log('✅✅✅ Item FOUND! Focusing:', item.id, item.type);
      console.log('✅ Item details:', { x: item.x, y: item.y, width: item.width, height: item.height });
      
      // First select the item
      focusOnItem(targetId);
      
      // Get focus options
      const zoom = request.focusOptions?.zoom || 0.8;
      const duration = request.focusOptions?.duration || 3000;
      
      console.log('🔍 Checking if window.centerOnItem exists:', typeof (window as any).centerOnItem);
      
      // Center the viewport on it
      if ((window as any).centerOnItem) {
        console.log('🚀🚀🚀 Calling centerOnItem with:', { targetId, zoom, duration });
        (window as any).centerOnItem(targetId, zoom, duration);
        console.log('✅ centerOnItem call completed');
        
        // If sub-element specified, highlight it after animation completes
        if (request.subElement && request.focusOptions?.highlight) {
          console.log('� Will highlight sub-element:', request.subElement);
          setTimeout(() => {
            const itemElement = document.querySelector(`[data-item-id="${targetId}"]`);
            const subElement = itemElement?.querySelector(`[data-focus-id="${request.subElement}"]`);
            
            if (subElement) {
              console.log('✨ Highlighting sub-element');
              subElement.classList.add('focus-highlighted');
              setTimeout(() => {
                subElement.classList.remove('focus-highlighted');
              }, 2000);
            } else {
              console.warn('⚠️ Sub-element not found:', request.subElement);
            }
          }, duration);
        }
      } else {
        console.error('❌ centerOnItem function not available on window');
      }
    } else {
      console.error('❌❌❌ Item NOT FOUND:', targetId);
      console.error('📋 Available item IDs:', items.map(i => i.id).join(', '));
    }
  }, [items, focusOnItem]);

  // Sync dynamic heights for agent and todo items
  useEffect(() => {
    const syncDynamicHeights = () => {
      items.forEach(item => {
        if ((item.type === 'agent' || item.type === 'todo') && item.id) {
          // Check if the item has a DOM element and measure its actual height
          const element = document.querySelector(`[data-item-id="${item.id}"]`);
          if (element) {
            const actualHeight = element.scrollHeight;
            const storedHeight = item.height;
            
            // If actual height differs significantly from stored height, update it
            if (Math.abs(actualHeight - storedHeight) > 10) {
              console.log(`📏 Syncing height for ${item.id}: ${storedHeight}px -> ${actualHeight}px`);
              updateItem(item.id, { height: actualHeight });
            }
          }
        }
      });
    };

    // Sync heights after items are rendered
    const timeoutId = setTimeout(syncDynamicHeights, 100);
    return () => clearTimeout(timeoutId);
  }, [items, updateItem]);

  // Connect to backend SSE to receive focus events
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    
    const connect = () => {
      try {
        // Connect directly to the backend SSE endpoint
        const sseUrl = `${API_BASE_URL}/api/events`;
        console.log('🔌🔌🔌 CONNECTING TO SSE:', sseUrl);
        console.log('🔌 Browser EventSource support:', typeof EventSource !== 'undefined');
        es = new EventSource(sseUrl);

        es.addEventListener('connected', () => {
          console.log('✅✅✅ SUCCESSFULLY CONNECTED TO SSE:', sseUrl);
        });

        es.addEventListener('ping', (event: any) => {
          // Heartbeat received - connection is alive
          console.log('💓 SSE heartbeat:', new Date(parseInt(event.data)).toISOString());
        });

        es.addEventListener('focus-item', (event: any) => {
          try {
            console.log('📨 RAW focus-item event received:', event);
            console.log('📨 RAW focus-item event.data:', event.data);
            const data = JSON.parse(event.data);
            console.log('🎯 PARSED focus-item event data:', data);
            console.log('🎯 Calling handleFocusRequest with:', {
              objectId: data.objectId || data.itemId,
              subElement: data.subElement,
              focusOptions: data.focusOptions
            });
            handleFocusRequest({
              objectId: data.objectId || data.itemId,
              subElement: data.subElement,
              focusOptions: data.focusOptions
            });
            console.log('✅ handleFocusRequest called successfully');
          } catch (err) {
            console.error('❌ Error handling focus-item event:', err);
            console.error('❌ Error stack:', (err as Error).stack);
          }
        });

        // Handle new items (todos, agents) created via API
        es.addEventListener('new-item', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📦 New-item event received via SSE:', data);
            const newItem = data.item;
            if (!newItem) return;

            // Use the coordinates from the backend (Task Zone positioning)
            // Don't override them with viewport center
            console.log(`📍 Item positioned by backend at (${newItem.x}, ${newItem.y})`);

            // Add the new item to the frontend state with backend coordinates
            setItems((prev: any[]) => {
              if (prev.some((it) => it.id === newItem.id)) return prev;
              return [...prev, newItem];
            });
          } catch (err) {
            console.error('❌ Error handling new-item event:', err);
          }
        });

        es.onerror = (error) => {
          console.error('❌ SSE connection error:', error);
          console.log('🔄 Will attempt to reconnect in 5 seconds...');
          es?.close();
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };

        es.onopen = () => {
          console.log('🌐 SSE connection opened');
        };
      } catch (error) {
        console.error('❌ Error creating SSE connection:', error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (es) {
        console.log('🔌 Closing SSE connection');
        es.close();
      }
    };
  }, [handleFocusRequest, API_BASE_URL]);

  if (isLoading) {
    return (
      <AppContainer style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading board items...
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Canvas
        items={items}
        selectedItemId={selectedItemId}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onSelectItem={setSelectedItemId}
        onFocusRequest={handleFocusRequest}
        onAddItem={addItem}
        onResetBoard={resetBoard}
      />
    </AppContainer>
  );
}

export default App;