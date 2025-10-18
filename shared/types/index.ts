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

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  currentRevisionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelRevision {
  id: string;
  projectId: string;
  parentRevisionId?: string;
  revisionNumber: number;
  freecadFileUrl?: string;
  thumbnailUrl?: string;
  isCurrent: boolean;
  createdAt: Date;
}

export interface AIPrompt {
  id: string;
  revisionId: string;
  userId: string;
  promptText: string;
  promptType: 'text' | 'sketch' | 'image';
  inputData?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processingTimeMs?: number;
  createdAt: Date;
}

export interface AIOutput {
  id: string;
  promptId: string;
  revisionId: string;
  freecadScript: string;
  executionLog: string;
  success: boolean;
  createdAt: Date;
}

export interface ModelParameter {
  id: string;
  revisionId: string;
  parameterName: string;
  parameterValue: number;
  parameterType: 'length' | 'angle' | 'count' | 'boolean';
  minValue?: number;
  maxValue?: number;
  unit?: string;
  createdAt: Date;
}

export interface Export {
  id: string;
  revisionId: string;
  userId: string;
  exportFormat: 'STL' | 'STEP' | 'IGES';
  fileUrl: string;
  fileSizeBytes: number;
  createdAt: Date;
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

// 3D Model types
export interface Model3D {
  id: string;
  name: string;
  vertices: number[];
  faces: number[];
  normals: number[];
  materials?: Material[];
  parameters: ModelParameter[];
}

export interface Material {
  id: string;
  name: string;
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
}

// CAD Generation types
export interface CADGenerationRequest {
  prompt: string;
  promptType: 'text' | 'sketch' | 'image';
  inputData?: Record<string, any>;
  projectId?: string;
  parentRevisionId?: string;
}

export interface CADGenerationResponse {
  success: boolean;
  revisionId?: string;
  modelUrl?: string;
  parameters?: ModelParameter[];
  error?: string;
  processingTimeMs?: number;
}

// Export types
export interface ExportRequest {
  revisionId: string;
  format: 'STL' | 'STEP' | 'IGES';
  quality?: 'low' | 'medium' | 'high';
}

export interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  fileSizeBytes?: number;
  error?: string;
}
