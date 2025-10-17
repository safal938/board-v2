import React from 'react';
import styled from 'styled-components';

const DiagnosisContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  
  /* Add focus highlighting */
  &.focused {
    border: 3px solid #ec4899;
    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }
  border-radius: 6px;
  padding: 12px;
`;

const DiagnosisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DiagnosisTitle = styled.h4`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const DiagnosisTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
`;

const TableHeader = styled.th`
  background: #f5f5f5;
  padding: 8px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #ddd;
  font-size: 10px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #fafafa;
  }
  
  &:hover {
    background: #f0f0f0;
  }
`;

const TableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
`;

const StatusDot = styled.span<{ status: 'ruled-out' | 'pending' | 'needs-investigation' | 'primary' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  
  ${props => {
    switch (props.status) {
      case 'ruled-out':
        return 'background: #10b981;';
      case 'pending':
        return 'background: #f59e0b;';
      case 'needs-investigation':
        return 'background: #ef4444;';
      case 'primary':
        return 'background: #8b5cf6;';
      default:
        return 'background: #64748b;';
    }
  }}
`;

const StatusText = styled.span<{ status: 'ruled-out' | 'pending' | 'needs-investigation' | 'primary' }>`
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'ruled-out':
        return 'color: #065f46;';
      case 'pending':
        return 'color: #92400e;';
      case 'needs-investigation':
        return 'color: #dc2626;';
      case 'primary':
        return 'color: #7c3aed;';
      default:
        return 'color: #64748b;';
    }
  }}
`;

interface DifferentialDiagnosisProps {
  patientData: any;
}

const DifferentialDiagnosis: React.FC<DifferentialDiagnosisProps> = ({ patientData }) => {
  const latestEncounter = patientData?.encounters?.[patientData.encounters.length - 1];
  const differentialList = latestEncounter?.assessment?.differential || [];
  const rucamData = latestEncounter?.rucam_ctcae_analysis?.rucam;
  const reasoning = latestEncounter?.rucam_ctcae_analysis?.reasoning || '';

  // Extract ruled out information from RUCAM data and reasoning
  const getRuledOutInfo = () => {
    const ruledOut = [];
    
    // From RUCAM exclusion parameter
    if (rucamData?.rows) {
      const exclusionRow = rucamData.rows.find(row => row[1]?.includes('non-drug causes'));
      if (exclusionRow && exclusionRow[2]) {
        const exclusionText = exclusionRow[2];
        if (exclusionText.includes('viral hepatitis pending')) {
          ruledOut.push('Viral hepatitis pending serology');
        }
        if (exclusionText.includes('no ischemic/septic event')) {
          ruledOut.push('Ischemic hepatitis ruled out');
        }
      }
    }

    // From reasoning text
    if (reasoning.includes('no autoimmune or metabolic history')) {
      ruledOut.push('Autoimmune hepatitis - no history');
    }
    if (reasoning.includes('no fever or hemodynamic instability')) {
      ruledOut.push('Septic hepatitis ruled out');
    }

    return ruledOut;
  };

  const ruledOutItems = getRuledOutInfo();

  // Determine status for each differential diagnosis
  const getDiagnosisStatus = (diagnosis: string) => {
    const lowerDiag = diagnosis.toLowerCase();
    
    if (lowerDiag.includes('tmp-smx') || lowerDiag.includes('dili')) {
      return 'primary'; // Primary suspected cause
    }
    if (lowerDiag.includes('viral hepatitis')) {
      return 'pending'; // Pending serology
    }
    if (lowerDiag.includes('sepsis') || lowerDiag.includes('ischemic')) {
      return 'ruled-out'; // Ruled out based on clinical presentation
    }
    return 'needs-investigation'; // Needs further workup
  };

  const getStatusDetails = (diagnosis: string, status: string) => {
    const lowerDiag = diagnosis.toLowerCase();
    
    switch (status) {
      case 'primary':
        return 'Primary suspected cause based on timeline and interaction';
      case 'ruled-out':
        if (lowerDiag.includes('sepsis')) {
          return 'Ruled Out - No fever or hemodynamic instability';
        }
        return 'Ruled Out - Clinical presentation inconsistent';
      case 'pending':
        return 'Pending - Viral serology ordered';
      case 'needs-investigation':
        return 'Needs Investigation - Further workup required';
      default:
        return '';
    }
  };

  // Combine all diagnoses for the table
  const allDiagnoses = [
    ...differentialList.map((diagnosis: string) => ({
      name: diagnosis,
      status: getDiagnosisStatus(diagnosis),
      details: getStatusDetails(diagnosis, getDiagnosisStatus(diagnosis))
    })),
    ...ruledOutItems.map((item: string) => ({
      name: item.split(' - ')[0],
      status: 'ruled-out' as const,
      details: item.includes(' - ') ? item.split(' - ')[1] : 'Ruled out clinically'
    }))
  ];

  if (!allDiagnoses.length) {
    return (
      <DiagnosisContainer>
        <DiagnosisTitle>Differential Diagnosis</DiagnosisTitle>
        <p style={{ fontSize: '11px', color: '#666', margin: '8px 0' }}>No data available</p>
      </DiagnosisContainer>
    );
  }

  return (
    <DiagnosisContainer id="differential-diagnosis-zone">
      <DiagnosisHeader>
        <DiagnosisTitle>Differential Diagnosis & Ruled Out Tracker</DiagnosisTitle>
      </DiagnosisHeader>
      
      <DiagnosisTable>
        <thead>
          <tr>
            <TableHeader>Diagnosis</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Notes</TableHeader>
          </tr>
        </thead>
        <tbody>
          {allDiagnoses.map((diagnosis, index) => (
            <TableRow key={index}>
              <TableCell>
                <strong style={{ fontSize: '11px' }}>{diagnosis.name}</strong>
              </TableCell>
              <TableCell>
                <StatusDot status={diagnosis.status} />
                <StatusText status={diagnosis.status}>
                  {diagnosis.status === 'ruled-out' ? 'Ruled Out' : 
                   diagnosis.status === 'pending' ? 'Pending' :
                   diagnosis.status === 'primary' ? 'Primary' : 'Investigate'}
                </StatusText>
              </TableCell>
              <TableCell style={{ fontSize: '10px', color: '#666' }}>
                {diagnosis.details}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </DiagnosisTable>
    </DiagnosisContainer>
  );
};

export default DifferentialDiagnosis;