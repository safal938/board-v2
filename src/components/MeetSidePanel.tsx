import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { meet, type MeetSidePanelClient } from '@googleworkspace/meet-addons/meet.addons';

const SidePanelContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h2`
  margin: 0;
  color: #1a73e8;
  font-size: 18px;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.4;
`;

const LaunchButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1557b0;
  }

  &:disabled {
    background: #dadce0;
    cursor: not-allowed;
  }
`;

const JoinAgentButton = styled.button`
  background: #34a853;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2d8e47;
  }

  &:disabled {
    background: #dadce0;
    cursor: not-allowed;
  }
`;

const StatusText = styled.div`
  font-size: 12px;
  color: #5f6368;
  font-style: italic;
`;

const SuccessMessage = styled.div`
  background: #e6f4ea;
  color: #137333;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid #34a853;
`;

const ErrorMessage = styled.div`
  background: #fce8e6;
  color: #c5221f;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid #ea4335;
`;

const Divider = styled.div`
  height: 1px;
  background: #dadce0;
  margin: 8px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }

  &::placeholder {
    color: #9aa0a6;
  }
`;

const InputLabel = styled.label`
  font-size: 13px;
  color: #5f6368;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const LogoText = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #1a73e8;
  margin: 0;
`;

const MeetSidePanel: React.FC = () => {
  const [client, setClient] = useState<MeetSidePanelClient>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [agentStatus, setAgentStatus] = useState<string>('');
  const [isJoiningAgent, setIsJoiningAgent] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState<string>('');
  const [customMeetUrl, setCustomMeetUrl] = useState<string>('');

  useEffect(() => {
    const initializeMeetSession = async () => {
      try {
        // Check if we're in a Google Meet context
        if (typeof window !== 'undefined' && !window.location.href.includes('meet.google.com')) {
          // Development mode - show demo interface
          setError('Demo Mode: This component works within Google Meet. Configure your GCP project number and deploy to use in Meet.');
          setIsLoading(false);
          return;
        }

        // Get meeting URL from window location
        const currentUrl = window.location.href;
        const meetUrlMatch = currentUrl.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
        if (meetUrlMatch) {
          setMeetingUrl(`https://meet.google.com/${meetUrlMatch[1]}`);
        }

        // Replace with your actual GCP project number
        const gcpProjectNumber = process.env.REACT_APP_GCP_PROJECT_NUMBER;
        if (!gcpProjectNumber || gcpProjectNumber === 'YOUR_GCP_PROJECT_NUMBER') {
          setError('Please set REACT_APP_GCP_PROJECT_NUMBER in your environment variables');
          setIsLoading(false);
          return;
        }

        const session = await meet.addon.createAddonSession({
          cloudProjectNumber: gcpProjectNumber
        });
        
        const sidePanelClient = await session.createSidePanelClient();
        setClient(sidePanelClient);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Meet session:', err);
        setError('Failed to initialize Google Meet integration');
        setIsLoading(false);
      }
    };

    initializeMeetSession();
  }, []);

  const handleLaunchActivity = async () => {
    if (!client) return;

    try {
      await client.startActivity({
        mainStageUrl: `${window.location.origin}/meet/Mainstage`
      });
    } catch (err) {
      console.error('Failed to launch activity:', err);
      setError('Failed to launch board in main stage');
    }
  };

  const handleJoinAgent = async () => {
    setIsJoiningAgent(true);
    setAgentStatus('');
    setError(''); // Clear previous errors

    try {
      // Use the direct API endpoint
      const API_URL = 'https://api.medforce-ai.com';
      const endpoint = `${API_URL}/join-meeting`;
      
      // Use custom URL if provided, otherwise use detected meeting URL
      const targetMeetingUrl = customMeetUrl || meetingUrl || window.location.href;
      
      console.log('🤖 Joining agent to:', targetMeetingUrl);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetUrl: targetMeetingUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAgentStatus('success');
        console.log('✅ Agent joined successfully:', data);
      } else {
        setAgentStatus('error');
        const errorText = await response.text();
        console.error('❌ Failed to join agent:', response.status, errorText);
        setError(`API Error: ${response.status} - ${errorText || 'Please check API endpoint and try again.'}`);
      }
    } catch (err: any) {
      console.error('❌ Error joining agent:', err);
      setAgentStatus('error');
      
      // Check if it's a network or CORS error
      if (err.message?.includes('Failed to fetch')) {
        setError('⚠️ Connection Error: Unable to reach API at https://api.medforce-ai.com. Please check if the API is running and accessible.');
      } else {
        setError(`Error: ${err.message || 'Unknown error occurred'}`);
      }
    } finally {
      setIsJoiningAgent(false);
    }
  };

  if (isLoading) {
    return (
      <SidePanelContainer>
        <StatusText>Initializing Google Meet integration...</StatusText>
      </SidePanelContainer>
    );
  }

  if (error) {
    return (
      <SidePanelContainer>
        <LogoContainer>
          <Logo src="/sidepanelogo.png" alt="Logo" />
          <LogoText>Adverse Events</LogoText>
        </LogoContainer>
        
        <Title>MedForce Board</Title>
        <StatusText style={{ color: '#d93025', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </StatusText>
        {error.includes('Demo Mode') && (
          <div style={{ background: '#e8f0fe', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#1a73e8' }}>
            <strong>Setup Instructions:</strong>
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Get your Google Cloud Project number from the GCP Console</li>
              <li>Add REACT_APP_GCP_PROJECT_NUMBER=your_project_number to your .env file</li>
              <li>Deploy your app to a public URL</li>
              <li>Configure your Meet Add-on in Google Cloud Console</li>
            </ol>
          </div>
        )}
      </SidePanelContainer>
    );
  }

  return (
    <SidePanelContainer>
      <LogoContainer>
        <Logo src="/sidepanelogo.png" alt="Logo" />
        <LogoText>Adverse Events</LogoText>
      </LogoContainer>
      
      <Title>MedForce Board</Title>
      <Description>
        Launch the collaborative medical board in the main stage where everyone in the call can see and interact with it.
      </Description>
      <LaunchButton 
        onClick={handleLaunchActivity}
        disabled={!client}
      >
        Launch Board in Main Stage
      </LaunchButton>
      <StatusText>
        Only you can see this side panel. Click the button above to share the board with everyone in the call.
      </StatusText>

      <Divider />

      <Title style={{ fontSize: '16px', marginTop: '8px' }}>AI Assistant</Title>
      <Description>
        Join an AI agent to the meeting that can help with medical documentation and analysis.
      </Description>
      
      <div style={{ marginTop: '8px' }}>
        <InputLabel htmlFor="meetUrl">Meeting URL (optional)</InputLabel>
        <Input
          id="meetUrl"
          type="text"
          placeholder={meetingUrl || "https://meet.google.com/xxx-xxxx-xxx"}
          value={customMeetUrl}
          onChange={(e) => setCustomMeetUrl(e.target.value)}
        />
        <StatusText style={{ marginTop: '4px' }}>
          {customMeetUrl ? 'Using custom URL' : meetingUrl ? 'Auto-detected from current meeting' : 'Enter meeting URL manually'}
        </StatusText>
      </div>

      <JoinAgentButton 
        onClick={handleJoinAgent}
        disabled={isJoiningAgent || (!customMeetUrl && !meetingUrl)}
      >
        {isJoiningAgent ? 'Joining Agent...' : 'Join AI Agent'}
      </JoinAgentButton>

      {agentStatus === 'success' && (
        <SuccessMessage>
          ✅ AI Agent has joined the meeting successfully!
        </SuccessMessage>
      )}

      {agentStatus === 'error' && (
        <ErrorMessage>
          ❌ Failed to join AI Agent. {error || 'Please try again.'}
        </ErrorMessage>
      )}

      {(customMeetUrl || meetingUrl) && (
        <StatusText style={{ fontSize: '11px', marginTop: '8px' }}>
          Target: {customMeetUrl || meetingUrl}
        </StatusText>
      )}
    </SidePanelContainer>
  );
};

export default MeetSidePanel;