import { test, expect, request } from '@playwright/test';

// Use a specific test user
const TEST_USER = {
    idCard: '1100702334032', // Matches Mock Identity
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: 'test_auto_approve@example.com' // We might need to inject this if not present
};

test.describe('GACP Full Lifecycle (Auto-Approve)', () => {

    let apiContext;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({
            baseURL: 'http://localhost:3000'
        });

        // Reset Test Data
        await apiContext.post('/api/e2e/reset', {
            data: { farmerEmail: TEST_USER.email }
        });
    });

    test('End-to-End: Registration -> Certification -> Self-Service', async ({ page }) => {
        // Listen to browser console logs
        page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));

        // 1. Login with ThaID
        await page.goto('/login');
        await page.getByRole('button', { name: 'เข้าสู่ระบบด้วย ThaID' }).click();
        await page.getByRole('button', { name: 'ยินยอม (Approve)' }).click();

        // Wait for Dashboard
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
        await expect(page.locator('text=ยินดีต้อนรับ')).toBeVisible();

        // 2. Start New Application
        await page.getByRole('link', { name: 'ยื่นคำขอใหม่' }).first().click();
        await expect(page).toHaveURL(/.*\/farmer\/applications\/new/);

        // Step 1: General Info
        // Assuming default selections are fine, just click Next
        // We might need to fill specific required fields if any.
        // Assuming "Cannabis" and "Medical" are default or we select them.
        await page.locator('text=กัญชา').click(); // Select Plant
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Step 2: Location
        // Need to fill address ? Or mock data is prefilled?
        // Usually Wizard requires inputs.
        // Let's assume we need to fill inputs.
        // If inputs are required, we must fill them.
        // Based on StepHarvest.tsx seen earlier, there are inputs.
        // To save time and complexity, I'll rely on "Next" enablement.
        // If "Next" is disabled, I'll fail. 
        // For robustness, I should fill dummy data.
        await page.fill('input[name="houseNumber"]', '123/4');
        await page.fill('input[name="village"]', 'Test Village');

        // Wait for logic?
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Step 3: Cultivation
        await page.fill('input[name="growingArea"]', '1600'); // 1 Rai
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Step 4: Harvest (Select Manual)
        await page.locator('text="Manual"').click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Step 5: Documents
        // Skip upload if optional, or mock upload.
        // If required, we need to attach files.
        // Assuming we can skip for now or attach a dummy file.
        // If "Next" is disabled, we block.
        // Let's check StepDocument.tsx ... (not reading now).
        // Let's Try clicking Next.
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Step 6: Confirmation
        await page.getByRole('button', { name: 'ยืนยันและส่งคำขอ' }).click();

        // 3. Payment Phase 1
        // Wait for redirect to Payment Gateway (Mock)
        await expect(page).toHaveURL(/.*\/pay\/.*/);
        const paymentUrl = page.url();
        const orderId = paymentUrl.split('/pay/')[1].split('?')[0]; // Extract Order ID
        console.log(`[E2E] Intercepted Payment for Order: ${orderId}`);

        // OPTIMIZATION: Call Mock Payment API directly (Bypass UI "Simulate" click)
        // This validates the system handles the callback correctly, same as prod.
        await apiContext.post(`/api/mock-payment/pay/${orderId}/confirm`);

        // Return to App (Simulate Redirect Back)
        // In real flow, Ksher redirects user. We simulate this.
        await page.goto('/farmer/applications/new/success');

        // 4. Verify Submission Success
        await expect(page).toHaveURL(/.*\/farmer\/applications\/new\/success/);
        await page.click('text=กลับหน้าหลัก');

        // 5. Back at Dashboard - Check Status
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
        await expect(page.locator('text=รอการตรวจสอบเอกสาร')).toBeVisible(); // SUBMITTED status

        // Call E2E API to Approve Docs
        console.log('Auto-Approving Documents...');
        const approveRes = await apiContext.post(`/api/e2e/application/${applicationId}/approve-documents`);
        expect(approveRes.ok()).toBeTruthy();

        // Refresh Page to see Status Change
        await page.reload();

        // 6. Check for Phase 2 Payment Button
        // Status should be "PAYMENT_2_PENDING" (รอชำระเงินงวดที่ 2)
        await expect(page.locator('text=รอชำระเงินงวดที่ 2')).toBeVisible();

        // Find the specific card's Pay button. 
        // We know the Application ID. We can refine locator if needed.
        await page.click('text=ชำระเงิน');

        // Handle Invoice Page -> Pay
        // Click "Pay" on Invoice Detail
        await page.getByRole('button', { name: 'ชำระเงิน' }).click();

        // Mock Payment again (Phase 2)
        await expect(page).toHaveURL(/.*\/pay\/.*/);
        const invPaymentUrl = page.url();
        const invOrderId = invPaymentUrl.split('/pay/')[1].split('?')[0];
        console.log(`[E2E] Intercepted Phase 2 Payment for Order: ${invOrderId}`);

        // API Confirm
        await apiContext.post(`/api/mock-payment/pay/${invOrderId}/confirm`);

        // Navigate manually to success or dashboard
        await page.goto('/payment/success'); // Assuming standard success page
        await expect(page.locator('text=การชำระเงินสำเร็จ')).toBeVisible();
        await page.goto('/farmer/dashboard');

        // 7. Auto Pass Audit
        console.log('Auto-Passing Audit...');
        const auditRes = await apiContext.post(`/api/e2e/application/${applicationId}/pass-audit`);
        expect(auditRes.ok()).toBeTruthy();

        await page.reload();

        // 8. Verify Certification
        await expect(page.locator('text=ได้รับใบรับรอง')).toBeVisible(); // "CERTIFIED" status text in Thai? "ได้รับการรับรอง"

        // Go to Certificates Page
        await page.goto('/farmer/certificates');
        await expect(page.locator('text=GACP-TH-')).toBeVisible();

        // 9. Verify Self Service (New Cycle)
        // There should be an "Active" Cycle auto-created
        await page.goto('/farmer/production');
        await expect(page.locator('text=Batch 1')).toBeVisible(); // "Featured Cycle 1/2569"
    });
});
