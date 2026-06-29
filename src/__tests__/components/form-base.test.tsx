import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Form,
  FormSection,
  FormControl,
  Input,
  Textarea,
  Checkbox,
  Radio,
  FormActions,
  FormError,
  FormSuccess,
  FormHelperText,
} from '@/components/ui/form-base';
import React from 'react';

describe('Form Components', () => {
  describe('Form', () => {
    it('renders as form element', () => {
      const { container } = render(
        <Form>
          <input type="text" />
        </Form>
      );

      const formElement = container.querySelector('form');
      expect(formElement).toBeInTheDocument();
    });

    it('applies layout variants', () => {
      const { container: containerVertical } = render(
        <Form layout="vertical">Content</Form>
      );
      const { container: containerHorizontal } = render(
        <Form layout="horizontal">Content</Form>
      );

      expect(containerVertical.querySelector('form')).toHaveClass('flex-col');
      expect(containerHorizontal.querySelector('form')).toHaveClass('flex-row');
    });

    it('accepts custom className', () => {
      const { container } = render(
        <Form className="custom-class">Content</Form>
      );

      expect(container.querySelector('form')).toHaveClass('custom-class');
    });
  });

  describe('FormSection', () => {
    it('renders section element', () => {
      const { container } = render(
        <FormSection>Content</FormSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('displays label and description', () => {
      render(
        <FormSection
          label="Personal Information"
          description="Enter your details"
        >
          Content
        </FormSection>
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Enter your details')).toBeInTheDocument();
    });

    it('applies card variant styling', () => {
      const { container } = render(
        <FormSection variant="card">Content</FormSection>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('rounded-card');
      expect(section).toHaveClass('bg-card');
    });
  });

  describe('FormControl', () => {
    it('renders label with required indicator', () => {
      render(
        <FormControl label="Email" required>
          <input type="email" />
        </FormControl>
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays error message with alert role', () => {
      render(
        <FormControl label="Email" error="Email is required">
          <input type="email" />
        </FormControl>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Email is required');
    });

    it('displays hint text', () => {
      render(
        <FormControl label="Password" hint="At least 8 characters">
          <input type="password" />
        </FormControl>
      );

      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    });

    it('sets aria-invalid when error exists', () => {
      render(
        <FormControl label="Email" error="Invalid email">
          <input type="email" />
        </FormControl>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for accessibility', () => {
      render(
        <FormControl label="Email" hint="Valid email required">
          <input type="email" />
        </FormControl>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('Input', () => {
    it('renders input element', () => {
      const { container } = render(<Input type="text" />);
      expect(container.querySelector('input')).toBeInTheDocument();
    });

    it('applies size variants', () => {
      const { container: containerSmall } = render(<Input size="sm" type="text" />);
      const { container: containerLarge } = render(<Input size="lg" type="text" />);

      expect(containerSmall.querySelector('input')).toHaveClass('text-sm');
      expect(containerLarge.querySelector('input')).toHaveClass('text-lg');
    });

    it('applies focus styles', () => {
      const { container } = render(<Input type="text" />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-bright-blue');
    });
  });

  describe('Textarea', () => {
    it('renders textarea element', () => {
      const { container } = render(<Textarea />);
      expect(container.querySelector('textarea')).toBeInTheDocument();
    });

    it('applies size variants with min-height', () => {
      const { container: containerSmall } = render(<Textarea size="sm" />);
      const { container: containerLarge } = render(<Textarea size="lg" />);

      expect(containerSmall.querySelector('textarea')).toHaveClass('min-h-20');
      expect(containerLarge.querySelector('textarea')).toHaveClass('min-h-32');
    });

    it('allows resizing', () => {
      const { container } = render(<Textarea />);
      expect(container.querySelector('textarea')).toHaveClass('resize-vertical');
    });
  });

  describe('Checkbox', () => {
    it('renders checkbox input', () => {
      const { container } = render(<Checkbox />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toBeInTheDocument();
    });

    it('displays label when provided', () => {
      render(<Checkbox label="Agree to terms" />);
      expect(screen.getByText('Agree to terms')).toBeInTheDocument();
    });

    it('can be checked', async () => {
      const user = userEvent.setup();
      const { container } = render(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');

      await user.click(checkbox!);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Radio', () => {
    it('renders radio input', () => {
      const { container } = render(<Radio />);
      const input = container.querySelector('input[type="radio"]');
      expect(input).toBeInTheDocument();
    });

    it('displays label when provided', () => {
      render(<Radio label="Option A" />);
      expect(screen.getByText('Option A')).toBeInTheDocument();
    });

    it('can be selected', async () => {
      const user = userEvent.setup();
      const { container } = render(<Radio />);
      const radio = container.querySelector('input[type="radio"]');

      await user.click(radio!);
      expect(radio).toBeChecked();
    });
  });

  describe('FormActions', () => {
    it('renders div with flex layout', () => {
      const { container } = render(
        <FormActions>
          <button>Submit</button>
          <button>Cancel</button>
        </FormActions>
      );

      const div = container.querySelector('div');
      expect(div).toHaveClass('flex');
      expect(div).toHaveClass('justify-end');
    });

    it('contains action buttons', () => {
      render(
        <FormActions>
          <button>Submit</button>
          <button>Cancel</button>
        </FormActions>
      );

      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('FormError', () => {
    it('renders with alert role', () => {
      render(<FormError>This field is required</FormError>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('This field is required');
    });

    it('applies danger color styling', () => {
      const { container } = render(<FormError>Error text</FormError>);
      expect(container.querySelector('p')).toHaveClass('text-danger');
    });
  });

  describe('FormSuccess', () => {
    it('renders with status role', () => {
      render(<FormSuccess>Success message</FormSuccess>);
      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('Success message');
    });

    it('applies success color styling', () => {
      const { container } = render(<FormSuccess>Success</FormSuccess>);
      expect(container.querySelector('p')).toHaveClass('text-success');
    });
  });

  describe('FormHelperText', () => {
    it('renders helper text', () => {
      render(<FormHelperText>This is a helper text</FormHelperText>);
      expect(screen.getByText('This is a helper text')).toBeInTheDocument();
    });

    it('applies secondary text color', () => {
      const { container } = render(<FormHelperText>Helper</FormHelperText>);
      expect(container.querySelector('p')).toHaveClass('text-text-secondary');
    });
  });
});
