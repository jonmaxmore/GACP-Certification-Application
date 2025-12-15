# Email Service

Centralized email sending service for GACP Platform with support for multiple email providers.

## Features

- ✅ Multiple email providers (SMTP, Gmail, SendGrid, AWS SES)
- ✅ Template-based email rendering
- ✅ Automatic fallback templates
- ✅ Thai language support
- ✅ Error handling and logging
- ✅ Email verification

## Supported Email Types

1. **Password Reset** - Send password reset link
2. **Email Verification** - Send email verification link
3. **Welcome Email** - Welcome new users
4. **Application Status** - Notify application status changes
5. **Inspection Scheduled** - Notify inspection appointments

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Email Provider (smtp, gmail, sendgrid, ses)
EMAIL_PROVIDER=smtp

# Email Sender Info
EMAIL_FROM_NAME=GACP Platform
EMAIL_FROM_ADDRESS=noreply@gacp.th
APP_URL=http://localhost:3000

# SMTP Configuration (default)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Provider-Specific Configuration

#### Gmail

```bash
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

**How to get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Use the 16-character password

#### SendGrid

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
```

#### AWS SES

```bash
EMAIL_PROVIDER=ses
AWS_SES_HOST=email-smtp.ap-southeast-1.amazonaws.com
AWS_SES_ACCESS_KEY=your-ses-access-key
AWS_SES_SECRET_KEY=your-ses-secret-key
```

## Usage

### Basic Usage

```javascript
const EmailService = require('./services/email/EmailService');
const emailService = new EmailService();

// Send password reset email
await emailService.sendPasswordResetEmail(user, resetToken);

// Send verification email
await emailService.sendVerificationEmail(user, verificationToken);

// Send welcome email
await emailService.sendWelcomeEmail(user);
```

### Integration with Services

```javascript
class GACPUserService {
  constructor() {
    this.repository = new UserRepository();
    this.emailService = new EmailService();
  }

  async requestPasswordReset(email) {
    const user = await this.repository.findByEmail(email);
    if (user) {
      const resetToken = user.generatePasswordResetToken();
      await this.repository.save(user);

      // Send email
      await this.emailService.sendPasswordResetEmail(user, resetToken);
    }
  }
}
```

### Custom Email

```javascript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  template: 'custom-template',
  data: {
    name: 'John Doe',
    customField: 'value',
  },
});
```

## Email Templates

Templates are located in `services/email/templates/` directory.

### Available Templates

- `password-reset.html` - Password reset email
- `email-verification.html` - Email verification
- `welcome.html` - Welcome email
- `application-status.html` - Application status update
- `inspection-scheduled.html` - Inspection notification

### Template Variables

Templates use `{{variable}}` syntax:

```html
<h2>สวัสดีคุณ {{name}}</h2>
<p>กรุณาคลิกลิงก์ด้านล่าง:</p>
<a href="{{resetLink}}">รีเซ็ตรหัสผ่าน</a>
```

### Fallback Templates

If template file is not found, the system uses built-in fallback templates with basic styling.

## Testing

### Verify Email Configuration

```javascript
const emailService = new EmailService();
const isValid = await emailService.verifyConnection();
console.log('Email configuration valid:', isValid);
```

### Send Test Email

```javascript
// Create test user
const testUser = {
  email: 'test@example.com',
  fullName: 'Test User',
};

// Send test email
await emailService.sendWelcomeEmail(testUser);
```

## Error Handling

The service includes comprehensive error handling:

```javascript
try {
  await emailService.sendPasswordResetEmail(user, token);
  logger.info('Email sent successfully');
} catch (error) {
  logger.error('Failed to send email:', error);
  // Handle error (retry, notify admin, etc.)
}
```

## Logging

All email operations are logged:

```javascript
// Success
[EmailService] Email sent successfully {
  to: 'user@example.com',
  subject: 'Password Reset',
  template: 'password-reset',
  messageId: '<message-id>'
}

// Error
[EmailService] Failed to send email: {
  to: 'user@example.com',
  error: 'Connection timeout'
}
```

## Production Considerations

### Security

- ✅ Never commit `.env` file with real credentials
- ✅ Use environment-specific secrets (AWS Secrets Manager, etc.)
- ✅ Enable 2FA for email provider accounts
- ✅ Use app-specific passwords (Gmail)
- ✅ Rotate credentials regularly

### Performance

- ✅ Template caching enabled by default
- ✅ Async email sending (non-blocking)
- ✅ Consider using queue for bulk emails

### Monitoring

- ✅ Monitor email delivery rates
- ✅ Set up alerts for failed emails
- ✅ Track bounce rates
- ✅ Review email logs regularly

## Troubleshooting

### Common Issues

**1. "Invalid login" error**
- Check SMTP credentials
- Ensure 2FA is enabled and using app password (Gmail)
- Verify SMTP host and port

**2. "Connection timeout"**
- Check firewall settings
- Verify SMTP port is not blocked
- Try different port (587, 465, 25)

**3. "Template not found"**
- Check template file exists in `services/email/templates/`
- Verify template name matches (case-sensitive)
- Fallback template will be used automatically

**4. Emails not received**
- Check spam folder
- Verify recipient email address
- Check email provider logs
- Verify sender domain reputation

## Development vs Production

### Development
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io  # Use Mailtrap for testing
SMTP_PORT=2525
```

### Production
```bash
EMAIL_PROVIDER=ses  # Use AWS SES for production
AWS_SES_HOST=email-smtp.ap-southeast-1.amazonaws.com
```

## Dependencies

```json
{
  "nodemailer": "^6.9.0"
}
```

Install if not already installed:
```bash
npm install nodemailer
```

## License

Proprietary - GACP Platform
