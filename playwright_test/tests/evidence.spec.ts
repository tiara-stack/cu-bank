import { captureActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';

test('a missing highlight allows post-condition checks to continue', async ({ page }, info) => {
  test.setTimeout(5_000);
  await page.setContent('<p>Account unchanged</p>');

  await captureActualOutput(page, page.getByText('Missing error'));

  await test.step('Post-condition: account state can still be checked', async () => {
    await expect(page.locator('p')).toHaveText('Account unchanged');
  });
  expect(info.attachments.map(({ name }) => name)).toEqual(['actual-output']);
});

test('a visible highlight attaches its position and viewport size', async ({ page }, info) => {
  await page.setContent('<p>Rejected</p>');
  const highlight = page.locator('p');
  const box = await highlight.boundingBox();
  const viewport = page.viewportSize()!;

  await captureActualOutput(page, highlight);

  expect(info.attachments.map(({ name }) => name)).toEqual(['actual-output', 'actual-output-highlight']);
  const framing = JSON.parse(info.attachments[1].body!.toString());
  expect(framing).toEqual({ ...box, viewportWidth: viewport.width, viewportHeight: viewport.height });
});

test('a framing lookup failure keeps the screenshot', async ({ page }, info) => {
  await page.setContent('<p>First error</p><p>Second error</p>');

  // The ambiguous locator makes boundingBox reject with a strict-mode error.
  await captureActualOutput(page, page.locator('p'));

  expect(info.attachments.map(({ name }) => name)).toEqual(['actual-output']);
  await expect(page.locator('p')).toHaveCount(2);
});

test('a framing attachment failure keeps the screenshot', async ({ page }, info) => {
  await page.setContent('<p>Rejected</p>');
  const attach = info.attach.bind(info);
  info.attach = async (name, options) => {
    if (name === 'actual-output-highlight') throw new Error('Framing attachment failed');
    await attach(name, options);
  };
  try {
    await captureActualOutput(page, page.locator('p'));
  } finally {
    info.attach = attach;
  }

  expect(info.attachments.map(({ name }) => name)).toEqual(['actual-output']);
});
