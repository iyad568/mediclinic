import { api, ApiClient } from './api';

export interface Appointment {
  id: number;
  patient_id: number;
  patient_name?: string;
  phone_number?: string; // NEW: Add phone number field
  date: string; // Required field
  time: string;
  type: string;
  notes?: string;
  created_at?: string;
  day?: number; // For calendar display
  payment_amount?: number;
}

export interface AppointmentCreate {
  patient_name: string;
  phone_number: string;
  date: string; // Required field
  time: string;
  type: string;
  duration: number;
  patient_id?: number;
  payment_amount?: number;
}

export interface AppointmentUpdate {
  date?: string;
  time?: string;
  type?: string;
  notes?: string;
}

export class AppointmentsService extends ApiClient {
  constructor() {
    super();
  }

  // Get all appointments
  async getAppointments(page: number = 1, pageSize: number = 10, filters?: any) {
    return this.request('/api/appointments/all');
  }

  // Get specific appointment
  async getAppointment(id: number) {
    return this.request(`/api/appointments/${id}`);
  }

  // Create new appointment
  async createAppointment(appointmentData: AppointmentCreate) {
    return this.request('/api/appointments/create', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  // Get appointments by date
  async getAppointmentsByDate(date: string) {
    return this.request(`/api/appointments/date/${date}`);
  }

  // Update appointment
  async updateAppointment(id: number, appointmentData: AppointmentUpdate) {
    return this.request(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(appointmentData),
    });
  }

  // Delete appointment
  async deleteAppointment(id: number) {
    return this.request(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Get today's appointments
  async getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments(1, 50, { date: today });
  }

  // Get upcoming appointments
  async getUpcomingAppointments(days: number = 7) {
    const today = new Date();
    const endDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return this.getAppointments(1, 50, {
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
  }

  // Get appointments by patient
  async getPatientAppointments(patientId: number) {
    return this.getAppointments(1, 50, { patient_id: patientId });
  }
}

// Create singleton instance
export const appointmentsService = new AppointmentsService();
