import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { meet } from '@googleworkspace/meet-addons/meet.addons';
import Canvas from './Canvas';
import boardItemsData from '../data/boardItems.json';

const MainStageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #f5f5f5;
  position: relative;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #5f6368;
`;

const ErrorContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ErrorText = styled.div`
  font-size: 16px;
  color: #d93025;
  text-align: center;
`;

const MeetMainStage: React.FC = () => {
  const [items, setItems] = useState(boardItemsData);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://patientcanvas-ai.vercel.app';

  const handleFocusRequest = useCallback((itemId: string) => {
    console.log('🎯 Focus requested for item:', itemId);
    setSelectedItemId(itemId);
    
    // Call the Canvas centerOnItem function (exposed via window)
    setTimeout(() => {
      if ((window as any).centerOnItem) {
        console.log('📍 Centering on item:', itemId);
        (window as any).centerOnItem(itemId, 0.8, 3000);
      } else {
        console.warn('⚠️ centerOnItem function not available yet');
      }
    }, 100); // Small delay to ensure Canvas is mounted
  }, []);

  useEffect(() => {
    const initializeMeetSession = async () => {
      try {
        // Replace with your actual GCP project number
        const session = await meet.addon.createAddonSession({
          cloudProjectNumber: process.env.REACT_APP_GCP_PROJECT_NUMBER || 'YOUR_GCP_PROJECT_NUMBER'
        });
        
        await session.createMainStageClient();
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Meet main stage session:', err);
        setError('Failed to initialize Google Meet integration');
        setIsLoading(false);
      }
    };

    initializeMeetSession();
  }, []);

  // Listen for real-time updates via Server-Sent Events
  useEffect(() => {
    const sseUrl = `${API_BASE_URL}/api/events`;
    console.log('🔌 Connecting to SSE for real-time updates...');
    console.log('📡 SSE URL:', sseUrl);
    
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('🟢 SSE connection opened successfully!');
    };

    eventSource.addEventListener('connected', () => {
      console.log('✅ SSE connected - will receive real-time updates');
    });

    eventSource.addEventListener('focus-item', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🎯 Focus event received:', data);
        if (data.objectId) {
          console.log('🎯 Setting selected item to:', data.objectId);
          setSelectedItemId(data.objectId);
          // Trigger focus animation in Canvas
          handleFocusRequest(data.objectId);
        }
      } catch (err) {
        console.error('Error parsing focus event:', err);
      }
    });

    eventSource.addEventListener('new-item', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('➕ New item event received:', data);
        if (data.item) {
          setItems(prevItems => {
            // Check if item already exists
            if (prevItems.some(item => item.id === data.item.id)) {
              return prevItems;
            }
            return [...prevItems, data.item];
          });
        }
      } catch (err) {
        console.error('Error parsing new-item event:', err);
      }
    });

    eventSource.addEventListener('update-item', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔄 Update item event received:', data);
        if (data.id) {
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === data.id ? { ...item, ...data.updates } : item
            )
          );
        }
      } catch (err) {
        console.error('Error parsing update-item event:', err);
      }
    });

    eventSource.addEventListener('delete-item', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🗑️ Delete item event received:', data);
        if (data.id) {
          setItems(prevItems => prevItems.filter(item => item.id !== data.id));
          if (selectedItemId === data.id) {
            setSelectedItemId(null);
          }
        }
      } catch (err) {
        console.error('Error parsing delete-item event:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('❌ SSE connection error:', err);
      // Don't close - EventSource auto-reconnects
    };

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
    };
  }, [API_BASE_URL, selectedItemId, handleFocusRequest]);

  const handleUpdateItem = useCallback((id: string, updates: any) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  const handleSelectItem = useCallback((id: string | null) => {
    setSelectedItemId(id);
  }, []);

  const handleAddItem = useCallback((newItem: any) => {
    setItems(prevItems => [...prevItems, newItem]);
  }, []);

  const handleResetBoard = useCallback(() => {
    setItems(boardItemsData);
    setSelectedItemId(null);
  }, []);

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Initializing MedForce Board for Google Meet...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>
          {error}
          <br />
          <br />
          Please check your Google Meet add-on configuration.
        </ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <MainStageContainer>
      <Canvas
        items={items}
        selectedItemId={selectedItemId}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onSelectItem={handleSelectItem}
        onFocusRequest={handleFocusRequest}
        onAddItem={handleAddItem}
        onResetBoard={handleResetBoard}
      />
    </MainStageContainer>
  );
};

export default MeetMainStage;