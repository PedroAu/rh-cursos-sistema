import React from 'react';
import { render, screen } from '@testing-library/react';
import { CheckboxField } from './checkbox-field';

describe('CheckboxField', () => {
  it('renders checkbox with label', () => {
    render(
      <CheckboxField id="test" label="Accept terms" />
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('label is associated with checkbox via htmlFor', () => {
    render(
      <CheckboxField id="test" label="Accept terms" />
    );

    const label = screen.getByText('Accept terms');
    expect(label).toHaveAttribute('for', 'test');
  });

  it('renders description when provided', () => {
    render(
      <CheckboxField
        id="test"
        label="Accept terms"
        description="You must accept to continue"
      />
    );

    const description = screen.getByText('You must accept to continue');
    expect(description).toHaveAttribute('id', 'test-description');
  });

  it('renders error with role="alert"', () => {
    render(
      <CheckboxField
        id="test"
        label="Accept terms"
        error="This is required"
      />
    );

    const error = screen.getByText('This is required');
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveAttribute('id', 'test-error');
  });

  it('does not render description when error exists', () => {
    const { queryByText } = render(
      <CheckboxField
        id="test"
        label="Accept terms"
        description="You must accept to continue"
        error="This is required"
      />
    );

    expect(queryByText('You must accept to continue')).not.toBeInTheDocument();
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  it('applies aria-describedby correctly', () => {
    const { container } = render(
      <CheckboxField
        id="test"
        label="Accept terms"
        description="You must accept to continue"
      />
    );

    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox).toHaveAttribute('aria-describedby', 'test-description');
  });

  it('sets aria-invalid=true when error exists', () => {
    const { container } = render(
      <CheckboxField
        id="test"
        label="Accept terms"
        error="This is required"
      />
    );

    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });
});
