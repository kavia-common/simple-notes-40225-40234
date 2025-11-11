import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import EmptyState from './components/EmptyState';
import { storage } from './utils/storage';
import { createUUID } from './utils/uuid';
import useLocalStorage from './hooks/useLocalStorage';

/**
 * PUBLIC_INTERFACE
 * App is the root component for the Simple Notes application.
 * It manages notes state, selection, search, and orchestrates the layout.
 */
function App() {
  // Theme persisted for user preference
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  // Notes and selected note are persisted to localStorage
  const [notes, setNotes] = useLocalStorage('notes', []);
  const [selectedNoteId, setSelectedNoteId] = useLocalStorage('selectedNoteId', null);
  const [search, setSearch] = useState('');

  // Apply theme to document element for CSS vars
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const onToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  // Derived: selected note
  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // Derived: filtered and sorted notes by most recently updated
  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? notes.filter(
          (n) =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.body || '').toLowerCase().includes(q)
        )
      : notes.slice();
    filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return filtered;
  }, [notes, search]);

  // PUBLIC_INTERFACE
  const handleCreateNote = useCallback(() => {
    const now = Date.now();
    const newNote = {
      id: createUUID(),
      title: 'Untitled',
      body: '',
      createdAt: now,
      updatedAt: now,
    };
    const next = [newNote, ...notes];
    setNotes(next);
    setSelectedNoteId(newNote.id);
  }, [notes, setNotes, setSelectedNoteId]);

  // PUBLIC_INTERFACE
  const handleSelectNote = useCallback(
    (id) => {
      setSelectedNoteId(id);
    },
    [setSelectedNoteId]
  );

  // PUBLIC_INTERFACE
  const handleUpdateNote = useCallback(
    (id, updates) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
        )
      );
    },
    [setNotes]
  );

  // PUBLIC_INTERFACE
  const handleDeleteNote = useCallback(
    (id) => {
      // Read the current title for confirmation prompt using the latest 'notes' value.
      const note = notes.find((n) => n.id === id);
      const title = note?.title ? `"${note.title}"` : 'this note';
      // Confirm deletion
      // eslint-disable-next-line no-alert
      const confirmed = window.confirm(`Delete ${title}? This cannot be undone.`);
      if (!confirmed) return;

      // Compute remaining notes and next selection atomically based on the latest state
      setNotes((prev) => {
        const remaining = prev.filter((n) => n.id !== id);

        // Determine next selection from remaining notes by most recent updatedAt (desc)
        let nextSelectedId = null;
        if (remaining.length) {
          const sorted = remaining
            .slice()
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          nextSelectedId = sorted[0]?.id || null;
        }

        // Update selected note based on whether the deleted one was selected and remaining validity.
        setSelectedNoteId((currSelected) => {
          if (currSelected === id) {
            return nextSelectedId;
          }
          const stillExists = remaining.some((n) => n.id === currSelected);
          return stillExists ? currSelected : nextSelectedId;
        });

        return remaining;
      });
    },
    [notes, setNotes, setSelectedNoteId]
  );

  // Persist notes to storage explicitly if needed (useLocalStorage handles it, but keep for clarity)
  useEffect(() => {
    storage.set('notes', notes);
  }, [notes]);

  useEffect(() => {
    storage.set('selectedNoteId', selectedNoteId);
  }, [selectedNoteId]);

  return (
    <div className="app-root">
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        onCreateNote={handleCreateNote}
      />

      <main className="layout" aria-label="Notes application main layout">
        <aside className="sidebar" aria-label="Notes list panel">
          <div className="sidebar-toolbar">
            <input
              aria-label="Search notes"
              className="search-input"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-primary btn-new"
              onClick={handleCreateNote}
              aria-label="Create new note"
            >
              + New Note
            </button>
          </div>
          <NoteList
            notes={filteredNotes}
            selectedId={selectedNoteId}
            onSelect={handleSelectNote}
            onDelete={handleDeleteNote}
          />
        </aside>

        <section
          className="editor-pane"
          aria-label="Note editor panel"
          role="region"
        >
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onChange={(updates) => handleUpdateNote(selectedNote.id, updates)}
              onDelete={() => handleDeleteNote(selectedNote.id)}
            />
          ) : (
            <EmptyState onCreate={handleCreateNote} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
