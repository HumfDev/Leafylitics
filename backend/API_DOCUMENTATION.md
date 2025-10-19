# Leafylitics Crop Analysis API Documentation

## Overview

The Leafylitics API provides comprehensive crop health analysis using Google Gemini AI. This API processes crop images and returns detailed diagnostic information including disease detection, severity assessment, and actionable recommendations.

## Base URL

```
http://localhost:3001/api/analysis
```

## Authentication

Currently, no authentication is required for testing. In production, JWT tokens will be required.

## Endpoints

### 1. Comprehensive Analysis

**Endpoint:** `POST /comprehensive`

Analyze crop images using the full Gemini framework with comprehensive diagnostic information.

#### Request

- **Method:** POST
- **Content-Type:** application/json
- **Body:**
  ```json
  {
    "image": "base64_encoded_image_string",
    "mimeType": "image/jpeg",
    "plantSpecies": "optional_plant_species_hint"
  }
  ```

#### Response

```json
{
  "success": true,
  "analysisId": "analysis_1234567890_abc123",
  "results": {
    "image_quality": {
      "is_acceptable": true,
      "clarity_score": 95,
      "issues": [],
      "retake_guidance": null
    },
    "plant_identification": {
      "common_name": "Tomato",
      "scientific_name": "Solanum lycopersicum",
      "confidence": 92
    },
    "diagnoses": [
      {
        "rank": 1,
        "condition_name": "Early Blight",
        "scientific_name": "Alternaria solani",
        "confidence": 87,
        "severity": "Mild",
        "affected_area_percent": 15,
        "progression_stage": "Early",
        "key_symptoms": ["Small dark spots", "Yellow halos", "Concentric rings"],
        "visual_description": "Small dark brown spots with yellow halos visible on lower leaves",
        "affected_regions": "Lower leaves, primarily along leaf margins"
      }
    ],
    "overall_confidence": 87,
    "requires_expert_review": false,
    "uncertainty_notes": null,
    "recommendations": {
      "immediate": [
        {
          "action": "Remove affected leaves",
          "reason": "Prevent disease spread",
          "expected_outcome": "Reduced disease progression"
        }
      ],
      "short_term": [
        {
          "action": "Apply copper fungicide",
          "reason": "Treat existing infection",
          "expected_outcome": "Disease control within 1 week"
        }
      ],
      "preventive": [
        {
          "action": "Improve air circulation",
          "reason": "Reduce humidity around plants",
          "expected_outcome": "Prevent future infections"
        }
      ]
    },
    "environmental_factors": {
      "likely_contributors": ["High humidity", "Poor air circulation"],
      "suggested_adjustments": ["Increase spacing between plants", "Water at soil level"]
    },
    "differential_diagnosis": [
      {
        "alternative_condition": "Septoria Leaf Spot",
        "likelihood": "Low",
        "distinguishing_features": "Smaller spots without concentric rings"
      }
    ],
    "technical_metadata": {
      "model_version": "leaflens-analysis-v1",
      "analysis_timestamp": "2024-01-15T10:30:00.000Z",
      "plantvillage_class_match": "Tomato_Early_blight"
    },
    "user_friendly_summary": {
      "headline": "Tomato - Early Blight Detected",
      "explanation": "Your tomato plant shows signs of early blight, a common fungal disease. The condition is mild and treatable.",
      "next_steps": "Remove affected leaves immediately and apply fungicide treatment"
    }
  },
  "processingTimeMs": 2340
}
```

### 2. File Upload Analysis

**Endpoint:** `POST /analyze`

Analyze crop images uploaded as files using the comprehensive Gemini framework.

#### Request

- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:**
  - `image`: Image file (JPEG, PNG, GIF, BMP, WebP)
  - `plantSpecies`: Optional plant species hint
  - `useGemini`: Boolean (default: true)

#### Response

Same format as comprehensive analysis endpoint.

### 3. Test Crop Analysis

**Endpoint:** `POST /test-crop-analysis`

