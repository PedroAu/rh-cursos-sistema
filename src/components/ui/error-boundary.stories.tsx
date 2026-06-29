import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { ErrorBoundary } from './error-boundary';
import { Button } from './button';

const meta = {
  title: 'UI/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Component that throws an error
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('This is a simulated error in the component');
  }

  return (
    <div className="p-6 bg-surface-light rounded-card">
      <p className="text-text-primary">Component rendered successfully!</p>
    </div>
  );
};

// Story: Default error boundary
export const Default: Story = {
  args: { children: null },
  render: () => (
    <ErrorBoundary>
      <ThrowingComponent shouldThrow={false} />
    </ErrorBoundary>
  ),
};

// Story: Error boundary catching an error
export const WithError: Story = {
  args: { children: null },
  render: () => (
    <ErrorBoundary>
      <ThrowingComponent shouldThrow={true} />
    </ErrorBoundary>
  ),
};

// Story: Error boundary with custom fallback
export const WithCustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-danger/10 rounded-card border border-danger">
          <h2 className="text-lg font-bold text-danger mb-2">Custom Error UI</h2>
          <p className="text-text-secondary">
            This is a custom fallback UI displayed when an error occurs.
          </p>
        </div>
      }
    >
      <ThrowingComponent shouldThrow={true} />
    </ErrorBoundary>
  ),
};

// Story: Error boundary with reset functionality
function WithResetStory() {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setShouldThrow(false)} variant="primary">
          Trigger Success
        </Button>
        <Button onClick={() => setShouldThrow(true)} variant="outline">
          Trigger Error
        </Button>
      </div>

      <ErrorBoundary onError={(error) => console.log('Error caught:', error)}>
        <ThrowingComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

export const WithReset: Story = {
  render: () => <WithResetStory />,
};

// Story: Multiple error boundaries
export const MultipleErrorBoundaries: Story = {
  render: () => (
    <div className="space-y-4">
      <ErrorBoundary>
        <div className="p-4 bg-surface-light rounded-card">
          <h3 className="font-bold mb-2">Boundary 1 (Safe)</h3>
          <p className="text-text-secondary">This component is safe</p>
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="p-4 bg-surface-light rounded-card">
          <h3 className="font-bold mb-2">Boundary 2 (Error)</h3>
          <ThrowingComponent shouldThrow={true} />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="p-4 bg-surface-light rounded-card">
          <h3 className="font-bold mb-2">Boundary 3 (Safe)</h3>
          <p className="text-text-secondary">This component is also safe</p>
        </div>
      </ErrorBoundary>
    </div>
  ),
};
