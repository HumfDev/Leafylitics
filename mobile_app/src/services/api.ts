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
    
    return result;
  } catch (error) {
    console.error('❌ Analysis error:', error);
    throw error;
  }
};

export default api;

