import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn(() => Promise.reject(new Error('offline')));
});

const press = (key) => act(() => {
  fireEvent.keyDown(window, { key });
});

// Let the (mocked, failing) dictionary prefetch settle inside act().
const renderApp = async () => {
  const result = render(<App />);
  await act(async () => {});
  return result;
};

test('renders the board and the on-screen keyboard', async () => {
  await renderApp();
  expect(screen.getByRole('heading', { name: 'Wordle' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit guess' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument();
});

test('typing fills the current row and short guesses are rejected', async () => {
  await renderApp();
  ['c', 'R', 'a'].forEach(press);
  const board = screen.getByRole('group', { name: 'Guesses' });
  expect(board.textContent.startsWith('cra')).toBe(true);

  press('Enter');
  expect(screen.getByText('Not enough letters')).toBeInTheDocument();

  press('Backspace');
  expect(board.textContent.startsWith('cr')).toBe(true);
  expect(board.textContent.startsWith('cra')).toBe(false);
});

test('a game in progress survives a reload', async () => {
  const { unmount } = await renderApp();
  ['s', 't', 'o'].forEach(press);
  unmount();

  await renderApp();
  expect(screen.getByRole('group', { name: 'Guesses' }).textContent.startsWith('sto')).toBe(true);
});
