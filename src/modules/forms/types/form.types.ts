export enum FormFieldType {
  SINGLE_INPUT = 'single_input',
  PARAGRAPH = 'paragraph',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  SINGLE_SELECT = 'single_select',
  RADIO = 'radio',
  MULTIPLE_CHOICE = 'multiple_choice',
  DATE = 'date',
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum SubmissionStatus {
  NEW = 'NEW',
  REVIEWED = 'REVIEWED',
  SPAM = 'SPAM',
  ARCHIVED = 'ARCHIVED',
}

export interface FormFieldOption {
  id?: string;
  _id?: string;
  label: string;
  value: string;
}

export interface FormValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMessage?: string;
}

export interface FormQuestion {
  id?: string;
  _id?: string;
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  url?: string;
  type: FormFieldType;
  options?: FormFieldOption[];
  validation?: FormValidationRules;
  order?: number;
  width?: 'full' | 'half';
}

export interface FormSettings {
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  notificationEmails?: string[];
  captchaEnabled?: boolean;
  maxSubmissions?: number;
  startDate?: string;
  endDate?: string;
}

export interface WebsiteRef {
  id?: string;
  _id?: string;
  name?: string;
  domain?: string;
  logo?: string;
}

export interface CustomForm {
  id: string;
  _id?: string;
  websiteId: string | WebsiteRef;
  name: string;
  slug: string;
  description?: string;
  status: FormStatus;
  settings: FormSettings;
  questions: FormQuestion[];
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomFormDto {
  websiteId: string;
  name: string;
  slug?: string;
  description?: string;
  status?: FormStatus;
  settings?: FormSettings;
  questions?: FormQuestion[];
}

export interface UpdateCustomFormDto {
  name?: string;
  slug?: string;
  description?: string;
  status?: FormStatus;
  settings?: FormSettings;
}

export interface CustomFormQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: FormStatus | string;
  websiteId?: string;
}

export interface FormAnswer {
  fieldKey: string;
  questionLabel: string;
  fieldType: FormFieldType;
  value: unknown;
}

export interface SubmitterMetadata {
  ipAddress?: string;
  userAgent?: string;
  countryCode?: string;
  submitterEmail?: string;
  submitterPhone?: string;
}

export interface FormSubmission {
  id: string;
  _id?: string;
  formId: string;
  status: SubmissionStatus;
  submitter?: SubmitterMetadata;
  answers: FormAnswer[];
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubmissionStatus | string;
  startDate?: string;
  endDate?: string;
}

export interface FormSubmissionAnalytics {
  total: number;
  statusBreakdown: Record<SubmissionStatus, number>;
  totalLast7Days: number;
  totalLast30Days: number;
  recentActivity: Array<{ date: string; count: number }>;
}
