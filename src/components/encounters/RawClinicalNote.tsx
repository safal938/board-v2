import React from "react";
import styled from "styled-components";

const NoteContainer = styled.div`
  background: #fefefe;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  font-family: "Courier New", Courier, monospace;
  line-height: 1.6;
  color: #2c3e50;
  height: 100%;
  overflow-y: auto;
  font-size: 10px;
  white-space: pre-wrap;
  position: relative;
`;

const DataSourceChip = styled.div<{ $sourceColor: string; $sourceBorder: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => props.$sourceColor};
  border: 1px solid ${props => props.$sourceBorder};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
`;

const NoteHeader = styled.div<{ $sourceColor: string }>`
  background: #f5f5f5;
  border-left: 4px solid ${props => props.$sourceColor};
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 4px;
`;

const NoteTitle = styled.h3<{ $sourceColor: string }>`
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: bold;
  color: ${props => props.$sourceColor};
  font-family: "Arial", sans-serif;
`;

const NoteMetadata = styled.div`
  font-size: 9px;
  color: #666;
  font-family: "Arial", sans-serif;
`;

const NoteContent = styled.div`
  padding: 8px 0;
`;

interface RawClinicalNoteProps {
  encounterNumber: number;
  date: string;
  visitType: string;
  provider?: string;
  specialty?: string;
  rawText: string;
  dataSource: string;
}

const RawClinicalNote: React.FC<RawClinicalNoteProps> = ({
  encounterNumber,
  date,
  visitType,
  provider,
  specialty,
  rawText,
  dataSource,
}) => {
  // Define colors for different EHR systems
  const getSourceColors = (source: string) => {
    const sourceLower = source.toLowerCase();
    
    if (sourceLower.includes('nervecentre')) {
      return { color: '#9c27b0', border: '#7b1fa2' }; // Purple
    } else if (sourceLower.includes('medilogik')) {
      return { color: '#00bcd4', border: '#00acc1' }; // Cyan
    } else if (sourceLower.includes('viper')) {
      return { color: '#ff5722', border: '#e64a19' }; // Deep Orange
    } else if (sourceLower.includes('ice')) {
      return { color: '#2196f3', border: '#1976d2' }; // Blue
    } else if (sourceLower.includes('bighand')) {
      return { color: '#4caf50', border: '#388e3c' }; // Green
    } else {
      return { color: '#607d8b', border: '#455a64' }; // Blue Grey (default)
    }
  };
  
  const colors = getSourceColors(dataSource);
  
  return (
    <NoteContainer>
      <DataSourceChip $sourceColor={colors.color} $sourceBorder={colors.border}>
        {dataSource}
      </DataSourceChip>
      
      <NoteHeader $sourceColor={colors.color}>
        <NoteTitle $sourceColor={colors.color}>{visitType}</NoteTitle>
        <NoteMetadata>
          <strong>Date:</strong> {date}
          {provider && <> | <strong>Provider:</strong> {provider}</>}
          {specialty && <> | <strong>Specialty:</strong> {specialty}</>}
        </NoteMetadata>
      </NoteHeader>
      
      <NoteContent>{rawText}</NoteContent>
    </NoteContainer>
  );
};

export default RawClinicalNote;
