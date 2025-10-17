import React from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 12px;
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
`;

const TableHead = styled.thead`
  background: #f1f3f4;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f9f9f9;
  }
  
  &:hover {
    background: #f0f8ff;
  }
`;

const TableHeader2 = styled.th`
  padding: 8px 6px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #ddd;
  font-size: 9px;
`;

const TableCell = styled.td`
  padding: 6px;
  border-bottom: 1px solid #eee;
  font-size: 9px;
`;

const LabValue = styled.span<{ status: 'normal' | 'high' | 'low' | 'critical' }>`
  font-weight: 600;
  color: ${props => {
    switch (props.status) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'low': return '#1976d2';
      default: return '#2e7d32';
    }
  }};
`;

const DeltaValue = styled.span<{ trend: 'up' | 'down' | 'stable' }>`
  font-size: 8px;
  margin-left: 4px;
  color: ${props => {
    switch (props.trend) {
      case 'up': return '#d32f2f';
      case 'down': return '#1976d2';
      default: return '#666';
    }
  }};
`;

const NormalRange = styled.span`
  font-size: 8px;
  color: #666;
  font-style: italic;
`;

interface LabResult {
  name: string;
  value: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  previousValue?: number;
  date: string;
}

interface LabTableProps {
  encounters: any[];
}

const LabTable: React.FC<LabTableProps> = ({ encounters }) => {
  
  // Generate lab results based on encounter data and clinical context
  const generateLabResults = (): LabResult[] => {
    const latestEncounter = encounters[encounters.length - 1];
    const isHighRisk = latestEncounter?.meta?.ui_risk_color === 'red';
    const hasLiverConcerns = latestEncounter?.meta?.event_tags?.some((tag: string) => 
      tag.includes('DILI') || tag.includes('liver')
    );
    
    const baseResults: LabResult[] = [
      {
        name: 'ALT',
        value: isHighRisk ? 145 : 28,
        unit: 'U/L',
        normalRange: '7-56',
        status: isHighRisk ? 'high' : 'normal',
        previousValue: isHighRisk ? 32 : 25,
        date: latestEncounter?.meta?.date_time?.split('T')[0] || '2025-06-21'
      },
      {
        name: 'AST',
        value: isHighRisk ? 178 : 31,
        unit: 'U/L', 
        normalRange: '10-40',
        status: isHighRisk ? 'critical' : 'normal',
        previousValue: isHighRisk ? 29 : 27,
        date: latestEncounter?.meta?.date_time?.split('T')[0] || '2025-06-21'
      },
      {
        name: 'ALP',
        value: hasLiverConcerns ? 156 : 78,
        unit: 'U/L',
        normalRange: '44-147',
        status: hasLiverConcerns ? 'high' : 'normal',
        previousValue: hasLiverConcerns ? 89 : 82,
        date: latestEncounter?.meta?.date_time?.split('T')[0] || '2025-06-21'
      },
      {
        name: 'GGT',
        value: hasLiverConcerns ? 234 : 45,
        unit: 'U/L',
        normalRange: '9-48',
        status: hasLiverConcerns ? 'critical' : 'normal',
        previousValue: hasLiverConcerns ? 52 : 41,
        date: latestEncounter?.meta?.date_time?.split('T')[0] || '2025-06-21'
      },
      {
        name: 'Total Bilirubin',
        value: isHighRisk ? 4.8 : 0.9,
        unit: 'mg/dL',
        normalRange: '0.3-1.2',
        status: isHighRisk ? 'critical' : 'normal',
        previousValue: isHighRisk ? 1.1 : 0.8,
        date: latestEncounter?.meta?.date_time?.split('T')[0] || '2025-06-21'
      },
      {
        name: 'INR',
        value: isHighRisk ? 1.8 : 1.1,
        unit: '',
        normalRange: '0.8-1.1',
        status: isHighRisk ? 'high' : 'normal',
        previousValue: isHighRisk ? 1.2 : 1.0,
        date: latestEncounter?.meta?.date_time?.split('T')[0] || '2025-06-21'
      },
      {
        name: 'Creatinine',
        value: 1.3,
        unit: 'mg/dL',
        normalRange: '0.7-1.3',
        status: 'normal',
        previousValue: 1.2,
        date: latestEncounter?.meta?.date_time?.split('T')[0] || '2025-06-21'
      }
    ];
    
    return baseResults;
  };

  const labResults = generateLabResults();

  const getTrend = (current: number, previous?: number) => {
    if (!previous) return 'stable';
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const getDelta = (current: number, previous?: number) => {
    if (!previous) return '';
    const change = current - previous;
    const trend = getTrend(current, previous);
    const symbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
    return `${symbol}${Math.abs(change).toFixed(1)}`;
  };

  return (
    <TableContainer>
      <TableHeader>Latest Lab Values</TableHeader>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader2>Lab Test</TableHeader2>
            <TableHeader2>Value</TableHeader2>
            <TableHeader2>Delta</TableHeader2>
            <TableHeader2>Normal Range</TableHeader2>
            <TableHeader2>Date</TableHeader2>
          </TableRow>
        </TableHead>
        <tbody>
          {labResults.map((lab, index) => (
            <TableRow key={index}>
              <TableCell>
                <strong>{lab.name}</strong>
              </TableCell>
              <TableCell>
                <LabValue status={lab.status}>
                  {lab.value} {lab.unit}
                </LabValue>
              </TableCell>
              <TableCell>
                <DeltaValue trend={getTrend(lab.value, lab.previousValue)}>
                  {getDelta(lab.value, lab.previousValue)}
                </DeltaValue>
              </TableCell>
              <TableCell>
                <NormalRange>{lab.normalRange} {lab.unit}</NormalRange>
              </TableCell>
              <TableCell>{lab.date}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default LabTable;