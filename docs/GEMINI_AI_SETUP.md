# Google Gemini AI Integration Setup

## Overview
This system uses Google Gemini AI (formerly Bard) for intelligent document processing and image analysis in the GACP certification workflow.

## Features

### 1. OCR (Optical Character Recognition)
- Extract text from images with Thai language support
- High accuracy for handwritten and printed text
- Maintains original layout and formatting

### 2. Document Validation
- Validate GACP application documents
- Extract structured data from forms
- Score document quality (clarity, completeness, authenticity)
- Identify missing or inconsistent information

### 3. Image Quality Analysis
- Assess image clarity, lighting, and focus
- Determine suitability for remote inspection
- Identify visible crops, equipment, and facilities
- Detect potential issues (pests, diseases)

### 4. AI Quality Control (QC)
- Automated quality assessment of applications
- Multi-criteria scoring system
- Smart inspection type recommendation:
  - **VIDEO** (Score ≥90): Video call inspection
  - **HYBRID** (Score 70-89): Mixed remote + onsite
  - **ONSITE** (Score <70): Full field inspection

### 5. Document Comparison
- Compare multiple documents for consistency
- Identify discrepancies and conflicts
- Generate consistency reports

## API Setup

### Prerequisites
1. Google Cloud Project
2. Gemini API access enabled
3. API key generated

### Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Environment Variables

Add to `.env` file:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

### Install Dependencies

```bash
npm install @google/generative-ai
```

## API Endpoints

### Base URL: `/api/v1/ai-qc`

### 1. Run AI QC on Application
```http
POST /applications/:applicationId/run
Authorization: Bearer <token>
Role: ADMIN, REVIEWER

Response:
{
  "success": true,
  "data": {
    "applicationId": "...",
    "overallScore": 85.5,
    "inspectionType": "HYBRID",
    "issues": [],
    "recommendations": []
  }
}
```

### 2. Get AI QC Results
```http
GET /applications/:applicationId/results
Authorization: Bearer <token>
Role: ADMIN, REVIEWER, INSPECTOR, APPROVER

Response:
{
  "success": true,
  "data": {
    "completedAt": "2025-11-04T10:30:00Z",
    "overallScore": 85.5,
    "scores": {
      "documentValidation": 8.5,
      "imageQuality": 9.0,
      "dataCompleteness": 8.0
    },
    "inspectionType": "HYBRID",
    "issues": [],
    "recommendations": []
  }
}
```

### 3. OCR - Extract Text
```http
POST /ocr
Authorization: Bearer <token>
Role: ADMIN, REVIEWER
Content-Type: multipart/form-data

Body:
- image: <file>

Response:
{
  "success": true,
  "data": {
    "extractedText": "ชื่อฟาร์ม: ...",
    "confidence": 0.85
  }
}
```

### 4. Validate Document
```http
POST /validate-document
Authorization: Bearer <token>
Role: ADMIN, REVIEWER
Content-Type: multipart/form-data

Body:
- document: <file>
- documentType: "farm_registration" | "id_card" | "land_certificate" | ...

Response:
{
  "success": true,
  "data": {
    "documentType": "farm_registration",
    "extractedData": { ... },
    "validation": {
      "clarity": 8,
      "completeness": 9,
      "authenticity": 8,
      "consistency": 9,
      "overallScore": 8.5
    },
    "issues": [],
    "recommendations": []
  }
}
```

### 5. Analyze Image Quality
```http
POST /analyze-image
Authorization: Bearer <token>
Role: ADMIN, REVIEWER, INSPECTOR
Content-Type: multipart/form-data

Body:
- image: <file>

Response:
{
  "success": true,
  "data": {
    "quality": {
      "clarity": 9,
      "lighting": 8,
      "focus": 9,
      "framing": 8,
      "overallScore": 8.5
    },
    "content": {
      "visibleElements": ["crops", "greenhouse"],
      "identifiedCrops": ["tomatoes"],
      "structures": ["greenhouse"],
      "equipment": ["irrigation system"]
    },
    "suitableForRemoteInspection": true,
    "issues": [],
    "recommendations": []
  }
}
```

### 6. Compare Documents
```http
POST /compare-documents
Authorization: Bearer <token>
Role: ADMIN, REVIEWER
Content-Type: multipart/form-data

Body:
- documents: <file[]> (exactly 2 files)

Response:
{
  "success": true,
  "data": {
    "commonInfo": ["ชื่อเกษตรกร: นายสมชาย..."],
    "discrepancies": ["เนื้อที่ไม่ตรงกัน: 5 ไร่ vs 6 ไร่"],
    "missingInDoc1": [],
    "missingInDoc2": [],
    "consistencyScore": 8.5,
    "summary": "..."
  }
}
```

