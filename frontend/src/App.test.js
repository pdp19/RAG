import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Connect with us link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Connect with us/i);
  expect(linkElement).toBeInTheDocument();
});
