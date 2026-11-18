/**
 * a) Module Name: Trip Input Validation Utilities
 * b) Date of Code: November 18, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Pure server-side validation and sanitization helpers for trip CRUD
 *    operations. Normalizes both plain TypeScript objects and HTML FormData payloads while
 *    enforcing length limits, UUID formats, valid calendar dates, and chronological date order.
 * e) Important Functions:
 *    - isValidUuid(value): Checks standard 36-character UUID syntax.
 *    - isValidDateString(value): Validates YYYY-MM-DD formatting and real calendar date existence.
 *    - validateCreateTripInput(input): Validates and normalizes payload for trip creation.
 *    - validateUpdateTripInput(input): Validates partial updates for trip editing.
 * f) Important Data Structures:
 *    - ValidationResult<T>: Discriminated union returning either sanitized value or human-readable error.
 * g) Algorithm & Justification:
 *    - Defense-in-Depth Validation: Validating inputs at the TypeScript layer before querying
 *      PostgreSQL produces clear, user-friendly error messages and prevents malformed data or
 *      oversized payloads from consuming database resources.
 */

import type { CreateTripInput, UpdateTripInput } from '@/types/trips';

export const MAX_TITLE_LENGTH = 120;
export const MAX_DESTINATION_LENGTH = 150;
export const MAX_DESCRIPTION_LENGTH = 2000;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type ValidationResult<T> =
  | { value: T; error: null }
  | { value: null; error: string };

export function isValidUuid(value: string | null | undefined): boolean {
  if (typeof value !== 'string') return false;
  return UUID_REGEX.test(value.trim());
}

export function isValidDateString(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) return false;

  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function normalizeOptionalString(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractTripFields(
  input: CreateTripInput | UpdateTripInput | FormData
): Record<string, unknown> {
  if (input instanceof FormData) {
    const fields: Record<string, unknown> = {};
    for (const key of ['title', 'destination', 'start_date', 'end_date', 'description']) {
      if (input.has(key)) {
        const val = input.get(key);
        fields[key] = typeof val === 'string' ? val : null;
      }
    }
    return fields;
  }

  return input as Record<string, unknown>;
}

export function validateCreateTripInput(
  input: CreateTripInput | FormData
): ValidationResult<{
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}> {
  const fields = extractTripFields(input);

  const title = typeof fields.title === 'string' ? fields.title.trim() : '';
  if (!title) {
    return { value: null, error: 'Trip title is required.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      value: null,
      error: `Trip title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    };
  }

  const destination =
    typeof fields.destination === 'string' ? fields.destination.trim() : '';
  if (!destination) {
    return { value: null, error: 'Destination is required.' };
  }
  if (destination.length > MAX_DESTINATION_LENGTH) {
    return {
      value: null,
      error: `Destination must be ${MAX_DESTINATION_LENGTH} characters or fewer.`,
    };
  }

  const description = normalizeOptionalString(fields.description) ?? null;
  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      value: null,
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }

  const start_date = normalizeOptionalString(fields.start_date) ?? null;
  const end_date = normalizeOptionalString(fields.end_date) ?? null;

  if (start_date && !isValidDateString(start_date)) {
    return {
      value: null,
      error: 'Start date must be a valid date in YYYY-MM-DD format.',
    };
  }

  if (end_date && !isValidDateString(end_date)) {
    return {
      value: null,
      error: 'End date must be a valid date in YYYY-MM-DD format.',
    };
  }

  if (start_date && end_date && end_date < start_date) {
    return {
      value: null,
      error: 'End date cannot be earlier than start date.',
    };
  }

  return {
    value: {
      title,
      destination,
      start_date,
      end_date,
      description,
    },
    error: null,
  };
}

export function validateUpdateTripInput(
  input: UpdateTripInput | FormData
): ValidationResult<{
  title?: string;
  destination?: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}> {
  const fields = extractTripFields(input);
  const updates: {
    title?: string;
    destination?: string;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
  } = {};

  if ('title' in fields && fields.title !== undefined) {
    const title = typeof fields.title === 'string' ? fields.title.trim() : '';
    if (!title) {
      return { value: null, error: 'Trip title cannot be empty.' };
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return {
        value: null,
        error: `Trip title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
      };
    }
    updates.title = title;
  }

  if ('destination' in fields && fields.destination !== undefined) {
    const destination =
      typeof fields.destination === 'string' ? fields.destination.trim() : '';
    if (!destination) {
      return { value: null, error: 'Destination cannot be empty.' };
    }
    if (destination.length > MAX_DESTINATION_LENGTH) {
      return {
        value: null,
        error: `Destination must be ${MAX_DESTINATION_LENGTH} characters or fewer.`,
      };
    }
    updates.destination = destination;
  }

  if ('description' in fields && fields.description !== undefined) {
    const description = normalizeOptionalString(fields.description) ?? null;
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      return {
        value: null,
        error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
      };
    }
    updates.description = description;
  }

  if ('start_date' in fields && fields.start_date !== undefined) {
    const start_date = normalizeOptionalString(fields.start_date) ?? null;
    if (start_date && !isValidDateString(start_date)) {
      return {
        value: null,
        error: 'Start date must be a valid date in YYYY-MM-DD format.',
      };
    }
    updates.start_date = start_date;
  }

  if ('end_date' in fields && fields.end_date !== undefined) {
    const end_date = normalizeOptionalString(fields.end_date) ?? null;
    if (end_date && !isValidDateString(end_date)) {
      return {
        value: null,
        error: 'End date must be a valid date in YYYY-MM-DD format.',
      };
    }
    updates.end_date = end_date;
  }

  if (Object.keys(updates).length === 0) {
    return { value: null, error: 'No valid trip fields were provided to update.' };
  }

  if (
    updates.start_date &&
    updates.end_date &&
    updates.end_date < updates.start_date
  ) {
    return {
      value: null,
      error: 'End date cannot be earlier than start date.',
    };
  }

  return { value: updates, error: null };
}
