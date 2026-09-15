import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '@/App';

describe('starter client', () => {
  it('renders the application title', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Staff Pulse' })).toBeTruthy();
  });
});
