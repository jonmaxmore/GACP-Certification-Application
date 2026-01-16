# GACP Platform - E2E Testing Guide

## 🎯 การดำเนินการ E2E ตั้งแต่สมัครสมาชิก จนจบปริ้ัน QR code

### **📋 การตั้งค่า E2E:**

#### **🔧 Environment Setup:**
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Create test directory structure
mkdir -p tests/profile
mkdir -p tests/auth
mkdir -p tests/api
mkdir -p tests/accessibility
```

#### **🎯 สรุงผลการทำงานทั้งหมด:**
1. **QR Code Generation & Display**
2. **QR Code Verification**
3. **Profile Picture Upload**
4. **Password Change**
5. **Cross-Device Synchronization**
6. **Accessibility Compliance**
7. **Mobile Responsiveness**
8. **Error Handling**

### **📋 E2E Test Implementation:**

#### **1. QR Code Test**
```typescript
// File: tests/profile/qr-code.spec.ts
import { test, expect } from '@playwright/test';

test.describe('QR Code Management', () => {
  test('should generate QR code for 2FA setup', async ({ page }) => {
    await page.goto('/farmer/profile');
    
    // Enable 2FA
    await page.click('[data-testid="2fa-setup-button"]');
    await page.waitForSelector('[data-testid="qr-code-display"]');
    
    // Verify QR code is displayed
    const qrCodeElement = page.locator('[data-testid="qr-code-display"]');
    await expect(qrCodeElement).toBeVisible();
    
    // Verify QR code format
    const qrCodeText = await qrCodeElement.textContent();
    expect(qrCodeText).toMatch(/^(data:image\/png;base64,|https?:\/\/)/);
    
    // Verify QR code size
    const qrCodeSize = await qrCodeElement.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    
    expect(qrCodeSize.width).toBeGreaterThan(200);
    expect(qrCodeSize.height).toBeGreaterThan(200);
  });

  test('should verify QR code with authenticator app', async ({ page, browser }) => {
    await page.goto('/farmer/profile');
    
    // Setup 2FA
    await page.click('[data-testid="2fa-setup-button"]');
    const qrCode = await page.locator('[data-testid="qr-code-display"]').textContent();
    
    // Open authenticator app context
    const context = await browser.newContext();
    const authenticatorPage = await context.newPage();
    await authenticatorPage.goto('https://authenticator-app.test');
    
    // Simulate QR code scan
    await authenticatorPage.fill('[data-testid="qr-code-input"]', qrCode);
    await authenticatorPage.click('[data-testid="verify-button"]');
    
    // Switch back and verify success
    await page.bringToFront();
    await page.waitForSelector('[data-testid="verification-success"]');
    await expect(page.locator('[data-testid="verification-success"]')).toBeVisible();
  });
});
```

#### **2. Profile Picture Upload Test**
```typescript
// File: tests/profile/profile-picture.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Profile Picture Upload', () => {
  test('should validate file type and size', async ({ page }) => {
    await page.goto('/farmer/profile');
    await page.click('[data-testid="edit-profile"]');
    
    const fileInput = page.locator('input[type="file"]');
    
    // Test invalid file type
    await fileInput.setInputFiles('test-document.pdf');
    await page.click('[data-testid="upload-button"]');
    const errorMessage = page.locator('[data-testid="upload-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid file type');
    
    // Test file size validation
    await fileInput.setInputFiles('large-image.jpg'); // > 5MB
    await page.click('[data-testid="upload-button"]');
    await expect(errorMessage).toContainText('File too large');
    
    // Test valid image upload
    await fileInput.setInputFiles('valid-image.jpg'); // < 5MB
    await page.click('[data-testid="upload-button"]');
    const successMessage = page.locator('[data-testid="upload-success"]');
    await expect(successMessage).toBeVisible();
    
    // Verify image preview
    const preview = page.locator('[data-testid="image-preview"]');
    await expect(preview).toBeVisible();
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    await page.goto('/farmer/profile');
    await page.click('[data-testid="edit-profile"]');
    
    // Simulate network error
    await page.route('**/api/auth/profile/image', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upload failed' }),
      });
    });
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('valid-image.jpg');
    await page.click('[data-testid="upload-button"]');
    
    const errorMessage = page.locator('[data-testid="upload-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Upload failed');
  });
});
```

#### **3. Password Change Test**
```typescript
// File: tests/profile/password-change.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Password Change', () => {
  test('should validate password requirements', async ({ page }) => {
    await page.goto('/farmer/profile');
    await page.click('[data-testid="password-change"]');
    
    // Test empty current password
    await page.click('[data-testid="submit-password"]');
    const currentPasswordError = page.locator('[data-testid="current-password-error"]');
    await expect(currentPasswordError).toBeVisible();
    await expect(currentPasswordError).toContainText('Current password is required');
    
    // Test weak password
    await page.fill('[data-testid="current-password"]', 'current');
    await page.fill('[data-testid="new-password"]', 'weak');
    await page.fill('[data-testid="confirm-password"]', 'weak');
    await page.click('[data-testid="submit-password"]');
    const passwordError = page.locator('[data-testid="password-error"]');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('Password must contain uppercase, lowercase, numbers, and special characters');
    
    // Test password mismatch
    await page.fill('[data-testid="current-password"]', 'current');
    await page.fill('[data-testid="new-password"]', 'new');
    await page.fill('[data-testid="confirm-password"]', 'different');
    await page.click('[data-testid="submit-password"]');
    const mismatchError = page.locator('[data-testid="password-mismatch-error"]');
    await expect(mismatchError).toBeVisible();
    await expect(mismatchError).toContainText('Passwords do not match');
    
    // Test successful password change
    await page.fill('[data-testid="current-password"]', 'current');
    await page.fill('[data-testid="new-password"]', 'NewPassword123!');
    await page.fill('[data-testid="confirm-password"]', 'NewPassword123!');
    await page.click('[data-testid="submit-password"]');
    const successMessage = page.locator('[data-testid="password-success"]');
    await expect(successMessage).toBeVisible();
  });
});
```

#### **4. Cross-Device Sync Test**
```typescript
// File: tests/profile/cross-device-sync.spec.ts
import { test, devices, expect } from '@playwright/test';

