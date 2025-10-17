import React, { useState } from 'react';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ChartTitle = styled.h4`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const LabSelector = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const LabButton = styled.button<{ active: boolean; color: string }>`
  padding: 4px 8px;
  border: 1px solid ${props => props.active ? props.color : '#ddd'};
  border-radius: 4px;
  background: ${props => props.active ? props.color : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 9px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? props.color : '#f5f5f5'};
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const MiniChart = styled.div`
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  height: 120px;
  position: relative;
`;

const MiniChartTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CurrentValue = styled.span<{ status: 'normal' | 'high' | 'critical' | 'low' }>`
  color: ${props => {
    switch (props.status) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'low': return '#1976d2';
      default: return '#2e7d32';
    }
  }};
  font-weight: 700;
`;

const MiniChartArea = styled.div`
  height: 80px;
  position: relative;
  display: flex;
  align-items: end;
  gap: 2px;
  padding: 4px 0;
`;

const ChartBar = styled.div<{ height: number; color: string; isLast?: boolean }>`
  flex: 1;
  height: ${props => props.height}%;
  background: ${props => props.color};
  border-radius: 2px 2px 0 0;
  opacity: ${props => props.isLast ? 1 : 0.7};
  position: relative;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
    transform: scaleY(1.1);
    transform-origin: bottom;
  }
`;

const NormalRangeBand = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(76, 175, 80, 0.1);
  border: 1px dashed rgba(76, 175, 80, 0.3);
  border-left: none;
  border-right: none;
`;

const MedicationEvent = styled.div<{ position: number }>`
  position: absolute;
  left: ${props => props.position}%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ff9800;
  z-index: 2;
  
  &::after {
    content: '▼';
    position: absolute;
    top: -2px;
    left: -4px;
    font-size: 8px;
    color: #ff9800;
  }
