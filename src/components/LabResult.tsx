import React from 'react';
import styled from 'styled-components';

interface LabResultProps {
  id: string;
  parameter: string;
  value: string;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  range: {
    min: number;
    max: number;
    warningMin?: number;
    warningMax?: number;
    criticalMin?: number;
    criticalMax?: number;
  };
  trend?: 'up' | 'down' | 'stable';
  onEdit?: () => void;
  onTrend?: () => void;
  onReadMore?: () => void;
}

const LabResultCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 300px;
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const StatusHeader = styled.div<{ status: string }>`
  background: ${props => {
    switch (props.status) {
      case 'optimal': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#4CAF50';
    }
  }};
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
`;

const StatusIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const Content = styled.div`
  padding: 20px;
`;

const ParameterTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const ValueBox = styled.div<{ status: string }>`
  background: ${props => {
    switch (props.status) {
      case 'optimal': return '#E8F5E8';
      case 'warning': return '#FFF3E0';
      case 'critical': return '#FFEBEE';
      default: return '#E8F5E8';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'optimal': return '#2E7D32';
      case 'warning': return '#E65100';
      case 'critical': return '#C62828';
      default: return '#2E7D32';
    }
  }};
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EditIcon = styled.div`
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const RangeContainer = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const RangeBar = styled.div`
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    to right,
    #F44336 0%,
    #F44336 15%,
    #FF9800 15%,
    #FF9800 25%,
    #4CAF50 25%,
    #4CAF50 75%,
    #FF9800 75%,
    #FF9800 85%,
    #F44336 85%,
    #F44336 100%
  );
  position: relative;
  margin-bottom: 8px;
  width: 100%;
  min-width: 200px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ValuePointer = styled.div<{ position: number }>`
  position: absolute;
  top: -8px;
  left: ${props => props.position}%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #4CAF50;
  z-index: 10;
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const InfoIcon = styled.div`
  color: #666;
  cursor: pointer;
  margin-right: 8px;
  font-size: 14px;
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
  }
`;

const TrendIcon = styled.div<{ trend?: string }>`
  transform: ${props => {
    switch (props.trend) {
      case 'up': return 'rotate(0deg)';
      case 'down': return 'rotate(180deg)';
      default: return 'rotate(0deg)';
    }
  }};
  transition: transform 0.2s;
`;

const LabResult: React.FC<LabResultProps> = ({
  parameter,
  value,
  unit,
  status,
  range,
  trend,
  onEdit,
  onTrend,
  onReadMore
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'optimal': return 'Optimal';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Optimal';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '!';
      default: return '✓';
    }
  };

  // Calculate pointer position based on value and range
  const calculatePointerPosition = () => {
    const numValue = parseFloat(value);
    const totalRange = range.max - range.min;
    const valuePosition = ((numValue - range.min) / totalRange) * 100;
    return Math.max(0, Math.min(100, valuePosition));
  };

  return (
    <LabResultCard>
      <StatusHeader status={status}>
        <StatusIcon>{getStatusIcon(status)}</StatusIcon>
        {getStatusText(status)}
      </StatusHeader>
      
      <Content>
        <ParameterTitle>{parameter}</ParameterTitle>
        
        <ValueContainer>
          <ValueBox status={status}>
            {value} {unit}
          </ValueBox>
          {onEdit && (
            <EditIcon onClick={onEdit}>✏️</EditIcon>
          )}
        </ValueContainer>
        
        <RangeContainer>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
            <InfoIcon>ⓘ</InfoIcon>
            <div style={{ flex: 1 }}>
              <RangeBar>
                <ValuePointer position={calculatePointerPosition()} />
              </RangeBar>
            </div>
          </div>
          <RangeLabels>
            <span>{range.min}</span>
            <span>{range.warningMin || range.min + (range.max - range.min) * 0.2}</span>
            <span>{range.warningMax || range.min + (range.max - range.min) * 0.8}</span>
            <span>{range.max}</span>
          </RangeLabels>
        </RangeContainer>
        
        <ActionButtons>
          {onTrend && (
            <ActionButton onClick={onTrend}>
              <TrendIcon trend={trend}>▼</TrendIcon>
              Trend
            </ActionButton>
          )}
          {onReadMore && (
            <ActionButton onClick={onReadMore}>
              <span>●</span>
              Read more
            </ActionButton>
          )}
        </ActionButtons>
      </Content>
    </LabResultCard>
  );
};

export default LabResult;
