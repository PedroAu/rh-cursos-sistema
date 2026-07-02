import type { Meta, StoryObj } from '@storybook/react';
import { tokens } from '@/design-tokens/tokens.tailwind.js';

const colorGroups = {
  'Trust Keith RH': [
    'tk-brand',
    'tk-brand-hover',
    'tk-cta',
    'tk-accent',
    'tk-accent-strong',
    'tk-accent-soft',
    'tk-focus',
  ],
  'RH canvas': [
    'rh-teal-deep',
    'rh-teal',
    'rh-teal-lt',
    'rh-gray',
    'rh-paper-a',
    'rh-paper-b',
    'rh-paper-line',
    'rh-hero-bg',
  ],
  Neutral: [
    'tk-ink',
    'tk-ink-muted',
    'tk-line',
    'tk-surface',
    'tk-surface-2',
    'tk-cream',
    'tk-cream-dark',
  ],
  Semantic: ['tk-success', 'tk-error'],
};

const Swatch = ({ name }: { name: string }) => (
  <div className="min-w-0">
    <div
      className="mb-2 h-24 rounded-tk-md border border-tk-line"
      style={{ backgroundColor: `var(--${name})` }}
    />
    <p className="truncate font-mono text-sm text-tk-ink">{name}</p>
    <p className="truncate font-mono text-xs text-tk-ink-muted">{tokens.colors[name]}</p>
  </div>
);

export const Colors: StoryObj = {
  render: () => (
    <div className="space-y-tk-12">
      {Object.entries(colorGroups).map(([group, names]) => (
        <section key={group} className="space-y-tk-4">
          <h2 className="font-tk-display text-section-heading text-tk-ink">{group}</h2>
          <div className="grid grid-cols-2 gap-tk-4 md:grid-cols-4">
            {names.map((name) => (
              <Swatch key={name} name={name} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className="max-w-tk-container space-y-tk-8">
      <div>
        <p className="font-tk-display text-display-hero font-bold text-tk-ink">Display hero</p>
        <p className="font-mono text-caption text-tk-ink-muted">tk-display / 3.75rem / fallback serif</p>
      </div>
      <div>
        <p className="font-tk-display text-display-large font-bold text-tk-ink">Display large</p>
        <p className="font-mono text-caption text-tk-ink-muted">tk-display / 2.75rem</p>
      </div>
      <div>
        <p className="font-tk-serif text-subheading-large font-light text-tk-ink">
          Merriweather subheading with a calm editorial rhythm.
        </p>
        <p className="font-mono text-caption text-tk-ink-muted">tk-serif / 1.5rem / weight 300</p>
      </div>
      <div>
        <p className="font-tk-body text-body-large text-tk-ink">
          Inter body copy is used for product content, forms, navigation, and repeated operational UI.
        </p>
        <p className="font-mono text-caption text-tk-ink-muted">tk-body / 1.0625rem</p>
      </div>
    </div>
  ),
};

export const SpacingAndShape: StoryObj = {
  render: () => (
    <div className="space-y-tk-10">
      <section className="space-y-tk-4">
        <h2 className="font-tk-display text-section-heading text-tk-ink">Spacing</h2>
        {Object.entries(tokens.spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-tk-4">
            <div className="w-28">
              <p className="font-mono text-sm text-tk-ink">{name}</p>
              <p className="font-mono text-xs text-tk-ink-muted">{value}</p>
            </div>
            <div className="h-7 rounded-tk-button bg-tk-accent" style={{ width: value }} />
          </div>
        ))}
      </section>

      <section className="space-y-tk-4">
        <h2 className="font-tk-display text-section-heading text-tk-ink">Radius</h2>
        <div className="grid grid-cols-2 gap-tk-6 md:grid-cols-3">
          {Object.entries(tokens.borderRadius).map(([name, value]) => (
            <div key={name}>
              <div className="mb-2 h-24 border border-tk-line bg-tk-accent-soft" style={{ borderRadius: value }} />
              <p className="font-mono text-sm text-tk-ink">{name}</p>
              <p className="font-mono text-xs text-tk-ink-muted">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};

export const Shadows: StoryObj = {
  render: () => (
    <div className="grid max-w-tk-container grid-cols-1 gap-tk-6 md:grid-cols-2">
      {Object.entries(tokens.boxShadow).map(([name, value]) => (
        <div key={name}>
          <div className="mb-3 h-32 rounded-tk-card border border-tk-line bg-tk-surface" style={{ boxShadow: value }} />
          <p className="font-mono text-sm text-tk-ink">{name}</p>
          <p className="break-all font-mono text-xs text-tk-ink-muted">{value}</p>
        </div>
      ))}
    </div>
  ),
};

export const ComponentExamples: StoryObj = {
  render: () => (
    <div className="max-w-tk-container space-y-tk-8 bg-rh-hero-bg p-tk-8">
      <div className="flex flex-wrap gap-tk-4">
        <button className="rounded-tk-button bg-tk-cta px-tk-5 py-tk-2 font-tk-body text-button text-tk-surface shadow-tk-glass transition hover:bg-tk-cta-hover">
          Primary
        </button>
        <button className="rounded-tk-button border border-tk-line bg-tk-surface px-tk-5 py-tk-2 font-tk-body text-button text-tk-ink transition hover:bg-tk-surface-2">
          Secondary
        </button>
        <span className="inline-flex items-center rounded-tk-pill border border-tk-line bg-tk-surface px-tk-4 py-tk-1 font-tk-body text-caption text-rh-gray">
          Badge
        </span>
      </div>

      <div className="grid gap-tk-6 md:grid-cols-2">
        <article className="rounded-tk-glass border border-tk-line bg-tk-surface p-tk-6 shadow-tk-glass">
          <h3 className="font-tk-display text-subheading text-tk-ink">Course card</h3>
          <p className="mt-tk-2 font-tk-body text-body-small text-tk-ink-muted">
            Surface, line, glass radius and dark-tinted elevation.
          </p>
        </article>
        <article className="rounded-tk-card border border-rh-paper-line bg-[var(--tk-gradient-paper)] p-tk-8 shadow-tk-card">
          <h3 className="font-tk-display text-subheading text-tk-ink">Paper card</h3>
          <p className="mt-tk-2 font-tk-serif text-body text-tk-ink-muted">
            RH paper gradient with Trust Keith typography.
          </p>
        </article>
      </div>
    </div>
  ),
};

const meta: Meta = {
  title: 'Design System / Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Trust Keith RH token documentation. Final RH remap values live in src/design-tokens/tokens.css and Tailwind references CSS variables from src/design-tokens/tokens.tailwind.js.',
      },
    },
  },
};

export default meta;
