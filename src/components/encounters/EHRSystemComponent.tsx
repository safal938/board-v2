import React from "react";
import styled from "styled-components";

const EHRContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 2px solid #e5e7eb;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const EHRHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
`;

const EHRTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #10b981;
  font-weight: 600;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }
    50% {
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.8);
    }
  }
`;

const SystemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  flex: 1;
`;

const SystemCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
`;

const SystemLogo = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  font-weight: bold;
`;

const SystemName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
`;

const SystemType = styled.div`
  font-size: 9px;
  color: #6b7280;
  text-align: center;
`;

interface EHRSystemComponentProps {
  patientData?: any;
}

const systems = [
  { name: "Nervecentre", type: "EPR Platform", icon: "🏥" },
  { name: "Medilogik", type: "Endoscopy", icon: "🔬" },
  { name: "Viper", type: "Clinical EMR", icon: "⚕️" },
  { name: "ICE", type: "Order Comms", icon: "📋" },
  { name: "BigHand", type: "Dictation", icon: "🎙️" },
  { name: "VueExplore", type: "PACS", icon: "🖼️" },
];

const EHRSystemComponent: React.FC<EHRSystemComponentProps> = ({ patientData }) => {
  const encounterCount = patientData?.encounters?.length || 0;
  
  return (
    <EHRContainer>
      <EHRHeader>
        <EHRTitle>Healthcare Information Systems</EHRTitle>
        <StatusIndicator>LIVE</StatusIndicator>
      </EHRHeader>
      
      <SystemsGrid>
        {systems.map((system, index) => (
          <SystemCard key={index}>
            <SystemLogo>{system.icon}</SystemLogo>
            <SystemName>{system.name}</SystemName>
            <SystemType>{system.type}</SystemType>
          </SystemCard>
        ))}
      </SystemsGrid>
    </EHRContainer>
  );
};

export default EHRSystemComponent;