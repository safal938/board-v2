import React from "react";
import styled from "styled-components";

const AnalyticsContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
`;

const SectionDescription = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
`;

// Adverse Events Table
const AdverseEventsSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  /* Add focus highlighting */
  &.focused {
    border: 3px solid #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }
`;

const TableContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
`;

const Table = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f8fafc;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  padding: 12px 16px;
  font-size: 12px;
  color: #4b5563;
  border-right: 1px solid #f1f5f9;
  line-height: 1.4;

  &:last-child {
    border-right: none;
  }
`;

const SeverityBadge = styled.span<{ severity: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;

  ${(props) => {
    switch (props.severity.toLowerCase()) {
      case "severe":
      case "4":
        return `
          background: #fecaca;
          color: #dc2626;
        `;
      case "moderate":
      case "3":
        return `
          background: #fed7aa;
          color: #ea580c;
        `;
      case "mild":
      case "2":
        return `
          background: #fef3c7;
          color: #d97706;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #64748b;
        `;
    }
  }}
`;

const SeverityLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
`;

const LegendDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.color};
`;

// RUCAM Causality Assessment
const CausalitySection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  /* Add focus highlighting */
  &.focused {
    border: 3px solid #f59e0b;
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }
`;

const RucamWidget = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
`;

const RucamScore = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const RucamLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
`;

const RucamBar = styled.div`
  height: 8px;
  background: linear-gradient(to right, #10b981, #f59e0b, #ef4444, #dc2626);
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
`;

const RucamIndicator = styled.div<{ position: number }>`
  position: absolute;
  top: -2px;
  left: ${(props) => props.position}%;
  width: 12px;
  height: 12px;
  background: #1e293b;
  border-radius: 50%;
  transform: translateX(-50%);
`;

const RucamCategories = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
`;

const RucamTable = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const RucamTableRow = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 2fr 3fr 0.5fr 2fr;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &:first-child {
    background: #f8fafc;
    font-weight: 600;
  }
`;

const RucamCell = styled.div`
  padding: 12px 16px;
  font-size: 12px;
  color: #4b5563;
  border-right: 1px solid #f1f5f9;
  line-height: 1.4;

  &:last-child {
    border-right: none;
  }
`;

// Medical Reasoning
const ReasoningSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  /* Add focus highlighting */
  &.focused {
    border: 3px solid #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }
`;

const ReasoningText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  text-align: justify;
`;

const HighlightBox = styled.div`
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
`;

const HighlightText = styled.div`
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
  line-height: 1.5;
`;

interface AdverseEventAnalyticsProps {
  patientData: any;
}

const AdverseEventAnalytics: React.FC<AdverseEventAnalyticsProps> = ({
  patientData,
}) => {
  // Use the adverse events from patientData directly
  const adverseEvents = patientData?.adverseEvents || [];
  const riskAssessment = patientData?.riskAssessment || {};

  // Mock RUCAM data for display
  const rucam = {
    total_score: 8,
    causality_category: "Probable DILI",
    columns: ["#", "Parameter", "Finding", "Score", "Notes"],
    rows: [
      [
        "1",
        "Time to onset",
        "5-90 days from drug start",
        "+2",
        "MTX reintroduced Sept 2025",
      ],
      [
        "2",
        "Course after stopping",
        "Not yet stopped",
        "0",
        "Ongoing exposure",
      ],
      [
        "3",
        "Risk factors",
        "Age >55, alcohol use",
        "+1",
        "Multiple risk factors present",
      ],
      [
        "4",
        "Concomitant drugs",
        "Turmeric supplement",
        "+1",
        "Known hepatotoxin",
      ],
      [
        "5",
        "Exclusion of non-drug causes",
        "Viral hepatitis pending",
        "+2",
        "Awaiting serology",
      ],
      [
        "6",
        "Previous hepatotoxicity",
        "Prior GI intolerance to MTX",
        "+1",
        "Known sensitivity",
      ],
      [
        "7",
        "Response to rechallenge",
        "Symptoms worsened",
        "+1",
        "Temporal correlation",
      ],
    ],
  };

  const ctcae = {
    overall_grade: "Grade 3-4 (Severe)",
    parameters: [
      { name: "ALT elevation", grade: "3-4", description: "Expected >5x ULN" },
      {
        name: "Fatigue",
        grade: "3",
        description: "Severe, limiting self-care",
      },
    ],
  };

  const reasoning =
    riskAssessment?.keyRiskFactors?.join(". ") ||
    "High risk for Drug-Induced Liver Injury (DILI) due to Methotrexate reintroduction without adequate monitoring, combined with turmeric supplement use and metabolic risk factors.";

  const getRucamPosition = (score: number) => {
    // RUCAM scale: ≤0 (Excluded), 1-2 (Unlikely), 3-5 (Possible), 6-8 (Probable), ≥9 (Highly Probable)
    if (score <= 0) return 10;
    if (score <= 2) return 25;
    if (score <= 5) return 50;
    if (score <= 8) return 75;
    return 90;
  };

  return (
    <AnalyticsContainer>
      {/* Adverse Events Section */}
      <AdverseEventsSection id="adverse-events-zone">
        <SectionTitle>Adverse Event Analytics Zone</SectionTitle>
        <SectionDescription>
          Brief description about the presenting complaints or symptoms after
          admission. Severity mapping based on 4 level scoring system (mild,
          moderate, severe, critical) or CTCAE
        </SectionDescription>

        <TableContainer>
          <Table>
            <TableHeader>Adverse Events</TableHeader>
            <TableRow>
              <TableCell style={{ fontWeight: "600", background: "#f8fafc" }}>
                Event
              </TableCell>
              <TableCell style={{ fontWeight: "600", background: "#f8fafc" }}>
                Severity
              </TableCell>
              <TableCell style={{ fontWeight: "600", background: "#f8fafc" }}>
                Description
              </TableCell>
            </TableRow>
            {adverseEvents.map((event, index) => (
              <TableRow key={index}>
                <TableCell>{event.event}</TableCell>
                <TableCell>
                  <SeverityBadge severity={event.severity}>
                    {event.severity}
                  </SeverityBadge>
                </TableCell>
                <TableCell>{event.description}</TableCell>
              </TableRow>
            ))}
          </Table>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <TableHeader>Severity Levels</TableHeader>
            <SeverityLegend>
              <LegendItem>
                <LegendDot color="#dc2626" />
                <span>Severe</span>
              </LegendItem>
              <LegendItem>
                <LegendDot color="#ea580c" />
                <span>Moderate</span>
              </LegendItem>
              <LegendItem>
                <LegendDot color="#d97706" />
                <span>Mild</span>
              </LegendItem>
            </SeverityLegend>
          </div>
        </TableContainer>
      </AdverseEventsSection>

      {/* RUCAM Causality Assessment */}
      <CausalitySection id="causality-assessment-zone">
        <SectionTitle>Causality Assessment Zone</SectionTitle>
        <SectionDescription>
          Auto-calculated RUCAM like scoring system
        </SectionDescription>

        <RucamWidget>
          <div style={{ fontWeight: "600", marginBottom: "8px" }}>
            Causality Assessment Widget
          </div>
          <RucamScore>RUCAM: {rucam.total_score}</RucamScore>
          <RucamLabel>{rucam.causality_category}</RucamLabel>
          <RucamBar>
            <RucamIndicator position={getRucamPosition(rucam.total_score)} />
          </RucamBar>
          <RucamCategories>
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
            <span>Life threatening</span>
          </RucamCategories>
        </RucamWidget>

        <RucamTable>
          <RucamTableRow>
            {rucam.columns.map((col, index) => (
              <RucamCell key={index}>{col}</RucamCell>
            ))}
          </RucamTableRow>
          {rucam.rows.map((row, index) => (
            <RucamTableRow key={index}>
              {row.map((cell, cellIndex) => (
                <RucamCell key={cellIndex}>{cell}</RucamCell>
              ))}
            </RucamTableRow>
          ))}
        </RucamTable>
      </CausalitySection>

      {/* Medical Reasoning */}
      <ReasoningSection id="medical-reasoning-zone">
        <SectionTitle>Medical Reasoning Zone</SectionTitle>
        <SectionDescription>
          Defining adverse event (Eg: Probable DILI due to TMP-SMX + MTX)
          Evidence (Eg: ALT rise 6 days post exposure) Rationale: Pattern,
          timing, dechallenge
        </SectionDescription>

        <HighlightBox>
          <HighlightText>
            <strong>Assessment:</strong> {rucam.causality_category} DILI •{" "}
            <strong>CTCAE Grade:</strong> {ctcae.overall_grade}
          </HighlightText>
        </HighlightBox>

        <ReasoningText>{reasoning}</ReasoningText>
      </ReasoningSection>
    </AnalyticsContainer>
  );
};

export default AdverseEventAnalytics;
