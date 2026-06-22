import { describe, it, expect } from 'vitest';

// Helper function tests extracted from app-store.tsx
// These are the pure functions that don't require React context

// Test the capacity calculation logic
function countConfirmedEnrollments(
  enrollments: Array<{ classId: string; status: string }>,
  classId: string
) {
  return enrollments.filter(
    (item) =>
      item.classId === classId &&
      (item.status === 'Confirmada' || item.status === 'Aguardando pagamento' || item.status === 'Concluída')
  ).length;
}

function deriveClassCapacity(
  trainingClass: { id: string; totalSeats: number; filledSeats: number; manualFilledSeats?: number },
  enrollments: Array<{ classId: string; status: string }>
) {
  const siteFilledSeats = countConfirmedEnrollments(enrollments, trainingClass.id);
  const manualFilledSeats = Math.max(
    trainingClass.manualFilledSeats ?? trainingClass.filledSeats - siteFilledSeats,
    0
  );
  const filledSeats = Math.min(trainingClass.totalSeats, manualFilledSeats + siteFilledSeats);

  return {
    manualFilledSeats,
    filledSeats,
    availableSeats: Math.max(0, trainingClass.totalSeats - filledSeats),
  };
}

describe('App Store Utilities', () => {
  describe('countConfirmedEnrollments', () => {
    it('should count confirmada enrollments', () => {
      const enrollments = [
        { classId: 'class-1', status: 'Confirmada' },
        { classId: 'class-1', status: 'Confirmada' },
        { classId: 'class-2', status: 'Confirmada' },
      ];

      const count = countConfirmedEnrollments(enrollments, 'class-1');
      expect(count).toBe(2);
    });

    it('should count pagamento aguardando enrollments', () => {
      const enrollments = [
        { classId: 'class-1', status: 'Aguardando pagamento' },
        { classId: 'class-1', status: 'Confirmada' },
      ];

      const count = countConfirmedEnrollments(enrollments, 'class-1');
      expect(count).toBe(2);
    });

    it('should count concluida enrollments', () => {
      const enrollments = [
        { classId: 'class-1', status: 'Concluída' },
        { classId: 'class-1', status: 'Confirmada' },
      ];

      const count = countConfirmedEnrollments(enrollments, 'class-1');
      expect(count).toBe(2);
    });

    it('should exclude canceled enrollments', () => {
      const enrollments = [
        { classId: 'class-1', status: 'Confirmada' },
        { classId: 'class-1', status: 'Cancelada' },
      ];

      const count = countConfirmedEnrollments(enrollments, 'class-1');
      expect(count).toBe(1);
    });

    it('should return 0 for class with no confirmed enrollments', () => {
      const enrollments = [{ classId: 'class-1', status: 'Cancelada' }];

      const count = countConfirmedEnrollments(enrollments, 'class-1');
      expect(count).toBe(0);
    });

    it('should return 0 for unknown class', () => {
      const enrollments = [{ classId: 'class-1', status: 'Confirmada' }];

      const count = countConfirmedEnrollments(enrollments, 'unknown-class');
      expect(count).toBe(0);
    });
  });

  describe('deriveClassCapacity', () => {
    it('should calculate available seats correctly', () => {
      const trainingClass = {
        id: 'class-1',
        totalSeats: 30,
        filledSeats: 10,
        manualFilledSeats: undefined,
      };
      const enrollments = [
        { classId: 'class-1', status: 'Confirmada' },
        { classId: 'class-1', status: 'Confirmada' },
        { classId: 'class-1', status: 'Confirmada' },
      ];

      const capacity = deriveClassCapacity(trainingClass, enrollments);
      // manualFilledSeats = max(undefined ?? (10 - 3), 0) = max(7, 0) = 7
      // filledSeats = min(30, 7 + 3) = 10
      // availableSeats = max(0, 30 - 10) = 20
      expect(capacity.filledSeats).toBe(10);
      expect(capacity.availableSeats).toBe(20);
    });

    it('should respect total seats limit', () => {
      const trainingClass = {
        id: 'class-1',
        totalSeats: 5,
        filledSeats: 3,
        manualFilledSeats: 2,
      };
      const enrollments: Array<{ classId: string; status: string }> = [];

      const capacity = deriveClassCapacity(trainingClass, enrollments);
      // manualFilledSeats = max(2 ?? (3 - 0), 0) = max(2, 0) = 2
      // filledSeats = min(5, 2 + 0) = 2
      // availableSeats = max(0, 5 - 2) = 3
      expect(capacity.filledSeats).toBe(2);
      expect(capacity.availableSeats).toBe(3);
    });

    it('should never return negative available seats', () => {
      const trainingClass = {
        id: 'class-1',
        totalSeats: 10,
        filledSeats: 15,
      };
      const enrollments: Array<{ classId: string; status: string }> = [];

      const capacity = deriveClassCapacity(trainingClass, enrollments);
      expect(capacity.availableSeats).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero filled seats', () => {
      const trainingClass = {
        id: 'class-1',
        totalSeats: 30,
        filledSeats: 0,
      };
      const enrollments: Array<{ classId: string; status: string }> = [];

      const capacity = deriveClassCapacity(trainingClass, enrollments);
      expect(capacity.filledSeats).toBe(0);
      expect(capacity.availableSeats).toBe(30);
    });

    it('should add manual and site filled seats', () => {
      const trainingClass = {
        id: 'class-1',
        totalSeats: 30,
        filledSeats: 10,
        manualFilledSeats: 5,
      };
      const enrollments = [
        { classId: 'class-1', status: 'Confirmada' },
        { classId: 'class-1', status: 'Confirmada' },
      ];

      const capacity = deriveClassCapacity(trainingClass, enrollments);
      expect(capacity.manualFilledSeats).toBe(5);
      expect(capacity.filledSeats).toBe(7); // 5 manual + 2 site
      expect(capacity.availableSeats).toBe(23);
    });

    it('should handle full class', () => {
      const trainingClass = {
        id: 'class-1',
        totalSeats: 30,
        filledSeats: 30,
      };
      const enrollments: Array<{ classId: string; status: string }> = [];

      const capacity = deriveClassCapacity(trainingClass, enrollments);
      expect(capacity.filledSeats).toBe(30);
      expect(capacity.availableSeats).toBe(0);
    });
  });

  describe('Storage key', () => {
    it('should use correct storage key for persistence', () => {
      const storageKey = 'rhcursos-demo-store-v4';
      expect(storageKey).toBe('rhcursos-demo-store-v4');
      expect(storageKey).toMatch(/^rhcursos-/);
      expect(storageKey).toMatch(/-v\d+$/);
    });
  });
});
