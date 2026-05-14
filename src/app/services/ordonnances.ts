import { ApiClient } from './api';

export interface Ordonnance {
  id: number;
  patient_id: number;
  content: string;
  doctor: string;
  date: string;
  created_at: string;
  updated_at?: string;
}

export interface OrdonnanceCreate {
  patient_id: number;
  content: string;
  doctor: string;
  date: string;
}

export interface OrdonnanceUpdate {
  content?: string;
  doctor?: string;
  date?: string;
}

export class OrdonnancesService extends ApiClient {
  constructor() {
    super();
  }

  async createOrdonnance(ordonnanceData: OrdonnanceCreate): Promise<Ordonnance> {
    return this.request<Ordonnance>('/api/ordonnances/', {
      method: 'POST',
      body: JSON.stringify(ordonnanceData),
    });
  }

  async getPatientOrdonnances(patientId: number): Promise<Ordonnance[]> {
    return this.request<Ordonnance[]>(`/api/ordonnances/patient/${patientId}`);
  }

  async getOrdonnance(ordonnanceId: number): Promise<Ordonnance> {
    return this.request<Ordonnance>(`/api/ordonnances/${ordonnanceId}`);
  }

  async updateOrdonnance(ordonnanceId: number, ordonnanceData: OrdonnanceUpdate): Promise<Ordonnance> {
    return this.request<Ordonnance>(`/api/ordonnances/${ordonnanceId}`, {
      method: 'PUT',
      body: JSON.stringify(ordonnanceData),
    });
  }

  async deleteOrdonnance(ordonnanceId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/ordonnances/${ordonnanceId}`, {
      method: 'DELETE',
    });
  }
}

export const ordonnancesService = new OrdonnancesService();
