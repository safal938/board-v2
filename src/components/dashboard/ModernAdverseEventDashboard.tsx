import React, { useState } from "react";
import styled from "styled-components";
import EncounterTimeline from "./EncounterTimeline";
import LabTable from "./LabTable";
import LabChart from "./LabChart";
import NotesPanel from "./NotesPanel";
import PatientContext from "./PatientContext";
import AdverseEventAnalytics from "./AdverseEventAnalytics";
import DifferentialDiagnosis from "./DifferentialDiagnosis";

const DashboardContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;

const DashboardContent = styled.div`
  max-width: 1800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const RiskBadge = styled.div<{ level: "low" | "medium" | "high" }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) => {
    switch (props.level) {
      case "high":
        return "linear-gradient(135deg, #ff6b6b, #ee5a24)";
      case "medium":
        return "linear-gradient(135deg, #feca57, #ff9ff3)";
      default:
        return "linear-gradient(135deg, #48dbfb, #0abde3)";
    }
  }};
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const PatientInfo = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px;
  background: rgba(103, 126, 234, 0.1);
  border-radius: 12px;
  border-left: 4px solid #667eea;
`;

const PatientDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PatientLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PatientValue = styled.span`
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;

const TimelineSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  &.focused {
    border: 3px solid #667eea;
    box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.2),
      0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px) scale(1.02);
    animation: focusPulse 2s ease-in-out;
  }

  @keyframes focusPulse {
    0%,
    100% {
      box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.2),
        0 12px 40px rgba(0, 0, 0, 0.15);
    }
    50% {
      box-shadow: 0 0 0 12px rgba(102, 126, 234, 0.4),
        0 12px 40px rgba(0, 0, 0, 0.15);
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardIcon = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const CardContent = styled.div`
  color: #555;
  line-height: 1.6;
`;

const BottomSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
`;

const StatusIndicator = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(props) => props.color};
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px 8px 8px 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #667eea;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 12px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${(props) =>
    props.active ? "rgba(255, 255, 255, 0.9)" : "transparent"};
  color: ${(props) => (props.active ? "#333" : "rgba(255, 255, 255, 0.7)")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) =>
      props.active ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.1)"};
  }
`;

const QuickNoteModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: ${(props) => (props.isOpen ? "fadeIn 0.3s ease" : "none")};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const QuickNoteContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const QuickNoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const QuickNoteTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }
`;

const QuickNoteTextArea = styled.textarea`
  width: 100%;
  height: 150px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  background: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const QuickNoteActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

interface ModernAdverseEventDashboardProps {
  patientData?: any;
}

const ModernAdverseEventDashboard: React.FC<
  ModernAdverseEventDashboardProps
> = ({ patientData }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [quickNoteContent, setQuickNoteContent] = useState("");

  // Extract patient info from the data
  const patient = patientData?.patient || {};
  const latestEncounter =
    patientData?.encounters?.[patientData.encounters.length - 1] || {};
  const medicationTimeline = patientData?.medication_timeline || [];

  // Determine risk level
  const getRiskLevel = () => {
    const riskColor = latestEncounter.meta?.ui_risk_color;
    if (riskColor === "red") return "high";
    if (riskColor === "amber") return "medium";
    return "low";
  };

  const riskLevel = getRiskLevel();

  const handleQuickNoteSave = () => {
    if (quickNoteContent.trim()) {
      // Here you would typically save to a backend or state management
      console.log("Quick note saved:", quickNoteContent);
      setQuickNoteContent("");
      setIsQuickNoteOpen(false);
      // You could also trigger a refresh of the NotesPanel here
    }
  };

  const handleQuickNoteCancel = () => {
    setQuickNoteContent("");
    setIsQuickNoteOpen(false);
  };

  return (
    <DashboardContainer>
      <DashboardContent>
        {/* Header Section */}
        <HeaderSection>
          <HeaderTop>
            <HeaderTitle>Adverse Event Monitoring System</HeaderTitle>
            <RiskBadge level={riskLevel}>{riskLevel} Risk</RiskBadge>
          </HeaderTop>
        </HeaderSection>

        {/* Patient Context Zone */}
        <Card id="patient-context-zone" style={{ marginBottom: "20px" }}>
          <PatientContext patientData={patientData} />
        </Card>

        {/* Patient Encounter Timeline */}
        <Card id="encounter-timeline-zone" style={{ marginBottom: "20px" }}>
          <CardHeader>
            <CardTitle>
              <CardIcon color="#48dbfb">📅</CardIcon>
              Patient Encounter Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EncounterTimeline
              encounters={patientData?.encounters || []}
              medicationTimeline={medicationTimeline}
            />
          </CardContent>
        </Card>

        {/* Adverse Event Analytics */}
        <Card id="adverse-events-zone" style={{ marginBottom: "20px" }}>
          <AdverseEventAnalytics patientData={patientData} />
        </Card>

        {/* Bottom Row - 3 Components */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Lab Findings */}
          <Card id="lab-findings-zone">
            <CardHeader>
              <CardTitle>
                <CardIcon color="#48dbfb">🧪</CardIcon>
                Lab Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LabTable encounters={patientData?.encounters || []} />
            </CardContent>
          </Card>

          {/* Lab Charts */}
          <Card id="lab-trends-zone">
            <CardHeader>
              <CardTitle>
                <CardIcon color="#764ba2">📈</CardIcon>
                Lab Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LabChart
                encounters={patientData?.encounters || []}
                medicationTimeline={medicationTimeline}
              />
            </CardContent>
          </Card>

          {/* Differential Diagnosis */}
          <Card id="differential-diagnosis-zone">
            <DifferentialDiagnosis patientData={patientData} />
          </Card>
        </div>
      </DashboardContent>

      {/* Quick Note Modal */}
      <QuickNoteModal isOpen={isQuickNoteOpen}>
        <QuickNoteContent>
          <QuickNoteHeader>
            <QuickNoteTitle>Quick Clinical Note</QuickNoteTitle>
            <CloseButton onClick={handleQuickNoteCancel}>×</CloseButton>
          </QuickNoteHeader>

          <QuickNoteTextArea
            value={quickNoteContent}
            onChange={(e) => setQuickNoteContent(e.target.value)}
            placeholder="Enter your clinical observation, decision, or follow-up note..."
            autoFocus
          />

          <QuickNoteActions>
            <ActionButton onClick={handleQuickNoteCancel}>Cancel</ActionButton>
            <ActionButton onClick={handleQuickNoteSave}>Save Note</ActionButton>
          </QuickNoteActions>
        </QuickNoteContent>
      </QuickNoteModal>
    </DashboardContainer>
  );
};

export default ModernAdverseEventDashboard;
