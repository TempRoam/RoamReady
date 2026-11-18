# RoamReady Database Schema & ER Diagram (Lane A: Data & Trips)

> **Location:** Kept next to [`supabase/migrations/`](./migrations/) as the living data schema reference for the backend team and course documentation.  
> **Last Updated:** November 18, 2026

---

## Entity-Relationship Diagram

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1 (auto-created via trigger)"
    profiles ||--o{ trips : "owns (ON DELETE CASCADE)"
    trips ||--o{ itinerary_items : "contains (ON DELETE CASCADE)"
    trips ||--o{ checklist_items : "contains (ON DELETE CASCADE)"
    trips ||--o{ budget_entries : "contains (ON DELETE CASCADE)"

    auth_users {
        uuid id PK "Supabase Auth managed"
        text email
        jsonb raw_user_meta_data
    }

    profiles {
        uuid id PK, FK "references auth.users(id)"
        text email "NOT NULL"
        text display_name
        text avatar_url
        timestamptz created_at "UTC default now()"
        timestamptz updated_at "auto-updated via trigger"
    }

    trips {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "references profiles(id)"
        text title "NOT NULL"
        text destination "NOT NULL"
        date start_date
        date end_date "CHECK (end_date >= start_date)"
        text description
        timestamptz created_at "UTC default now()"
        timestamptz updated_at "auto-updated via trigger"
    }

    itinerary_items {
        uuid id PK "gen_random_uuid()"
        uuid trip_id FK "references trips(id)"
        uuid user_id FK "references profiles(id)"
        text title "NOT NULL"
        text location
        text category "e.g. flight, hotel, food, culture, sightseeing, activity"
        timestamptz start_time "NOT NULL (also powers Calendar view)"
        timestamptz end_time "CHECK (end_time >= start_time)"
        text notes
        int sort_order "default 0"
        timestamptz created_at "UTC default now()"
        timestamptz updated_at "auto-updated via trigger"
    }

    checklist_items {
        uuid id PK "gen_random_uuid()"
        uuid trip_id FK "references trips(id)"
        uuid user_id FK "references profiles(id)"
        text label "NOT NULL"
        text category "e.g. packing, documents, pre-trip"
        boolean is_completed "NOT NULL default false"
        int sort_order "default 0"
        timestamptz created_at "UTC default now()"
        timestamptz updated_at "auto-updated via trigger"
    }

    budget_entries {
        uuid id PK "gen_random_uuid()"
        uuid trip_id FK "references trips(id)"
        uuid user_id FK "references profiles(id)"
        text category "NOT NULL (e.g. lodging, flights, food, transport, activities)"
        numeric amount "NOT NULL CHECK (amount >= 0)"
        text currency "NOT NULL default 'USD'"
        text note
        date entry_date
        timestamptz created_at "UTC default now()"
        timestamptz updated_at "auto-updated via trigger"
    }
```

---

## Table List & Naming Conventions

| Table | Status | Owner Column | Parent FK (Cascade Delete) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `public.profiles` | **Active (Week 1)** | `id` | `auth.users(id)` | Auto-created on Email & Google signup via `on_auth_user_created` trigger. |
| `public.trips` | **Active (Week 1)** | `user_id` | `public.profiles(id)` | Enforces `end_date >= start_date`, indexed on `(user_id, start_date DESC)`. |
| `public.itinerary_items` | **Planned (Week 2)** | `user_id` | `public.trips(id)` | **Single source of truth for Calendar & Itinerary views** (`start_time`, `end_time`, `category`). |
| `public.checklist_items` | **Planned (Week 2)** | `user_id` | `public.trips(id)` | Supports Packing lists & pre-trip To-Dos per trip. |
| `public.budget_entries` | **Planned (Week 2)** | `user_id` | `public.trips(id)` | Tracks estimated or actual expenses (`numeric(10,2)`, non-negative). |

---

## Shared Backend Conventions

1. **Row-Level Security (RLS):** Every user-owned table enables RLS with four explicit policies (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) checking `auth.uid() = user_id` (or `auth.uid() = id` on `profiles`).
2. **Ownership Verification on Child Tables:** In addition to checking `auth.uid() = user_id`, `INSERT` and `UPDATE` policies on child tables (`itinerary_items`, `checklist_items`, `budget_entries`) verify that the referenced `trip_id` belongs to `auth.uid()`.
3. **Timestamps & Triggers:** All tables include `created_at` and `updated_at` (`timestamptz` in UTC), maintained automatically by `public.set_updated_at()`.
4. **Migration Discipline:** Existing applied migrations are never edited. All schema changes are added as new timestamped `.sql` files in `supabase/migrations/`.
5. **Calendar Strategy:** Calendar entries are derived directly from `itinerary_items` (`start_time`, `end_time`, `category`) so there is one source of truth and zero sync drift between the Itinerary page and Calendar page.
