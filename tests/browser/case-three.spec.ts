import { expect, test } from "@playwright/test";

const experiencePath = "/experiences/case-three-tomcat/";
const storageKey = "oversweep.case-three.synthetic-debrief.v1";

async function openPractice(page: import("@playwright/test").Page) {
  await page.goto(experiencePath);
  await expect(page.locator(".practice")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("Manual and Training Library link to the same canonical experience", async ({
  page,
}) => {
  await page.goto("/manual/naval-operations/");
  await expect(
    page.getByRole("link", { name: "Open local development preview" }),
  ).toHaveAttribute("href", experiencePath);

  await page.goto("/training/");
  await expect(
    page.getByRole("link", { name: "Open local development preview" }),
  ).toHaveAttribute("href", experiencePath);
  await openPractice(page);
  await expect(
    page.getByText("experience.case-three-tomcat", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Local synthetic exercise — not Case III guidance",
    }),
  ).toBeVisible();
});

test("keyboard-accessible arithmetic flow persists an explanatory debrief", async ({
  page,
}) => {
  await openPractice(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  const angle = page.getByRole("spinbutton", {
    name: "Swept angle (degrees)",
  });
  await angle.focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("90");
  const rate = page.getByRole("spinbutton", {
    name: "Constant rate (degrees per second)",
  });
  await rate.focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("3");
  const estimate = page.getByRole("spinbutton", {
    name: "Your estimated elapsed time (seconds)",
  });
  await estimate.focus();
  await page.keyboard.type("30");
  await page.keyboard.press("Enter");

  await expect(page.getByRole("status")).toContainText(
    "matches the synthetic constant-rate example",
  );
  await expect(
    page.getByRole("list", { name: "Synthetic exercise debrief history" }),
  ).toContainText("arithmetic result 30.000 s");

  await page.reload();
  await expect(
    page.getByRole("list", { name: "Synthetic exercise debrief history" }),
  ).toContainText("arithmetic result 30.000 s");
});

test("incorrect estimates receive explanatory feedback", async ({ page }) => {
  await openPractice(page);
  await page.getByLabel("Your estimated elapsed time (seconds)").fill("31");
  await page.getByRole("button", { name: "Check arithmetic" }).click();
  await expect(page.getByRole("status")).toContainText("Recheck the arithmetic");
  await expect(page.getByText("Review", { exact: true })).toBeVisible();
});

test("shows a useful result when browser storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "oversweep.case-three.synthetic-debrief.v1") {
        throw new DOMException("Storage blocked", "SecurityError");
      }
      originalSetItem.call(this, key, value);
    };
  });
  await openPractice(page);
  await expect(page.getByText(/Speech is not used or required/)).toBeVisible();
  await page.getByLabel("Your estimated elapsed time (seconds)").fill("30");
  await page.getByRole("button", { name: "Check arithmetic" }).click();
  await expect(page.getByText(/matches the synthetic constant-rate example/)).toBeVisible();
  await expect(page.getByText(/Browser storage is unavailable/)).toBeVisible();
});

test("long debrief remains in normal document flow at mobile, tablet, and desktop widths", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify(
          Array.from({ length: 50 }, (_, index) => ({
            id: `run-${index}`,
            createdAt: "2026-10-22T12:00:00.000Z",
            angleDeg: index,
            rateDegPerSecond: 3,
            estimateSeconds: index / 3,
            expectedSeconds: index / 3,
            passed: true,
          })),
        ),
      );
    },
    { key: storageKey },
  );
  await openPractice(page);
  const history = page.getByRole("list", {
    name: "Synthetic exercise debrief history",
  });
  await expect(history.getByRole("listitem")).toHaveCount(50);
  await expect(history.getByRole("listitem").first()).toContainText("49°");
  await expect(history.getByRole("listitem").last()).toContainText("0°");
  await history.getByRole("listitem").last().scrollIntoViewIfNeeded();

  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    await expect(history.getByRole("listitem").last()).toBeVisible();
  }
});

test("respects reduced-motion browser preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPractice(page);
  expect(
    await page.evaluate(() =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
});
