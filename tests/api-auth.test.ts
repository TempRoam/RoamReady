import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, cookiesMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  cookiesMock: vi.fn(async () => ({})),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: createClientMock,
}));

import { GET } from "../src/app/api/trips/route";

describe("Trips API authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });
  });

  it("returns 401 when the user is not logged in", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/trips"),
    );

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});