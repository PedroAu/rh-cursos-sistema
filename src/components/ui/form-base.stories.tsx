import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Form,
  FormSection,
  FormControl,
  Input,
  Textarea,
  Checkbox,
  Radio,
  FormActions,
  FormSuccess,
} from './form-base';
import { Button } from './button';

const meta = {
  title: 'UI/FormBase',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta;

// Story: Basic form layout
export const BasicForm: StoryObj<typeof meta> = {
  render: () => (
    <Form className="max-w-md">
      <FormControl label="Full Name" required hint="Enter your first and last name">
        <Input type="text" placeholder="John Doe" />
      </FormControl>

      <FormControl label="Email" required>
        <Input type="email" placeholder="john@example.com" />
      </FormControl>

      <FormControl label="Message" hint="Max 500 characters">
        <Textarea placeholder="Your message here..." />
      </FormControl>

      <FormActions>
        <Button>Submit</Button>
        <Button variant="outline">Cancel</Button>
      </FormActions>
    </Form>
  ),
};

// Story: Form with validation errors
export const FormWithErrors: StoryObj<typeof meta> = {
  render: () => (
    <Form className="max-w-md">
      <FormControl
        label="Email"
        required
        error="Please enter a valid email address"
      >
        <Input type="email" placeholder="invalid-email" />
      </FormControl>

      <FormControl
        label="Password"
        required
        error="Password must be at least 8 characters"
        hint="At least 8 characters with uppercase and numbers"
      >
        <Input type="password" />
      </FormControl>

      <FormActions>
        <Button>Retry</Button>
      </FormActions>
    </Form>
  ),
};

// Story: Form with success message
export const FormWithSuccess: StoryObj<typeof meta> = {
  render: () => (
    <Form className="max-w-md">
      <FormSuccess>Your profile has been updated successfully!</FormSuccess>

      <FormControl label="Username" required>
        <Input type="text" defaultValue="johndoe" />
      </FormControl>

      <FormControl label="Bio">
        <Textarea defaultValue="A brief description about yourself" />
      </FormControl>

      <FormActions>
        <Button>Save Changes</Button>
      </FormActions>
    </Form>
  ),
};

// Story: Form sections
export const FormSections: StoryObj<typeof meta> = {
  render: () => (
    <Form className="max-w-2xl">
      <FormSection label="Personal Information" description="Basic details about you">
        <FormControl label="Full Name" required>
          <Input type="text" placeholder="John Doe" />
        </FormControl>

        <FormControl label="Email" required>
          <Input type="email" placeholder="john@example.com" />
        </FormControl>
      </FormSection>

      <FormSection label="Address" variant="card">
        <FormControl label="Street Address" required>
          <Input type="text" placeholder="123 Main St" />
        </FormControl>

        <FormControl label="City" required>
          <Input type="text" placeholder="New York" />
        </FormControl>

        <FormControl label="Postal Code" required>
          <Input type="text" placeholder="10001" />
        </FormControl>
      </FormSection>

      <FormActions>
        <Button>Submit</Button>
      </FormActions>
    </Form>
  ),
};

// Story: Checkboxes and radios
export const CheckboxesAndRadios: StoryObj<typeof meta> = {
  render: () => (
    <Form className="max-w-md">
      <FormControl label="Preferences">
        <div className="space-y-2">
          <Checkbox label="Receive email notifications" />
          <Checkbox label="Subscribe to newsletter" />
          <Checkbox label="Share usage data" />
        </div>
      </FormControl>

      <FormControl label="Plan Type" required>
        <div className="space-y-2">
          <Radio name="plan" label="Free Plan" value="free" />
          <Radio name="plan" label="Pro Plan" value="pro" />
          <Radio name="plan" label="Enterprise" value="enterprise" />
        </div>
      </FormControl>

      <FormActions>
        <Button>Continue</Button>
      </FormActions>
    </Form>
  ),
};

// Story: Input sizes
export const InputSizes: StoryObj<typeof meta> = {
  render: () => (
    <Form className="max-w-md">
      <FormControl label="Small Input">
        <Input size="sm" type="text" placeholder="Small" />
      </FormControl>

      <FormControl label="Medium Input">
        <Input size="md" type="text" placeholder="Medium (default)" />
      </FormControl>

      <FormControl label="Large Input">
        <Input size="lg" type="text" placeholder="Large" />
      </FormControl>

      <FormControl label="Textarea Sizes">
        <div className="space-y-2">
          <Textarea size="sm" placeholder="Small" />
          <Textarea size="md" placeholder="Medium" />
          <Textarea size="lg" placeholder="Large" />
        </div>
      </FormControl>
    </Form>
  ),
};

// Story: Interactive form
function InteractiveFormStory() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newsletter: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Form onSubmit={handleSubmit} className="max-w-md">
      {submitted && <FormSuccess>Form submitted successfully!</FormSuccess>}

      <FormControl
        label="Name"
        required
        error={errors.name}
      >
        <Input
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </FormControl>

      <FormControl
        label="Email"
        required
        error={errors.email}
        hint="We'll never share your email"
      >
        <Input
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </FormControl>

      <FormControl>
        <Checkbox
          label="Subscribe to our newsletter"
          checked={formData.newsletter}
          onChange={(e) =>
            setFormData({ ...formData, newsletter: e.target.checked })
          }
        />
      </FormControl>

      <FormActions>
        <Button type="submit">Submit</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({ name: '', email: '', newsletter: false });
            setErrors({});
          }}
        >
          Clear
        </Button>
      </FormActions>
    </Form>
  );
}

export const InteractiveForm: StoryObj<typeof meta> = {
  render: () => <InteractiveFormStory />,
};
