import { test, expect } from '@playwright/test';
import memberData from '../data/member-test-data.json';
import appData from '../data/application-test-data.json';

test.describe('System: Application Wizard Loop', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        // Login as Somsak
        const user = memberData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', user.identifier);
        await page.fill('input[name="password"]', user.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    });

    test('Scenario 1: Complete Wizard Steps 1-15 (Full E2E Happy Path)', async ({ page }) => {
        // 1. Start New Application
        await page.goto('/farmer/applications/create');

        // --- STEP 1: Plant Selection ---
        await expect(page.locator('text=เลือกพืชสมุนไพร')).toBeVisible();
        await page.locator('button').filter({ hasText: 'กัญชา' }).first().click();
        await page.locator('button').filter({ hasText: /^ขอใหม่$/ }).click();
        await page.locator('button').filter({ hasText: 'เพื่อจำหน่าย' }).first().click();
        await page.locator('button').filter({ hasText: 'โรงเรือน' }).first().click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 2: General Info ---
        await expect(page).toHaveURL(/.*\/step\/2/);
        await expect(page.locator('text=ข้อมูลผู้ยื่นคำขอ')).toBeVisible();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 3: Farm & Location ---
        await expect(page).toHaveURL(/.*\/step\/3/);
        await expect(page.locator('text=ข้อมูลฟาร์ม')).toBeVisible();
        await page.fill('input[placeholder="ชื่อฟาร์ม"]', 'Somsak Farm');
        await page.fill('textarea[placeholder="ที่ตั้งฟาร์ม..."]', '123 Farm Rd.');
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 4: Plots ---
        await expect(page).toHaveURL(/.*\/step\/4/);
        await expect(page.locator('text=การแบ่งแปลงปลูก')).toBeVisible();
        await page.locator('button').filter({ hasText: 'เพิ่มแปลงใหม่' }).click();
        await page.getByPlaceholder('เช่น A1, โซน B').fill('Plot A');
        await page.getByPlaceholder('จำนวน').fill('1'); // 1 Rai
        await page.getByRole('button', { name: 'เพิ่มแปลง' }).click();
        await expect(page.locator('text=Plot A')).toBeVisible();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 5: Production (Propagation) ---
        await expect(page).toHaveURL(/.*\/step\/5/);
        await expect(page.locator('text=ผลผลิต')).toBeVisible();
        await page.locator('label').first().click(); // e.g., Dried Flower
        await page.locator('button').filter({ hasText: 'เพาะเมล็ด' }).click();
        await page.getByRole('button', { name: '+ เพิ่มสายพันธุ์' }).click();
        await page.locator('input[placeholder="เช่น หางกระรอก"]').fill('Thai Stick');
        await page.selectOption('select', { index: 1 });
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 6: Lots ---
        await expect(page).toHaveURL(/.*\/step\/6/);
        await expect(page.locator('text=จัดการล็อตการผลิต')).toBeVisible();
        await page.locator('button').filter({ hasText: 'เพิ่มล็อตใหม่' }).click();
        await page.selectOption('select', { index: 1 }); // Plot
        await page.locator('input[placeholder="0"]').fill('100'); // Count
        await page.getByRole('button', { name: 'ยืนยันสร้างล็อต' }).click();
        await expect(page.locator('text=100')).toBeVisible();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 7: Production Estimate ---
        await expect(page).toHaveURL(/.*\/step\/7/);
        await expect(page.locator('text=ประมาณการผลผลิต')).toBeVisible();
        await expect(page.locator('input[type="number"]')).toHaveValue('100');
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 8: Harvest ---
        await expect(page).toHaveURL(/.*\/step\/8/);
        await expect(page.locator('text=การเก็บเกี่ยวและจัดการ')).toBeVisible();
        const selects = page.locator('select');
        await selects.nth(0).selectOption({ value: 'MANUAL' });
        await selects.nth(1).selectOption({ value: 'SUN' });
        await selects.nth(2).selectOption({ value: 'CONTROLLED' });
        await page.locator('textarea').fill('Vacuum sealed bags');
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // --- STEP 9: Documents ---
        await expect(page).toHaveURL(/.*\/step\/9/);
        await expect(page.locator('text=การตรวจสอบเอกสาร')).toBeVisible();

        // Mock File Upload Loop
        const buffer = Buffer.from('dummy pdf content');
        const fileInputs = await page.locator('input[type="file"]').all();
        // Upload to the first 5 slots to satisfy "some" requirements or all if possible.
        // We need to be careful not to be flaky. The test might pass even if not all required are filled 
        // IF the logic is loose, but let's try to fill all found inputs.
        for (const input of fileInputs) {
            const isVisible = await input.isVisible().catch(() => false);
            // Inputs are usually hidden, so isVisible might be false. 
            // Just set input files.
            await input.setInputFiles({
                name: 'test-doc.pdf',
                mimeType: 'application/pdf',
                buffer: buffer
            });
            await page.waitForTimeout(500); // Small delay
        }

        // Wait for potential async uploads or AI scan mock
        await page.waitForTimeout(3000);

        // Attempt to proceed
        await page.getByRole('button', { name: 'ถัดไป' }).first().click();

        // --- STEP 10: PreCheck ---
        await expect(page).toHaveURL(/.*\/step\/10/);
        await expect(page.locator('text=ตรวจสอบความเรียบร้อย')).toBeVisible();
        await page.locator('text=ยืนยันความถูกต้องของข้อมูล').click();
        await page.locator('text=ยินยอมให้เข้าตรวจสถานประกอบการ').click();
        await page.locator('text=รับทราบบทลงโทษ').click();
        await page.locator('text=ยินยอมเปิดเผยข้อมูล').click();
        await page.getByRole('button', { name: 'รับทราบและดำเนินการต่อ' }).click();

        // --- STEP 11: Preview ---
        await expect(page).toHaveURL(/.*\/step\/11/);
        await expect(page.locator('text=ตรวจสอบข้อมูลสรุป')).toBeVisible();
        await page.getByRole('button', { name: 'ไปที่หน้าส่งคำขอ' }).click();

        // --- STEP 12: Submit ---
        await expect(page).toHaveURL(/.*\/step\/12/);
        await expect(page.locator('text=ยืนยันการส่งคำขอรับรอง GACP')).toBeVisible();
        await page.locator('text=ข้าพเจ้ายืนยันความถูกต้องของข้อมูล').click();
        await page.locator('text=ข้าพเจ้าได้อ่านและยอมรับข้อกำหนด').click();
        await page.locator('text=รับทราบเรื่องค่าธรรมเนียม').click();
        await page.getByRole('button', { name: 'ยืนยันและส่งคำขอ' }).click();

        // --- STEP 13: Quote ---
        await expect(page).toHaveURL(/.*\/step\/13/);
        await expect(page.locator('text=ใบเสนอราคา')).toBeVisible();

        // Accept Quotes
        // Button texts: "ยอมรับใบเสนอราคา" (Accept) or "รับทราบ" (Acknowledge)
        // Code says: "ยอมรับ (Accept)"
        // Let's use more stable selector logic if possible, or text.
        // The buttons become "ยอมรับแล้ว" (Accepted) after click.

        // Find buttons that say "ยอมรับ" or "Accept" (regex)
        const acceptButtons = page.locator('button').filter({ hasText: /^ยอมรับ|Accept$/ });
        const count = await acceptButtons.count();
        for (let i = 0; i < count; i++) {
            await acceptButtons.nth(i).click();
        }

        // Proceed
        await page.getByRole('button', { name: 'ไปที่ขั้นตอนการชำระเงิน' }).click();

        // --- STEP 14: Invoice ---
        await expect(page).toHaveURL(/.*\/step\/14/);
        await expect(page.locator('text=ใบแจ้งชำระเงิน')).toBeVisible();

        // Pay
        await page.locator('button').filter({ hasText: 'ชำระผ่าน Mobile Banking' }).click();

        // Wait for Modal
        await expect(page.locator('text=Ksher Pay')).toBeVisible();

        // Simulate Success
        await page.locator('button').filter({ hasText: 'Simulate Payment Success' }).click(); // Check exact text from code/dict
        // Actual text in code: dict.wizard.invoice.modal.simulate or just 'Simulate Payment Success' ??
        // In StepInvoice.tsx:
        // <button ...>{dict.wizard.invoice.modal.simulate}</button>
        // We assume English 'Simulate Payment Success' or Thai equiv.
        // Let's rely on the icon or class if text is dynamic.
        // Or better: `page.locator('button.bg-emerald-500')`

        // Wait for redirect to Step 15
        await expect(page).toHaveURL(/.*\/step\/15/, { timeout: 10000 });

        // --- STEP 15: Success ---
        await expect(page.locator('text=ส่งคำขอสำเร็จ')).toBeVisible();
    });
});
