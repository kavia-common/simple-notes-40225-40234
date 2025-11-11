import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Debounce utility hook to delay invoking fn until after delay has passed.
 */
function useDebouncedCallback(fn, delay) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const timer = useRef(null);

  const debounced = useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return debounced;
}

/**
 * PUBLIC_INTERFACE
 * NoteEditor allows editing of title and body with autosave and keyboard shortcut support.
 */
function NoteEditor({ note, onChange, onDelete }) {
  const [title, setTitle] = useState(note.title || '');
  const [body, setBody] = useState(note.body || '');

  // Prepare a debounced saver to reduce frequent writes
  const debouncedSave = useDebouncedCallback((next) => {
    onChange(next);
  }, 300);

  // When local inputs change, debounce-save
  useEffect(() => {
    debouncedSave({ title, body });
  }, [title, body, debouncedSave]);

  // Sync if parent note changes (switching selection)
  useEffect(() => {
    setTitle(note.title || '');
    setBody(note.body || '');
  }, [note.id]); // only when switching notes

  // Ctrl/Cmd+S to save immediately
  const onKeyDown = useCallback((e) => {
    const isSave = (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's');
    if (isSave) {
      e.preventDefault();
      onChange({ title, body });
    }
  }, [title, body, onChange]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const createdAt = useMemo(() => {
    try { return new Date(note.createdAt).toLocaleString(); } catch { return ''; }
  }, [note.createdAt]);

  const updatedAt = useMemo(() => {
    try { return new Date(note.updatedAt).toLocaleString(); } catch { return ''; }
  }, [note.updatedAt]);

  return (
    <div className="editor" aria-label="Editor">
      <div className="editor-header">
        <input
          className="input title-input"
          aria-label="Note title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => onChange({ title, body })}
            aria-label="Save note"
            title="Save (Ctrl/Cmd+S)"
          >
            Save
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete()}
            aria-label="Delete note"
            title="Delete this note"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="editor-body">
        <label className="visually-hidden" htmlFor="note-body">Note body</label>
        <textarea
          id="note-body"
          className="textarea"
          placeholder="Write your note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div style={{ color: 'var(--muted)', fontSize: 12, display: 'flex', gap: 16 }}>
          <div>Created: {createdAt}</div>
          <div>Last saved: {updatedAt}</div>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
