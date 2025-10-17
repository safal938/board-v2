import React from "react";
import styled from "styled-components";

const DocumentContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-family: "Times New Roman", Times, serif;
  line-height: 1.6;
  color: #333;
  max-height: 600px;
  overflow-y: auto;
`;

const DocumentTitle = styled.h1`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #000;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
`;

const PatientHeader = styled.div`
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-left: 4px solid #007bff;
`;

const PatientInfo = styled.p`
  margin: 5px 0;
  font-size: 14px;
  font-weight: bold;
`;

const EncounterSection = styled.div`
  margin-bottom: 40px;
  page-break-inside: avoid;
`;

const EncounterHeader = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #000;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
`;

const SectionHeading = styled.h3`
  font-size: 14px;
  font-weight: bold;
  margin: 15px 0 8px 0;
  color: #333;
  text-transform: uppercase;
`;

const Paragraph = styled.p`
  margin: 8px 0;
  font-size: 12px;
  text-align: justify;
`;

const BulletList = styled.ul`
  margin: 8px 0 8px 20px;
  padding: 0;
`;

const BulletItem = styled.li`
  margin: 4px 0;
  font-size: 12px;
`;

const SubBulletList = styled.ul`
  margin: 4px 0 4px 15px;
  padding: 0;
`;

const SubBulletItem = styled.li`
  margin: 2px 0;
  font-size: 11px;
  list-style-type: circle;
`;

const MetaInfo = styled.div`
  background: #f0f0f0;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 11px;
`;

const RiskBadge = styled.span<{ color: string }>`
  background: ${(props) => {
    switch (props.color) {
      case "red":
        return "#dc3545";
      case "amber":
        return "#ffc107";
      case "green":
        return "#28a745";
      default:
        return "#6c757d";
    }
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 10px;
`;

interface EncounterDocumentProps {
  patientData: any;
}

