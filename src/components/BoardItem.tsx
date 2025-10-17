import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LabResult from './LabResult';
import PatientContext from './dashboard/PatientContext';
import EncounterTimeline from './dashboard/EncounterTimeline';
import AdverseEventAnalytics from './dashboard/AdverseEventAnalytics';
import LabTable from './dashboard/LabTable';
import LabChart from './dashboard/LabChart';
import DifferentialDiagnosis from './dashboard/DifferentialDiagnosis';
import EHRSystemComponent from './encounters/EHRSystemComponent';
import EncounterDocument from './encounters/EncounterDocument';
import SingleEncounterDocument from './encounters/SingleEncounterDocument';
import RawClinicalNote from './encounters/RawClinicalNote';
import ICELabData from './encounters/ICELabData';
// Types removed for Storybook compatibility
 
  const ItemContainer = styled(motion.div)`
  position: absolute;
  cursor: move;
  border-radius: 12px;
  user-select: none;
  z-index: 10;
  will-change: transform;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
  
  &.selected {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 8px 24px rgba(0,0,0,0.2);
  }
`;

const TextContent = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  padding: 8px;
  color: #333;
  
  &::placeholder {
    color: #666;
  }
`;

const ShapeContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
`;

const StickyContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  word-wrap: break-word;
`;



    // ===== Todo Item Styles =====
    const TodoCard = styled.div`
      width: 100%;
      min-height: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: visible;
    `;

    const TodoHeader = styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: linear-gradient(135deg, #f7faff 0%, #eef5ff 100%);
      border-bottom: 1px solid #e6eefb;
    `;

    const TodoTitle = styled.div`
      font-size: 14px;
      font-weight: 700;
      color: #1e3a8a;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const TodoBody = styled.div`
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: visible;
      flex-grow: 1;
    `;

    const TodoDesc = styled.div`
      color: #475569;
      font-size: 12px;
      line-height: 1.4;
    `;

    const ProgressBar = styled.div`
      height: 8px;
      background: #f1f5f9;
      border-radius: 6px;
      overflow: hidden;
    `;

    const ProgressFill = styled.div`
      height: 100%;
      background: linear-gradient(90deg, #34d399, #10b981);
      transition: width 200ms ease;
    `;

    const TodoList = styled.ul`
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    const TodoItem = styled.li`
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 12px;
      color: #334155;
    `;

    const StatusChip = styled.span`
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      background: #94a3b8;
    `;

    // ===== Agent Result Styles =====
    const AgentCard = styled.div`
      width: 100%;
      min-height: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: visible;
    `;

    const AgentHeader = styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: linear-gradient(135deg, #f6fffb 0%, #e9fbf3 100%);
      border-bottom: 1px solid #dcfce7;
    `;

    const AgentTitle = styled.div`
      font-size: 14px;
      font-weight: 800;
      color: #065f46;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const AgentBody = styled.div`
      padding: 12px 14px;
      overflow: visible;
      color: #111827;
      font-size: 13px;
      line-height: 1.5;
      white-space: normal;
      flex-grow: 1;
    `;

    // ===== EHR Data Styles =====
    const EHRDataCard = styled.div`
      width: 100%;
      min-height: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: visible;
    `;

    const EHRDataHeader = styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-bottom: 1px solid #e9d5ff;
    `;

    const EHRDataTitle = styled.div`
      font-size: 14px;
      font-weight: 800;
      color: #581c87;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const EHRDataSource = styled.div`
      font-size: 11px;
      font-weight: 600;
      color: #7c3aed;
      background: rgba(124, 58, 237, 0.1);
      padding: 2px 8px;
      border-radius: 12px;
    `;

    const EHRDataBody = styled.div`
      padding: 12px 14px;
      overflow: visible;
      color: #111827;
      font-size: 13px;
      line-height: 1.5;
      white-space: normal;
      flex-grow: 1;
    `;

    const EHRDataType = styled.div`
      font-size: 11px;
      font-weight: 600;
      color: #7c3aed;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    `;

    const EHRDataContent = styled.div`
      color: #374151;
      margin-bottom: 8px;
      white-space: pre-wrap;
    `;

    const EHRDataTimestamp = styled.div`
      font-size: 10px;
      color: #9ca3af;
      font-style: italic;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f3f4f6;
    `;


    // Very small markdown -> HTML converter (headings, bold, italic, code, lists)
    const toHtml = (md: string) => {
      if (!md) return '';
      const escape = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      let html = escape(md);
      // code blocks ```
      html = html.replace(/```([\s\S]*?)```/g, (_m, p1) => `<pre><code>${p1}</code></pre>`);
      // inline code `code`
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      // bold **text**
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // italics *text* or _text_
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
      // headings # .. ######
      html = html.replace(/^######\s?(.+)$/gm, '<h6>$1</h6>')
                 .replace(/^#####\s?(.+)$/gm, '<h5>$1</h5>')
                 .replace(/^####\s?(.+)$/gm, '<h4>$1</h4>')
                 .replace(/^###\s?(.+)$/gm, '<h3>$1</h3>')
                 .replace(/^##\s?(.+)$/gm, '<h2>$1</h2>')
                 .replace(/^#\s?(.+)$/gm, '<h1>$1</h1>');
      // lists - item
      html = html.replace(/^(?:-\s.+\n?)+/gm, (block) => {
        const items = block.trim().split(/\n/).map(l => l.replace(/^- ?/, '').trim());
        return `<ul>${items.map(it => `<li>${it}</li>`).join('')}</ul>`;
      });
      // newlines to <br> (basic)
      html = html.replace(/\n/g, '<br/>');
      return html;
    };

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #f44336;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  &:hover {
    background: #d32f2f;
  }
`;

// BoardItemProps interface removed for Storybook compatibility

const BoardItem = ({
  item,
  isSelected,
  onUpdate,
  onDelete,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: item.x, y: item.y });
  const textareaRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    onSelect(item.id);
    
    if (e.detail === 2) { // Double click
      if (item.type === 'text') {
        setIsEditing(true);
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - item.x,
        y: e.clientY - item.y
      });
      setLastPosition({ x: item.x, y: item.y });
    }
  }, [item.id, item.type, item.x, item.y, onSelect]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Use global mouse event listeners for better performance
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Only update if position actually changed to reduce re-renders
        if (newX !== lastPosition.x || newY !== lastPosition.y) {
          setLastPosition({ x: newX, y: newY });
          onUpdate(item.id, { x: newX, y: newY });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, lastPosition, item.id, onUpdate]);

  const handleTextChange = useCallback((e) => {
    onUpdate(item.id, { content: e.target.value });
  }, [item.id, onUpdate]);

  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
    if (e.key === 'Delete' && isSelected) {
      onDelete(item.id);
    }
  }, [isSelected, item.id, onDelete]);

  const renderContent = () => {
    switch (item.type) {
      case 'text':
        if (isEditing) {
          return (
            <TextContent
              ref={textareaRef}
              value={item.content}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              placeholder="Enter text..."
            />
          );
        }
        return (
          <TextContent
            value={item.content}
            readOnly
            onDoubleClick={() => setIsEditing(true)}
          />
        );
      
      case 'shape':
        return (
          <ShapeContent>
            {item.content || 'Shape'}
          </ShapeContent>
        );
      
       case 'sticky':
         return (
           <StickyContent>
             {item.content || 'Sticky note'}
           </StickyContent>
         );
       
          case 'todo':
            const todo = item.todoData || { title: 'Todos', description: '', todos: [] };
            const total = (todo.todos || []).length;
            const done = (todo.todos || []).filter((t) => t.status === 'done').length;
            const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
            const statusColor = (status) => status === 'done' ? '#10b981' : status === 'in_progress' ? '#f59e0b' : '#64748b';
            return (
              <TodoCard>
                <TodoHeader>
                  <TodoTitle>
                    ✅ {todo.title || 'Todo List'}
                  </TodoTitle>
                  <div style={{ fontSize: '11px', color: '#1e293b', fontWeight: 700 }}>{progressPct}%</div>
                </TodoHeader>
                <TodoBody>
                  {todo.description ? <TodoDesc>{todo.description}</TodoDesc> : null}
                  <ProgressBar>
                    <ProgressFill style={{ width: `${progressPct}%` }} />
                  </ProgressBar>
                  <TodoList>
                    {(todo.todos || []).map((t, idx) => (
                      <TodoItem key={idx}>
                        <span>{t.text}</span>
                        <StatusChip style={{ background: statusColor(t.status) }}>
                          {t.status === 'done' ? 'DONE' : t.status === 'in_progress' ? 'DOING' : 'TODO'}
                        </StatusChip>
                      </TodoItem>
                    ))}
                  </TodoList>
                </TodoBody>
              </TodoCard>
            );

          case 'agent':
          case 'agent_result':
            const agent = item.agentData || { title: item.title || 'Agent Result', markdown: item.markdown || '' };
            return (
              <AgentCard>
                <AgentHeader>
                  <AgentTitle>🤖 {agent.title || 'Agent Result'}</AgentTitle>
                </AgentHeader>
                <AgentBody>
                  {/* Render simple markdown */}
                  <div dangerouslySetInnerHTML={{ __html: toHtml(agent.markdown || item.content || '') }} />
                </AgentBody>
              </AgentCard>
            );

          case 'lab-result':
            const labData = item.labResultData;
            if (!labData) {
              return <div>Invalid lab result data</div>;
            }
            return (
              <LabResult
                id={item.id}
                parameter={labData.parameter}
                value={labData.value}
                unit={labData.unit}
                status={labData.status}
                range={labData.range}
                trend={labData.trend}
                onEdit={() => console.log('Edit lab result:', item.id)}
                onTrend={() => console.log('View trend for:', item.id)}
                onReadMore={() => console.log('Read more about:', item.id)}
              />
            );

          case 'component':
            const componentType = item.componentType;
            const componentProps = item.content?.props || {};
            
            switch (componentType) {
              case 'PatientContext':
                return <PatientContext patientData={componentProps.patientData} />;
              
              case 'EncounterTimeline':
                return (
                  <EncounterTimeline
                    encounters={componentProps.encounters || []}
                    medicationTimeline={componentProps.medicationTimeline || []}
                  />
                );
              
              case 'AdverseEventAnalytics':
                return <AdverseEventAnalytics patientData={componentProps.patientData} />;
              
              case 'LabTable':
                return <LabTable encounters={componentProps.encounters || []} />;
              
              case 'LabChart':
                return (
                  <LabChart
                    encounters={componentProps.encounters || []}
                    medicationTimeline={componentProps.medicationTimeline || []}
                  />
                );
              
              case 'DifferentialDiagnosis':
                return <DifferentialDiagnosis patientData={componentProps.patientData} />;
              
              case 'EHRSystemComponent':
                return <EHRSystemComponent patientData={componentProps.patientData} />;
              
              case 'EncounterDocument':
                return <EncounterDocument patientData={componentProps.patientData} />;
              
              case 'SingleEncounterDocument':
                return (
                  <SingleEncounterDocument
                    encounter={componentProps.encounter}
                    patient={componentProps.patient}
                    encounterIndex={componentProps.encounterIndex}
                    dataSource={componentProps.dataSource}
                  />
                );
              
              case 'RawClinicalNote':
                return (
                  <RawClinicalNote
                    encounterNumber={componentProps.encounterNumber}
                    date={componentProps.date}
                    visitType={componentProps.visitType}
                    provider={componentProps.provider}
                    specialty={componentProps.specialty}
                    rawText={componentProps.rawText}
                    dataSource={componentProps.dataSource}
                  />
                );
              
              case 'ICELabData':
                return (
                  <ICELabData
                    encounters={componentProps.encounters}
                  />
                );
              
              default:
                return (
                  <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Unknown Component</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      Component type "{componentType}" is not recognized
                    </p>
                  </div>
                );
            }

          case 'ehr-data':
            return (
              <EHRDataCard>
                <EHRDataHeader>
                  <EHRDataTitle>🏥 {item.title || 'EHR Data'}</EHRDataTitle>
                  <EHRDataSource>{item.source || 'EHR System'}</EHRDataSource>
                </EHRDataHeader>
                <EHRDataBody>
                  <EHRDataType>{item.dataType || 'clinical'}</EHRDataType>
                  <EHRDataContent>{item.content || 'No content available'}</EHRDataContent>
                  {item.timestamp && (
                    <EHRDataTimestamp>
                      Retrieved: {new Date(item.timestamp).toLocaleString()}
                    </EHRDataTimestamp>
                  )}
                </EHRDataBody>
              </EHRDataCard>
            );
       
       default:
         return null;
    }
  };

  return (
    <ItemContainer
      data-item-id={item.id}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: (item.type === 'agent' || item.type === 'todo' || item.type === 'lab-result' || item.type === 'component' || item.type === 'ehr-data') ? 'auto' : item.height,
        minHeight: (item.type === 'agent' || item.type === 'todo' || item.type === 'lab-result' || item.type === 'component' || item.type === 'ehr-data') ? (item.height === 'auto' ? '200px' : item.height) : 'auto',
        transform: `rotate(${item.rotation}deg)`,
        backgroundColor: item.color,
        border: isSelected ? '2px solid #2196f3' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isSelected
          ? '0 4px 20px rgba(33, 150, 243, 0.3)'
          : '0 2px 8px rgba(0,0,0,0.1)',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {renderContent()}
      {isSelected && (
        <DeleteButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="Delete item"
        >
          ×
        </DeleteButton>
      )}
    </ItemContainer>
  );
};

export default BoardItem;
