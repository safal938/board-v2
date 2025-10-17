import React from "react";
import styled from "styled-components";

const TimelineContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  transition: all 0.3s ease;
  
  /* Add focus highlighting */
  &.focused {
    border: 3px solid #06b6d4;
    box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
    border-radius: 12px;
    padding: 8px;
  }
  overflow-y: visible;
  padding: 20px;
`;

const TimelineWrapper = styled.div`
  position: relative;
  min-width: max-content;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const TimelineUpper = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 20px;
  min-height: 120px;
`;

const TimelineMiddle = styled.div`
  position: relative;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimelineLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  border-top: 2px dashed #666;
  z-index: 1;
  transform: translateY(-1px);
`;

const MedicationLine = styled.div<{
  color: string;
  startPercent: number;
  endPercent: number;
  offset: number;
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: ${(props) => props.color};
  left: calc(
    ${(props) => props.startPercent}% + ${(props) => props.offset * 8}px
  );
  z-index: 2;
  border-radius: 2px;
  opacity: 0.8;

  &::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -2px;
    width: 8px;
    height: 8px;
    background: ${(props) => props.color};
    border-radius: 50%;
    border: 2px solid white;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: -2px;
    width: 8px;
    height: 8px;
    background: ${(props) => props.color};
    border-radius: 50%;
    border: 2px solid white;
  }
`;

const MedicationLegend = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 10;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #666;

  &::before {
    content: "";
    width: 12px;
    height: 4px;
    background: ${(props) => props.color};
    border-radius: 2px;
  }
`;

const TimelineLower = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  min-height: 120px;
`;

const TimelineSlot = styled.div<{ isEmpty?: boolean }>`
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-right: 20px;
`;

const EncounterCard = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 10px;
  line-height: 1.3;
  width: 180px;
  position: relative;
`;

const EncounterDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #333;
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
`;

const ConnectorLine = styled.div<{ isAbove: boolean }>`
  width: 1px;
  height: 10px;
  background: #333;
  margin: 0 auto;
`;

const EncounterDate = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 4px;
`;

const EncounterEvent = styled.div`
  color: #555;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 11px;
`;

const InfoSection = styled.div`
  margin-bottom: 6px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #666;
  font-size: 10px;
`;

const InfoValue = styled.div`
  color: #333;
  font-size: 10px;
  margin-top: 2px;
`;

const MedicationChange = styled.div<{ type: "start" | "stop" | "change" }>`
  font-size: 9px;
  margin-bottom: 2px;
  padding: 2px 4px;
  border-radius: 3px;
  background: ${(props) =>
    props.type === "start"
      ? "#e8f5e9"
      : props.type === "stop"
      ? "#ffebee"
      : "#fff3e0"};
  color: ${(props) =>
    props.type === "start"
      ? "#2e7d32"
      : props.type === "stop"
      ? "#c62828"
      : "#ef6c00"};
`;

const ConfidenceScore = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f5f5f5;
  color: #666;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
  border: 1px solid #e0e0e0;
`;

interface EncounterTimelineProps {
  encounters: any[];
  medicationTimeline: any[];
}