### 7. Batch OCR
```http
POST /batch-ocr
Authorization: Bearer <token>
Role: ADMIN, REVIEWER
Content-Type: multipart/form-data

Body:
- images: <file[]> (up to 10 files)

Response:
{
  "success": true,
  "data": {
    "total": 5,
    "successful": 5,
    "failed": 0,
    "results": [ ... ]
  }
}
```

### 8. Get AI QC Statistics
```http
GET /stats
Authorization: Bearer <token>
Role: ADMIN

Response:
{
  "success": true,
  "data": {
    "totalProcessed": 150,
    "byInspectionType": [
      {
        "_id": "VIDEO",
        "count": 30,
        "avgScore": 92.5
      },
      {
        "_id": "HYBRID",
        "count": 75,
        "avgScore": 82.3
      },
      {
        "_id": "ONSITE",
        "count": 45,
        "avgScore": 65.8
      }
    ],
    "overallAvgScore": 80.2
  }
}
```

## Scoring System

### Document Validation (10 points)
- **Clarity** (0-10): Image sharpness, readability
- **Completeness** (0-10): All required fields present
- **Authenticity** (0-10): Document genuineness indicators
- **Consistency** (0-10): Data consistency across fields

### Image Quality (10 points)
- **Clarity** (0-10): Image sharpness
- **Lighting** (0-10): Proper illumination
- **Focus** (0-10): Proper focus on subject
- **Framing** (0-10): Appropriate angle and composition

### Data Completeness (10 points)
- Required fields: farmer name, ID, farm name, location, area, lot ID
- Each field: +1.67 points

### Overall Score Calculation
```
Overall Score = Average of all component scores
```

### Inspection Type Determination
```javascript
if (overallScore >= 90) {
  inspectionType = 'VIDEO';     // ฿500, 2 hours
} else if (overallScore >= 70) {
  inspectionType = 'HYBRID';    // ฿1,500, 4 hours
} else {
  inspectionType = 'ONSITE';    // ฿3,000, 1 day
}
```

## Integration with Workflow

### Automatic AI QC Trigger
When farmer submits application (status: SUBMITTED):

1. System automatically calls `POST /ai-qc/applications/:id/run`
2. Gemini AI analyzes documents and images
3. Calculates overall score
4. Determines inspection type
5. Updates application:
   - Status: `SUBMITTED` → `IN_REVIEW`
   - Adds AI QC results
   - Sets inspection type

### Manual Trigger
Reviewer can manually trigger AI QC from dashboard if needed.

## Error Handling

### Common Errors

**1. API Key Not Configured**
```json
{
  "success": false,
  "message": "Gemini API key is required"
}
```

**2. File Upload Error**
```json
{
  "success": false,
  "message": "Only images (JPEG, PNG) and PDF files are allowed"
}
```

**3. API Rate Limit**
```json
{
  "success": false,
  "message": "AI QC failed",
  "error": "Rate limit exceeded"
}
```

## Best Practices

### 1. Image Requirements
- **Format**: JPEG, PNG
- **Size**: < 10MB
- **Resolution**: ≥ 1024x768 recommended
- **Quality**: Clear, well-lit, focused

### 2. Document Types
- Farm registration certificate
- National ID card
- Land ownership certificate
- Chemical usage logs
- Farming practice records
- Previous certifications

### 3. Rate Limiting
- Gemini API has rate limits
- Implement queue system for batch processing
- Consider caching results

### 4. Cost Optimization
- Gemini 1.5 Flash is cost-effective
- Batch similar operations
- Cache frequent queries
- Monitor usage via Google Cloud Console

## Monitoring

### Logs
Check logs for AI QC operations:
```bash
tail -f logs/ai-qc.log
```

### Statistics
Monitor AI QC performance:
```http
GET /api/v1/ai-qc/stats
```

## Troubleshooting

### Issue: Low Accuracy
**Solution**: 
- Improve image quality
- Use better prompts
- Try Gemini 1.5 Pro (higher accuracy, higher cost)

### Issue: Slow Processing
**Solution**:
- Use Gemini 1.5 Flash (faster)
- Implement async processing
- Add job queue (Bull, BullMQ)

### Issue: Thai Language Issues
**Solution**:
- Explicitly mention Thai language in prompts
- Use UTF-8 encoding
- Test with various Thai fonts

## Future Enhancements

1. **Video Analysis**: Process video inspection recordings
2. **Crop Disease Detection**: AI-powered disease identification
3. **Pest Detection**: Automatic pest detection in images
4. **Custom Model Training**: Fine-tune for specific crops
5. **Multi-language Support**: Additional languages beyond Thai

## Support

- Documentation: [Gemini API Docs](https://ai.google.dev/docs)
- Community: [Google AI Forum](https://developers.googleblog.com/)
- Issues: Create ticket in project repository

## License

This integration uses Google Gemini API which is subject to Google's terms of service.