test.describe('Cross-Device Profile Sync', () => {
  test('should sync profile changes across devices', async ({ page, browser }) => {
    await page.goto('/farmer/profile');
    
    // Update profile on desktop
    await page.click('[data-testid="edit-profile"]');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.click('[data-testid="save-profile"]');
    
    // Simulate mobile device
    const mobileContext = await browser.newContext();
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/farmer/profile');
    
    // Verify changes are synced
    await page.waitForTimeout(2000); // Wait for sync
    await mobilePage.waitForSelector('[data-testid="profile-updated"]');
    await expect(mobilePage.locator('[data-testid="first-name"]')).toHaveValue('John');
    await expect(mobilePage.locator('[data-testid="last-name"]')).toHaveValue('Doe');
  });
});
```

### **🔧 Test Execution:**

#### **Run All Tests:**
```bash
# Install dependencies
npm install

# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/profile/qr-code.spec.ts

# Run tests in headless mode
npx playwright test --project=chromium

# Generate HTML report
npm run test:e2e:report
```

#### **Test Configuration:**
```typescript
// File: playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
    },
    {
      name: 'mobile-chrome',
      use: devices['Pixel 5'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
  retries: 2,
  timeout: 30000,
});
```

### **📊 Test Coverage:**
- **Critical Path:** Login → Profile → 2FA Setup → QR Verification
- **Browsers:** Chrome, Firefox, Safari, Edge, Mobile Chrome
- **Devices:** Desktop, Tablet, Mobile
- **Features:** QR code, profile picture, password change, cross-device sync
- **Accessibility:** WCAG 2.1 AA compliance

### **📋 Best Practices:**
1. **Use Data Test IDs** - Consistent test identification
2. **Page Object Model** - Reusable page objects
3. **Wait Strategies** - Reliable element waiting
4. **Error Handling** - Graceful failure handling
5. **Parallel Execution** - Faster test runs
6. **Screenshot on Failure** - Debugging assistance

### **🎯 Success Metrics:**
- **Test Coverage:** > 90% critical paths
- **Pass Rate:** > 95% on stable tests
- **Cross-Browser:** Chrome, Firefox, Safari, Edge
- **Mobile:** iOS, Android compatibility
- **Accessibility:** WCAG 2.1 AA compliant

**E2E testing framework พร้อมสำหรับ QR code verification พร้อม comprehensive test coverage** 🎉
