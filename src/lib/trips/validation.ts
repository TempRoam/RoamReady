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

import type {
  CreateBudgetEntryInput,
  CreateChecklistItemInput,
  CreateItineraryItemInput,
  CreateTripInput,
  UpdateBudgetEntryInput,
  UpdateChecklistItemInput,
  UpdateItineraryItemInput,
  UpdateTripInput,
} from '@/types/trips';

export const MAX_TITLE_LENGTH = 120;
export const MAX_DESTINATION_LENGTH = 150;
export const MAX_DESCRIPTION_LENGTH = 2000;

export const MAX_ITINERARY_TITLE_LENGTH = 150;
export const MAX_LOCATION_LENGTH = 200;
export const MAX_CATEGORY_LENGTH = 50;
export const MAX_NOTES_LENGTH = 2000;

export const MAX_CHECKLIST_LABEL_LENGTH = 200;

export const MAX_BUDGET_CATEGORY_LENGTH = 50;
export const MAX_BUDGET_AMOUNT = 9999999.99;
export const MAX_NOTE_LENGTH = 500;

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

export function isValidIsoTimestamp(value: string | null | undefined): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const parsed = Date.parse(trimmed);
  return !Number.isNaN(parsed);
}

function extractFields(input: unknown): Record<string, unknown> {
  if (input instanceof FormData) {
    const fields: Record<string, unknown> = {};
    input.forEach((val, key) => {
      fields[key] = typeof val === 'string' ? val : null;
    });
    return fields;
  }
  if (typeof input === 'object' && input !== null) {
    return input as Record<string, unknown>;
  }
  return {};
}

// ============================================================================
// Itinerary Validation
// ============================================================================

export function validateCreateItineraryItemInput(
  input: CreateItineraryItemInput | FormData
): ValidationResult<{
  trip_id: string;
  title: string;
  location: string | null;
  category: string | null;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  sort_order: number;
}> {
  const fields = extractFields(input);

  const tripId = typeof fields.trip_id === 'string' ? fields.trip_id.trim() : '';
  if (!isValidUuid(tripId)) {
    return { value: null, error: 'A valid trip identifier is required.' };
  }

  const title = typeof fields.title === 'string' ? fields.title.trim() : '';
  if (!title) {
    return { value: null, error: 'Activity title is required.' };
  }
  if (title.length > MAX_ITINERARY_TITLE_LENGTH) {
    return {
      value: null,
      error: `Activity title must be ${MAX_ITINERARY_TITLE_LENGTH} characters or fewer.`,
    };
  }

  const start_time =
    typeof fields.start_time === 'string' ? fields.start_time.trim() : '';
  if (!start_time || !isValidIsoTimestamp(start_time)) {
    return {
      value: null,
      error: 'Start time is required and must be a valid ISO 8601 date/time.',
    };
  }

  const rawEndTime = normalizeOptionalString(fields.end_time);
  let end_time: string | null = null;
  if (rawEndTime) {
    if (!isValidIsoTimestamp(rawEndTime)) {
      return {
        value: null,
        error: 'End time must be a valid ISO 8601 date/time.',
      };
    }
    if (new Date(rawEndTime).getTime() < new Date(start_time).getTime()) {
      return {
        value: null,
        error: 'End time cannot be earlier than start time.',
      };
    }
    end_time = rawEndTime;
  }

  const location = normalizeOptionalString(fields.location) ?? null;
  if (location && location.length > MAX_LOCATION_LENGTH) {
    return {
      value: null,
      error: `Location must be ${MAX_LOCATION_LENGTH} characters or fewer.`,
    };
  }

  const category = normalizeOptionalString(fields.category) ?? null;
  if (category && category.length > MAX_CATEGORY_LENGTH) {
    return {
      value: null,
      error: `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`,
    };
  }

  const notes = normalizeOptionalString(fields.notes) ?? null;
  if (notes && notes.length > MAX_NOTES_LENGTH) {
    return {
      value: null,
      error: `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`,
    };
  }

  const rawSortOrder = fields.sort_order;
  const sort_order =
    typeof rawSortOrder === 'number' && Number.isFinite(rawSortOrder)
      ? Math.trunc(rawSortOrder)
      : typeof rawSortOrder === 'string' && !Number.isNaN(Number(rawSortOrder))
      ? Math.trunc(Number(rawSortOrder))
      : 0;

  return {
    value: {
      trip_id: tripId,
      title,
      location,
      category,
      start_time: new Date(start_time).toISOString(),
      end_time: end_time ? new Date(end_time).toISOString() : null,
      notes,
      sort_order,
    },
    error: null,
  };
}

