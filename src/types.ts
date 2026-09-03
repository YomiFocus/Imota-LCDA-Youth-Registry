export interface RegistrationFormData {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  ward: string;
  lassra: string;
  dob: string;
  address: string;
  state_of_origin: string;
  occupation: string;
  education: string;
  photo_url: string;
  skills: string;
}

export interface RegistrationRecord extends RegistrationFormData {
  id: number;
  reg_number: string;
  full_name_clean: string;
  email_clean: string;
  phone_clean: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  genderCounts: Record<string, number>;
  wardCounts: Record<string, number>;
  topSkills: { skill: string; count: number }[];
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface EmailDispatch {
  id: number;
  reg_id: number;
  reg_number: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  status: string;
  sent_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  target_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface FieldValidationState {
  status: 'idle' | 'checking' | 'valid' | 'invalid';
  message: string | null;
}
