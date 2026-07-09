import api from './api';

export interface BackendMeasurement {
  id: string;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
  neck: number;
  arms: number | null;
  height: number | null;
  weight: number | null;
  size: string;
  confidence: number;
  qualityScore: string;
  isDefault: boolean;
  createdAt: string;
}

export interface BackendScan {
  id: string;
  frontPhotoUrl: string;
  sidePhotoUrl: string | null;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
  neck: number;
  arms: number | null;
  size: string;
  confidence: number;
  qualityScore: string;
  createdAt: string;
}

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  profileImage: string | null;
}

// ============ Auth ============

export async function verifyAuthToken(name?: string): Promise<{ user: BackendUser }> {
  const response = await api.post('/api/auth/verify', { name });
  return response.data;
}

// ============ User Profile ============

export async function getUserProfile(): Promise<{ user: BackendUser }> {
  const response = await api.get('/api/user/profile');
  return response.data;
}

export async function updateUserProfile(data: {
  name?: string;
  phone?: string;
  gender?: string;
  height?: number;
  weight?: number;
  age?: number;
  profileImage?: string;
}): Promise<{ user: BackendUser }> {
  const response = await api.put('/api/user/profile', data);
  return response.data;
}

// ============ Measurements ============

export async function getMeasurements(): Promise<{ measurements: BackendMeasurement[] }> {
  const response = await api.get('/api/measurements');
  return response.data;
}

export async function getDefaultMeasurement(): Promise<{ measurement: BackendMeasurement | null }> {
  const response = await api.get('/api/measurements/default');
  return response.data;
}

export async function createMeasurement(data: {
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
  neck: number;
  arms?: number;
  height?: number;
  weight?: number;
  size: string;
  confidence: number;
  qualityScore: string;
  isDefault?: boolean;
}): Promise<{ measurement: BackendMeasurement }> {
  const response = await api.post('/api/measurements', data);
  return response.data;
}

export async function updateMeasurement(
  id: string,
  data: Partial<{
    chest: number;
    waist: number;
    hips: number;
    shoulder: number;
    inseam: number;
    neck: number;
    arms: number;
    size: string;
    confidence: number;
    qualityScore: string;
    isDefault: boolean;
  }>
): Promise<{ measurement: BackendMeasurement }> {
  const response = await api.put(`/api/measurements/${id}`, data);
  return response.data;
}

export async function deleteMeasurement(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/api/measurements/${id}`);
  return response.data;
}

// ============ Scan ============

export async function processScan(data: {
  frontPhotoUrl: string;
  sidePhotoUrl?: string;
  userHeight?: number;
  userWeight?: number;
}): Promise<{ scan: BackendScan; measurement: BackendMeasurement; message: string; fallback?: boolean }> {
  const response = await api.post('/api/scan/process', data);
  return response.data;
}

export async function getScanHistory(): Promise<{ scans: BackendScan[] }> {
  const response = await api.get('/api/scan/history');
  return response.data;
}

export async function deleteScan(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/api/scan/${id}`);
  return response.data;
}

// ============ Upload ============

export async function getPresignedUrl(fileName: string, fileType: string): Promise<{
  uploadUrl: string;
  key: string;
  fileUrl: string;
}> {
  const response = await api.post('/api/upload/presigned-url', { fileName, fileType });
  return response.data;
}

export async function uploadPhotoDirectly(
  file: FormData
): Promise<{ url: string; key: string; message: string }> {
  const response = await api.post('/api/upload/photo', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