export function validateUpdateItineraryItemInput(
  input: UpdateItineraryItemInput | FormData
): ValidationResult<{
  title?: string;
  location?: string | null;
  category?: string | null;
  start_time?: string;
  end_time?: string | null;
  notes?: string | null;
  sort_order?: number;
}> {
  const fields = extractFields(input);
  const updates: {
    title?: string;
    location?: string | null;
    category?: string | null;
    start_time?: string;
    end_time?: string | null;
    notes?: string | null;
    sort_order?: number;
  } = {};

  if ('title' in fields && fields.title !== undefined) {
    const title = typeof fields.title === 'string' ? fields.title.trim() : '';
    if (!title) {
      return { value: null, error: 'Activity title cannot be empty.' };
    }
    if (title.length > MAX_ITINERARY_TITLE_LENGTH) {
      return {
        value: null,
        error: `Activity title must be ${MAX_ITINERARY_TITLE_LENGTH} characters or fewer.`,
      };
    }
    updates.title = title;
  }

  if ('location' in fields && fields.location !== undefined) {
    const location = normalizeOptionalString(fields.location) ?? null;
    if (location && location.length > MAX_LOCATION_LENGTH) {
      return {
        value: null,
        error: `Location must be ${MAX_LOCATION_LENGTH} characters or fewer.`,
      };
    }
    updates.location = location;
  }

  if ('category' in fields && fields.category !== undefined) {
    const category = normalizeOptionalString(fields.category) ?? null;
    if (category && category.length > MAX_CATEGORY_LENGTH) {
      return {
        value: null,
        error: `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`,
      };
    }
    updates.category = category;
  }

  if ('notes' in fields && fields.notes !== undefined) {
    const notes = normalizeOptionalString(fields.notes) ?? null;
    if (notes && notes.length > MAX_NOTES_LENGTH) {
      return {
        value: null,
        error: `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`,
      };
    }
    updates.notes = notes;
  }

  if ('start_time' in fields && fields.start_time !== undefined) {
    const start_time =
      typeof fields.start_time === 'string' ? fields.start_time.trim() : '';
    if (!start_time || !isValidIsoTimestamp(start_time)) {
      return {
        value: null,
        error: 'Start time must be a valid ISO 8601 date/time.',
      };
    }
    updates.start_time = new Date(start_time).toISOString();
  }

  if ('end_time' in fields && fields.end_time !== undefined) {
    const rawEnd = normalizeOptionalString(fields.end_time);
    if (rawEnd) {
      if (!isValidIsoTimestamp(rawEnd)) {
        return {
          value: null,
          error: 'End time must be a valid ISO 8601 date/time.',
        };
      }
      updates.end_time = new Date(rawEnd).toISOString();
    } else {
      updates.end_time = null;
    }
  }

  if ('sort_order' in fields && fields.sort_order !== undefined) {
    const raw = fields.sort_order;
    updates.sort_order =
      typeof raw === 'number' && Number.isFinite(raw)
        ? Math.trunc(raw)
        : !Number.isNaN(Number(raw))
        ? Math.trunc(Number(raw))
        : 0;
  }

  if (
    updates.start_time &&
    updates.end_time &&
    new Date(updates.end_time).getTime() < new Date(updates.start_time).getTime()
  ) {
    return {
      value: null,
      error: 'End time cannot be earlier than start time.',
    };
  }

  if (Object.keys(updates).length === 0) {
    return { value: null, error: 'No valid itinerary fields provided to update.' };
  }

  return { value: updates, error: null };
}

// ============================================================================
// Checklist Validation
// ============================================================================

