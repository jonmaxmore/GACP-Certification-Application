# Phase 1 Frontend Integration Guide

## Overview

This guide explains how to integrate Phase 1 AI QC and Calendar Scheduling components into existing dashboards.

## Components Created

### 1. AIQCModal.tsx
**Location**: `apps/frontend/components/AIQCModal.tsx`

**Purpose**: Display AI Quality Control interface and results

**Props**:
- `open: boolean` - Dialog open state
- `onClose: () => void` - Close handler
- `applicationId: string` - Application ID to run AI QC on
- `onComplete?: (result: AIQCResult) => void` - Callback after AI QC completes

**Usage Example**:
```tsx
import AIQCModal from '@/components/AIQCModal';

const [aiQcOpen, setAiQcOpen] = useState(false);
const [selectedApplicationId, setSelectedApplicationId] = useState('');

// In your component
<Button onClick={() => {
  setSelectedApplicationId(application._id);
  setAiQcOpen(true);
}}>
  Run AI QC
</Button>

<AIQCModal
  open={aiQcOpen}
  onClose={() => setAiQcOpen(false)}
  applicationId={selectedApplicationId}
  onComplete={(result) => {
    console.log('AI QC Result:', result);
    // Refresh application list
    loadApplications();
  }}
/>
```

### 2. InspectionSchedule.tsx
**Location**: `apps/frontend/components/InspectionSchedule.tsx`

**Purpose**: Schedule inspections with Google Calendar integration

**Props**:
- `open: boolean` - Dialog open state
- `onClose: () => void` - Close handler
- `applicationId: string` - Application ID
- `application: object` - Application data (see interface)
- `onScheduled?: () => void` - Callback after scheduling

**Usage Example**:
```tsx
import InspectionSchedule from '@/components/InspectionSchedule';

const [scheduleOpen, setScheduleOpen] = useState(false);
const [selectedApp, setSelectedApp] = useState(null);

// In your component
<Button onClick={() => {
  setSelectedApp(application);
  setScheduleOpen(true);
}}>
  Schedule Inspection
</Button>

<InspectionSchedule
  open={scheduleOpen}
  onClose={() => setScheduleOpen(false)}
  applicationId={selectedApp._id}
  application={selectedApp}
  onScheduled={() => {
    console.log('Inspection scheduled');
    loadApplications();
  }}
/>
```

## Integration Steps

### Step 1: Inspector Dashboard

**File**: `apps/frontend/pages/inspector/dashboard.tsx`

**Add to imports**:
```tsx
import AIQCModal from '@/components/AIQCModal';
import InspectionSchedule from '@/components/InspectionSchedule';
```

**Add state**:
```tsx
const [aiQcModalOpen, setAiQcModalOpen] = useState(false);
const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
const [selectedApplication, setSelectedApplication] = useState<any>(null);
```

**Add buttons to application card**:
```tsx
<CardActions>
  {/* Existing buttons */}
  
  {/* Add AI QC button for IN_REVIEW status */}
  {application.status === 'IN_REVIEW' && (
    <Button
      size="small"
      color="primary"
      startIcon={<AssessmentIcon />}
      onClick={() => {
        setSelectedApplication(application);
        setAiQcModalOpen(true);
      }}
    >
      View AI QC
    </Button>
  )}
  
  {/* Add Schedule button for REVIEW_PASSED status */}
  {application.status === 'REVIEW_PASSED' && (
    <Button
      size="small"
      color="primary"
      startIcon={<EventIcon />}
      onClick={() => {
        setSelectedApplication(application);
        setScheduleModalOpen(true);
      }}
    >
      Schedule
    </Button>
  )}
</CardActions>
```

**Add modals before closing component**:
```tsx
{/* AI QC Modal */}
{selectedApplication && (
  <AIQCModal
    open={aiQcModalOpen}
    onClose={() => setAiQcModalOpen(false)}
    applicationId={selectedApplication._id}
    onComplete={(result) => {
      console.log('AI QC completed:', result);
      loadApplications(); // Refresh list
    }}
  />
)}

{/* Schedule Modal */}
{selectedApplication && (
  <InspectionSchedule
    open={scheduleModalOpen}
    onClose={() => setScheduleModalOpen(false)}
    applicationId={selectedApplication._id}
    application={selectedApplication}
    onScheduled={() => {
      loadApplications(); // Refresh list
    }}
  />
)}
```

### Step 2: Approver Dashboard

**File**: `apps/frontend/pages/approver/dashboard.tsx`

**Add to imports**:
```tsx
import AIQCModal from '@/components/AIQCModal';
```

**Add state**:
```tsx
const [aiQcModalOpen, setAiQcModalOpen] = useState(false);
const [selectedApplication, setSelectedApplication] = useState<any>(null);
```

**Add AI QC details in application card**:
```tsx
{/* Show AI QC Results */}
{application.aiQc && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">
      AI QC Results
    </Typography>
    <Box display="flex" gap={1} mt={1}>
      <Chip
        label={`Score: ${application.aiQc.overallScore}/10`}
        color={
          application.aiQc.overallScore >= 8 ? 'success' :
          application.aiQc.overallScore >= 6 ? 'warning' : 'error'
        }
        size="small"
      />
      <Chip
        label={application.inspectionType}
        color={
          application.inspectionType === 'VIDEO' ? 'info' :
          application.inspectionType === 'HYBRID' ? 'warning' : 'error'
        }
        size="small"
      />
    </Box>
    <Button
      size="small"
      onClick={() => {
        setSelectedApplication(application);
        setAiQcModalOpen(true);
      }}
    >
      View Details
    </Button>
  </Box>
)}
```

