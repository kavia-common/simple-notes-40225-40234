import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Header shows the application title and top-level actions like theme toggle and new note.
 */
function Header({ theme, onToggleTheme, onCreateNote }) {
  return (
    <header className="header" role="banner">
      <div className="header-title" aria-label="Application title">
        <span className="brand-dot" aria-hidden="true"></span>
        <h1 style={{ margin: 0, fontSize: 18 }}>Simple Notes</h1>
      </div>
      <div className="header-actions" role="group" aria-label="Header actions">
        <button
          className="btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button
          className="btn btn-primary"
          onClick={onCreateNote}
          aria-label="Create new note"
        >
          + New Note
        </button>
      </div>
    </header>
  );
}

export default Header;
