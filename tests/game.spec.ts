import { test, expect, Page } from '@playwright/test';
async function openAir(p: Page) {
  await p.getByRole('button', { name: '모아항공 앱 열기' }).click();
}
async function menu(p: Page, label: string) {
  await p.getByRole('button', { name: '항공사 메뉴로' }).click();
  await p.getByRole('button', { name: label, exact: true }).click();
}
async function solve(p: Page, paid = false) {
  await openAir(p);
  if (await p.getByRole('button', { name: '항공사 메뉴로' }).count())
    await p.getByRole('button', { name: '항공사 메뉴로' }).click();
  await p.getByRole('button', { name: '예약 조회', exact: true }).click();
  await p.getByLabel('항공사 예약번호').fill(' q7m2kd ');
  await p.getByLabel('성 (Surname)', { exact: true }).fill(' han ');
  await p.getByRole('button', { name: '예약 찾기', exact: true }).click();
  await menu(p, '이름 정정');
  await p.getByRole('button', { name: '무료 정정 안내 읽기' }).click();
  await p.getByLabel('성 (Surname)', { exact: true }).fill('HAN');
  await p.getByLabel('이름 (Given name)').fill('SEOJUN');
  await p
    .getByRole('button', { name: paid ? '빠른 정정 · ₩19,900' : '무료로 직접 정정', exact: true })
    .click();
  await menu(p, '출발 시간 확인');
  await p.getByRole('button', { name: '14:05', exact: true }).click();
  await menu(p, '탑승구 확인');
  await p.getByRole('button', { name: 'C08', exact: true }).click();
  await menu(p, '탑승권 발급');
  await p.getByRole('button', { name: '탑승권 발급하기', exact: true }).click();
}
test('free success, summary and restart', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '5분 도전 시작' }).click();
  await solve(page);
  await expect(page.getByText('침착한 여행자', { exact: true })).toBeVisible();
  await expect(page.getByText('HAN SEOJUN', { exact: true })).toBeVisible();
  await page.screenshot({
    path: 'artifacts/success-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '다시 도전', exact: true }).click();
  await expect(page.getByText('0/4', { exact: true })).toBeVisible();
});
test('timeout is immutable and practice is unlimited', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: '5분 도전 시작' }).click();
  await page.clock.fastForward(301000);
  await expect(page.getByText('탑승권 발급 마감', { exact: true })).toBeVisible();
  await page.screenshot({
    path: 'artifacts/failure-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '연습 모드', exact: true }).click();
  await page.clock.fastForward(601000);
  await expect(page.getByText('연습 중', { exact: true })).toBeVisible();
  await solve(page);
  await expect(page.getByText('침착한 여행자', { exact: true })).toBeVisible();
});
test('all clues, drafts persist, wrong answers and paid success', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await openAir(page);
  await page.getByRole('button', { name: '예약 조회', exact: true }).click();
  await page.getByLabel('항공사 예약번호').fill('TR-482193');
  await page.getByLabel('성 (Surname)', { exact: true }).fill('HAN');
  await page.getByRole('button', { name: '예약 찾기', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('여행사 주문번호');
  await page.getByRole('button', { name: '예약 복구 대행 · ₩9,900', exact: true }).dblclick();
  await page.getByRole('button', { name: '홈으로' }).click();
  await page.getByRole('button', { name: '이메일 앱 열기' }).click();
  await page.getByRole('button', { name: /여행사 결제가 완료/ }).click();
  await page.getByRole('button', { name: '예약 상세 펼치기' }).click();
  await expect(page.getByText('Q7M2KD', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '홈으로' }).click();
  await page.getByRole('button', { name: '메신저 앱 열기' }).click();
  await page.getByRole('button', { name: '여행 서류 확대' }).click();
  await expect(page.getByRole('dialog')).toContainText('HAN SEOJUN');
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.getByRole('button', { name: '예약번호 물어보기', exact: true }).click();
  await expect(page.getByText(/메일의 큰 번호는/)).toBeVisible();
  await page.getByRole('button', { name: '홈으로' }).click();
  await openAir(page);
  await expect(page.getByLabel('항공사 예약번호')).toHaveValue('TR-482193');
  await page.getByRole('button', { name: '홈으로' }).click();
  await solve(page, true);
  await expect(page.getByText('돈으로 해결한 여행자', { exact: true })).toBeVisible();
  await expect(page.getByText('₩29,800', { exact: true })).toBeVisible();
});
test('small screen hints, scrolling and modal controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await page.getByRole('button', { name: '힌트 열기' }).click();
  for (let i = 1; i <= 3; i++) await page.getByRole('button', { name: `${i}단계 힌트` }).click();
  await expect(page.getByRole('dialog')).toContainText('Q7M2KD');
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.screenshot({
    path: 'artifacts/home-small.png',
    fullPage: true,
    animations: 'disabled',
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
test('unread clue badge survives reading advertisement', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await page.getByRole('button', { name: '이메일 앱 열기' }).click();
  for (const subject of [
    '[광고] 여행의 끝은 기념품!',
    '[중요] MA204 탑승구 변경 안내',
    'MA204, 오늘의 출발 안내',
  ]) {
    await page.getByRole('button', { name: subject, exact: false }).click();
    await page.getByRole('button', { name: '메일함으로' }).click();
  }
  await page.getByRole('button', { name: '홈으로' }).click();
  await expect(page.getByRole('button', { name: '이메일 앱 열기' }).locator('i')).toHaveText('1');
});
test('hint dialog traps focus around enabled controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await page.getByRole('button', { name: '힌트 열기' }).click();
  await page.getByRole('button', { name: '1단계 힌트' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '닫기', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: '1단계 힌트' })).toBeFocused();
});
test('reply arrives after switching apps and restart clears pending replies', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await page.getByRole('button', { name: '메신저 앱 열기' }).click();
  await page.getByRole('button', { name: '예약번호 물어보기' }).click();
  await page.getByRole('button', { name: '홈으로' }).click();
  await page.clock.fastForward(1000);
  await expect(page.getByText('민지 · 새 메시지')).toBeVisible();
  await expect(page.getByRole('button', { name: '메신저 앱 열기' }).locator('i')).toHaveText('1');
  await page.getByRole('button', { name: '메신저 앱 열기' }).click();
  await expect(page.getByText(/메일의 큰 번호는/)).toBeVisible();
  await page.getByRole('button', { name: '영문 이름 확인하기' }).click();
  await page.getByRole('button', { name: '설정 열기' }).click();
  await page.getByRole('button', { name: '연습 모드로 새로 시작' }).click();
  await page.clock.fastForward(2000);
  await page.getByRole('button', { name: '메신저 앱 열기' }).click();
  await expect(page.getByText(/내가 O를 하나 더/)).toHaveCount(0);
});
test('all twelve hint stages and 320px complete play', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await page.getByRole('button', { name: '힌트 열기' }).click();
  for (const [i, label] of ['예약 찾기', '이름 정정', '시간 확인', '탑승구 확인'].entries()) {
    await page.getByRole('button', { name: `${i + 1}. ${label}`, exact: true }).click();
    for (let level = 1; level <= 3; level++)
      await page.getByRole('button', { name: `${level}단계 힌트` }).click();
  }
  await expect(page.getByText('열어 본 힌트 12개')).toBeVisible();
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await solve(page);
  await expect(page.getByText('침착한 여행자', { exact: true })).toBeVisible();
  await expect(page.getByText('12회', { exact: true })).toBeVisible();
});