export function validateCreateChecklistItemInput(
  input: CreateChecklistItemInput | FormData
): ValidationResult<{
  trip_id: string;
  label: string;
  category: string | null;
  is_completed: boolean;
  sort_order: number;
}> {
  const fields = extractFields(input);

  const tripId = typeof fields.trip_id === 'string' ? fields.trip_id.trim() : '';
  if (!isValidUuid(tripId)) {
    return { value: null, error: 'A valid trip identifier is required.' };
  }

  const label = typeof fields.label === 'string' ? fields.label.trim() : '';
  if (!label) {
    return { value: null, error: 'Checklist item label is required.' };
  }
  if (label.length > MAX_CHECKLIST_LABEL_LENGTH) {
    return {
      value: null,
      error: `Checklist label must be ${MAX_CHECKLIST_LABEL_LENGTH} characters or fewer.`,
    };
  }

  const category = normalizeOptionalString(fields.category) ?? null;
  if (category && category.length > MAX_CATEGORY_LENGTH) {
    return {
      value: null,
      error: `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`,
    };
  }

  const is_completed =
    fields.is_completed === true ||
    fields.is_completed === 'true' ||
    fields.is_completed === '1' ||
    fields.is_completed === 1;

  const rawSortOrder = fields.sort_order;
  const sort_order =
    typeof rawSortOrder === 'number' && Number.isFinite(rawSortOrder)
      ? Math.trunc(rawSortOrder)
      : typeof rawSortOrder === 'string' && !Number.isNaN(Number(rawSortOrder))
      ? Math.trunc(Number(rawSortOrder))
      : 0;

  return {
    value: {
      trip_id: tripId,
      label,
      category,
      is_completed,
      sort_order,
    },
    error: null,
  };
}

export function validateUpdateChecklistItemInput(
  input: UpdateChecklistItemInput | FormData
): ValidationResult<{
  label?: string;
  category?: string | null;
  is_completed?: boolean;
  sort_order?: number;
}> {
  const fields = extractFields(input);
  const updates: {
    label?: string;
    category?: string | null;
    is_completed?: boolean;
    sort_order?: number;
  } = {};

  if ('label' in fields && fields.label !== undefined) {
    const label = typeof fields.label === 'string' ? fields.label.trim() : '';
    if (!label) {
      return { value: null, error: 'Checklist item label cannot be empty.' };
    }
    if (label.length > MAX_CHECKLIST_LABEL_LENGTH) {
      return {
        value: null,
        error: `Checklist label must be ${MAX_CHECKLIST_LABEL_LENGTH} characters or fewer.`,
      };
    }
    updates.label = label;
  }

  if ('category' in fields && fields.category !== undefined) {
    const category = normalizeOptionalString(fields.category) ?? null;
    if (category && category.length > MAX_CATEGORY_LENGTH) {
      return {
        value: null,
        error: `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`,
      };
    }
    updates.category = category;
  }

  if ('is_completed' in fields && fields.is_completed !== undefined) {
    updates.is_completed =
      fields.is_completed === true ||
      fields.is_completed === 'true' ||
      fields.is_completed === '1' ||
      fields.is_completed === 1;
  }

  if ('sort_order' in fields && fields.sort_order !== undefined) {
    const raw = fields.sort_order;
    updates.sort_order =
      typeof raw === 'number' && Number.isFinite(raw)
        ? Math.trunc(raw)
        : !Number.isNaN(Number(raw))
        ? Math.trunc(Number(raw))
        : 0;
  }

  if (Object.keys(updates).length === 0) {
    return { value: null, error: 'No valid checklist fields provided to update.' };
  }

  return { value: updates, error: null };
}

// ============================================================================
// Budget Validation
// ============================================================================