Test endpoint for complete crop analysis pipeline with enhanced logging.

#### Request

- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:**
  - `image`: Image file (JPEG, PNG, GIF, BMP, WebP)

#### Response

```json
{
  "success": true,
  "analysis": {
    // Same structure as comprehensive analysis
  },
  "metadata": {
    "filename": "test_image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "processingTimeMs": 2340,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Health Check

**Endpoint:** `GET /health`

Check the status of the analysis service.

#### Response

```json
{
  "status": "ok",
  "message": "Analysis service is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "geminiAnalysis": "available"
  }
}
```

### 5. Supported Formats

**Endpoint:** `GET /supported-formats`

Get supported image formats and size limits.

#### Response

```json
{
  "success": true,
  "formats": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp"
  ],
  "maxSize": "10MB",
  "recommendedSize": "1536x1536"
}
```

## Data Types

### GeminiAnalysisResponse

```typescript
interface GeminiAnalysisResponse {
  image_quality: {
    is_acceptable: boolean;
    clarity_score: number;
    issues: string[];
    retake_guidance?: string;
  };
  plant_identification: {
    common_name: string;
    scientific_name: string;
    confidence: number;
  };
  diagnoses: Array<{
    rank: number;
    condition_name: string;
    scientific_name: string;
    confidence: number;
    severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    affected_area_percent: number;
    progression_stage: 'Early' | 'Mid' | 'Advanced';
    key_symptoms: string[];
    visual_description: string;
    affected_regions: string;
  }>;
  overall_confidence: number;
  requires_expert_review: boolean;
  uncertainty_notes?: string;
  recommendations: {
    immediate: Array<{
      action: string;
      reason: string;
      expected_outcome: string;
    }>;
    short_term: Array<{
      action: string;
      reason: string;
      expected_outcome: string;
    }>;
    preventive: Array<{
      action: string;
      reason: string;
      expected_outcome: string;
    }>;
  };
  environmental_factors: {
    likely_contributors: string[];
    suggested_adjustments: string[];
  };
  differential_diagnosis: Array<{
    alternative_condition: string;
    likelihood: 'Low' | 'Medium' | 'High';
    distinguishing_features: string;
  }>;
  technical_metadata: {
    model_version: string;
    analysis_timestamp: string;
    plantvillage_class_match?: string;
  };
  user_friendly_summary: {
    headline: string;
    explanation: string;
    next_steps: string;
  };
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Image file is required"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Analysis failed: Invalid image format"
}
```

## Usage Examples

### cURL Example

```bash
# Test crop analysis
curl -X POST http://localhost:3001/api/analysis/test-crop-analysis \
  -F "image=@/path/to/crop_image.jpg"
```

### JavaScript Example

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/analysis/test-crop-analysis', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Analysis result:', result.analysis.user_friendly_summary.headline);
```

### Python Example

```python
import requests

url = 'http://localhost:3001/api/analysis/test-crop-analysis'
files = {'image': open('crop_image.jpg', 'rb')}

response = requests.post(url, files=files)
result = response.json()

print(f"Analysis: {result['analysis']['user_friendly_summary']['headline']}")
```

## Performance Targets

- **Inference latency:** ≤ 500ms median (cloud)
- **Image processing:** < 2 seconds
- **Total response time:** < 5 seconds
- **Success rate:** ≥ 95% for acceptable quality images

## Image Requirements

- **Supported formats:** JPEG, PNG, GIF, BMP, WebP
- **Maximum size:** 10MB
- **Recommended resolution:** 1536x1536 pixels
- **Quality:** Clear, well-lit images with single leaf visible
- **Background:** Clean background preferred for better analysis

## Rate Limits

Currently no rate limits are implemented. In production:
- Free tier: 10 requests/hour
- Pro tier: 100 requests/hour
- Enterprise: Custom limits

## Support

For API support and questions:
- Documentation: This file
- Issues: GitHub repository
- Email: support@leafylitics.com
