/**
 * Comprehensive Gemini AI Integration for Leaf Analysis
 * Implements detailed plant disease diagnostic framework using Gemini Vision API
 */

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
    
    // Set environment variable to use v1beta API for free tier
    process.env['GOOGLE_GENERATIVE_AI_API_VERSION'] = 'v1beta';
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro-vision',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
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

Now, analyze the provided leaf image following this framework.
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
      
      // Compress image with optimal settings for plant analysis
      const compressedBuffer = await sharp(imageBuffer)
        .resize(1024, 1024, { 
          fit: 'inside', 
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ 
          quality: 85, 
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
    try {
      console.log('🖼️ Processing image for Gemini analysis...');
      console.log('📊 Original image size:', imageBuffer.length, 'bytes');
      
      // Compress image before processing
      const compressedBuffer = await this.compressImage(imageBuffer);
      console.log('📦 Compressed image size:', compressedBuffer.length, 'bytes');
      
      // Save compressed image locally for reference
      const savedImagePath = this.saveImageLocally(compressedBuffer, filename);
      console.log(`📁 Image saved locally at: ${savedImagePath}`);
      
      // Convert compressed image buffer to base64 for Gemini API
      const base64Image = compressedBuffer.toString('base64');
      console.log('🔄 Converted image to base64, length:', base64Image.length);
      
      // Create the image part for the prompt
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: this.getMimeType(filename),
        },
      };

      console.log('🚀 Sending to Gemini API...');
      console.log('🔑 Using API Key:', process.env['GOOGLE_API_KEY'] ? 'Present' : 'Missing');
      
      // Generate content with image and prompt (include species hint if provided)
      const prompt = plantSpecies 
        ? this.ANALYSIS_PROMPT.replace(
            'Analyze the attached leaf image carefully',
            `Analyze the attached image of a **${plantSpecies}** leaf carefully`
          )
        : this.ANALYSIS_PROMPT;
      
      console.log('📝 Prompt length:', prompt.length);
      
      const result = await this.model.generateContent([
        prompt,
        imagePart,
      ]);

      const response = await result.response;
      const text = response.text();
      console.log('✅ Gemini response received, length:', text.length);
      console.log('📄 Raw response preview:', text.substring(0, 200) + '...');

      // Parse the JSON response
      const analysisResult = this.parseGeminiResponse(text);
      console.log('🧠 Parsed analysis result:', analysisResult.user_friendly_summary?.headline || 'Unknown');
      
      return analysisResult;
    } catch (error) {
      console.error('❌ Error in Gemini leaf analysis:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(`Gemini analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Gemini response text to extract structured analysis
   */
  private parseGeminiResponse(text: string): GeminiAnalysisResponse {
    try {
      console.log('🔍 Parsing Gemini response...');
      
      // Clean the response text (remove any markdown formatting)
      const cleanedText = text.trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
      
      console.log('📝 Cleaned response text:', cleanedText.substring(0, 200) + '...');
      
      // Try to parse as JSON first
      try {
        const jsonResponse = JSON.parse(cleanedText);
        console.log('✅ Successfully parsed JSON response');
        
        // The new prompt should return the exact GeminiAnalysisResponse format
        // Validate and return directly if it matches our interface
        if (this.isValidGeminiResponse(jsonResponse)) {
          return jsonResponse as GeminiAnalysisResponse;
        } else {
          // Fallback to conversion if structure doesn't match exactly
          console.log('⚠️ Response structure doesn\'t match expected format, converting...');
          return this.convertJsonToGeminiFormat(jsonResponse);
        }
      } catch (jsonError) {
        console.log('⚠️ JSON parsing failed, trying structured text parsing...');
        // Fallback to structured text parsing
        const analysis = this.parseStructuredResponse(text);
        return this.convertToJsonFormat(analysis);
      }
      
    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error);
      console.error('Raw response:', text);
      
      // Return a fallback response structure
      return this.createFallbackResponse(text);
    }
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
    return {
      image_quality: {
        is_acceptable: true,
        clarity_score: 50,
        issues: ['Response parsing failed'],
        retake_guidance: 'Unable to process response properly'
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
        key_symptoms: ['Unable to analyze'],
        visual_description: 'Analysis could not be completed due to processing error',
        affected_regions: 'Unable to determine'
      }],
      overall_confidence: 0,
      requires_expert_review: true,
      uncertainty_notes: 'Gemini response could not be parsed properly. Raw response: ' + rawText.substring(0, 200),
      recommendations: {
        immediate: [{
          action: 'Retry analysis with a different image',
          reason: 'Current analysis failed due to processing error',
          expected_outcome: 'Successful analysis and diagnosis'
        }],
        short_term: [],
        preventive: []
      },
      environmental_factors: {
        likely_contributors: [],
        suggested_adjustments: []
      },
      differential_diagnosis: [],
      technical_metadata: {
        model_version: 'leaflens-analysis-v1-fallback',
        analysis_timestamp: new Date().toISOString()
      },
      user_friendly_summary: {
        headline: 'Analysis Error',
        explanation: 'Unable to complete the analysis due to a processing error.',
        next_steps: 'Please try uploading a different image or contact support.'
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
