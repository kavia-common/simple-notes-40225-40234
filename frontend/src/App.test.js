import { render, screen, fireEvent, within, act } from '@testing-library/react';
import App from './App';

// Utility to flush timers for debounced saves where needed
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

test('renders Simple Notes header and New Note button', () => {
  render(<App />);
  expect(screen.getByText(/Simple Notes/i)).toBeInTheDocument();
  const button = screen.getAllByRole('button', { name: /New Note/i })[0];
  expect(button).toBeInTheDocument();
});

test('can create a note and then delete it from editor, selection clears when none remain', async () => {
  // Ensure clean storage state per test
  window.localStorage.clear();

  render(<App />);
  const newButtons = screen.getAllByRole('button', { name: /New Note/i });
  fireEvent.click(newButtons[0]); // header or sidebar

  // Editor visible with default title
  expect(await screen.findByLabelText('Note title')).toBeInTheDocument();

  // Delete from editor
  const deleteBtn = screen.getByRole('button', { name: /Delete note/i });
  // Mock confirm to auto-confirm
  const originalConfirm = window.confirm;
  window.confirm = () => true;
  fireEvent.click(deleteBtn);
  // Restore confirm
  window.confirm = originalConfirm;

  // With no notes, empty state shows
  expect(await screen.findByText(/Simple Notes/i)).toBeInTheDocument();
});

test('deleting from list selects next most recent note', async () => {
  // Ensure clean storage state per test
  window.localStorage.clear();

  render(<App />);

  // Create first note
  let newBtn = screen.getAllByRole('button', { name: /New Note/i })[0];
  fireEvent.click(newBtn);
  const titleInput1 = await screen.findByLabelText('Note title');
  fireEvent.change(titleInput1, { target: { value: 'First' } });
  // Save immediately
  fireEvent.click(screen.getByRole('button', { name: /Save note/i }));
  await act(async () => { await flushPromises(); });

  // Create second note, which should be most recent
  newBtn = screen.getAllByRole('button', { name: /New Note/i })[0];
  fireEvent.click(newBtn);
  const titleInput2 = await screen.findByLabelText('Note title');
  fireEvent.change(titleInput2, { target: { value: 'Second' } });
  fireEvent.click(screen.getByRole('button', { name: /Save note/i }));
  await act(async () => { await flushPromises(); });

  // Delete "Second" from list
  const notesList = await screen.findByRole('list', { name: /Notes/i });
  const items = within(notesList).getAllByRole('button', { name: /Delete/ });
  // Confirm dialog mock
  const originalConfirm = window.confirm;
  window.confirm = () => true;
  // "Second" should be first item (most recent), so first delete button
  fireEvent.click(items[0]);
  window.confirm = originalConfirm;

  // After deleting most recent, selection should move to "First"
  const editorTitle = await screen.findByLabelText('Note title');
  expect(editorTitle.value).toBe('First');
});

test('create then immediately delete from editor works and clears when only note', async () => {
  window.localStorage.clear();
  render(<App />);

  // Create a note from sidebar/header
  const newBtns = screen.getAllByRole('button', { name: /New Note/i });
  fireEvent.click(newBtns[0]);

  // Immediately delete from editor without manual save
  const deleteBtn = await screen.findByRole('button', { name: /Delete note/i });
  const originalConfirm = window.confirm;
  window.confirm = () => true;
  fireEvent.click(deleteBtn);
  window.confirm = originalConfirm;

  // Should return to empty state because no notes remain
  expect(await screen.findByText(/Simple Notes/i)).toBeInTheDocument();

  // localStorage should reflect no notes and no selection
  const notesRaw = window.localStorage.getItem('notes');
  const selectedIdRaw = window.localStorage.getItem('selectedNoteId');
  expect(notesRaw).toBe('[]');
  expect(selectedIdRaw).toBe('null');
});

test('create two notes then immediately delete the latest from editor selects previous', async () => {
  window.localStorage.clear();
  render(<App />);

  // First note
  let newBtn = screen.getAllByRole('button', { name: /New Note/i })[0];
  fireEvent.click(newBtn);
  const title1 = await screen.findByLabelText('Note title');
  fireEvent.change(title1, { target: { value: 'A' } });
  // Save
  fireEvent.click(screen.getByRole('button', { name: /Save note/i }));
  await act(async () => { await flushPromises(); });

  // Second note (most recent)
  newBtn = screen.getAllByRole('button', { name: /New Note/i })[0];
  fireEvent.click(newBtn);
  const title2 = await screen.findByLabelText('Note title');
  fireEvent.change(title2, { target: { value: 'B' } });

  // Immediately delete from editor
  const deleteBtn = screen.getByRole('button', { name: /Delete note/i });
  const originalConfirm = window.confirm;
  window.confirm = () => true;
  fireEvent.click(deleteBtn);
  window.confirm = originalConfirm;

  // Should select previous note "A"
  const editorTitle = await screen.findByLabelText('Note title');
  expect(editorTitle.value).toBe('A');
});

test('deleting from list while filtered removes item and updates list', async () => {
  window.localStorage.clear();
  render(<App />);

  // Create three notes
  const getNewBtn = () => screen.getAllByRole('button', { name: /New Note/i })[0];

  fireEvent.click(getNewBtn());
  let title = await screen.findByLabelText('Note title');
  fireEvent.change(title, { target: { value: 'Alpha' } });
  fireEvent.click(screen.getByRole('button', { name: /Save note/i }));

  fireEvent.click(getNewBtn());
  title = await screen.findByLabelText('Note title');
  fireEvent.change(title, { target: { value: 'Beta' } });
  fireEvent.click(screen.getByRole('button', { name: /Save note/i }));

  fireEvent.click(getNewBtn());
  title = await screen.findByLabelText('Note title');
  fireEvent.change(title, { target: { value: 'Gamma' } });
  fireEvent.click(screen.getByRole('button', { name: /Save note/i }));

  // Filter for 'Beta'
  const searchInput = screen.getByLabelText('Search notes');
  fireEvent.change(searchInput, { target: { value: 'Beta' } });

  // Ensure only Beta appears
  const list = await screen.findByRole('list', { name: /Notes/i });
  expect(within(list).getAllByRole('button', { name: /Delete/ }).length).toBe(1);
  expect(within(list).getByText('Beta')).toBeInTheDocument();

  // Delete the filtered item
  const originalConfirm = window.confirm;
  window.confirm = () => true;
  fireEvent.click(within(list).getByRole('button', { name: /Delete/ }));
  window.confirm = originalConfirm;

  // The filtered list should now show "No notes found" since 'Beta' was removed
  expect(await screen.findByText(/No notes found/i)).toBeInTheDocument();

  // Clear search, ensure only two notes remain (Alpha and Gamma)
  fireEvent.change(searchInput, { target: { value: '' } });
  const fullList = await screen.findByRole('list', { name: /Notes/i });
  const titles = within(fullList).getAllByRole('heading', { level: 3 }).map(h => h.textContent);
  expect(titles).toEqual(expect.arrayContaining(['Alpha', 'Gamma']));
  expect(titles).not.toEqual(expect.arrayContaining(['Beta']));
});
