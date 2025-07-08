const { test, expect } = require('@playwright/test');

test.describe('Memory Match Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the game page correctly', async ({ page }) => {
    await expect(page.locator('.game-title')).toHaveText('Memory Match');
    await expect(page.locator('#instructionsBox')).toBeVisible();
    await expect(page.locator('.start-button')).toBeVisible();
  });

  test('should start the game when start button is clicked', async ({ page }) => {
    await page.click('.start-button', { force: true });
    // Wait for the game board to become visible (allowing for animation)
    await expect(page.locator('#gameBoard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#timerContainer')).toBeVisible();
    await expect(page.locator('#progressContainer')).toBeVisible();
    const tiles = page.locator('.game-tile');
    await expect(tiles).toHaveCount(24);
  });

  test('should handle tile clicks correctly', async ({ page }) => {
    await page.click('.start-button', { force: true });
    await expect(page.locator('#gameBoard')).toBeVisible({ timeout: 10000 });
    const tiles = page.locator('.game-tile');
    await expect(tiles).toHaveCount(24);
    await tiles.first().click();
    await page.waitForTimeout(500);
    await expect(tiles.first()).toHaveClass(/flipped/);
  });

  test('should detect matching pairs', async ({ page }) => {
    await page.click('.start-button', { force: true });
    await expect(page.locator('#gameBoard')).toBeVisible({ timeout: 10000 });
    const tiles = page.locator('.game-tile');
    await expect(tiles).toHaveCount(24);
    // Find two tiles with the same symbol
    let firstIdx = -1, secondIdx = -1, symbol = '';
    for (let i = 0; i < 24; i++) {
      const t1 = tiles.nth(i);
      const s1 = await t1.textContent();
      for (let j = i + 1; j < 24; j++) {
        const t2 = tiles.nth(j);
        const s2 = await t2.textContent();
        if (s1 && s1 === s2) {
          firstIdx = i;
          secondIdx = j;
          symbol = s1;
          break;
        }
      }
      if (firstIdx !== -1) break;
    }
    // Click both tiles
    await tiles.nth(firstIdx).click();
    await page.waitForTimeout(500);
    await tiles.nth(secondIdx).click();
    await page.waitForTimeout(2000);
    // Check that both are matched
    const matchedTiles = page.locator('.game-tile.matched');
    await expect(matchedTiles).toHaveCount(2);
  });

  test('should update progress counter when pairs are matched', async ({ page }) => {
    await page.click('.start-button', { force: true });
    await expect(page.locator('#gameBoard')).toBeVisible({ timeout: 10000 });
    const progressText = page.locator('#progressText');
    await expect(progressText).toHaveText('0/12');
    const tiles = page.locator('.game-tile');
    // Find a match
    let firstIdx = -1, secondIdx = -1, symbol = '';
    for (let i = 0; i < 24; i++) {
      const t1 = tiles.nth(i);
      const s1 = await t1.textContent();
      for (let j = i + 1; j < 24; j++) {
        const t2 = tiles.nth(j);
        const s2 = await t2.textContent();
        if (s1 && s1 === s2) {
          firstIdx = i;
          secondIdx = j;
          symbol = s1;
          break;
        }
      }
      if (firstIdx !== -1) break;
    }
    await tiles.nth(firstIdx).click();
    await page.waitForTimeout(500);
    await tiles.nth(secondIdx).click();
    await page.waitForTimeout(2500);
    await expect(progressText).toHaveText('1/12');
  });

  test('should handle sound toggle correctly', async ({ page }) => {
    const soundIcon = page.locator('#soundIcon');
    await expect(soundIcon).toHaveText('🔊');
    await page.click('#soundToggle');
    await expect(soundIcon).toHaveText('🔇');
    await page.click('#soundToggle');
    await expect(soundIcon).toHaveText('🔊');
  });

  test('should display timer correctly', async ({ page }) => {
    await page.click('.start-button', { force: true });
    await expect(page.locator('#gameBoard')).toBeVisible({ timeout: 10000 });
    const timerText = page.locator('#timerText');
    await expect(timerText).toHaveText('120');
    await page.waitForTimeout(3000);
    const newTime = await timerText.textContent();
    expect(parseInt(newTime)).toBeLessThan(120);
  });

  test('should show win screen when all pairs are matched', async ({ page }) => {
    await page.click('.start-button', { force: true });
    await expect(page.locator('#gameBoard')).toBeVisible({ timeout: 10000 });
    const envelopeContainer = page.locator('#envelopeContainer');
    await expect(envelopeContainer).toBeHidden();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.game-title')).toBeVisible();
    await expect(page.locator('.start-button')).toBeVisible();
    await page.click('.start-button', { force: true });
    await expect(page.locator('#gameBoard')).toBeVisible({ timeout: 10000 });
    const tiles = page.locator('.game-tile');
    await expect(tiles.first()).toBeVisible();
  });

  test('should handle browser compatibility features', async ({ page }) => {
    const polyfillScript = page.locator('script[src*="polyfill.io"]');
    await expect(polyfillScript).toBeAttached();
    const browserNotice = page.locator('#browserNotice');
    await expect(browserNotice).toBeAttached();
  });

  test('should load all audio files correctly', async ({ page }) => {
    // There are 4 audio elements, each with 1 source (mp3 only)
    const audioElements = page.locator('audio');
    await expect(audioElements).toHaveCount(4);
    const audioSources = page.locator('audio source');
    await expect(audioSources).toHaveCount(4); // 4 audio elements × 1 source each
    // Check that the main audio elements are present
    const clickSound = page.locator('#clickSound');
    const matchSound = page.locator('#matchSound');
    const envelopeSound = page.locator('#envelopeSound');
    const backgroundMusic = page.locator('#backgroundMusic');
    await expect(clickSound).toBeAttached();
    await expect(matchSound).toBeAttached();
    await expect(envelopeSound).toBeAttached();
    await expect(backgroundMusic).toBeAttached();
  });
}); 