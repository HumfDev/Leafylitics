// Common TypeScript definitions shared between frontend and backend

export interface User {
  id: string;
  email: string;
  subscriptionTier: 'basic' | 'pro' | 'enterprise';
  apiCreditsUsed: number;
  apiCreditsLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plant {
  id: string;
  userId: string;
  name: string;
  species?: string;
  variety?: string;
  plantingDate?: Date;
  location?: PlantLocation;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantLocation {
  latitude: number;
  longitude: number;
  address?: string;
  fieldName?: string;
}

export interface LeafAnalysis {
  id: string;
  plantId: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl: string;
  analysisResults: AnalysisResults;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processingTimeMs?: number;
  createdAt: Date;
}

export interface AnalysisResults {
  overallHealth: HealthScore;
  diseases: DiseaseDetection[];
  nutrientDeficiencies: NutrientDeficiency[];
  pestDamage: PestDamage[];
  growthStage: GrowthStage;
  recommendations: Recommendation[];
  confidence: number;
}

export interface HealthScore {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  factors: string[];
}

export interface DiseaseDetection {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  affectedArea: number; // percentage
  description: string;
  treatment: string[];
}

export interface NutrientDeficiency {
  nutrient: string;
  deficiency: 'low' | 'moderate' | 'severe';
  confidence: number;
  symptoms: string[];
  recommendations: string[];
}

export interface PestDamage {
  pest: string;
  damageType: string;
  severity: 'low' | 'medium' | 'high';
  affectedArea: number; // percentage
  treatment: string[];
}

export interface GrowthStage {
  stage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'mature';
  confidence: number;
  estimatedDaysToNext: number;
}

export interface Recommendation {
  type: 'treatment' | 'prevention' | 'nutrition' | 'environmental';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  actionItems: string[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Image Analysis types
export interface ImageUpload {
  file: File;
  plantId?: string;
  location?: PlantLocation;
  metadata?: Record<string, any>;
}

export interface ImageAnalysisRequest {
  imageUrl: string;
  plantId?: string;
  location?: PlantLocation;
  analysisType?: 'full' | 'disease' | 'nutrient' | 'pest';
  metadata?: Record<string, any>;
}

export interface ImageAnalysisResponse {
  success: boolean;
  analysisId?: string;
  results?: AnalysisResults;
  error?: string;
  processingTimeMs?: number;
}

// Plant Database types
export interface PlantSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  growthHabits: string[];
  commonDiseases: string[];
  nutrientNeeds: string[];
  optimalConditions: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    soilPh: { min: number; max: number };
  };
}

// History and Tracking types
export interface AnalysisHistory {
  id: string;
  plantId: string;
  analyses: LeafAnalysis[];
  trends: HealthTrend[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthTrend {
  metric: string;
  values: { date: Date; value: number }[];
  trend: 'improving' | 'stable' | 'declining';
  changeRate: number;
}