const EncounterTimeline: React.FC<EncounterTimelineProps> = ({
  encounters,
  medicationTimeline,
}) => {
  const getConfidenceScore = (encounter: any): number => {
    // Calculate AE risk based on encounter data
    const encounterDate = new Date(encounter.date || encounter.meta?.date_time);
    const currentDate = new Date();
    const daysSince = Math.floor((currentDate.getTime() - encounterDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check for risk indicators in notes or diagnosis
    const notes = (encounter.notes || '').toLowerCase();
    const diagnosis = (encounter.diagnosis || '').toLowerCase();
    const medications = encounter.medications || [];
    
    // High risk indicators
    if (notes.includes('mtx') || notes.includes('methotrexate') || 
        diagnosis.includes('mtx') || diagnosis.includes('methotrexate')) {
      if (notes.includes('reintroduction') || notes.includes('reintroduc') || notes.includes('restarted')) {
        return 85; // Very high risk - MTX reintroduction
      }
      return 65; // High risk - MTX use
    }
    
    // Check for concerning medications
    const hasMethotrexate = medications.some((med: string) => 
      med.toLowerCase().includes('methotrexate') || med.toLowerCase().includes('mtx')
    );
    
    if (hasMethotrexate) {
      return 70; // High risk
    }
    
    // Check for flare or elevated markers
    if (diagnosis.includes('flare') || notes.includes('elevated')) {
      return 55; // Moderate-high risk
    }
    
    // Older encounters with no specific risk indicators
    if (daysSince > 365) {
      return 20; // Low risk - old encounter
    }
    
    // Default moderate risk
    return 35;
  };

  const getMedicationChangesForEncounter = (encounter: any) => {
    const encounterDate = new Date(encounter.date || encounter.meta?.date_time);

    // Find medication changes around this encounter date
    const changes: any[] = [];

    // Check for new medications started
    medicationTimeline.forEach((med) => {
      const startDate = new Date(med.startDate || med.start);
      const timeDiff = Math.abs(encounterDate.getTime() - startDate.getTime());
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      if (daysDiff <= 7) {
        // Within 7 days of encounter
        changes.push({
          type: "start",
          medication: `${med.medication || med.name} ${med.dose}`,
          frequency: med.frequency || '',
        });
      }

      // Check for stopped medications
      if (med.endDate || med.end) {
        const endDate = new Date(med.endDate || med.end);
        const endTimeDiff = Math.abs(
          encounterDate.getTime() - endDate.getTime()
        );
        const endDaysDiff = endTimeDiff / (1000 * 3600 * 24);

        if (endDaysDiff <= 7) {
          changes.push({
            type: "stop",
            medication: `${med.medication || med.name} ${med.dose}`,
            frequency: med.frequency || '',
          });
        }
      }
    });

    // Add medications from encounter if available
    if (encounter.medications && Array.isArray(encounter.medications)) {
      encounter.medications.forEach((med: string) => {
        if (!changes.some(c => c.medication.includes(med.split(' ')[0]))) {
          changes.push({
            type: "start",
            medication: med,
            frequency: '',
          });
        }
      });
    }

    return changes;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getKeyDiagnoses = (encounter: any) => {
    // Try different diagnosis fields
    if (encounter.diagnosis) {
      return encounter.diagnosis;
    }
    if (encounter.diagnoses && encounter.diagnoses.length > 0) {
      return encounter.diagnoses
        .slice(0, 2)
        .map((d: any) => d.display || d.label || d)
        .join(", ");
    }
    if (encounter.assessment?.impression) {
      return encounter.assessment.impression;
    }
    return "Routine visit";
  };

  const renderEncounterCard = (encounter: any, index: number) => {
    const confidenceScore = getConfidenceScore(encounter);
    const medicationChanges = getMedicationChangesForEncounter(encounter);
    const keyDiagnoses = getKeyDiagnoses(encounter);

    return (
      <EncounterCard key={encounter.encounter_no || index}>
        <ConfidenceScore>AE Risk: {confidenceScore}%</ConfidenceScore>

        <EncounterDate>{formatDate(encounter.date || encounter.meta?.date_time)}</EncounterDate>

        <EncounterEvent>
          {encounter.type || encounter.reason_for_visit ||
            encounter.chief_complaint ||
            "Routine visit"}
        </EncounterEvent>

        <InfoSection>
          <InfoLabel>Key Diagnoses:</InfoLabel>
          <InfoValue>{keyDiagnoses}</InfoValue>
        </InfoSection>

        {medicationChanges.length > 0 && (
          <InfoSection>
            <InfoLabel>Medication Changes:</InfoLabel>
            <InfoValue>
              {medicationChanges.map((change, idx) => (
                <MedicationChange key={idx} type={change.type}>
                  {change.type.toUpperCase()}: {change.medication}
                </MedicationChange>
              ))}
            </InfoValue>
          </InfoSection>
        )}

        {encounter.notes && (
          <InfoSection>
            <InfoLabel>Notes:</InfoLabel>
            <InfoValue>{encounter.notes}</InfoValue>
          </InfoSection>
        )}
        
        {encounter.provider && (
          <InfoSection>
            <InfoLabel>Provider:</InfoLabel>
            <InfoValue>{encounter.provider}</InfoValue>
          </InfoSection>
        )}
      </EncounterCard>
    );
  };

  // Create medication timeline data
  const createMedicationLines = () => {
    if (encounters.length === 0) return { lines: [], legend: [] };

    const medicationColors = {
      Methotrexate: "#dc2626", // Red
      "Folic Acid": "#16a34a", // Green
      Lisinopril: "#2563eb", // Blue
      "Trimethoprim-Sulfamethoxazole": "#7c3aed", // Purple
      "TMP-SMX": "#7c3aed", // Purple
      Ibuprofen: "#0891b2", // Cyan (instead of orange)
    };

    const medicationLines: any[] = [];
    const usedMedications = new Set();
    let offsetIndex = 0;

    // Create encounter date map for positioning
    const encounterDates = encounters.map(
      (enc) => new Date(enc.date || enc.meta?.date_time)
    );
    const slotSpacing = 200; // Same as timeline layout
    const dotOffset = 90; // Same as timeline layout

    medicationTimeline.forEach((med) => {
      const medName = med.medication || med.name;
      const startDate = new Date(med.startDate || med.start);
      const endDate = (med.endDate || med.end) ? new Date(med.endDate || med.end) : new Date();

      // Find closest encounter dates for start and end
      let startPosition = 0;
      let endPosition = 0;

      // Find start position - align with encounter dots
      for (let i = 0; i < encounterDates.length; i++) {
        if (startDate <= encounterDates[i]) {
          if (i === 0) {
            startPosition = dotOffset;
          } else {
            // Interpolate between encounters
            const prevDate = encounterDates[i - 1];
            const nextDate = encounterDates[i];
            const ratio =
              (startDate.getTime() - prevDate.getTime()) /
              (nextDate.getTime() - prevDate.getTime());
            startPosition =
              (i - 1) * slotSpacing + dotOffset + ratio * slotSpacing;
          }
          break;
        }
      }

      // If start date is after all encounters, position at the end
      if (startDate > encounterDates[encounterDates.length - 1]) {
        startPosition = (encounterDates.length - 1) * slotSpacing + dotOffset;
      }

      // Find end position
      for (let i = 0; i < encounterDates.length; i++) {
        if (endDate <= encounterDates[i]) {
          if (i === 0) {
            endPosition = dotOffset;
          } else {
            const prevDate = encounterDates[i - 1];
            const nextDate = encounterDates[i];
            const ratio =
              (endDate.getTime() - prevDate.getTime()) /
              (nextDate.getTime() - prevDate.getTime());
            endPosition =
              (i - 1) * slotSpacing + dotOffset + ratio * slotSpacing;
          }
          break;
        }
      }

      // If end date is after all encounters, position at the end
      if (endDate > encounterDates[encounterDates.length - 1]) {
        endPosition = (encounterDates.length - 1) * slotSpacing + dotOffset;
      }

      const color =
        medicationColors[medName as keyof typeof medicationColors] || "#888888";

      medicationLines.push({
        id: `med-${med.name}-${med.start}`,
        name: medName,
        color,
        startPosition: Math.max(0, startPosition),
        endPosition: Math.max(startPosition + 20, endPosition), // Minimum 20px width
        offset: offsetIndex,
      });

      if (!usedMedications.has(medName)) {
        usedMedications.add(medName);
        offsetIndex++;
      }
    });

    const legend = Array.from(usedMedications).map((medName: string) => ({
      name: medName,
      color:
        medicationColors[medName as keyof typeof medicationColors] || "#888888",
    }));

    return { lines: medicationLines, legend };
  };

  // Create timeline layout: A-[empty]-C-[empty]-E / [empty]-B-[empty]-D-[empty]-F
  const createTimelineLayout = () => {
    const totalSlots = Math.max(encounters.length, 6); // Ensure we have enough slots
    const upperSlots = [];
    const lowerSlots = [];
    const dots = [];

    for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
      const encounterIndex = slotIndex;
      const hasEncounter = encounterIndex < encounters.length;

      // Calculate dot position
      const dotPosition = slotIndex * 200 + 90; // 200px spacing between slots

      if (hasEncounter) {
        const encounter = encounters[encounterIndex];
        const isUpperRow = encounterIndex % 2 === 0; // Even indices go to upper row

        // Add dot for this encounter
        dots.push(
          <EncounterDot
            key={`dot-${encounterIndex}`}
            style={{
              position: "absolute",
              left: `${dotPosition}px`,
            }}
          />
        );

        if (isUpperRow) {
          // Add encounter to upper row
          upperSlots.push(
            <TimelineSlot key={`upper-${slotIndex}`}>
              {renderEncounterCard(encounter, encounterIndex)}
              <ConnectorLine isAbove={true} />
            </TimelineSlot>
          );
          // Add empty to lower row
          lowerSlots.push(
            <TimelineSlot key={`lower-${slotIndex}`} isEmpty={true}>
              <div style={{ height: "120px" }} />
            </TimelineSlot>
          );
        } else {
          // Add empty to upper row
          upperSlots.push(
            <TimelineSlot key={`upper-${slotIndex}`} isEmpty={true}>
              <div style={{ height: "120px" }} />
            </TimelineSlot>
          );
          // Add encounter to lower row
          lowerSlots.push(
            <TimelineSlot key={`lower-${slotIndex}`}>
              <ConnectorLine isAbove={false} />
              {renderEncounterCard(encounter, encounterIndex)}
            </TimelineSlot>
          );
        }
      } else {
        // No more encounters, add empty slots
        dots.push(
          <EncounterDot
            key={`dot-${slotIndex}`}
            style={{
              position: "absolute",
              left: `${dotPosition}px`,
            }}
          />
        );

        upperSlots.push(
          <TimelineSlot key={`upper-${slotIndex}`} isEmpty={true}>
            <div style={{ height: "120px" }} />
          </TimelineSlot>
        );
        lowerSlots.push(
          <TimelineSlot key={`lower-${slotIndex}`} isEmpty={true}>
            <div style={{ height: "120px" }} />
          </TimelineSlot>
        );
      }
    }

    return { upperSlots, lowerSlots, dots };
  };

  const { upperSlots, lowerSlots, dots } = createTimelineLayout();
  const { lines: medicationLines, legend } = createMedicationLines();

  return (
    <TimelineContainer id="encounter-timeline-zone">
      {/* Medication Legend - Top Right */}
      {legend.length > 0 && (
        <MedicationLegend>
          <strong
            style={{ fontSize: "12px", color: "#374151", fontWeight: "600" }}
          >
            Medications
          </strong>
          {legend.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11px",
                color: "#6b7280",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "3px",
                  background: item.color,
                  borderRadius: "1.5px",
                }}
              />
              {item.name}
            </div>
          ))}
        </MedicationLegend>
      )}

      <TimelineWrapper>
        {/* Upper row: A-[empty]-C-[empty]-E-[empty] */}
        <TimelineUpper>{upperSlots}</TimelineUpper>

        {/* Middle line with dashed line, dots, and medication lines */}
        <TimelineMiddle>
          <TimelineLine />
          {dots}

          {/* Medication timeline lines - horizontal */}
          {medicationLines.map((medLine) => (
            <div
              key={medLine.id}
              style={{
                position: "absolute",
                top: `${50 + medLine.offset * 10}%`,
                left: `${medLine.startPosition}px`,
                width: `${medLine.endPosition - medLine.startPosition}px`,
                height: "3px",
                background: medLine.color,
                zIndex: 2,
                borderRadius: "1.5px",
                opacity: 0.9,
              }}
              title={medLine.name}
            >
              {/* Start dot */}
              <div
                style={{
                  position: "absolute",
                  top: "-2.5px",
                  left: "-3px",
                  width: "6px",
                  height: "6px",
                  background: medLine.color,
                  borderRadius: "50%",
                  border: "1.5px solid white",
                }}
              />
              {/* End dot */}
              <div
                style={{
                  position: "absolute",
                  top: "-2.5px",
                  right: "-3px",
                  width: "6px",
                  height: "6px",
                  background: medLine.color,
                  borderRadius: "50%",
                  border: "1.5px solid white",
                }}
              />
            </div>
          ))}
        </TimelineMiddle>

        {/* Lower row: [empty]-B-[empty]-D-[empty]-F */}
        <TimelineLower>{lowerSlots}</TimelineLower>
      </TimelineWrapper>
    </TimelineContainer>
  );
};

export default EncounterTimeline;
