/**
 * a) Module Name: RoamReady Backend API Integration Notes & Frontend Contract
 * b) Date of Code: November 23, 2026
 * c) Programmer's Name: Peter Kimberley
 * d) Brief Description: Integration guide and technical contract documentation for frontend
 *    engineers (Gisselle Francisco, Daniela Chavez, Luis Larios) connecting Next.js UI
 *    components to Supabase PostgreSQL via Server Actions.
 * e) Target Modules & Views:
 *    - Trip Overview Dashboard (src/app/trips / src/app/features)
 *    - Itinerary & Calendar Views (src/app/itinerary)
 *    - Packing & Pre-Trip Checklists
 *    - Expense & Budget Management
 * f) Response Shape Contract:
 *    - Standardized ActionResult envelope: Promise<{ data: T | null; error: string | null }>
 * g) Architecture & Security:
 *    - Session persistence managed through Next.js cookies; no manual JWT tokens required.
 *    - Database Row-Level Security and server-side checks guarantee strict user isolation.
 */

# RoamReady Backend API & Frontend Integration Guide

Welcome to the backend data layer documentation for RoamReady! All database mutations and queries are exposed as **strongly-typed Next.js Server Actions** (`'use server'`).

---

## 1. Quick Start & Import Paths

You can import all trip and child collection actions from a single centralized module:

```typescript
import {
  // Trip Management
  getUserTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,

  // Itinerary & Calendar
  getTripItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,

  // Checklist & Packing
  getTripChecklist,
  addChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,

  // Budget & Expenses
  getTripBudget,
  addBudgetEntry,
  updateBudgetEntry,
  deleteBudgetEntry,
} from '@/app/trips/actions';
```

---

## 2. Standard Return Contract

Every Server Action returns a uniform envelope with `{ data, error }`. They do **not** throw uncaught errors across the network boundary:

```typescript
const { data, error } = await getUserTrips();

if (error) {
  // Show error toast / alert to user
  console.error('Action failed:', error);
  return;
}

// data is strictly typed and safe to render!
console.log('Success:', data);
```

---

## 3. Trip Overview / Dashboard Integration

### 3.1 Fetching All Trips for Current User
Use in a React Server Component or client component:
```typescript
import { getUserTrips } from '@/app/trips/actions';

export default async function TripsPage() {
  const { data: trips, error } = await getUserTrips();

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div>
      {trips?.map((trip) => (
        <div key={trip.id} className="trip-card">
          <h3>{trip.title}</h3>
          <p>{trip.destination}</p>
          <small>{trip.start_date} to {trip.end_date}</small>
        </div>
      ))}
    </div>
  );
}
```

### 3.2 Fetching Full Trip Details (Trip + Itinerary + Checklist + Budget)
Loads the complete trip and all its child collections in one server roundtrip:
```typescript
const { data: tripWithDetails, error } = await getTripById('trip-uuid-here');

// tripWithDetails contains:
// tripWithDetails.title
// tripWithDetails.destination
// tripWithDetails.itinerary_items (array)
// tripWithDetails.checklist_items (array)
// tripWithDetails.budget_entries (array)
```

### 3.3 Creating a Trip
Accepts either a TypeScript object or HTML `<form>` `FormData`:
```typescript
// Option A: Direct JavaScript Call (e.g. from an onClick or modal form)
const { data: newTrip, error } = await createTrip({
  title: 'Summer in Tokyo',
  destination: 'Tokyo, Japan',
  start_date: '2027-07-01', // Format: YYYY-MM-DD
  end_date: '2027-07-12',
  description: 'Exploring Shibuya and Kyoto.',
});

// Option B: Native Form Action
<form action={createTrip}>
  <input name="title" required placeholder="Trip Title" />
  <input name="destination" required placeholder="Destination" />
  <input type="date" name="start_date" />
  <input type="date" name="end_date" />
  <textarea name="description" placeholder="Description" />
  <button type="submit">Create Trip</button>
</form>
```

### 3.4 Updating a Trip
```typescript
const { data: updatedTrip, error } = await updateTrip(tripId, {
  destination: 'Kyoto, Japan',
  description: 'Updated destination and plans.',
});
```

### 3.5 Deleting a Trip
*Note: Deleting a trip automatically cascades and cleanly deletes all of its itinerary items, checklist items, and budget entries.*
```typescript
const { data, error } = await deleteTrip(tripId);
```

