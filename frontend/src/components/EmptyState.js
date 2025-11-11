import React from 'react';

/**
 * PUBLIC_INTERFACE
 * EmptyState renders when no note is selected or exists, guiding the user to create one.
 */
function EmptyState({ onCreate }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-title">Simple Notes</div>
      <p>Capture your thoughts quickly. Create a new note to get started.</p>
      <div className="empty-actions">
        <button className="btn btn-primary" onClick={onCreate} aria-label="Create new note">
          + New Note
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