test('result copies locally and can fall back to selectable text', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await solve(page);
  await page.getByRole('button', { name: '결과 요약 복사', exact: true }).click();
  await expect(page.getByText('복사 완료', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('침착한 여행자');
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: () => Promise.reject(new Error('denied')),
    }),
  );
  await page.getByRole('button', { name: '복사 완료', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue(/연습 모드/);
});

test('representative mobile and desktop screens', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.screenshot({
    path: 'artifacts/intro-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'artifacts/intro-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '연습 모드로 둘러보기' }).click();
  await page.clock.fastForward(7000);
  await page.screenshot({
    path: 'artifacts/home-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '이메일 앱 열기' }).click();
  await page.screenshot({
    path: 'artifacts/mail-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByLabel('메일 검색').fill('결제');
  await expect(page.getByRole('button', { name: /여행사 결제가 완료/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /탑승구 변경 안내/ })).toHaveCount(0);
  await page.getByRole('button', { name: '홈으로' }).click();
  await page.getByRole('button', { name: '메신저 앱 열기' }).click();
  await page.getByRole('button', { name: '여행 서류 확대' }).click();
  await page.screenshot({
    path: 'artifacts/document-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.getByRole('button', { name: '홈으로' }).click();
  await openAir(page);
  await page.screenshot({
    path: 'artifacts/airline-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '설정 열기' }).click();
  await page.getByRole('button', { name: '동작 줄이기' }).click();
  await expect(page.locator('.desktop')).toHaveClass(/reduced/);
  await page.getByRole('button', { name: '효과음' }).click();
  await expect(page.getByRole('button', { name: '효과음' })).toContainText('꺼짐');
});