const EncounterDocument: React.FC<EncounterDocumentProps> = ({
  patientData,
}) => {
  if (!patientData) return null;

  const {
    patient,
    encounters = [],
    problem_list = [],
    medication_timeline = [],
  } = patientData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMedications = (medications: any[]) => {
    if (!medications || medications.length === 0)
      return <Paragraph>None documented</Paragraph>;

    return (
      <BulletList>
        {medications.map((med, index) => (
          <BulletItem key={index}>
            <strong>{med.name}</strong> {med.dose} {med.route} {med.frequency}
            {med.indication && ` (for ${med.indication})`}
          </BulletItem>
        ))}
      </BulletList>
    );
  };

  const renderPhysicalExam = (exam: any) => {
    if (!exam) return <Paragraph>Not documented</Paragraph>;

    return (
      <BulletList>
        {Object.entries(exam).map(([system, findings]) => (
          <BulletItem key={system}>
            <strong>{system.toUpperCase()}:</strong>{" "}
            {typeof findings === "object"
              ? JSON.stringify(findings)
              : String(findings)}
          </BulletItem>
        ))}
      </BulletList>
    );
  };

  const renderPlan = (plan: any) => {
    if (!plan) return <Paragraph>No plan documented</Paragraph>;

    return (
      <div>
        {plan.investigations && (
          <>
            <SectionHeading>Investigations</SectionHeading>
            {plan.investigations.labs && (
              <>
                <strong>Laboratory:</strong>
                <BulletList>
                  {plan.investigations.labs.map(
                    (lab: string, index: number) => (
                      <BulletItem key={index}>{lab}</BulletItem>
                    )
                  )}
                </BulletList>
              </>
            )}
            {plan.investigations.imaging &&
              plan.investigations.imaging.length > 0 && (
                <>
                  <strong>Imaging:</strong>
                  <BulletList>
                    {plan.investigations.imaging.map(
                      (img: string, index: number) => (
                        <BulletItem key={index}>{img}</BulletItem>
                      )
                    )}
                  </BulletList>
                </>
              )}
          </>
        )}

        {plan.management && (
          <>
            <SectionHeading>Management</SectionHeading>
            {plan.management.medications_started && (
              <>
                <strong>Medications Started:</strong>
                {renderMedications(plan.management.medications_started)}
              </>
            )}
            {plan.management.education && (
              <>
                <strong>Patient Education:</strong>
                <BulletList>
                  {plan.management.education.map(
                    (item: string, index: number) => (
                      <BulletItem key={index}>{item}</BulletItem>
                    )
                  )}
                </BulletList>
              </>
            )}
          </>
        )}

        {plan.medications_started && (
          <>
            <strong>New Medications:</strong>
            {renderMedications(plan.medications_started)}
          </>
        )}

        {plan.continue_meds && (
          <>
            <strong>Continue:</strong>
            <BulletList>
              {plan.continue_meds.map((med: string, index: number) => (
                <BulletItem key={index}>{med}</BulletItem>
              ))}
            </BulletList>
          </>
        )}
      </div>
    );
  };

  return (
    <DocumentContainer>
      <DocumentTitle>Clinical Encounter Documentation</DocumentTitle>

      <PatientHeader>
        <PatientInfo>
          <strong>Patient:</strong> {patient.name}
        </PatientInfo>
        <PatientInfo>
          <strong>Sex:</strong> {patient.sex}
        </PatientInfo>
        <PatientInfo>
          <strong>Age at First Encounter:</strong>{" "}
          {patient.age_at_first_encounter} years
        </PatientInfo>
        {patient.identifiers?.mrn && (
          <PatientInfo>
            <strong>MRN:</strong> {patient.identifiers.mrn}
          </PatientInfo>
        )}
      </PatientHeader>

      {problem_list.length > 0 && (
        <EncounterSection>
          <EncounterHeader>Active Problem List</EncounterHeader>
          <BulletList>
            {problem_list.map((problem: any, index: number) => (
              <BulletItem key={index}>
                <strong>{problem.name}</strong> - {problem.status} (since{" "}
                {problem.first_recorded})
              </BulletItem>
            ))}
          </BulletList>
        </EncounterSection>
      )}

      {encounters.map((encounter: any, index: number) => (
        <EncounterSection key={index}>
          <EncounterHeader>
            Encounter {encounter.encounter_no}: {encounter.reason_for_visit}
            {encounter.meta?.ui_risk_color && (
              <RiskBadge color={encounter.meta.ui_risk_color}>
                {encounter.meta.ui_risk_color.toUpperCase()} RISK
              </RiskBadge>
            )}
          </EncounterHeader>

          <MetaInfo>
            <strong>Date:</strong> {formatDate(encounter.meta.date_time)} |
            <strong> Visit Type:</strong> {encounter.meta.visit_type} |
            <strong> Provider:</strong>{" "}
            {encounter.meta.provider?.name || "Not specified"}(
            {encounter.meta.provider?.specialty || "General"})
          </MetaInfo>

          {encounter.chief_complaint && (
            <>
              <SectionHeading>Chief Complaint</SectionHeading>
              <Paragraph>{encounter.chief_complaint}</Paragraph>
            </>
          )}

          {encounter.hpi && (
            <>
              <SectionHeading>History of Present Illness</SectionHeading>
              <Paragraph>{encounter.hpi}</Paragraph>
            </>
          )}

          {encounter.hpc_ros && (
            <>
              <SectionHeading>History & Review of Systems</SectionHeading>
              <Paragraph>{encounter.hpc_ros}</Paragraph>
            </>
          )}

          {encounter.medications_prior &&
            encounter.medications_prior.length > 0 && (
              <>
                <SectionHeading>Current Medications</SectionHeading>
                {renderMedications(encounter.medications_prior)}
              </>
            )}

          {encounter.current_meds && encounter.current_meds.length > 0 && (
            <>
              <SectionHeading>Current Medications</SectionHeading>
              <BulletList>
                {encounter.current_meds.map((med: string, medIndex: number) => (
                  <BulletItem key={medIndex}>{med}</BulletItem>
                ))}
              </BulletList>
            </>
          )}

          {encounter.alcohol_smoking && (
            <>
              <SectionHeading>Social History</SectionHeading>
              <BulletList>
                {encounter.alcohol_smoking.alcohol && (
                  <BulletItem>
                    <strong>Alcohol:</strong>{" "}
                    {encounter.alcohol_smoking.alcohol}
                  </BulletItem>
                )}
                {encounter.alcohol_smoking.smoking && (
                  <BulletItem>
                    <strong>Smoking:</strong>{" "}
                    {encounter.alcohol_smoking.smoking}
                  </BulletItem>
                )}
              </BulletList>
            </>
          )}

          {encounter.examination && (
            <>
              <SectionHeading>Physical Examination</SectionHeading>
              {renderPhysicalExam(encounter.examination)}
            </>
          )}

          {encounter.physical_exam && (
            <>
              <SectionHeading>Physical Examination</SectionHeading>
              {renderPhysicalExam(encounter.physical_exam)}
            </>
          )}

          {encounter.assessment && (
            <>
              <SectionHeading>Assessment</SectionHeading>
              <Paragraph>
                <strong>Impression:</strong> {encounter.assessment.impression}
              </Paragraph>
              {encounter.assessment.differential &&
                encounter.assessment.differential.length > 0 && (
                  <>
                    <strong>Differential Diagnosis:</strong>
                    <BulletList>
                      {encounter.assessment.differential.map(
                        (diff: string, diffIndex: number) => (
                          <BulletItem key={diffIndex}>{diff}</BulletItem>
                        )
                      )}
                    </BulletList>
                  </>
                )}
            </>
          )}

          {encounter.plan && (
            <>
              <SectionHeading>Plan</SectionHeading>
              {renderPlan(encounter.plan)}
            </>
          )}

          {encounter.follow_up && encounter.follow_up.instructions && (
            <>
              <SectionHeading>Follow-up Instructions</SectionHeading>
              <BulletList>
                {encounter.follow_up.instructions.map(
                  (instruction: string, instIndex: number) => (
                    <BulletItem key={instIndex}>{instruction}</BulletItem>
                  )
                )}
              </BulletList>
            </>
          )}

          {encounter.next_review && (
            <Paragraph>
              <strong>Next Review:</strong> {encounter.next_review}
            </Paragraph>
          )}
        </EncounterSection>
      ))}
    </DocumentContainer>
  );
};

export default EncounterDocument;
