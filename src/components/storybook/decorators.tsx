import type { Decorator } from "@storybook/nextjs-vite";

import { QuoteModalProvider } from "@/components/in-company/quote-modal";
import { AppStoreProvider } from "@/lib/app-store";

import { mockStoreInitialData } from "./mock-data";

/**
 * Envolve a story na `AppStoreProvider` semeada com dados mockados e na
 * `QuoteModalProvider`. Use em componentes que consomem `useAppStore()` ou
 * `useQuoteModal()` (ex.: `CourseCard`, `CalendarView`, `CommandPalette`).
 */
export const withAppStore: Decorator = (Story) => (
  <AppStoreProvider initialData={mockStoreInitialData}>
    <QuoteModalProvider>
      <Story />
    </QuoteModalProvider>
  </AppStoreProvider>
);
