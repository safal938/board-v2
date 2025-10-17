import React from "react";
import styled from "styled-components";

const LabContainer = styled.div`
  background: #fefefe;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  font-family: "Arial", sans-serif;
  color: #2c3e50;
  height: 100%;
  overflow-y: auto;
  font-size: 11px;
  position: relative;
`;

const DataSourceChip = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #2196f3;
  border: 1px solid #1976d2;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
`;

const LabHeader = styled.div`
  background: #f5f5f5;
  border-left: 4px solid #2196f3;
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 4px;
`;

const LabTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: bold;
  color: #2196f3;
`;

const EncounterSection = styled.div`
  margin-bottom: 20px;
`;

const EncounterTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  padding: 6px 0;
  border-bottom: 1px solid #ddd;
`;

const LabTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  margin-bottom: 12px;
`;

const TableHeader = styled.th`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 9px;
`;

const TableCell = styled.td<{ $flag?: string }>`
  border: 1px solid #dee2e6;
  padding: 6px 8px;
  font-size: 9px;
  background: ${props => 
    props.$flag === 'H' ? '#fff3cd' : 
    props.$flag === 'L' ? '#d1ecf1' : 
    'white'
  };
  color: ${props => 
    props.$flag === 'H' ? '#856404' : 
    props.$flag === 'L' ? '#0c5460' : 
    '#212529'
  };
`;

const FlagBadge = styled.span<{ $flag: string }>`
  background: ${props => 
    props.$flag === 'H' ? '#dc3545' : 
    props.$flag === 'L' ? '#007bff' : 
    'transparent'
  };
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 8px;
  font-weight: bold;
  margin-left: 4px;
`;

interface LabTest {
  panel?: string;
  name: string;
  result: string | number;
  unit: string;
  reference_range: string;
  flag: string;
}

interface LabEncounter {
  encounter: number;
  tests: LabTest[];
}

interface ICELabDataProps {
  encounters: LabEncounter[];
}

const ICELabData: React.FC<ICELabDataProps> = ({ encounters }) => {
  // Group tests by panel for better organization
  const groupTestsByPanel = (tests: LabTest[]) => {
    const grouped: { [key: string]: LabTest[] } = {};
    
    tests.forEach(test => {
      const panel = test.panel || 'Other Tests';
      if (!grouped[panel]) {
        grouped[panel] = [];
      }
      grouped[panel].push(test);
    });
    
    return grouped;
  };

  return (
    <LabContainer>
      <DataSourceChip>ICE Lab System</DataSourceChip>
      
      <LabHeader>
        <LabTitle>Laboratory Results</LabTitle>
      </LabHeader>
      
      {encounters.map((encounter) => (
        <EncounterSection key={encounter.encounter}>
          <EncounterTitle>Encounter #{encounter.encounter}</EncounterTitle>
          
          {Object.entries(groupTestsByPanel(encounter.tests)).map(([panel, tests]) => (
            <div key={panel}>
              {panel !== 'Other Tests' && (
                <h5 style={{ 
                  margin: '8px 0 4px 0', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  color: '#666' 
                }}>
                  {panel}
                </h5>
              )}
              
              <LabTable>
                <thead>
                  <tr>
                    <TableHeader>Test</TableHeader>
                    <TableHeader>Result</TableHeader>
                    <TableHeader>Unit</TableHeader>
                    <TableHeader>Reference Range</TableHeader>
                    <TableHeader>Flag</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => (
                    <tr key={index}>
                      <TableCell>{test.name}</TableCell>
                      <TableCell $flag={test.flag}>{test.result}</TableCell>
                      <TableCell>{test.unit}</TableCell>
                      <TableCell>{test.reference_range}</TableCell>
                      <TableCell>
                        {test.flag && (
                          <FlagBadge $flag={test.flag}>{test.flag}</FlagBadge>
                        )}
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </LabTable>
            </div>
          ))}
        </EncounterSection>
      ))}
    </LabContainer>
  );
};

export default ICELabData;