import React from 'react';
import ModernAdverseEventDashboard from './ModernAdverseEventDashboard';

interface AdverseEventDashboardProps {
  patientData?: any;
}

const AdverseEventDashboard: React.FC<AdverseEventDashboardProps> = ({ patientData }) => {
  return <ModernAdverseEventDashboard patientData={patientData} />;
};

export default AdverseEventDashboard;