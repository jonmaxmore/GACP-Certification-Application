import { test, expect } from '@playwright/test';

test.describe('Farmer Full Journey: Register to QR', () => {

    test.beforeEach(async ({ page, context }) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 13.7563, longitude: 100.5018 });
        await context.clearCookies();
        await page.addInitScript(() => localStorage.clear());
    });

    test('Register, Complete Application, and Print QR Code @smoke', async ({ page, context }) => {
        test.setTimeout(300000); // 5 minutes
        console.log('--- START TEST ---');

        // ... (keep existing code until line 218) ...

        await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
        console.log('Clicked Login Button');

        // FORCE cookie setup for WebKit stability
        await context.addCookies([{
            name: 'auth_token',
            value: 'mock-jwt-token',
            domain: 'localhost',
            path: '/',
            expires: Date.now() / 1000 + 86400,
            sameSite: 'Lax',
            secure: false
        }]);

        // Verify Dashboard
        await expect(page).toHaveURL(/\/farmer\/dashboard/, { timeout: 30000 });
        console.log('Logged In');

        // --- 2. Wizard (Application) ---
        await page.goto('/farmer/applications/new/step/1');
        console.log('Started Wizard');

        // Step 1: Plant
        await page.locator('button').filter({ hasText: 'กัญชา' }).first().click();
        await page.locator('button').filter({ hasText: 'ขอใหม่' }).first().click();
        await page.locator('button').filter({ hasText: 'เพื่อการพาณิชย์' }).first().click();
        await page.locator('button').filter({ hasText: 'กลางแจ้ง' }).first().click();
        await page.locator('button').filter({ hasText: 'ดำเนินการต่อ' }).click();

        // Step 2: General
        await page.waitForURL('**/step/2');
        await page.fill('input[placeholder*="ฟาร์มสมุนไพร"]', 'GACP Farm 2026');

        // [GACP] Hygiene Checks
        await page.locator('button').filter({ hasText: 'มีการอบรมพนักงาน' }).click();
        await page.locator('button').filter({ hasText: 'มีการตรวจสุขภาพประจำปี' }).click();
        await page.locator('button').filter({ hasText: 'มีชุดป้องกัน' }).click();

        await page.click('button:has-text("ถัดไป")');

        // Step 3: Land (Soil Info)
        await page.waitForURL('**/step/3');
        await page.fill('input[placeholder*="ชื่อสถานที่"]', 'Green Zone');
        await page.fill('input[placeholder*="ที่อยู่"]', '888 Farm Lane');
        await page.selectOption('select.w-full', { label: 'เชียงใหม่ (Chiang Mai)' });
        await page.fill('input[placeholder*="รหัสไปรษณีย์"]', '50200');
        await page.locator('div').filter({ hasText: 'กรรมสิทธิ์ที่ดิน' }).locator('select').selectOption({ label: 'เป็นเจ้าของ' });

        // [GACP] Sanitation Checks
        await page.locator('button').filter({ hasText: 'มีห้องน้ำที่ถูกสุขลักษณะ' }).click();
        await page.locator('button').filter({ hasText: 'มีจุดล้างมือพร้อมสบู่' }).click();

        // New Soil Fields
        await page.locator('div').filter({ hasText: 'ลักษณะดิน (Soil Type)' }).locator('select').selectOption({ label: 'ดินร่วน (Loam)' });
        await page.fill('textarea[placeholder*="ประวัติการใช้พื้นที่"]', 'Rice field 10 years ago');
        await page.click('button:has-text("ถัดไป")');

        // Step 4: Plots
        await page.waitForURL('**/step/4');
        await page.click('button:has-text("เพิ่มแปลงปลูกใหม่")');
        await page.fill('input[placeholder*="โรงเรือน 1"]', 'Plot A');
        await page.fill('input[type="number"]', '5');
        await page.click('button:has-text("บันทึก")');
        await page.click('button:has-text("ถัดไป")');

        // Step 5: Production (Varieties)
        await page.waitForURL('**/step/5');
        await page.locator('label').filter({ hasText: 'ช่อดอก' }).click();
        await page.locator('button').filter({ hasText: 'เพาะเมล็ด (Seed)' }).click();

        // Add Variety
        await page.click('button:has-text("เพิ่มสายพันธุ์")');
        await page.fill('input[placeholder="เช่น หางกระรอก"]', 'KDKT V1');
        await page.locator('div').filter({ hasText: '#1' }).locator('select').first().selectOption({ index: 0 });
        await page.fill('input[placeholder="ระบุจำนวนต้น"]', '500');
        await page.fill('input[placeholder="ระบุปริมาณ (kg)"]', '200');

        // [GACP] Production Inputs
        await page.click('button:has-text("เพิ่มรายการ")');
        await page.locator('select').nth(1).selectOption('FERTILIZER'); // Type
        await page.fill('input[placeholder="เช่น ปุ๋ยคอก, NPK 15-15-15"]', 'Organic Fertilizer A');
        await page.locator('select').nth(2).selectOption('PURCHASED'); // Source Type
        await page.fill('input[placeholder="ชื่อร้านค้า..."]', 'Farm Shop B');
        await page.locator('label').filter({ hasText: 'อินทรีย์?' }).click();

        await page.click('button:has-text("ถัดไป")');

        // --- Step 6: Lots (NEW) ---
        await page.waitForURL('**/step/6');
        await page.click('button:has-text("เพิ่มรุ่นการผลิต")');
        await page.fill('input[placeholder*="LOT"]', 'LOT-001');
        await page.fill('input[type="number"]', '100');
        await page.click('button:has-text("บันทึก")');
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- Step 7: Estimates (NEW) ---
        await page.waitForURL('**/step/7');
        await page.fill('input[placeholder="ระบุจำนวนต้น"]', '100');
        await page.fill('input[placeholder="ระบุปริมาณ (kg)"]', '50');
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- Step 8: Harvest ---
        await page.waitForURL('**/step/8');
        await page.selectOption('#harvestMethod', 'MANUAL');
        await page.selectOption('#dryingMethod', 'OVEN');
        await page.selectOption('#storageSystem', 'CONTROLLED');
        await page.fill('#packaging', 'Glass Jar');
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- Step 9: Documents ---
        await page.waitForURL('**/step/9');
        await page.click('button:has-text("ดำเนินการต่อ")');
        // Optional upload logic (same as before)

        // --- Step 10: Pre-Check ---
        await page.waitForURL('**/step/10');
        const checkboxes = await page.locator('input[type="checkbox"]').all();
        for (const box of checkboxes) await box.check();
        await page.click('button:has-text("ยืนยันและดำเนินการต่อ")');

        // --- Step 11: Preview ---
        await page.waitForURL('**/step/11');
        await page.click('button:has-text("ยืนยันและดำเนินการต่อ")');

        // --- Step 12: Submit (NEW) ---
        await page.waitForURL('**/step/12');
        const submitCheckboxes = await page.locator('input[type="checkbox"]').all();
        for (const box of submitCheckboxes) await box.check();
        await page.click('button:has-text("ยืนยันการส่งคำขอ")');

        // --- Step 13: Quote ---
        await page.waitForURL('**/step/13');
        const acceptButtons = await page.locator('button:has-text("ยอมรับ")').all();
        for (const btn of acceptButtons) {
            await btn.click();
        }
        await page.click('button:has-text("ยืนยันและดำเนินการชำระเงิน")');

        // --- Step 14: Invoice ---
        await page.waitForURL('**/step/14');
        await page.click('button:has-text("ยืนยันการชำระเงิน")');
        await page.click('button:has-text("จำลองการชำระเงินสำเร็จ")');

        // --- Step 15: Success ---
        await page.waitForURL('**/step/15');
        await expect(page.locator('h2')).toContainText('ส่งคำขอสำเร็จ');
        console.log('Wizard Completed');


        // --- 3. QR Code (Mocked Lots) ---
        await page.goto('/farmer/tracking/lots');
        console.log('Navigated to Lots');

        // Expect to see Lot
        await expect(page.getByText('LOT-67-001')).toBeVisible({ timeout: 10000 });

        // Click View QR
        await page.click('button:has-text("ดู QR Code")');
        console.log('Opened QR Modal');

        // Expect Modal
        await expect(page.locator('h2').filter({ hasText: 'QR Code' })).toBeVisible();
        await expect(page.locator('button:has-text("พิมพ์")')).toBeVisible();
        console.log('QR Code Verified');
    });
});