---

## 4. Itinerary & Calendar Integration

> **Crucial Architecture Note:** The `itinerary_items` table is the **single source of truth** for both the Itinerary page and the Calendar page. Every itinerary item has an ISO 8601 timestamp (`start_time` and optional `end_time`), allowing calendar components to plot them directly on monthly or weekly views with zero sync issues.

### 4.1 Adding an Activity
```typescript
const { data: item, error } = await addItineraryItem({
  trip_id: 'trip-uuid',
  title: 'Senso-ji Temple Morning Tour',
  location: 'Asakusa, Tokyo',
  category: 'culture', // 'flight' | 'hotel' | 'food' | 'culture' | 'sightseeing' | 'activity' | 'transport'
  start_time: '2027-07-02T09:00:00Z', // ISO 8601 string
  end_time: '2027-07-02T11:30:00Z',
  notes: 'Bring cash for street stalls.',
  sort_order: 1,
});
```

### 4.2 Updating or Moving an Activity
```typescript
const { data: updatedItem, error } = await updateItineraryItem(itemId, {
  start_time: '2027-07-02T10:00:00Z',
  end_time: '2027-07-02T12:30:00Z',
});
```

### 4.3 Reordering Activities (Drag and Drop)
When a user drags and reorders activities on the page:
```typescript
// Pass the tripId and array of item IDs in their new top-to-bottom order:
const { data, error } = await reorderItineraryItems(tripId, [
  'id-first-item',
  'id-second-item',
  'id-third-item',
]);
```

### 4.4 Deleting an Activity
```typescript
const { data, error } = await deleteItineraryItem(itemId);
```

---

## 5. Checklist & Packing Integration

### 5.1 Adding a Checklist Item
```typescript
const { data: newItem, error } = await addChecklistItem({
  trip_id: 'trip-uuid',
  label: 'Pack universal 2-prong power adapters',
  category: 'packing', // 'packing' | 'documents' | 'health' | 'finance' | 'bookings' | 'pre-trip'
});
```

### 5.2 Toggling Completion (Checkbox Click)
```typescript
// Pass just the item ID to toggle true/false automatically:
const { data: toggledItem, error } = await toggleChecklistItem(itemId);

// Or pass an explicit boolean state:
await toggleChecklistItem(itemId, true);
```

### 5.3 Deleting a Checklist Item
```typescript
const { data, error } = await deleteChecklistItem(itemId);
```

---

## 6. Budget & Expense Tracking Integration

### 6.1 Adding an Expense
```typescript
const { data: expense, error } = await addBudgetEntry({
  trip_id: 'trip-uuid',
  category: 'lodging', // 'lodging' | 'flights' | 'food' | 'transport' | 'activities' | 'shopping'
  amount: 240.50, // Number (non-negative)
  currency: 'USD', // Defaults to 'USD'
  note: 'Hotel deposit for 2 nights',
  entry_date: '2027-07-01', // YYYY-MM-DD
});
```

### 6.2 Calculating Total Expenses & Category Breakdown
```typescript
const { data: budget } = await getTripBudget(tripId);

// Total spending:
const totalSpent = (budget ?? []).reduce((acc, entry) => acc + entry.amount, 0);

// Spending by category:
const categoryTotals = (budget ?? []).reduce<Record<string, number>>((acc, entry) => {
  acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
  return acc;
}, {});
```

### 6.3 Deleting an Expense
```typescript
const { data, error } = await deleteBudgetEntry(entryId);
```

---

## 7. Error Handling & Validation Rules

| Rule | Limit / Requirement | Error Message Returned |
| :--- | :--- | :--- |
| **Authentication** | Must be logged in via Supabase session cookie | `"Authentication required. Please log in."` |
| **Trip Title** | Required, max 120 chars | `"Trip title is required."` |
| **Destination** | Required, max 150 chars | `"Destination is required."` |
| **Trip Dates** | Format `YYYY-MM-DD`, `end_date >= start_date` | `"End date cannot be earlier than start date."` |
| **Activity Start/End** | ISO 8601 string, `end_time >= start_time` | `"End time cannot be earlier than start time."` |
| **Budget Amount** | Non-negative number (`>= 0`) | `"Amount must be a non-negative number."` |
| **Security / RLS** | User can only query/mutate their own trips/items | `"Trip not found or access denied."` |
