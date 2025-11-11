import React from 'react';
import NoteItem from './NoteItem';

/**
 * PUBLIC_INTERFACE
 * NoteList displays a vertical list of notes with selection and delete controls.
 */
function NoteList({ notes, selectedId, onSelect, onDelete }) {
  if (!notes.length) {
    return (
      <div className="note-list" aria-live="polite">
        <div className="empty-state" style={{ padding: 24 }}>
          <div className="empty-title" style={{ fontSize: 16 }}>No notes found</div>
          <p>Try clearing your search or create a new note.</p>
        </div>
      </div>
    );
  }
  return (
    <ul className="note-list" role="list" aria-label="Notes">
      {notes.map((n) => (
        <NoteItem
          key={n.id}
          note={n}
          selected={n.id === selectedId}
          onClick={() => onSelect(n.id)}
          onDelete={() => onDelete(n.id)}
        />
      ))}
    </ul>
  );
}

export default NoteList;
