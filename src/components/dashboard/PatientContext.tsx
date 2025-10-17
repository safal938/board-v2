import React from 'react';
import styled from 'styled-components';

const PatientContextContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  transition: all 0.3s ease;
  
  /* Add focus highlighting */
  &.focused {
    border: 3px solid #8b5cf6;
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
`;

const PatientAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
`;

const PatientDetails = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const InfoCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const InfoItem = styled.li`
  padding: 6px 0;
  font-size: 13px;
  color: #4b5563;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ status: 'active' | 'resolved' | 'inactive' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: 8px;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'resolved':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #64748b;
        `;
    }
  }}
`;

const MetricCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FullWidthCard = styled.div`
  grid-column: 1 / -1;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

interface PatientContextProps {
  patientData: any;
}

const PatientContext: React.FC<PatientContextProps> = ({ patientData }) => {
  const patient = patientData?.patient || {};
  const encounters = patientData?.encounters || [];
  const problemList = patientData?.problem_list || [];
  const medicationTimeline = patientData?.medication_timeline || [];
  const allergies = patientData?.allergies || [];
  const riskLevel = patientData?.riskLevel || 'unknown';
  const primaryDiagnosis = patientData?.primaryDiagnosis || 'Not specified';

  const getPatientInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActiveMedications = () => {
    return medicationTimeline.filter(med => !med.end);
  };

  const getActiveProblems = () => {
    // If we have a problem list, use it
    if (problemList.length > 0) {
      return problemList.filter(problem => problem.status === 'active');
    }
    // Otherwise, create from primary diagnosis
    if (primaryDiagnosis && primaryDiagnosis !== 'Not specified') {
      return [{ name: primaryDiagnosis, status: 'active' }];
    }
    return [];
  };

  const getLatestEncounter = () => {
    return encounters[encounters.length - 1];
  };

  const latestEncounter = getLatestEncounter();
  const activeMedications = getActiveMedications();
  const activeProblems = getActiveProblems();

  return (
    <PatientContextContainer id="patient-context-zone">
      <PatientHeader>
        <PatientAvatar>
          {getPatientInitials(patient.name || 'Unknown')}
        </PatientAvatar>
        <PatientInfo>
          <PatientName>{patient.name || 'Unknown Patient'}</PatientName>
          <PatientDetails>
            {patient.age || patient.age_at_first_encounter} years old • {patient.sex} • MRN: {patient.mrn || patient.identifiers?.mrn || 'N/A'}
          </PatientDetails>
        </PatientInfo>
        {riskLevel && riskLevel !== 'unknown' && (
          <StatusBadge status={riskLevel === 'high' ? 'active' : 'resolved'} style={{ marginLeft: 'auto' }}>
            Risk: {riskLevel.toUpperCase()}
          </StatusBadge>
        )}
      </PatientHeader>

      <InfoGrid>
        <InfoCard data-focus-id="active-problems">
          <InfoTitle>Active Problems</InfoTitle>
          <InfoList>
            {activeProblems.slice(0, 4).map((problem, index) => (
              <InfoItem key={index}>
                {problem.name}
                <StatusBadge status={problem.status as 'active'}>
                  {problem.status}
                </StatusBadge>
              </InfoItem>
            ))}
            {activeProblems.length === 0 && (
              <InfoItem>No active problems recorded</InfoItem>
            )}
          </InfoList>
        </InfoCard>

        <InfoCard data-focus-id="medication-timeline">
          <InfoTitle>Current Medications</InfoTitle>
          <InfoList>
            {activeMedications.slice(0, 4).map((med, index) => (
              <InfoItem key={index}>
                <strong>{med.name}</strong> {med.dose}
                <br />
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {med.frequency} • {med.route}
                </span>
              </InfoItem>
            ))}
            {activeMedications.length === 0 && (
              <InfoItem>No active medications</InfoItem>
            )}
          </InfoList>
        </InfoCard>

        <FullWidthCard data-focus-id="allergies">
          <InfoTitle>Allergies</InfoTitle>
          {allergies.length > 0 ? (
            <InfoList>
              {allergies.map((allergy, index) => (
                <InfoItem key={index} style={{ color: '#dc2626', fontWeight: '500' }}>
                  ⚠️ {allergy}
                </InfoItem>
              ))}
            </InfoList>
          ) : (
            <div>No known allergies</div>
          )}
        </FullWidthCard>

        <FullWidthCard>
          <InfoTitle>Patient Demographics</InfoTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <strong>DOB:</strong> {patient.dob || 'Unknown'}
            </div>
            <div>
              <strong>Age:</strong> {patient.age || 'Unknown'}
            </div>
            <div>
              <strong>Sex:</strong> {patient.sex || 'Unknown'}
            </div>
            <div>
              <strong>Marital Status:</strong> {patient.maritalStatus || 'Unknown'}
            </div>
            <div>
              <strong>Occupation:</strong> {patient.occupation || 'Unknown'}
            </div>
            <div>
              <strong>Language:</strong> {patient.primaryLanguage || 'English'}
            </div>
          </div>
        </FullWidthCard>
      </InfoGrid>
    </PatientContextContainer>
  );
};

export default PatientContext;