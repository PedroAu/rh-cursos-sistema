import React from 'react';
import { render, screen } from '@testing-library/react';
import { FieldShell } from './field-shell';

describe('FieldShell', () => {
  it('renders label with htmlFor attribute', () => {
    render(
      <FieldShell id="test-input" label="Test Label">
        <input type="text" />
      </FieldShell>
    );

    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders required indicator when required=true', () => {
    render(
      <FieldShell id="test-input" label="Test Label" required>
        <input type="text" />
      </FieldShell>
    );

    const indicator = screen.getByText('*');
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('obrigatório')).toHaveClass('sr-only');
  });

  it('renders description with stable id', () => {
    render(
      <FieldShell
        id="test-input"
        label="Test Label"
        description="Test description"
      >
        <input type="text" />
      </FieldShell>
    );

    const description = screen.getByText('Test description');
    expect(description).toHaveAttribute('id', 'test-input-description');
  });

  it('renders error with role="alert" and stable id', () => {
    render(
      <FieldShell id="test-input" label="Test Label" error="Test error">
        <input type="text" />
      </FieldShell>
    );

    const error = screen.getByText('Test error');
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveAttribute('id', 'test-input-error');
  });

  it('does not render error and description together', () => {
    const { queryByText } = render(
      <FieldShell
        id="test-input"
        label="Test Label"
        description="Test description"
        error="Test error"
      >
        <input type="text" />
      </FieldShell>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(queryByText('Test description')).not.toBeInTheDocument();
  });

  it('renders children without modification', () => {
    render(
      <FieldShell id="test-input" label="Test Label">
        <input type="text" id="custom-id" data-testid="custom-input" />
      </FieldShell>
    );

    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});
