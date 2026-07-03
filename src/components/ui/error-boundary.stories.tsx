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
    <div className="rounded-tk-card bg-tk-surface-2 p-6">
      <p className="text-tk-ink">Component rendered successfully!</p>
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
  args: { children: null },
  render: () => (
    <ErrorBoundary
      fallback={
        <div className="rounded-tk-card border border-tk-error bg-tk-error/10 p-6">
          <h2 className="mb-2 text-lg font-bold text-tk-error">Custom Error UI</h2>
          <p className="text-tk-ink-muted">
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
        <Button onClick={() => setShouldThrow(false)} variant="default">
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
  args: { children: null },
  render: () => <WithResetStory />,
};

// Story: Multiple error boundaries
export const MultipleErrorBoundaries: Story = {
  args: { children: null },
  render: () => (
    <div className="space-y-4">
      <ErrorBoundary>
        <div className="rounded-tk-card bg-tk-surface-2 p-4">
          <h3 className="font-bold mb-2">Boundary 1 (Safe)</h3>
          <p className="text-tk-ink-muted">This component is safe</p>
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="rounded-tk-card bg-tk-surface-2 p-4">
          <h3 className="font-bold mb-2">Boundary 2 (Error)</h3>
          <ThrowingComponent shouldThrow={true} />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="rounded-tk-card bg-tk-surface-2 p-4">
          <h3 className="font-bold mb-2">Boundary 3 (Safe)</h3>
          <p className="text-tk-ink-muted">This component is also safe</p>
        </div>
      </ErrorBoundary>
    </div>
  ),
};
