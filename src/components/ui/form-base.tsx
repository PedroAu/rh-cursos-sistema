/**
 * Form Base Component — Unified Mantine + Tailwind Form Styling
 *
 * Consolidates form styling with Trust Keith design tokens.
 * Provides base styles and patterns for form fields across the application.
 *
 * Trust Keith Design System
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Base form container with consistent spacing and layout
 */
const formVariants = cva('flex flex-col gap-6', {
  variants: {
    layout: {
      vertical: 'flex-col',
      horizontal: 'flex-row flex-wrap items-end gap-4',
      grid: 'grid grid-cols-1 gap-6',
    },
  },
  defaultVariants: {
    layout: 'vertical',
  },
});

export interface FormProps extends React.HTMLAttributes<HTMLFormElement>, VariantProps<typeof formVariants> {
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, layout, ...props }, ref) => (
    <form ref={ref} className={cn(formVariants({ layout }), className)} {...props} />
  )
);
Form.displayName = 'Form';

/**
 * Form section wrapper for grouping related fields
 */
const formSectionVariants = cva('flex flex-col gap-4', {
  variants: {
    variant: {
      default: '',
      card: 'rounded-tk-card border border-outline-variant bg-card p-6',
      outlined: 'rounded-tk-card border-2 border-outline-variant p-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface FormSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formSectionVariants> {
  label?: string;
  description?: string;
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, variant, label, description, ...props }, ref) => (
    <section ref={ref} className={cn(formSectionVariants({ variant }), className)}>
      {label && (
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-section-heading font-bold text-tk-ink">{label}</h3>
          {description && <p className="text-body-small text-tk-ink-muted">{description}</p>}
        </div>
      )}
      <div className="flex flex-col gap-4" {...props} />
    </section>
  )
);
FormSection.displayName = 'FormSection';

/**
 * Form control wrapper for consistent input styling
 */
const formControlVariants = cva('flex flex-col gap-2', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
    state: {
      default: '',
      error: '',
      success: '',
      warning: '',
    },
  },
  defaultVariants: {
    size: 'md',
    state: 'default',
  },
});

export interface FormControlProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formControlVariants> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  state?: 'default' | 'error' | 'success' | 'warning';
}

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  (
    { className, size, state, label, required, error, hint, id, children, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const fieldId = id ?? `form-${generatedId}`;
    const descriptionId = hint ? `${fieldId}-hint` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div
        ref={ref}
        className={cn(formControlVariants({ size, state }), className)}
        {...props}
      >
        {label && (
          <label
            htmlFor={fieldId}
            className="text-label-bold font-semibold uppercase tracking-[0.05em] text-label-primary"
          >
            {label}
            {required && <span className="ml-1 text-tk-error">*</span>}
          </label>
        )}

        {/* Slot for input elements */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>(child)) {
            return React.cloneElement(child, {
              id: fieldId,
              'aria-describedby': ariaDescribedBy,
              'aria-invalid': Boolean(error),
            });
          }
          return child;
        })}

        {hint && (
          <p className="text-sm leading-6 text-label-secondary" id={descriptionId}>
            {hint}
          </p>
        )}

        {error && (
          <p className="text-sm leading-6 text-tk-error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormControl.displayName = 'FormControl';

/**
 * Form input base with Trust Keith styling
 */
const inputVariants = cva(
  cn(
    'w-full rounded-tk-input border border-input bg-tk-surface px-3 py-2',
    'font-sans text-body placeholder:text-tk-ink-muted',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-tk-focus focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-tk-error aria-invalid:focus:ring-tk-error'
  ),
  {
    variants: {
      size: {
        sm: 'text-sm px-2 py-1.5',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      size: 'md',
      fullWidth: true,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, fullWidth, ...props }, ref) => (
    <input ref={ref} className={cn(inputVariants({ size, fullWidth }), className)} {...props} />
  )
);
Input.displayName = 'Input';

/**
 * Textarea base with Trust Keith styling
 */
const textareaVariants = cva(
  cn(
    'w-full rounded-tk-input border border-input bg-tk-surface px-3 py-2',
    'font-sans text-body placeholder:text-tk-ink-muted',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-tk-focus focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-tk-error aria-invalid:focus:ring-tk-error',
    'resize-vertical'
  ),
  {
    variants: {
      size: {
        sm: 'text-sm px-2 py-1.5 min-h-20',
        md: 'text-base px-3 py-2 min-h-24',
        lg: 'text-lg px-4 py-3 min-h-32',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      size: 'md',
      fullWidth: true,
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, fullWidth, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ size, fullWidth }), className)}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

/**
 * Select base with Trust Keith styling
 */
const selectVariants = cva(
  cn(
    'w-full rounded-tk-input border border-input bg-tk-surface px-3 py-2',
    'font-sans text-body',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-tk-focus focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-tk-error aria-invalid:focus:ring-tk-error',
    'appearance-none cursor-pointer'
  ),
  {
    variants: {
      size: {
        sm: 'text-sm px-2 py-1.5',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      size: 'md',
      fullWidth: true,
    },
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, fullWidth, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(selectVariants({ size, fullWidth }), className)}
      {...props}
    />
  )
);
Select.displayName = 'Select';

/**
 * Checkbox base with Trust Keith styling
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'w-5 h-5 rounded-sm border border-input bg-tk-surface',
          'focus:outline-none focus:ring-2 focus:ring-tk-focus focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'checked:bg-tk-accent checked:border-tk-accent',
          className
        )}
        {...props}
      />
      {label && <span className="text-body text-tk-ink">{label}</span>}
    </label>
  )
);
Checkbox.displayName = 'Checkbox';

/**
 * Radio button base with Trust Keith styling
 */
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        ref={ref}
        type="radio"
        className={cn(
          'w-5 h-5 rounded-full border-2 border-input bg-tk-surface',
          'focus:outline-none focus:ring-2 focus:ring-tk-focus focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'checked:border-tk-accent',
          className
        )}
        {...props}
      />
      {label && <span className="text-body text-tk-ink">{label}</span>}
    </label>
  )
);
Radio.displayName = 'Radio';

/**
 * Form actions footer (typically for submit/cancel buttons)
 */
export const FormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-wrap items-center justify-end gap-3 border-t border-outline-variant pt-4 mt-6', className)}
    {...props}
  />
));
FormActions.displayName = 'FormActions';

/**
 * Helper text for form context
 */
export const FormHelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm leading-6 text-tk-ink-muted', className)}
    {...props}
  />
));
FormHelperText.displayName = 'FormHelperText';

/**
 * Error message with alert role
 */
export const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    role="alert"
    className={cn('text-sm leading-6 text-tk-error', className)}
    {...props}
  />
));
FormError.displayName = 'FormError';

/**
 * Success message
 */
export const FormSuccess = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    role="status"
    className={cn('text-sm leading-6 text-tk-success', className)}
    {...props}
  />
));
FormSuccess.displayName = 'FormSuccess';