**Add modal before closing component**:
```tsx
{/* AI QC Modal */}
{selectedApplication && (
  <AIQCModal
    open={aiQcModalOpen}
    onClose={() => setAiQcModalOpen(false)}
    applicationId={selectedApplication._id}
  />
)}
```

### Step 3: Reviewer Dashboard (Optional)

Similar to Approver Dashboard - add AI QC viewing capability.

## Backend Integration

### Auto-trigger AI QC

**File**: `apps/backend/routes/farmer.routes.js` (or wherever application submission is handled)

**Add to application submission endpoint**:
```javascript
const aiQcTrigger = require('../services/ai/aiQcTrigger');

// After application is saved with SUBMITTED status
router.post('/applications/:id/submit', async (req, res) => {
  try {
    // ... existing submission logic ...
    
    application.status = 'SUBMITTED';
    await application.save();
    
    // Auto-trigger AI QC (non-blocking)
    if (process.env.ENABLE_AI_QC === 'true') {
      aiQcTrigger.autoTriggerAIQC(application._id).catch(err => {
        logger.error('AI QC auto-trigger failed:', err);
        // Don't fail the submission
      });
    }
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Notification Integration

**File**: `apps/backend/controllers/aiQcController.js`

**Update runAIQC function**:
```javascript
const notificationService = require('../services/notification/notificationService');

// After AI QC completes
if (qcResult.success) {
  // ... existing code ...
  
  // Notify reviewers
  await notificationService.notifyNewApplication(application);
}
```

**File**: `apps/backend/routes/inspector.routes.js`

**Update scheduleInspection function**:
```javascript
const notificationService = require('../services/notification/notificationService');

// After scheduling
if (calendarEvent.success) {
  // ... existing code ...
  
  // Notify inspector
  await notificationService.notifyInspectorAssignment(application, inspector);
}
```

## Environment Variables

Update `.env`:
```bash
# Phase 1 Features
ENABLE_AI_QC=true
ENABLE_GOOGLE_CALENDAR=true
ENABLE_SCHEDULER=true

# Google Gemini AI
GEMINI_API_KEY=your_api_key_here

# Google Calendar
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/calendar/oauth2callback

# Email/SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM="GACP DTAM <noreply@gacp-dtam.th>"

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Testing Checklist

### Frontend Testing
- [ ] AI QC Modal opens correctly
- [ ] AI QC results display with proper styling
- [ ] Score color coding works (green/yellow/red)
- [ ] Inspection type chips show correct colors
- [ ] Issues and recommendations lists render
- [ ] Schedule modal opens correctly
- [ ] Inspector dropdown loads
- [ ] Date/time pickers work
- [ ] Availability check works
- [ ] Schedule button saves and refreshes

### Backend Testing
- [ ] AI QC auto-triggers after submission
- [ ] AI QC results saved to database
- [ ] Inspection type determined correctly
- [ ] Calendar events created (VIDEO inspections)
- [ ] Email notifications sent
- [ ] Job scheduler starts on server startup
- [ ] Cron jobs run on schedule

### Integration Testing
- [ ] Submit application → AI QC runs → Status changes to IN_REVIEW
- [ ] View AI QC results in dashboard
- [ ] Schedule inspection → Calendar event created → Email sent
- [ ] Complete inspection → Notify approver
- [ ] Approve application → Certificate issued

## Troubleshooting

### AI QC not triggering
1. Check `ENABLE_AI_QC=true` in .env
2. Check Gemini API key is valid
3. Check application has documents and images
4. Check server logs for errors

### Calendar events not creating
1. Check `ENABLE_GOOGLE_CALENDAR=true` in .env
2. Check Google OAuth credentials
3. Ensure inspector has Google Calendar access
4. Check server logs for API errors

### Email notifications not sending
1. Check SMTP configuration in .env
2. For Gmail: Use App Password, not regular password
3. Check `SMTP_SECURE` matches your port (587=false, 465=true)
4. Check server logs for SMTP errors

### Job scheduler not running
1. Check `ENABLE_SCHEDULER=true` in .env
2. Check node-cron is installed: `npm install node-cron`
3. Check server logs show "Job scheduler started"
4. Verify cron syntax is correct

## Next Steps (Phase 2)

1. **Job Queues**: Implement Bull/BullMQ for background processing
2. **Caching**: Add Redis caching for frequently accessed data
3. **Monitoring**: Set up metrics dashboard with Prometheus/Grafana
4. **Optimization**: Add database indexing, query optimization
5. **Production Deployment**: AWS setup, Docker containers, CI/CD

## Support

For issues or questions:
1. Check server logs: `apps/backend/logs/`
2. Check browser console for frontend errors
3. Review API responses in Network tab
4. Check database records in MongoDB

## Summary

Phase 1 adds:
- ✅ AI QC automation with Gemini
- ✅ Google Calendar integration
- ✅ Email notifications
- ✅ Job scheduler for cron tasks
- ✅ Frontend components for UI
- ✅ Backend services and APIs

Total new files: 8
Total new lines: ~2,500
Total new APIs: 8 endpoints
