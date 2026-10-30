export type BackupType = 'database' | 'configurations' | 'keys';
export type BackupCadence = 'daily' | 'monthly' | 'manual';
export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface BackupS3Config {
  bucket: string;
  region: string;
  endpoint?: string;
  basePrefix: string;
  forcePathStyle: boolean;
}

export interface BackupSettings {
  id: string;
  isDailyEnabled: boolean;
  dailyCron: string;
  dailyRetentionDays: number;
  isMonthlyEnabled: boolean;
  monthlyCron: string;
  emailMonthlyBackup: boolean;
  notificationEmails: string[];
  s3StorageConfig: BackupS3Config;
  updatedAt?: string;
  createdAt?: string;
}

export interface BackupRecord {
  id: string;
  type: BackupType;
  cadence: BackupCadence;
  status: BackupStatus;
  triggeredBy?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  s3Key: string;
  s3Bucket: string;
  fileSizeBytes: number;
  checksum?: string;
  durationMs?: number;
  isPermanent: boolean;
  expiresAt?: string;
  emailedToAdmin: boolean;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedKeysEnvelope {
  format: 'core-media-keys';
  version: '1.0';
  mode: 'server_key' | 'password';
  salt: string;
  iv: string;
  tag: string;
  ciphertext: string;
  createdAt: string;
}

export interface PaginatedBackupRecords {
  docs: BackupRecord[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QueryBackupRecordsParams {
  page?: number;
  limit?: number;
  type?: BackupType;
  cadence?: BackupCadence;
  status?: BackupStatus;
  search?: string;
}

export interface UpdateBackupSettingsInput {
  isDailyEnabled?: boolean;
  dailyCron?: string;
  dailyRetentionDays?: number;
  isMonthlyEnabled?: boolean;
  monthlyCron?: string;
  emailMonthlyBackup?: boolean;
  notificationEmails?: string[];
  s3StorageConfig?: Partial<BackupS3Config>;
}

export interface TriggerDatabaseBackupInput {
  cadence?: BackupCadence;
  collections?: string[];
}

export interface ExportKeysInput {
  mode: 'server_key' | 'password';
  password?: string;
}

export interface RestoreDatabaseInput {
  backupRecordId: string;
  confirmationText: string;
  superAdminPassword: string;
  collections?: string[];
}

export interface RestoreKeysInput {
  superAdminPassword: string;
  encryptedPayload: string;
  password?: string;
}

export interface S3HealthStatus {
  status: boolean;
  bucket: string;
  error?: string;
}