export function validateCreateBudgetEntryInput(
  input: CreateBudgetEntryInput | FormData
): ValidationResult<{
  trip_id: string;
  category: string;
  amount: number;
  currency: string;
  note: string | null;
  entry_date: string | null;
}> {
  const fields = extractFields(input);

  const tripId = typeof fields.trip_id === 'string' ? fields.trip_id.trim() : '';
  if (!isValidUuid(tripId)) {
    return { value: null, error: 'A valid trip identifier is required.' };
  }

  const category = typeof fields.category === 'string' ? fields.category.trim() : '';
  if (!category) {
    return { value: null, error: 'Expense category is required.' };
  }
  if (category.length > MAX_BUDGET_CATEGORY_LENGTH) {
    return {
      value: null,
      error: `Category must be ${MAX_BUDGET_CATEGORY_LENGTH} characters or fewer.`,
    };
  }

  const rawAmount = fields.amount;
  const numAmount =
    typeof rawAmount === 'number' ? rawAmount : Number(String(rawAmount ?? ''));
  if (Number.isNaN(numAmount) || numAmount < 0) {
    return {
      value: null,
      error: 'Amount must be a non-negative number.',
    };
  }
  if (numAmount > MAX_BUDGET_AMOUNT) {
    return {
      value: null,
      error: `Amount exceeds maximum limit ($${MAX_BUDGET_AMOUNT.toLocaleString()}).`,
    };
  }

  const rawCurrency = normalizeOptionalString(fields.currency);
  const currency = rawCurrency ? rawCurrency.toUpperCase().slice(0, 3) : 'USD';

  const note = normalizeOptionalString(fields.note) ?? null;
  if (note && note.length > MAX_NOTE_LENGTH) {
    return {
      value: null,
      error: `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`,
    };
  }

  const rawDate = normalizeOptionalString(fields.entry_date);
  let entry_date: string | null = null;
  if (rawDate) {
    if (!isValidDateString(rawDate)) {
      return {
        value: null,
        error: 'Entry date must be a valid date in YYYY-MM-DD format.',
      };
    }
    entry_date = rawDate;
  }

  return {
    value: {
      trip_id: tripId,
      category,
      amount: Math.round(numAmount * 100) / 100,
      currency,
      note,
      entry_date,
    },
    error: null,
  };
}

export function validateUpdateBudgetEntryInput(
  input: UpdateBudgetEntryInput | FormData
): ValidationResult<{
  category?: string;
  amount?: number;
  currency?: string;
  note?: string | null;
  entry_date?: string | null;
}> {
  const fields = extractFields(input);
  const updates: {
    category?: string;
    amount?: number;
    currency?: string;
    note?: string | null;
    entry_date?: string | null;
  } = {};

  if ('category' in fields && fields.category !== undefined) {
    const category = typeof fields.category === 'string' ? fields.category.trim() : '';
    if (!category) {
      return { value: null, error: 'Expense category cannot be empty.' };
    }
    if (category.length > MAX_BUDGET_CATEGORY_LENGTH) {
      return {
        value: null,
        error: `Category must be ${MAX_BUDGET_CATEGORY_LENGTH} characters or fewer.`,
      };
    }
    updates.category = category;
  }

  if ('amount' in fields && fields.amount !== undefined) {
    const numAmount =
      typeof fields.amount === 'number'
        ? fields.amount
        : Number(String(fields.amount ?? ''));
    if (Number.isNaN(numAmount) || numAmount < 0) {
      return {
        value: null,
        error: 'Amount must be a non-negative number.',
      };
    }
    if (numAmount > MAX_BUDGET_AMOUNT) {
      return {
        value: null,
        error: `Amount exceeds maximum limit ($${MAX_BUDGET_AMOUNT.toLocaleString()}).`,
      };
    }
    updates.amount = Math.round(numAmount * 100) / 100;
  }

  if ('currency' in fields && fields.currency !== undefined) {
    const rawCurrency = normalizeOptionalString(fields.currency);
    updates.currency = rawCurrency ? rawCurrency.toUpperCase().slice(0, 3) : 'USD';
  }

  if ('note' in fields && fields.note !== undefined) {
    const note = normalizeOptionalString(fields.note) ?? null;
    if (note && note.length > MAX_NOTE_LENGTH) {
      return {
        value: null,
        error: `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`,
      };
    }
    updates.note = note;
  }

  if ('entry_date' in fields && fields.entry_date !== undefined) {
    const rawDate = normalizeOptionalString(fields.entry_date);
    if (rawDate) {
      if (!isValidDateString(rawDate)) {
        return {
          value: null,
          error: 'Entry date must be a valid date in YYYY-MM-DD format.',
        };
      }
      updates.entry_date = rawDate;
    } else {
      updates.entry_date = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return { value: null, error: 'No valid budget fields provided to update.' };
  }

  return { value: updates, error: null };
}
