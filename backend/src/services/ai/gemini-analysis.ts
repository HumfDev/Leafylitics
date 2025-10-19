/**
 * Comprehensive Gemini AI Integration for Leaf Analysis
 * Implements detailed plant disease diagnostic framework using Gemini Vision API
 */

// Set API version before importing the library
process.env['GOOGLE_GENERATIVE_AI_API_VERSION'] = 'v1';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResults } from '../../types/index.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

export interface GeminiAnalysisResponse {
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

export class GeminiAnalysisService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    console.log('🔍 GeminiAnalysisService constructor - checking environment variables...');
    console.log('🔍 Available env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
    console.log('🔍 GOOGLE_API_KEY value:', process.env['GOOGLE_API_KEY'] ? 'Present' : 'Missing');
    
    const apiKey = process.env['GOOGLE_API_KEY'];
    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY not found in environment variables');
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    
    // Use gemini-2.5-flash model (latest)
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent output
        topK: 20, // Reduced for more focused responses
        topP: 0.8, // Reduced for more focused responses
        maxOutputTokens: 2048,
      }
    });
  }

  /**
   * Enhanced comprehensive leaf analysis prompt for Gemini API
   * Based on LeafLens expert plant disease diagnostic framework
   */
  private readonly ANALYSIS_PROMPT = `
You are LeafLens, an expert plant disease diagnostic AI assistant trained on the PlantVillage dataset and field observations. Analyze the provided leaf image and deliver a comprehensive health assessment.

## Analysis Framework

1. **Image Quality Assessment**
   - Evaluate image clarity, lighting, focus, and leaf visibility
   - If quality is insufficient, provide specific guidance for retaking the photo
   - Check if a single leaf is clearly visible or if multiple leaves/objects are present

2. **Primary Disease Classification**
   - Identify the plant species (common name and scientific name if possible)
   - Detect any diseases, pests, or health conditions present
   - Provide top 3 most likely diagnoses with confidence percentages
   - For each diagnosis, specify:
     * Disease/condition name (common and scientific)
     * Confidence level (0-100%)
     * Visual symptoms observed
     * Affected leaf regions (describe location and extent)

3. **Severity Assessment**
   - Estimate percentage of leaf area affected (0-100%)
   - Rate overall severity: Healthy, Mild, Moderate, Severe, Critical
   - Describe progression stage: Early, Mid, Advanced

4. **Symptom Analysis**
   - Document visible symptoms: discoloration, spots, lesions, wilting, necrosis, chlorosis, etc.
   - Describe pattern: localized, scattered, spreading, systemic
   - Note any secondary indicators: pest presence, environmental stress signs

5. **Confidence & Uncertainty**
   - Provide overall diagnostic confidence (0-100%)
   - Identify areas of uncertainty or ambiguity
   - Suggest if human expert review is recommended (for confidence <70%)
   - Flag if additional images (different angles, lighting) would improve diagnosis

6. **Actionable Recommendations**
   Provide 3-5 prioritized care actions:
   - **Immediate** (within 24 hours): Critical interventions
   - **Short-term** (within 1 week): Follow-up treatments
   - **Preventive** (ongoing): Long-term health maintenance
   - For each action, specify: what to do, why, and expected outcome

7. **Environmental Factors**
   - Suggest likely contributing factors: overwatering, humidity, temperature, nutrient deficiency
   - Recommend environmental adjustments if applicable

8. **Differential Diagnosis**
   - List alternative possible conditions that share similar symptoms
   - Explain distinguishing features that rule them in or out

## Output Format

Structure your response as JSON with the following fields:
- image_quality: { is_acceptable, clarity_score, issues, retake_guidance }
- plant_identification: { common_name, scientific_name, confidence }
- diagnoses: array of { rank, condition_name, scientific_name, confidence, severity, affected_area_percent, progression_stage, key_symptoms, visual_description, affected_regions }
- overall_confidence: number 0-100
- requires_expert_review: boolean
- uncertainty_notes: string
- recommendations: { immediate, short_term, preventive } arrays
- environmental_factors: { likely_contributors, suggested_adjustments }
- differential_diagnosis: array of { alternative_condition, likelihood, distinguishing_features }
- technical_metadata: { model_version, analysis_timestamp, plantvillage_class_match }
- user_friendly_summary: { headline, explanation, next_steps }

## Calibration Guidelines

- **High Confidence (90-100%)**: Clear, unambiguous symptoms matching known patterns
- **Moderate Confidence (70-89%)**: Likely diagnosis but some atypical features present
- **Low Confidence (50-69%)**: Multiple possible conditions, ambiguous symptoms
- **Uncertain (<50%)**: Poor image quality, rare condition, or insufficient visible symptoms

## Important Constraints

1. **Never provide definitive medical/agricultural prescriptions** - frame as observations and suggestions
2. **Be transparent about uncertainty** - it's better to flag for human review than give false confidence
3. **Prioritize actionable guidance** - focus on what users can do immediately
4. **Use empathetic, clear language** - avoid alarmist terminology
5. **Cite observable evidence** - always tie conclusions to visible symptoms
6. **Consider domain gap** - acknowledge when field conditions may differ from training data
7. **Flag safety concerns** - if plant appears to have toxic or hazardous conditions

## Context for This Analysis

- Target users: hobbyist gardeners, agronomists, researchers
- Based on PlantVillage dataset (38 classes, 14 crops, 26 diseases)
- Emphasize explainability and trust through detailed symptom descriptions
- Support both immediate care decisions and longitudinal tracking

CRITICAL: You must respond with ONLY a valid JSON object. No additional text, explanations, or formatting outside the JSON structure.

IMPORTANT: Your response must start with { and end with }. Do not include any markdown formatting, explanations, or text before or after the JSON.

EXAMPLE FORMAT (respond in exactly this structure):
{
  "image_quality": {
    "is_acceptable": true,
    "clarity_score": 85,
    "issues": [],
    "retake_guidance": null
  },
  "plant_identification": {
    "common_name": "Tomato",
    "scientific_name": "Solanum lycopersicum",
    "confidence": 88
  },
  "diagnoses": [
    {
      "rank": 1,
      "condition_name": "Early Blight",
      "scientific_name": "Alternaria solani",
      "confidence": 85,
      "severity": "Moderate",
      "affected_area_percent": 15,
      "progression_stage": "Early",
      "key_symptoms": ["Brown spots", "Yellowing leaves"],
      "visual_description": "Circular brown lesions with yellow halos",
      "affected_regions": "Lower leaves"
    }
  ],
  "overall_confidence": 85,
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
    "short_term": [],
    "preventive": []
  },
  "environmental_factors": {
    "likely_contributors": ["High humidity", "Poor air circulation"],
    "suggested_adjustments": ["Improve ventilation", "Reduce watering frequency"]
  },
  "differential_diagnosis": [],
  "technical_metadata": {
    "model_version": "leaflens-v1",
    "analysis_timestamp": "2024-01-15T10:30:00Z",
    "plantvillage_class_match": "Tomato___Early_blight"
  },
  "user_friendly_summary": {
    "headline": "Early Blight Detected",
    "explanation": "Your tomato plant shows signs of early blight disease",
    "next_steps": "Remove affected leaves and improve air circulation"
  }
}

Now, analyze the provided leaf image following this framework and respond with ONLY the JSON object in the exact format shown above.
`;

  /**
   * Compress image before sending to Gemini API
   * Optimizes image size while maintaining quality for analysis
   */
  private async compressImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      console.log('🗜️ Compressing image for Gemini API...');
      
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      console.log(`📏 Original size: ${imageBuffer.length} bytes (${metadata.width}x${metadata.height})`);
      
      // Compress image with optimal settings for detailed crop analysis
      const compressedBuffer = await sharp(imageBuffer)
        .resize(1536, 1536, { 
          fit: 'inside', 
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ 
          quality: 90, 
          progressive: true,
          mozjpeg: true
        })
        .toBuffer();
      
      console.log(`📦 Compressed size: ${compressedBuffer.length} bytes (${Math.round((1 - compressedBuffer.length / imageBuffer.length) * 100)}% reduction)`);
      
      return compressedBuffer;
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      console.log('⚠️ Using original image without compression');
      return imageBuffer;
    }
  }

  /**
   * Save image locally and return the file path
   */
  private saveImageLocally(imageBuffer: Buffer, filename: string): string {
    const uploadsDir = join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `analysis_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFilename);
    
    // Save the image
    writeFileSync(filePath, imageBuffer);
    
    return filePath;
  }

  /**
   * Analyze leaf image using comprehensive Gemini framework
   */
  async analyzeLeafImage(imageBuffer: Buffer, filename: string, plantSpecies?: string): Promise<GeminiAnalysisResponse> {
    const analysisStartTime = Date.now();
    
    try {
      console.log('🖼️ Stage 1: Image received for Gemini analysis');
      console.log('📊 Original image size:', imageBuffer.length, 'bytes');
      console.log('📄 Filename:', filename);
      console.log('🌿 Plant species hint:', plantSpecies || 'None provided');
      
      // Stage 2: Image compression
      const compressionStartTime = Date.now();
      const compressedBuffer = await this.compressImage(imageBuffer);
      const compressionTime = Date.now() - compressionStartTime;
      console.log('📦 Stage 2: Image compressed in', compressionTime, 'ms');
      console.log('📊 Compressed image size:', compressedBuffer.length, 'bytes');
      
      // Stage 3: Save image locally
      const savedImagePath = this.saveImageLocally(compressedBuffer, filename);
      console.log('📁 Stage 3: Image saved locally at:', savedImagePath);
      
      // Stage 4: Prepare for API
      const base64Image = compressedBuffer.toString('base64');
      console.log('🔄 Stage 4: Image converted to base64, length:', base64Image.length);
      
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: this.getMimeType(filename),
        },
      };

      // Stage 5: API call preparation
      console.log('🚀 Stage 5: Sending to Gemini API...');
      console.log('🔑 API Key status:', process.env['GOOGLE_API_KEY'] ? 'Present' : 'Missing');
      
      const prompt = plantSpecies 
        ? this.ANALYSIS_PROMPT.replace(
            'Analyze the provided leaf image and deliver a comprehensive health assessment.',
            `Analyze the provided **${plantSpecies}** leaf image and deliver a comprehensive health assessment.`
          )
        : this.ANALYSIS_PROMPT;
      
      console.log('📝 Prompt length:', prompt.length, 'characters');
      
      // Stage 6: API call
      console.log('🔍 Model configuration:', {
        model: 'gemini-2.5-flash',
        apiVersion: 'v1beta',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        plan: 'Free Plan'
      });
      
      const apiStartTime = Date.now();
      
      // Add system message to force JSON output
      const systemMessage = "You are a plant disease diagnostic AI. You MUST respond with ONLY valid JSON. No markdown, no explanations, no text outside the JSON structure.";
      
      // Use a natural prompt that works with Gemini's habits
      const naturalPrompt = `Analyze this plant leaf image and provide a detailed health assessment. Include:

1. Plant identification (common name and scientific name if possible)
2. Overall health status (healthy, unhealthy, or specific condition)
3. Any diseases, pests, or health issues you can identify
4. Severity level (mild, moderate, severe)
5. Specific symptoms you observe
6. Recommendations for treatment or care
7. Your confidence level in the assessment (0-100%)

Be thorough and specific in your analysis.`;

      const result = await this.model.generateContent([
        naturalPrompt,
        imagePart,
      ]);
      const apiTime = Date.now() - apiStartTime;

      const response = await result.response;
      const text = response.text();
      console.log('✅ Stage 6: Gemini API response received in', apiTime, 'ms');
      console.log('📄 Response length:', text.length, 'characters');
      console.log('📄 Raw response preview:', text.substring(0, 200) + '...');
      console.log('🔍 COMPLETE GEMINI RAW OUTPUT:');
      console.log('=' .repeat(80));
      console.log(text);
      console.log('=' .repeat(80));
      
      // Check if response starts and ends with JSON brackets
      const startsWithBrace = text.trim().startsWith('{');
      const endsWithBrace = text.trim().endsWith('}');
      console.log('🔍 JSON FORMAT CHECK:');
      console.log('  Starts with {:', startsWithBrace);
      console.log('  Ends with }:', endsWithBrace);
      console.log('  First 50 chars:', text.substring(0, 50));
      console.log('  Last 50 chars:', text.substring(Math.max(0, text.length - 50)));

      // Stage 7: Parse response
      const parseStartTime = Date.now();
      const analysisResult = this.parseGeminiResponse(text);
      const parseTime = Date.now() - parseStartTime;
      console.log('🧠 Stage 7: Response parsed in', parseTime, 'ms');
      
      // Log all analysis result fields
      console.log('🔍 COMPLETE ANALYSIS RESULT:');
      console.log('=' .repeat(80));
      console.log('📊 Overall confidence:', analysisResult.overall_confidence + '%');
      console.log('🔍 Expert review required:', analysisResult.requires_expert_review);
      console.log('❓ Uncertainty notes:', analysisResult.uncertainty_notes || 'None');
      
      console.log('\n🖼️ IMAGE QUALITY:');
      console.log('  Acceptable:', analysisResult.image_quality.is_acceptable);
      console.log('  Clarity score:', analysisResult.image_quality.clarity_score);
      console.log('  Issues:', analysisResult.image_quality.issues);
      console.log('  Retake guidance:', analysisResult.image_quality.retake_guidance || 'None');
      
      console.log('\n🌿 PLANT IDENTIFICATION:');
      console.log('  Common name:', analysisResult.plant_identification.common_name);
      console.log('  Scientific name:', analysisResult.plant_identification.scientific_name);
      console.log('  Confidence:', analysisResult.plant_identification.confidence + '%');
      
      console.log('\n🩺 DIAGNOSES:');
      analysisResult.diagnoses.forEach((diagnosis, index) => {
        console.log(`  ${index + 1}. ${diagnosis.condition_name} (${diagnosis.scientific_name})`);
        console.log(`     Confidence: ${diagnosis.confidence}%`);
        console.log(`     Severity: ${diagnosis.severity}`);
        console.log(`     Affected area: ${diagnosis.affected_area_percent}%`);
        console.log(`     Stage: ${diagnosis.progression_stage}`);
        console.log(`     Symptoms: ${diagnosis.key_symptoms.join(', ')}`);
        console.log(`     Description: ${diagnosis.visual_description}`);
        console.log(`     Regions: ${diagnosis.affected_regions}`);
        console.log('');
      });
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('  Immediate actions:');
      analysisResult.recommendations.immediate.forEach((rec, index) => {
        console.log(`    ${index + 1}. ${rec.action}`);
        console.log(`       Reason: ${rec.reason}`);
        console.log(`       Expected: ${rec.expected_outcome}`);
      });
      
      console.log('  Short-term actions:');
      analysisResult.recommendations.short_term.forEach((rec, index) => {
        console.log(`    ${index + 1}. ${rec.action}`);
        console.log(`       Reason: ${rec.reason}`);
        console.log(`       Expected: ${rec.expected_outcome}`);
      });
      
      console.log('  Preventive actions:');
      analysisResult.recommendations.preventive.forEach((rec, index) => {
        console.log(`    ${index + 1}. ${rec.action}`);
        console.log(`       Reason: ${rec.reason}`);
        console.log(`       Expected: ${rec.expected_outcome}`);
      });
      
      console.log('\n🌍 ENVIRONMENTAL FACTORS:');
      console.log('  Likely contributors:', analysisResult.environmental_factors.likely_contributors);
      console.log('  Suggested adjustments:', analysisResult.environmental_factors.suggested_adjustments);
      
      console.log('\n🔬 DIFFERENTIAL DIAGNOSIS:');
      analysisResult.differential_diagnosis.forEach((diff, index) => {
        console.log(`  ${index + 1}. ${diff.alternative_condition} (${diff.likelihood} likelihood)`);
        console.log(`     Distinguishing features: ${diff.distinguishing_features}`);
      });
      
      console.log('\n📋 TECHNICAL METADATA:');
      console.log('  Model version:', analysisResult.technical_metadata.model_version);
      console.log('  Analysis timestamp:', analysisResult.technical_metadata.analysis_timestamp);
      console.log('  PlantVillage class match:', analysisResult.technical_metadata.plantvillage_class_match || 'None');
      
      console.log('\n👤 USER FRIENDLY SUMMARY:');
      console.log('  Headline:', analysisResult.user_friendly_summary.headline);
      console.log('  Explanation:', analysisResult.user_friendly_summary.explanation);
      console.log('  Next steps:', analysisResult.user_friendly_summary.next_steps);
      
      console.log('=' .repeat(80));
      
      const totalTime = Date.now() - analysisStartTime;
      console.log('⏱️ Total analysis time:', totalTime, 'ms');
      
      return analysisResult;
    } catch (error) {
      const totalTime = Date.now() - analysisStartTime;
      console.error('❌ Error in Gemini leaf analysis after', totalTime, 'ms:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        filename: filename,
        plantSpecies: plantSpecies || 'None'
      });
      throw new Error(`Gemini analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Gemini response text to extract structured analysis
   * Works with Gemini's natural response patterns
   */
  private parseGeminiResponse(text: string): GeminiAnalysisResponse {
    try {
      console.log('🔍 Parsing Gemini response using natural language patterns...');
      console.log('📝 Response length:', text.length, 'characters');
      
      // First try JSON parsing
      const jsonResult = this.tryJsonParsing(text);
      if (jsonResult) {
        return jsonResult;
      }
      
      // If no JSON, parse natural language response
      console.log('📝 Parsing as natural language response...');
      return this.parseNaturalLanguageResponse(text);
      
    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error);
      console.error('Raw response:', text);
      return this.createFallbackResponse(text);
    }
  }

  /**
   * Try to parse response as JSON
   */
  private tryJsonParsing(text: string): GeminiAnalysisResponse | null {
    try {
      // Clean the response text
      const cleanedText = text.trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
      
      const jsonResponse = JSON.parse(cleanedText);
      console.log('✅ Successfully parsed JSON response');
      
      if (this.isValidGeminiResponse(jsonResponse)) {
        return jsonResponse as GeminiAnalysisResponse;
      } else {
        return this.convertJsonToGeminiFormat(jsonResponse);
      }
    } catch (error) {
      // Try to extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully extracted JSON from response');
          if (this.isValidGeminiResponse(extractedJson)) {
            return extractedJson as GeminiAnalysisResponse;
          } else {
            return this.convertJsonToGeminiFormat(extractedJson);
          }
        } catch (extractError) {
          console.log('⚠️ JSON extraction failed:', extractError.message);
        }
      }
      return null;
    }
  }

  /**
   * Parse natural language response from Gemini
   */
  private parseNaturalLanguageResponse(text: string): GeminiAnalysisResponse {
    console.log('🔍 Parsing natural language response...');
    
    // Extract information using regex patterns
    const plantInfo = this.extractPlantIdentification(text);
    const healthInfo = this.extractHealthStatus(text);
    const diagnoses = this.extractDiagnoses(text);
    const recommendations = this.extractRecommendations(text);
    const confidence = this.extractConfidence(text);
    
    console.log('📊 Extracted information:');
    console.log('  Plant:', plantInfo.common_name);
    console.log('  Health:', healthInfo.status);
    console.log('  Diagnoses:', diagnoses.length);
    console.log('  Confidence:', confidence);
    
    return {
      image_quality: {
        is_acceptable: true,
        clarity_score: 85,
        issues: [],
        retake_guidance: undefined
      },
      plant_identification: plantInfo,
      diagnoses: diagnoses,
      overall_confidence: confidence,
      requires_expert_review: confidence < 70,
      uncertainty_notes: confidence < 70 ? "Low confidence - expert review recommended" : undefined,
      recommendations: recommendations,
      environmental_factors: {
        likely_contributors: [],
        suggested_adjustments: []
      },
      differential_diagnosis: [],
      technical_metadata: {
        model_version: "leaflens-natural-parser-v1",
        analysis_timestamp: new Date().toISOString(),
        plantvillage_class_match: undefined
      },
      user_friendly_summary: {
        headline: healthInfo.status === 'healthy' ? 'Healthy Plant' : 'Plant Health Issues Detected',
        explanation: healthInfo.description || 'Plant analysis completed',
        next_steps: recommendations.immediate.map(r => r.action).join('; ')
      }
    };
  }

  /**
   * Extract plant identification from text
   */
  private extractPlantIdentification(text: string): { common_name: string; scientific_name: string; confidence: number } {
    // Look for plant names in various patterns
    const patterns = [
      /(?:plant|leaf|specimen).*?(?:is|appears to be|looks like).*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:identified|recognized).*?as.*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:this|the).*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*).*?(?:plant|leaf)/i
    ];
    
    let commonName = "Plant";
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        commonName = match[1];
        break;
      }
    }
    
    // Look for scientific names (italicized or in parentheses)
    const scientificPattern = /(?:scientific name|binomial|latin name).*?([A-Z][a-z]+\s+[a-z]+)/i;
    const scientificMatch = text.match(scientificPattern);
    const scientificName = scientificMatch ? scientificMatch[1] : "Unknown species";
    
    return {
      common_name: commonName,
      scientific_name: scientificName,
      confidence: 75
    };
  }

  /**
   * Extract health status from text
   */
  private extractHealthStatus(text: string): { status: string; description: string } {
    const healthyPatterns = [
      /(?:healthy|good condition|no issues|appears healthy)/i,
      /(?:no signs of disease|no visible problems)/i
    ];
    
    const unhealthyPatterns = [
      /(?:unhealthy|diseased|infected|damaged)/i,
      /(?:shows signs of|appears to have|suffering from)/i
    ];
    
    let status = "unknown";
    let description = "";
    
    if (healthyPatterns.some(pattern => pattern.test(text))) {
      status = "healthy";
      description = "The plant appears to be in good health with no visible issues.";
    } else if (unhealthyPatterns.some(pattern => pattern.test(text))) {
      status = "unhealthy";
      description = "The plant shows signs of health issues that require attention.";
    } else {
      status = "unknown";
      description = "Unable to determine plant health status from the image.";
    }
    
    return { status, description };
  }

  /**
   * Extract diagnoses from text
   */
  private extractDiagnoses(text: string): Array<{
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
  }> {
    const diagnoses: any[] = [];
    
    // Look for disease mentions
    const diseasePatterns = [
      /(?:disease|infection|blight|rust|mildew|spot|rot|wilt|scorch)/gi
    ];
    
    const diseaseMatches = text.match(/(?:disease|infection|blight|rust|mildew|spot|rot|wilt|scorch)/gi);
    if (diseaseMatches) {
      const uniqueDiseases = [...new Set(diseaseMatches)];
      uniqueDiseases.forEach((disease, index) => {
        diagnoses.push({
          rank: index + 1,
          condition_name: disease.charAt(0).toUpperCase() + disease.slice(1),
          scientific_name: disease,
          confidence: 70,
          severity: 'Moderate' as const,
          affected_area_percent: 20,
          progression_stage: 'Early' as const,
          key_symptoms: [disease],
          visual_description: `Signs of ${disease} detected`,
          affected_regions: "Leaf surface"
        });
      });
    }
    
    return diagnoses;
  }

  /**
   * Extract recommendations from text
   */
  private extractRecommendations(text: string): {
    immediate: Array<{ action: string; reason: string; expected_outcome: string }>;
    short_term: Array<{ action: string; reason: string; expected_outcome: string }>;
    preventive: Array<{ action: string; reason: string; expected_outcome: string }>;
  } {
    const recommendations = {
      immediate: [] as Array<{ action: string; reason: string; expected_outcome: string }>,
      short_term: [] as Array<{ action: string; reason: string; expected_outcome: string }>,
      preventive: [] as Array<{ action: string; reason: string; expected_outcome: string }>
    };
    
    // Look for recommendation patterns
    const recPatterns = [
      /(?:recommend|suggest|advise|should|need to)/gi
    ];
    
    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (/(?:recommend|suggest|advise|should|need to)/i.test(sentence)) {
        const action = sentence.trim();
        if (action.length > 10) {
          recommendations.immediate.push({
            action: action,
            reason: "Based on visual analysis",
            expected_outcome: "Improved plant health"
          });
        }
      }
    });
    
    return recommendations;
  }

  /**
   * Extract confidence level from text
   */
  private extractConfidence(text: string): number {
    const confidencePatterns = [
      /(?:confidence|certainty).*?(\d+)%/i,
      /(\d+)%.*?(?:confidence|certainty)/i,
      /(?:high|medium|low).*?(?:confidence|certainty)/i
    ];
    
    for (const pattern of confidencePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[1]) {
          return parseInt(match[1]);
        } else if (match[0].toLowerCase().includes('high')) {
          return 85;
        } else if (match[0].toLowerCase().includes('medium')) {
          return 65;
        } else if (match[0].toLowerCase().includes('low')) {
          return 45;
        }
      }
    }
    
    return 75; // Default confidence
  }

  /**
   * Validate if the JSON response matches the expected GeminiAnalysisResponse format
   */
  private isValidGeminiResponse(response: any): boolean {
    try {
      return (
        response &&
        typeof response === 'object' &&
        response.image_quality &&
        response.plant_identification &&
        response.diagnoses &&
        Array.isArray(response.diagnoses) &&
        response.overall_confidence !== undefined &&
        response.recommendations &&
        response.environmental_factors &&
        response.user_friendly_summary
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert JSON response to GeminiAnalysisResponse format
   */
  private convertJsonToGeminiFormat(jsonResponse: any): GeminiAnalysisResponse {
    const now = new Date().toISOString();
    
    // Map the JSON response to our expected format
    const diagnoses = (jsonResponse.diseases_detected || []).map((disease: any, index: number) => ({
      rank: index + 1,
      condition_name: disease.name || 'Unknown Disease',
      scientific_name: disease.name || 'Unknown Disease',
      confidence: disease.confidence || 0,
      severity: this.mapSeverityFromJson(disease.severity),
      affected_area_percent: Math.min(disease.confidence || 0, 100),
      progression_stage: this.determineProgressionStage(disease.confidence || 0),
      key_symptoms: disease.symptoms || [],
      visual_description: disease.description || 'No description available',
      affected_regions: "Leaf surface"
    }));

    // Create recommendations from the JSON response
    const recommendations = {
      immediate: (jsonResponse.recommended_treatment || []).slice(0, 2).map((action: string) => ({
        action,
        reason: "Based on visual analysis",
        expected_outcome: "Improved plant health"
      })),
      short_term: (jsonResponse.recommended_treatment || []).slice(2, 4).map((action: string) => ({
        action,
        reason: "Follow-up care",
        expected_outcome: "Long-term plant health"
      })),
      preventive: (jsonResponse.preventive_measures || []).map((action: string) => ({
        action,
        reason: "Preventive measures",
        expected_outcome: "Disease prevention"
      }))
    };

    return {
      image_quality: {
        is_acceptable: true,
        clarity_score: 85,
        issues: [],
        retake_guidance: undefined
      },
      plant_identification: {
        common_name: "Plant",
        scientific_name: "Unknown species",
        confidence: 70
      },
      diagnoses,
      overall_confidence: parseInt(jsonResponse.confidence) || 0,
      requires_expert_review: (parseInt(jsonResponse.confidence) || 0) < 70,
      uncertainty_notes: (parseInt(jsonResponse.confidence) || 0) < 70 ? "Low confidence - expert review recommended" : undefined,
      recommendations,
      environmental_factors: {
        likely_contributors: (jsonResponse.environmental_stress || []).map((stress: any) => stress.type),
        suggested_adjustments: (jsonResponse.environmental_stress || []).map((stress: any) => stress.recommendation)
      },
      differential_diagnosis: [],
      technical_metadata: {
        model_version: "leaflens-analysis-v1",
        analysis_timestamp: now,
        plantvillage_class_match: undefined
      },
      user_friendly_summary: {
        headline: jsonResponse.health_status === 'Healthy' ? 'Healthy Plant' : 'Plant Health Issues Detected',
        explanation: jsonResponse.overall_assessment || 'Plant analysis completed',
        next_steps: (jsonResponse.recommended_treatment || []).slice(0, 3).join("; ")
      }
    };
  }

  /**
   * Map severity from JSON format to our expected format
   */
  private mapSeverityFromJson(severity: string): 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'Critical' {
    const mapping: { [key: string]: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'Critical' } = {
      'Mild': 'Mild',
      'Moderate': 'Moderate',
      'Severe': 'Severe',
      'Critical': 'Critical'
    };
    return mapping[severity] || 'Healthy';
  }

  /**
   * Parse the structured text response into organized sections
   */
  private parseStructuredResponse(text: string): any {
    const sections = {
      overallHealth: this.extractOverallHealth(text),
      diseases: this.extractDiseases(text),
      nutrientDeficiencies: this.extractNutrientDeficiencies(text),
      pestDamage: this.extractPestDamage(text),
      environmentalStress: this.extractEnvironmentalStress(text),
      recommendedActions: this.extractRecommendedActions(text)
    };
    
    return sections;
  }

  /**
   * Extract overall health assessment
   */
  private extractOverallHealth(text: string): any {
    const healthMatch = text.match(/\*\*Overall Health:\*\*\s*(\d+)\s*[-\s]*(.+?)(?=\*\*|$)/s);
    if (healthMatch) {
      return {
        score: parseInt(healthMatch[1]),
        explanation: healthMatch[2].trim()
      };
    }
    return { score: 50, explanation: "Unable to assess health from image" };
  }

  /**
   * Extract disease information
   */
  private extractDiseases(text: string): any[] {
    const diseases: any[] = [];
    const diseaseSection = text.match(/\*\*Diseases Detected:\*\*([\s\S]*?)(?=\*\*|$)/);
    
    if (diseaseSection) {
      const diseaseText = diseaseSection[1];
      const diseaseMatches = diseaseText.match(/\*\s*([^—]+)—\s*(\d+)%/g);
      
      if (diseaseMatches) {
        diseaseMatches.forEach(match => {
          const parts = match.match(/\*\s*([^—]+)—\s*(\d+)%/);
          if (parts) {
            diseases.push({
              name: parts[1].trim(),
              confidence: parseInt(parts[2])
            });
          }
        });
      }
    }
    
    return diseases;
  }

  /**
   * Extract nutrient deficiency information
   */
  private extractNutrientDeficiencies(text: string): any[] {
    const deficiencies: any[] = [];
    const deficiencySection = text.match(/\*\*Nutrient Deficiencies:\*\*([\s\S]*?)(?=\*\*|$)/);
    
    if (deficiencySection) {
      const deficiencyText = deficiencySection[1];
      const deficiencyMatches = deficiencyText.match(/\*\s*([^—]+)—\s*(\d+)%/g);
      
      if (deficiencyMatches) {
        deficiencyMatches.forEach(match => {
          const parts = match.match(/\*\s*([^—]+)—\s*(\d+)%/);
          if (parts) {
            deficiencies.push({
              element: parts[1].trim(),
              confidence: parseInt(parts[2])
            });
          }
        });
      }
    }
    
    return deficiencies;
  }

  /**
   * Extract pest damage information
   */
  private extractPestDamage(text: string): any[] {
    const pests: any[] = [];
    const pestSection = text.match(/\*\*Pest Damage:\*\*([\s\S]*?)(?=\*\*|$)/);
    
    if (pestSection) {
      const pestText = pestSection[1];
      const pestMatches = pestText.match(/\*\s*([^—]+)—\s*(\d+)%/g);
      
      if (pestMatches) {
        pestMatches.forEach(match => {
          const parts = match.match(/\*\s*([^—]+)—\s*(\d+)%/);
          if (parts) {
            pests.push({
              pestType: parts[1].trim(),
              confidence: parseInt(parts[2])
            });
          }
        });
      }
    }
    
    return pests;
  }

  /**
   * Extract environmental stress information
   */
  private extractEnvironmentalStress(text: string): any[] {
    const stress: any[] = [];
    const stressSection = text.match(/\*\*Environmental Stress:\*\*([\s\S]*?)(?=\*\*|$)/);
    
    if (stressSection) {
      const stressText = stressSection[1];
      const stressMatches = stressText.match(/\*\s*([^—]+)—\s*(\d+)%/g);
      
      if (stressMatches) {
        stressMatches.forEach(match => {
          const parts = match.match(/\*\s*([^—]+)—\s*(\d+)%/);
          if (parts) {
            stress.push({
              type: parts[1].trim(),
              confidence: parseInt(parts[2])
            });
          }
        });
      }
    }
    
    return stress;
  }

  /**
   * Extract recommended actions
   */
  private extractRecommendedActions(text: string): string[] {
    const actions: string[] = [];
    const actionSection = text.match(/\*\*Top 3 Recommended Actions:\*\*([\s\S]*?)(?=\*\*|$)/);
    
    if (actionSection) {
      const actionText = actionSection[1];
      const actionMatches = actionText.match(/\d+\.\s*([^\n]+)/g);
      
      if (actionMatches) {
        actionMatches.forEach(match => {
          const action = match.replace(/^\d+\.\s*/, '').trim();
          if (action) {
            actions.push(action);
          }
        });
      }
    }
    
    return actions;
  }

  /**
   * Convert structured analysis to JSON format
   */
  private convertToJsonFormat(analysis: any): GeminiAnalysisResponse {
    const now = new Date().toISOString();
    
    // Calculate overall confidence based on individual assessments
    const allConfidences = [
      ...analysis.diseases.map((d: any) => d.confidence),
      ...analysis.nutrientDeficiencies.map((d: any) => d.confidence),
      ...analysis.pestDamage.map((p: any) => p.confidence),
      ...analysis.environmentalStress.map((s: any) => s.confidence)
    ];
    
    const overallConfidence = allConfidences.length > 0 
      ? Math.round(allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length)
      : 85;

    // Create diagnoses array
    const diagnoses = analysis.diseases.map((disease: any, index: number) => ({
      rank: index + 1,
      condition_name: disease.name,
      scientific_name: disease.name,
      confidence: disease.confidence,
      severity: this.determineSeverity(disease.confidence),
      affected_area_percent: Math.min(disease.confidence, 100),
      progression_stage: this.determineProgressionStage(disease.confidence),
      key_symptoms: [disease.name],
      visual_description: `Detected ${disease.name} with ${disease.confidence}% confidence`,
      affected_regions: "Leaf surface"
    }));

    // Create recommendations
    const recommendations = {
      immediate: analysis.recommendedActions.slice(0, 2).map((action: string) => ({
        action,
        reason: "Based on visual analysis",
        expected_outcome: "Improved plant health"
      })),
      short_term: analysis.recommendedActions.slice(2, 4).map((action: string) => ({
        action,
        reason: "Follow-up care",
        expected_outcome: "Long-term plant health"
      })),
      preventive: analysis.recommendedActions.slice(4).map((action: string) => ({
        action,
        reason: "Preventive measures",
        expected_outcome: "Disease prevention"
      }))
    };

    return {
      image_quality: {
        is_acceptable: true,
        clarity_score: 85,
        issues: [],
        retake_guidance: undefined
      },
      plant_identification: {
        common_name: "Plant",
        scientific_name: "Unknown species",
        confidence: 70
      },
      diagnoses,
      overall_confidence: overallConfidence,
      requires_expert_review: overallConfidence < 70,
      uncertainty_notes: overallConfidence < 70 ? "Low confidence - expert review recommended" : undefined,
      recommendations,
      environmental_factors: {
        likely_contributors: analysis.environmentalStress.map((s: any) => s.type),
        suggested_adjustments: analysis.environmentalStress.map((s: any) => `Address ${s.type}`)
      },
      differential_diagnosis: [],
      technical_metadata: {
        model_version: "leaflens-analysis-v1",
        analysis_timestamp: now,
        plantvillage_class_match: undefined
      },
      user_friendly_summary: {
        headline: analysis.overallHealth.score >= 80 ? "Healthy Plant" : "Plant Health Issues Detected",
        explanation: analysis.overallHealth.explanation,
        next_steps: analysis.recommendedActions.slice(0, 3).join("; ")
      }
    };
  }

  /**
   * Determine severity based on confidence
   */
  private determineSeverity(confidence: number): 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'Critical' {
    if (confidence < 20) return 'Healthy';
    if (confidence < 40) return 'Mild';
    if (confidence < 60) return 'Moderate';
    if (confidence < 80) return 'Severe';
    return 'Critical';
  }

  /**
   * Determine progression stage based on confidence
   */
  private determineProgressionStage(confidence: number): 'Early' | 'Mid' | 'Advanced' {
    if (confidence < 40) return 'Early';
    if (confidence < 70) return 'Mid';
    return 'Advanced';
  }

  /**
   * Create fallback response when JSON parsing fails
   */
  private createFallbackResponse(rawText: string): GeminiAnalysisResponse {
    console.log('🚨 Creating fallback response due to parsing failure');
    console.log('📝 Raw response that failed to parse:', rawText);
    
    return {
      image_quality: {
        is_acceptable: false,
        clarity_score: 0,
        issues: ['Response parsing failed', 'Unable to process AI response'],
        retake_guidance: 'Please try uploading a clearer image or contact support if the issue persists'
      },
      plant_identification: {
        common_name: 'Unknown Plant',
        scientific_name: 'Unknown species',
        confidence: 0
      },
      diagnoses: [{
        rank: 1,
        condition_name: 'Analysis Error',
        scientific_name: 'Processing failed',
        confidence: 0,
        severity: 'Healthy' as const,
        affected_area_percent: 0,
        progression_stage: 'Early' as const,
        key_symptoms: ['Unable to analyze due to parsing error'],
        visual_description: 'Analysis could not be completed due to AI response parsing error',
        affected_regions: 'Unable to determine'
      }],
      overall_confidence: 0,
      requires_expert_review: true,
      uncertainty_notes: `AI response parsing failed. This may be due to unexpected response format from Gemini. Raw response preview: ${rawText.substring(0, 300)}...`,
      recommendations: {
        immediate: [{
          action: 'Retry analysis with a different image',
          reason: 'Current analysis failed due to AI response parsing error',
          expected_outcome: 'Successful analysis and diagnosis'
        }, {
          action: 'Check image quality and try again',
          reason: 'Poor image quality may cause parsing issues',
          expected_outcome: 'Better AI response that can be parsed correctly'
        }],
        short_term: [{
          action: 'Contact support if issue persists',
          reason: 'Persistent parsing errors may indicate a system issue',
          expected_outcome: 'Technical support and resolution'
        }],
        preventive: []
      },
      environmental_factors: {
        likely_contributors: ['Technical processing error'],
        suggested_adjustments: ['Ensure stable internet connection', 'Try with different image format']
      },
      differential_diagnosis: [],
      technical_metadata: {
        model_version: 'leaflens-analysis-v1-fallback',
        analysis_timestamp: new Date().toISOString(),
        plantvillage_class_match: 'parsing_error'
      },
      user_friendly_summary: {
        headline: 'Analysis Temporarily Unavailable',
        explanation: 'We encountered a technical issue while processing your image. This is likely a temporary problem.',
        next_steps: 'Please try uploading the image again, or try with a different image if the problem persists.'
      }
    };
  }

  /**
   * Get MIME type from filename
   */
  private getMimeType(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'bmp': 'image/bmp'
    };
    return mimeTypes[extension || ''] || 'image/jpeg';
  }

  /**
   * Convert Gemini response to legacy AnalysisResults format for compatibility
   */
  convertToLegacyFormat(geminiResponse: GeminiAnalysisResponse): AnalysisResults {
    const primaryDiagnosis = geminiResponse.diagnoses[0];
    
    return {
      overallHealth: {
        score: 100 - (primaryDiagnosis?.affected_area_percent || 0),
        level: this.mapSeverityToHealthLevel(primaryDiagnosis?.severity || 'Healthy'),
        factors: []
      },
      diseases: geminiResponse.diagnoses.map(d => ({
        disease: d.condition_name,
        confidence: d.confidence / 100,
        severity: this.mapSeverityToLegacy(d.severity),
        affectedArea: d.affected_area_percent,
        description: d.visual_description,
        treatment: d.key_symptoms
      })),
      nutrientDeficiencies: [],
      pestDamage: [],
      growthStage: {
        stage: 'vegetative',
        confidence: 0.8,
        estimatedDaysToNext: 30
      },
      recommendations: [
        ...geminiResponse.recommendations.immediate.map(r => ({
          type: 'treatment' as const,
          priority: 'urgent' as const,
          title: r.action,
          description: r.reason,
          actionItems: [r.action]
        })),
        ...geminiResponse.recommendations.short_term.map(r => ({
          type: 'treatment' as const,
          priority: 'high' as const,
          title: r.action,
          description: r.reason,
          actionItems: [r.action]
        })),
        ...geminiResponse.recommendations.preventive.map(r => ({
          type: 'prevention' as const,
          priority: 'medium' as const,
          title: r.action,
          description: r.reason,
          actionItems: [r.action]
        }))
      ],
      confidence: geminiResponse.overall_confidence / 100
    };
  }

  /**
   * Map Gemini severity to legacy health level
   */
  private mapSeverityToHealthLevel(severity: string): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const mapping: { [key: string]: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' } = {
      'Healthy': 'excellent',
      'Mild': 'good',
      'Moderate': 'fair',
      'Severe': 'poor',
      'Critical': 'critical'
    };
    return mapping[severity] || 'fair';
  }

  /**
   * Map Gemini severity to legacy severity format
   */
  private mapSeverityToLegacy(severity: string): 'low' | 'medium' | 'high' {
    const mapping: { [key: string]: 'low' | 'medium' | 'high' } = {
      'Healthy': 'low',
      'Mild': 'low',
      'Moderate': 'medium',
      'Severe': 'high',
      'Critical': 'high'
    };
    return mapping[severity] || 'low';
  }
}
