/**
 * API Client
 */

import axios from 'axios';

import { Platform } from 'react-native';

// Dynamic API URL based on platform
const getApiBaseUrl = () => {
  // For development - use your computer's local IP address
  const LOCAL_IP = '10.19.146.211';
  
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine
    return `http://10.0.2.2:3001`;
  } else {
    // iOS simulator and physical devices use your computer's IP
    return `http://${LOCAL_IP}:3001`;
  }
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getApiBaseUrl();

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  // TODO: Add JWT token from async storage
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Analysis result interface - matches backend response structure
export interface AnalysisResult {
  success: boolean;
  analysisId: string;
  results: {
    image_quality: {
      is_acceptable: boolean;
      clarity_score: number;
      issues: string;
      retake_guidance: string;
    };
    plant_identification: {
      common_name: string;
      scientific_name: string;
      confidence: number;
    };
    diagnoses: Array<{
      rank?: number;
      condition_name?: string;
      scientific_name?: string;
      confidence?: number;
      severity?: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' | 'Critical';
      affected_area_percent?: number;
      progression_stage?: 'Early' | 'Mid' | 'Advanced';
      key_symptoms?: string[];
      visual_description?: string;
      affected_regions?: string;
    }>;
    overall_confidence: number;
    requires_expert_review: boolean;
    uncertainty_notes?: string;
    recommendations: {
      immediate: string[];
      short_term: string[];
      preventive: string[];
    };
    environmental_factors: {
      likely_contributors: string[];
      suggested_adjustments: string[];
    };
    differential_diagnosis: Array<{
      condition_name?: string;
      confidence?: number;
      distinguishing_features?: string;
    }>;
    technical_metadata: {
      model_version: string;
      analysis_timestamp: string;
      plantvillage_class_match: string;
    };
    user_friendly_summary: {
      headline: string;
      explanation: string;
      next_steps: string;
    };
  };
  processingTimeMs: number;
  metadata: {
    analysisType: string;
    timestamp: string;
  };
}

// API methods
export const analyzeImage = async (imageUri: string): Promise<AnalysisResult> => {
  try {
    console.log('📸 Starting image analysis...', imageUri);
    
    // Read the image file and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Convert to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix if present
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    const base64Image = await base64Promise;
    console.log('📦 Image converted to base64, length:', base64Image.length);

    // Call the comprehensive analysis endpoint
    const endpoint = '/api/analysis/comprehensive';
    console.log('📡 Calling API at:', API_BASE_URL + endpoint);
    console.log('🚀 Sending to backend API...');
    const apiResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        mimeType: 'image/jpeg',
      }),
    });

    console.log('📨 Response status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API request failed: ${apiResponse.status} - ${errorText}`);
    }

    const result: AnalysisResult = await apiResponse.json();
    console.log('✅ Analysis complete:', result.results.user_friendly_summary.headline);
    
    // Log the raw response to see what we're getting
    console.log('🔍 RAW BACKEND RESPONSE:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('=' .repeat(60));
    
    // Log specific properties to see what's actually returned
    console.log('🔍 RESPONSE PROPERTIES ANALYSIS:');
    console.log('=' .repeat(60));
    console.log('📊 Top level keys:', Object.keys(result));
    console.log('📊 Results keys:', Object.keys(result.results || {}));
    console.log('📊 Image quality keys:', Object.keys(result.results?.image_quality || {}));
    console.log('📊 Plant identification keys:', Object.keys(result.results?.plant_identification || {}));
    console.log('📊 Diagnoses array length:', result.results?.diagnoses?.length || 0);
    console.log('📊 Recommendations keys:', Object.keys(result.results?.recommendations || {}));
    console.log('📊 User summary keys:', Object.keys(result.results?.user_friendly_summary || {}));
    
    // Show actual values of key properties
    console.log('\n🔍 KEY VALUES:');
    console.log('  Overall confidence:', result.results?.overall_confidence);
    console.log('  Expert review required:', result.results?.requires_expert_review);
    console.log('  Uncertainty notes:', result.results?.uncertainty_notes);
    console.log('  Image acceptable:', result.results?.image_quality?.is_acceptable);
    console.log('  Plant common name:', result.results?.plant_identification?.common_name);
    console.log('  Plant scientific name:', result.results?.plant_identification?.scientific_name);
    console.log('  Number of diagnoses:', result.results?.diagnoses?.length || 0);
    console.log('  Immediate recommendations:', result.results?.recommendations?.immediate?.length || 0);
    console.log('  Headline:', result.results?.user_friendly_summary?.headline);
    console.log('  Explanation:', result.results?.user_friendly_summary?.explanation);
    console.log('=' .repeat(60));
    
    // Log detailed analysis results for debugging
    console.log('🔍 DETAILED ANALYSIS RESULTS:');
    console.log('=' .repeat(60));
    console.log('📊 Overall confidence:', result.results.overall_confidence + '%');
    console.log('🔍 Expert review required:', result.results.requires_expert_review);
    console.log('❓ Uncertainty notes:', result.results.uncertainty_notes || 'None');
    
    console.log('\n🖼️ IMAGE QUALITY:');
    console.log('  Acceptable:', result.results.image_quality.is_acceptable);
    console.log('  Clarity score:', result.results.image_quality.clarity_score);
    console.log('  Issues:', result.results.image_quality.issues);
    
    console.log('\n🌿 PLANT IDENTIFICATION:');
    console.log('  Common name:', result.results.plant_identification.common_name);
    console.log('  Scientific name:', result.results.plant_identification.scientific_name);
    console.log('  Confidence:', result.results.plant_identification.confidence + '%');
    
    console.log('\n🩺 DIAGNOSES:');
    result.results.diagnoses.forEach((diagnosis, index) => {
      console.log(`  ${index + 1}. ${diagnosis.condition_name} (${diagnosis.scientific_name})`);
      console.log(`     Confidence: ${diagnosis.confidence}%`);
      console.log(`     Severity: ${diagnosis.severity}`);
      console.log(`     Affected area: ${diagnosis.affected_area_percent}%`);
      console.log(`     Symptoms: ${diagnosis.key_symptoms.join(', ')}`);
      console.log('');
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('  Immediate actions:', result.results.recommendations.immediate.length);
    result.results.recommendations.immediate.forEach((rec, index) => {
      console.log(`    ${index + 1}. ${rec.action}`);
    });
    
    console.log('\n👤 USER SUMMARY:');
    console.log('  Headline:', result.results.user_friendly_summary.headline);
    console.log('  Explanation:', result.results.user_friendly_summary.explanation);
    console.log('  Next steps:', result.results.user_friendly_summary.next_steps);
    
    console.log('=' .repeat(60));
    
    return result;
  } catch (error) {
    console.error('❌ Analysis error:', error);
    throw error;
  }
};

export default api;

