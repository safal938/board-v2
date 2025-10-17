import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  margin-right: 24px;
`;

const Instructions = styled.div`
  font-size: 12px;
  color: #666;
  margin-left: auto;
`;

// ToolbarProps interface removed for Storybook compatibility

const Toolbar = ({ onAddItem, onResetBoard }) => {
  return (
    <ToolbarContainer>
      <Title>Canvas Board</Title>

      <ButtonGroup>
        <Button onClick={() => onAddItem('sticky')}>
          📌 Add Sticky
        </Button>
        <Button onClick={onResetBoard} style={{ backgroundColor: '#f44336', color: 'white' }}>
          🔄 Reset Board
        </Button>
      </ButtonGroup>

      <Instructions>
        Double-click text to edit • Ctrl+F to focus • Ctrl+Click to pan • Mouse wheel to zoom
      </Instructions>
    </ToolbarContainer>
  );
};

export default Toolbar;
