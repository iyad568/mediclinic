import Database from 'better-sqlite3';
import path from 'path';

// TypeScript interfaces
interface Patient {
  id: number;
  full_name: string;
  email?: string;
  phone_number: string;
  date_of_birth?: string;
  address?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: number;
  patient_id?: number;
  patient: string;
  phone_number: string;
  date: string;
  time: string;
  type: string;
  duration: number;
  payment_amount: number;
  status: string;
  created_at: string;
}

// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && (window as any).process && (window as any).process.type;

let db: Database.Database | null = null;

// Initialize database only in Electron environment
if (isElectron) {
  try {
    const { app } = (window as any).require('electron');
    const dbPath = path.join(app.getPath('userData'), 'mediclinic.db');
    db = new Database(dbPath);
    console.log('Database initialized at:', dbPath);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
} else {
  console.log('Not in Electron environment, database not initialized');
}

// Initialize database tables
export const initializeDatabase = () => {
  if (!db) {
    console.warn('Database not initialized, skipping table creation');
    return;
  }
  try {
    // Patients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT,
        phone_number TEXT NOT NULL,
        date_of_birth TEXT,
        address TEXT,
        blood_type TEXT,
        allergies TEXT,
        chronic_conditions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Appointments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        patient_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT DEFAULT 'Check-up',
        duration INTEGER DEFAULT 30,
        payment_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      );
    `);

    // Consultations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        appointment_id INTEGER,
        name TEXT,
        age TEXT,
        sex TEXT,
        weight TEXT,
        height TEXT,
        contact TEXT,
        complaint TEXT,
        whenStarted TEXT,
        howOften TEXT,
        gettingBetter TEXT,
        triggers TEXT,
        makesBetter TEXT,
        medications TEXT,
        fever BOOLEAN DEFAULT 0,
        pain BOOLEAN DEFAULT 0,
        nausea BOOLEAN DEFAULT 0,
        cough BOOLEAN DEFAULT 0,
        dizziness BOOLEAN DEFAULT 0,
        fatigue BOOLEAN DEFAULT 0,
        allergies TEXT,
        chronicConditions TEXT,
        surgeries TEXT,
        familyHistory TEXT,
        diagnosis TEXT,
        consultation_date TEXT,
        doctor TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (appointment_id) REFERENCES appointments (id)
      );
    `);

    // Finance/Expenses table
    db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT DEFAULT 'other',
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Patients CRUD operations
export const patientsService = {
  getAll: (): Patient[] => {
    if (!db) {
      console.warn('Database not initialized');
      return [];
    }
    try {
      const stmt = db.prepare('SELECT * FROM patients ORDER BY created_at DESC');
      return stmt.all() as Patient[];
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  },

  getById: (id: number): Patient | null => {
    if (!db) {
      console.warn('Database not initialized');
      return null;
    }
    try {
      const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
      return stmt.get(id) as Patient | null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  },

  create: (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Patient => {
    if (!db) {
      console.warn('Database not initialized');
      throw new Error('Database not initialized');
    }
    try {
      const stmt = db.prepare(`
        INSERT INTO patients (full_name, email, phone_number, date_of_birth, address, blood_type, allergies, chronic_conditions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        patient.full_name,
        patient.email,
        patient.phone_number,
        patient.date_of_birth,
        patient.address,
        patient.blood_type,
        patient.allergies,
        patient.chronic_conditions
      );
      
      return {
        ...patient,
        id: result.lastInsertRowid as number,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  update: (id: number, patient: Partial<Patient>): boolean => {
    if (!db) {
      console.warn('Database not initialized');
      return false;
    }
    try {
      const stmt = db.prepare(`
        UPDATE patients 
        SET full_name = ?, email = ?, phone_number = ?, date_of_birth = ?, address = ?, blood_type = ?, allergies = ?, chronic_conditions = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(
        patient.full_name,
        patient.email,
        patient.phone_number,
        patient.date_of_birth,
        patient.address,
        patient.blood_type,
        patient.allergies,
        patient.chronic_conditions,
        id
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating patient:', error);
      return false;
    }
  },

  delete: (id: number): boolean => {
    if (!db) {
      console.warn('Database not initialized');
      return false;
    }
    try {
      const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting patient:', error);
      return false;
    }
  },

  // Additional methods for compatibility
  getPatients: async (page?: number, limit?: number, filters?: any) => {
    const allPatients = patientsService.getAll();
    if (filters?.name) {
      return allPatients.filter(p => p.full_name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    return allPatients;
  },

  searchPatientsByPhone: async (phoneNumber: string) => {
    if (!db) {
      console.warn('Database not initialized');
      return [];
    }
    try {
      const stmt = db.prepare('SELECT * FROM patients WHERE phone_number LIKE ?');
      return stmt.all(`%${phoneNumber}%`) as Patient[];
    } catch (error) {
      console.error('Error searching patients by phone:', error);
      return [];
    }
  }
};

// Appointments CRUD operations
const appointmentsServiceBase = {
  getAll: (): Appointment[] => {
    if (!db) {
      console.warn('Database not initialized');
      return [];
    }
    try {
      const stmt = db.prepare('SELECT * FROM appointments ORDER BY date, time');
      return stmt.all() as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  getByDate: (date: string): Appointment[] => {
    if (!db) {
      console.warn('Database not initialized');
      return [];
    }
    try {
      const stmt = db.prepare('SELECT * FROM appointments WHERE date = ? ORDER BY time');
      return stmt.all(date) as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return [];
    }
  },

  create: (appointment: Omit<Appointment, 'id' | 'created_at'>): Appointment => {
    if (!db) {
      console.warn('Database not initialized');
      throw new Error('Database not initialized');
    }
    try {
      const stmt = db.prepare(`
        INSERT INTO appointments (patient_id, patient, phone_number, date, time, type, duration, payment_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        appointment.patient_id,
        appointment.patient,
        appointment.phone_number,
        appointment.date,
        appointment.time,
        appointment.type,
        appointment.duration,
        appointment.payment_amount,
        appointment.status
      );
      
      return {
        ...appointment,
        id: result.lastInsertRowid as number,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  update: (id: number, appointment: Partial<Appointment>): boolean => {
    if (!db) {
      console.warn('Database not initialized');
      return false;
    }
    try {
      const stmt = db.prepare(`
        UPDATE appointments 
        SET patient_id = ?, patient = ?, phone_number = ?, date = ?, time = ?, type = ?, duration = ?, payment_amount = ?, status = ?
        WHERE id = ?
      `);
      const result = stmt.run(
        appointment.patient_id,
        appointment.patient,
        appointment.phone_number,
        appointment.date,
        appointment.time,
        appointment.type,
        appointment.duration,
        appointment.payment_amount,
        appointment.status,
        id
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return false;
    }
  },

  delete: (id: number): boolean => {
    if (!db) {
      console.warn('Database not initialized');
      return false;
    }
    try {
      const stmt = db.prepare('DELETE FROM appointments WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  }
};

export const appointmentsService = {
  ...appointmentsServiceBase,
  // Additional methods for compatibility
  getAppointments: async (page?: number, limit?: number, filters?: any) => {
    const allAppointments = appointmentsServiceBase.getAll();
    if (filters?.start_date && filters?.end_date) {
      return allAppointments.filter((apt: Appointment) => 
        apt.date >= filters.start_date && apt.date <= filters.end_date
      );
    }
    return allAppointments;
  },

  getAppointmentsByDate: appointmentsServiceBase.getByDate,
  createAppointment: appointmentsServiceBase.create,
  updateAppointment: appointmentsServiceBase.update,
  deleteAppointment: appointmentsServiceBase.delete
};

// Consultations CRUD operations
export const consultationsService = {
  create: (consultation: any): any => {
    if (!db) {
      console.warn('Database not initialized');
      throw new Error('Database not initialized');
    }
    try {
      const stmt = db.prepare(`
        INSERT INTO consultations (
          patient_id, appointment_id, name, age, sex, weight, height, contact, 
          complaint, whenStarted, howOften, gettingBetter, triggers, makesBetter, 
          medications, fever, pain, nausea, cough, dizziness, fatigue, 
          allergies, chronicConditions, surgeries, familyHistory, diagnosis, consultation_date, doctor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        consultation.patient_id, consultation.appointment_id, consultation.name, consultation.age, consultation.sex, 
        consultation.weight, consultation.height, consultation.contact, consultation.complaint, consultation.whenStarted, 
        consultation.howOften, consultation.gettingBetter, consultation.triggers, consultation.makesBetter, 
        consultation.medications, consultation.fever, consultation.pain, consultation.nausea, consultation.cough, 
        consultation.dizziness, consultation.fatigue, consultation.allergies, consultation.chronicConditions, 
        consultation.surgeries, consultation.familyHistory, consultation.diagnosis, consultation.consultation_date, consultation.doctor
      );
      
      return {
        ...consultation,
        id: result.lastInsertRowid as number,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  }
};

// Expenses CRUD operations
export const expensesService = {
  getAll: (): any[] => {
    if (!db) {
      console.warn('Database not initialized');
      return [];
    }
    try {
      const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC');
      return stmt.all();
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  create: (expense: any): any => {
    if (!db) {
      console.warn('Database not initialized');
      throw new Error('Database not initialized');
    }
    try {
      const stmt = db.prepare('INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)');
      const result = stmt.run(expense.description, expense.amount, expense.category, expense.date);
      
      return {
        ...expense,
        id: result.lastInsertRowid as number,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }
};

// Add missing methods to existing patientsService
patientsService.getPatients = async (page?: number, limit?: number, filters?: any) => {
  const allPatients = patientsService.getAll();
  if (filters?.name) {
    return allPatients.filter(p => p.full_name.toLowerCase().includes(filters.name.toLowerCase()));
  }
  return allPatients;
};

patientsService.searchPatientsByPhone = async (phoneNumber: string) => {
  if (!db) {
    console.warn('Database not initialized');
    return [];
  }
  try {
    const stmt = db.prepare('SELECT * FROM patients WHERE phone_number LIKE ?');
    return stmt.all(`%${phoneNumber}%`) as Patient[];
  } catch (error) {
    console.error('Error searching patients by phone:', error);
    return [];
  }
};

// Add missing methods for appointmentsService
appointmentsService.getAppointments = async (page?: number, limit?: number, filters?: any) => {
  const allAppointments = appointmentsService.getAll();
  if (filters?.start_date && filters?.end_date) {
    return allAppointments.filter(apt => 
      apt.date >= filters.start_date && apt.date <= filters.end_date
    );
  }
  return allAppointments;
};

appointmentsService.getAppointmentsByDate = appointmentsService.getByDate;
appointmentsService.createAppointment = appointmentsService.create;
appointmentsService.updateAppointment = appointmentsService.update;
appointmentsService.deleteAppointment = appointmentsService.delete;

// Initialize database on import
initializeDatabase();

export { db, Patient, Appointment };
