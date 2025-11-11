import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Simple Notes header and New Note button', () => {
  render(<App />);
  expect(screen.getByText(/Simple Notes/i)).toBeInTheDocument();
  const button = screen.getAllByRole('button', { name: /New Note/i })[0];
  expect(button).toBeInTheDocument();
});
