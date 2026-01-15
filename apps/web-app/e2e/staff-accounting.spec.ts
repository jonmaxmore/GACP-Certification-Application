import { test, expect } from '@playwright/test';

test.describe('Staff Journey: Accounting Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('Accountant Login and Dashboard Verification @smoke', async ({ page }) => {
        // --- Mock APIs ---

        // Login Mock
        await page.route('/api/auth-dtam/login', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        token: 'mock-staff-token',
                        user: { id: 'staff-1', role: 'ACCOUNTANT', firstName: 'Somchai', lastName: 'Acc' }
                    }
                })
            });
        });

        // Invoices Summary Mock
        await page.route('/api/invoices/summary', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        totalRevenue: 150000,
                        pendingAmount: 50000,
                        overdueAmount: 10000,
                        monthlyRevenue: 20000,
                        invoiceCount: { total: 10, pending: 2, paid: 7, overdue: 1 }
                    }
                })
            });
        });

        // Invoices List Mock
        await page.route('/api/invoices', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        invoices: [
                            {
                                id: 'inv-1',
                                invoiceNumber: 'INV-2024-001',
                                applicationNumber: 'APP-001',
                                farmerName: 'Farmer One',
                                amount: 10000,
                                status: 'PENDING',
                                dueDate: '2025-12-31',
                                createdAt: '2025-01-01',
                                items: []
                            },
                            {
                                id: 'inv-2',
                                invoiceNumber: 'INV-2024-002',
                                applicationNumber: 'APP-002',
                                farmerName: 'Farmer Two',
                                amount: 20000,
                                status: 'PAID',
                                paidAt: '2025-01-10',
                                dueDate: '2025-01-15',
                                createdAt: '2025-01-01',
                                items: []
                            }
                        ]
                    }
                })
            });
        });

        // --- Test Flow ---
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

        // 1. Login
        console.log('Navigating to Login');
        await page.goto('/staff/login');
        await expect(page.locator('h1')).toContainText('ระบบเจ้าหน้าที่ GACP');

        console.log('Filling Credentials');
        await page.getByPlaceholder('admin / EMP001 / officer@dtam.go.th').fill('accountant');
        await page.getByPlaceholder('กรอกรหัสผ่าน').fill('password');

        console.log('Clicking Submit');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

        // Check for error message
        const errorMsg = page.locator('.text-red-600');
        if (await errorMsg.isVisible()) {
            console.log('Login Error Visible:', await errorMsg.textContent());
        }

        // Expect redirect to Dashboard
        console.log('Waiting for Redirect');
        await expect(page).toHaveURL(/\/staff\/dashboard/, { timeout: 10000 });

        // 2. Navigate to Accounting
        // Assuming there is a link or we just go there directly for this smoke test
        await page.goto('/staff/accounting');

        // 3. Verify Dashboard Stats
        await expect(page.getByText('฿150,000')).toBeVisible(); // Revenue
        await expect(page.getByText('฿50,000')).toBeVisible(); // Pending

        // 4. Verify Invoice Table
        await expect(page.getByText('INV-2024-001')).toBeVisible();
        await expect(page.getByText('Farmer One')).toBeVisible();
        await expect(page.getByText('รอชำระ')).toBeVisible(); // Badge for PENDING

        await expect(page.getByText('INV-2024-002')).toBeVisible();
        await expect(page.getByText('ชำระแล้ว')).toBeVisible(); // Badge for PAID

        console.log('Accounting Dashboard Verified');
    });
});