`;

const ChartLabel = styled.div`
  font-size: 8px;
  color: #666;
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
`;

const Tooltip = styled.div<{ x: number; y: number; visible: boolean }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 9px;
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s;
  z-index: 1000;
  white-space: nowrap;
  transform: translateX(-50%) translateY(-100%);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

interface LabDataPoint {
  date: string;
  value: number;
  encounter: number;
}

interface LabChartProps {
  encounters: any[];
  medicationTimeline: any[];
}

const LabChart: React.FC<LabChartProps> = ({ encounters, medicationTimeline }) => {
  const [selectedLabs, setSelectedLabs] = useState<string[]>(['ALT', 'AST', 'Total Bilirubin', 'INR']);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  const labTests = [
    { name: 'ALT', color: '#1976d2', normalRange: [7, 56], unit: 'U/L' },
    { name: 'AST', color: '#d32f2f', normalRange: [10, 40], unit: 'U/L' },
    { name: 'ALP', color: '#388e3c', normalRange: [44, 147], unit: 'U/L' },
    { name: 'GGT', color: '#f57c00', normalRange: [9, 48], unit: 'U/L' },
    { name: 'Total Bilirubin', color: '#7b1fa2', normalRange: [0.3, 1.2], unit: 'mg/dL' },
    { name: 'INR', color: '#c2185b', normalRange: [0.8, 1.1], unit: '' },
    { name: 'Creatinine', color: '#00796b', normalRange: [0.7, 1.3], unit: 'mg/dL' }
  ];

  // Generate lab data based on encounters
  const generateLabData = () => {
    const labData: { [key: string]: LabDataPoint[] } = {};
    
    encounters.forEach((encounter, index) => {
      const date = encounter.meta?.date_time?.split('T')[0] || `2025-0${index + 1}-01`;
      const isHighRisk = encounter.meta?.ui_risk_color === 'red';
      const hasLiverConcerns = encounter.meta?.event_tags?.some((tag: string) => 
        tag.includes('DILI') || tag.includes('liver')
      );
      
      // Generate realistic lab progression
      const baselineMultiplier = index === 0 ? 1 : (1 + (index * 0.1));
      const riskMultiplier = isHighRisk ? 3.5 : hasLiverConcerns ? 2 : 1;
      
      labTests.forEach(lab => {
        if (!labData[lab.name]) labData[lab.name] = [];
        
        let value: number;
        const normalMid = (lab.normalRange[0] + lab.normalRange[1]) / 2;
        
        if (lab.name === 'ALT') {
          value = Math.round(normalMid * baselineMultiplier * riskMultiplier);
        } else if (lab.name === 'AST') {
          value = Math.round((normalMid * 0.9) * baselineMultiplier * riskMultiplier);
        } else if (lab.name === 'ALP') {
          value = Math.round(normalMid * baselineMultiplier * (riskMultiplier * 0.7));
        } else if (lab.name === 'GGT') {
          value = Math.round(normalMid * baselineMultiplier * (riskMultiplier * 1.2));
        } else if (lab.name === 'Total Bilirubin') {
          value = parseFloat((normalMid * baselineMultiplier * riskMultiplier).toFixed(1));
        } else if (lab.name === 'INR') {
          value = parseFloat((normalMid * baselineMultiplier * (riskMultiplier * 0.8)).toFixed(1));
        } else {
          value = parseFloat((normalMid * baselineMultiplier).toFixed(1));
        }
        
        labData[lab.name].push({
          date,
          value,
          encounter: index + 1
        });
      });
    });
    
    return labData;
  };

  const labData = generateLabData();

  const toggleLab = (labName: string) => {
    setSelectedLabs(prev => 
      prev.includes(labName) 
        ? prev.filter(name => name !== labName)
        : [...prev, labName]
    );
  };

  const getLabStatus = (value: number, normalRange: number[]) => {
    if (value > normalRange[1] * 2) return 'critical';
    if (value > normalRange[1]) return 'high';
    if (value < normalRange[0]) return 'low';
    return 'normal';
  };

  const getMedicationEvents = () => {
    return medicationTimeline
      .filter(med => med.start)
      .map(med => ({
        date: med.start,
        label: `Start ${med.name}`,
        type: 'start'
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const medicationEvents = getMedicationEvents();

  const handleBarHover = (event: React.MouseEvent, lab: string, value: number, date: string, unit: string) => {
    const barRect = event.currentTarget.getBoundingClientRect();
    
    // Use fixed positioning with screen coordinates
    const x = barRect.left + (barRect.width / 2);
    const y = barRect.top - 5; // Position just above the bar
    
    setTooltip({
      visible: true,
      x: x,
      y: y,
      content: `${lab}: ${value} ${unit} (${date})`
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <ChartContainer className="chart-container">
      <ChartHeader>
        <ChartTitle>Lab Trends - Individual Charts</ChartTitle>
        <LabSelector>
          {labTests.map(lab => (
            <LabButton
              key={lab.name}
              active={selectedLabs.includes(lab.name)}
              color={lab.color}
              onClick={() => toggleLab(lab.name)}
            >
              {lab.name}
            </LabButton>
          ))}
        </LabSelector>
      </ChartHeader>
      
      <ChartGrid>
        {selectedLabs.map(labName => {
          const lab = labTests.find(l => l.name === labName);
          const data = labData[labName] || [];
          const currentValue = data[data.length - 1]?.value || 0;
          const status = getLabStatus(currentValue, lab?.normalRange || [0, 100]);
          
          if (!lab) return null;
          
          // Calculate chart dimensions
          const maxValue = Math.max(...data.map(d => d.value), lab.normalRange[1] * 1.2);
          const minValue = 0;
          
          // Calculate normal range position
          const normalRangeTop = ((maxValue - lab.normalRange[1]) / (maxValue - minValue)) * 100;
          const normalRangeBottom = ((maxValue - lab.normalRange[0]) / (maxValue - minValue)) * 100;
          
          return (
            <MiniChart key={labName} className="mini-chart">
              <MiniChartTitle>
                {lab.name}
                <CurrentValue status={status}>
                  {currentValue} {lab.unit}
                </CurrentValue>
              </MiniChartTitle>
              
              <MiniChartArea>
                {/* Normal range band */}
                <NormalRangeBand
                  style={{
                    top: `${normalRangeTop}%`,
                    height: `${normalRangeBottom - normalRangeTop}%`
                  }}
                />
                
                {/* Medication events */}
                {medicationEvents.map((event, index) => {
                  const eventDate = new Date(event.date);
                  const firstDate = new Date(data[0]?.date || '2015-01-01');
                  const lastDate = new Date(data[data.length - 1]?.date || '2025-12-31');
                  const position = ((eventDate.getTime() - firstDate.getTime()) / 
                                  (lastDate.getTime() - firstDate.getTime())) * 100;
                  
                  return (
                    <MedicationEvent
                      key={index}
                      position={Math.max(0, Math.min(100, position))}
                      title={event.label}
                    />
                  );
                })}
                
                {/* Data bars */}
                {data.map((point, index) => {
                  const height = ((point.value - minValue) / (maxValue - minValue)) * 100;
                  const isLast = index === data.length - 1;
                  const barStatus = getLabStatus(point.value, lab.normalRange);
                  
                  let barColor = lab.color;
                  if (barStatus === 'critical') barColor = '#d32f2f';
                  else if (barStatus === 'high') barColor = '#f57c00';
                  
                  return (
                    <ChartBar
                      key={index}
                      height={height}
                      color={barColor}
                      isLast={isLast}
                      onMouseEnter={(e) => handleBarHover(e, lab.name, point.value, point.date, lab.unit)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}
              </MiniChartArea>
              
              <ChartLabel>
                <span>{data[0]?.date || ''}</span>
                <span>Normal: {lab.normalRange[0]}-{lab.normalRange[1]} {lab.unit}</span>
                <span>{data[data.length - 1]?.date || ''}</span>
              </ChartLabel>
            </MiniChart>
          );
        })}
      </ChartGrid>
      
      <Tooltip
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
      >
        {tooltip.content}
      </Tooltip>
    </ChartContainer>
  );
};

export default LabChart;