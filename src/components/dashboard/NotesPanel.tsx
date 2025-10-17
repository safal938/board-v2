import React, { useState } from 'react';
import styled from 'styled-components';

const NotesContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const NotesTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotesIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const AddNoteButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
  }
`;

const NoteCard = styled.div<{ isEditing?: boolean }>`
  background: ${props => props.isEditing ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.isEditing ? '#667eea' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
    border-color: #667eea;
  }
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NoteTimestamp = styled.div`
  font-size: 11px;
  color: #666;
  font-weight: 500;
`;

const NoteActions = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' | 'save' | 'cancel' }>`
  background: ${props => {
    switch (props.variant) {
      case 'delete': return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
      case 'save': return 'linear-gradient(135deg, #2ecc71, #27ae60)';
      case 'cancel': return 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
      default: return 'linear-gradient(135deg, #667eea, #764ba2)';
    }
  }};
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
`;

const NoteTextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  background: rgba(255, 255, 255, 0.9);
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const NoteContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 14px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
`;

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  author?: string;
}

interface NotesPanelProps {
  patientId?: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ patientId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const addNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        content: newNoteContent.trim(),
        timestamp: new Date(),
        author: 'Current User'
      };
      setNotes(prev => [newNote, ...prev]);
      setNewNoteContent('');
      setIsAddingNew(false);
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editContent.trim() && editingId) {
      setNotes(prev => prev.map(note => 
        note.id === editingId 
          ? { ...note, content: editContent.trim() }
          : note
      ));
      setEditingId(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <NotesContainer>
      <NotesHeader>
        <NotesTitle>
          <NotesIcon>📝</NotesIcon>
          Clinical Notes
        </NotesTitle>
        <AddNoteButton onClick={() => setIsAddingNew(true)}>
          ➕ Add Note
        </AddNoteButton>
      </NotesHeader>

      {isAddingNew && (
        <NoteCard isEditing>
          <NoteTextArea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Enter your clinical note here..."
            autoFocus
          />
          <NoteActions style={{ marginTop: '12px' }}>
            <ActionButton variant="save" onClick={addNote}>
              Save
            </ActionButton>
            <ActionButton 
              variant="cancel" 
              onClick={() => {
                setIsAddingNew(false);
                setNewNoteContent('');
              }}
            >
              Cancel
            </ActionButton>
          </NoteActions>
        </NoteCard>
      )}

      <NotesList>
        {notes.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <div>No clinical notes yet</div>
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
              Add notes to track observations, decisions, and follow-ups
            </div>
          </EmptyState>
        ) : (
          notes.map(note => (
            <NoteCard key={note.id} isEditing={editingId === note.id}>
              <NoteHeader>
                <NoteTimestamp>
                  {formatTimestamp(note.timestamp)}
                  {note.author && ` • ${note.author}`}
                </NoteTimestamp>
                <NoteActions>
                  {editingId === note.id ? (
                    <>
                      <ActionButton variant="save" onClick={saveEdit}>
                        Save
                      </ActionButton>
                      <ActionButton variant="cancel" onClick={cancelEdit}>
                        Cancel
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton variant="edit" onClick={() => startEditing(note)}>
                        Edit
                      </ActionButton>
                      <ActionButton variant="delete" onClick={() => deleteNote(note.id)}>
                        Delete
                      </ActionButton>
                    </>
                  )}
                </NoteActions>
              </NoteHeader>
              
              {editingId === note.id ? (
                <NoteTextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                />
              ) : (
                <NoteContent>{note.content}</NoteContent>
              )}
            </NoteCard>
          ))
        )}
      </NotesList>
    </NotesContainer>
  );
};

export default NotesPanel;