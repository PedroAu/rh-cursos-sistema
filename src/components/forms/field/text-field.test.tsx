import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextField } from './text-field';

describe('TextField', () => {
  it('renders input with text type', () => {
    const { container } = render(
      <TextField id="test" label="Test Label" />
    );

    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
  });

  it('renders with leftIcon', () => {
    const { container } = render(
      <TextField id="test" label="Test Label" leftIcon={<span data-testid="left-icon">🔍</span>} />
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    const input = container.querySelector('input');
    expect(input).toHaveClass('pl-10');
  });

  it('renders with rightIcon', () => {
    const { container } = render(
      <TextField id="test" label="Test Label" rightIcon={<span data-testid="right-icon">✓</span>} />
    );

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    const input = container.querySelector('input');
    expect(input).toHaveClass('pr-10');
  });

  it('applies aria-describedby with description', () => {
    const { container } = render(
      <TextField
        id="test"
        label="Test Label"
        description="Test description"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-description');
  });

  it('applies aria-describedby with error', () => {
    const { container } = render(
      <TextField
        id="test"
        label="Test Label"
        error="Test error"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-error');
  });

  it('sets aria-invalid=true when error exists', () => {
    const { container } = render(
      <TextField
        id="test"
        label="Test Label"
        error="Test error"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('passes through input props', () => {
    const { container } = render(
      <TextField
        id="test"
        label="Test Label"
        placeholder="Enter text"
        disabled
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toBeDisabled();
  });
});
