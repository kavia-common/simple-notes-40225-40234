import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * NoteItem is an interactive list row for a single note.
 */
function NoteItem({ note, selected, onClick, onDelete }) {
  const preview = useMemo(() => {
    const text = (note.body || '').trim().replace(/\s+/g, ' ');
    return text.length > 80 ? text.slice(0, 80) + '…' : text;
  }, [note.body]);

  const updated = useMemo(() => {
    try {
      return new Date(note.updatedAt || note.createdAt).toLocaleString();
    } catch {
      return '';
    }
  }, [note.updatedAt, note.createdAt]);

  return (
    <li
      className={`note-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
    >
      <div>
        <h3 className="note-title">{note.title || 'Untitled'}</h3>
        <p className="note-preview" aria-label="Note preview">{preview || 'No content yet'}</p>
        <div className="note-meta" aria-label="Last updated">Updated {updated}</div>
      </div>
      <div className="note-actions">
        <button
          className="btn btn-danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${note.title || 'untitled note'}`}
          title="Delete note"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default NoteItem;
