import { apiFetch } from './apiFetch';
import {
  BackupSettings,
  BackupRecord,
  PaginatedBackupRecords,
  QueryBackupRecordsParams,
  UpdateBackupSettingsInput,
  TriggerDatabaseBackupInput,
  ExportKeysInput,
  EncryptedKeysEnvelope,
  RestoreDatabaseInput,
  RestoreKeysInput,
  S3HealthStatus,
} from '@/modules/backup-restore/types/backup.types';

export const backupService = {
  getSettings: async (): Promise<BackupSettings> => {
    return apiFetch<BackupSettings>('/admin/backups/settings');
  },

  updateSettings: async (input: UpdateBackupSettingsInput): Promise<BackupSettings> => {
    return apiFetch<BackupSettings>('/admin/backups/settings', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  checkHealth: async (): Promise<S3HealthStatus> => {
    return apiFetch<S3HealthStatus>('/admin/backups/health');
  },

  getRecords: async (params: QueryBackupRecordsParams = {}): Promise<PaginatedBackupRecords> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.type) query.set('type', params.type);
    if (params.cadence) query.set('cadence', params.cadence);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    return apiFetch<PaginatedBackupRecords>(`/admin/backups/records${qs ? `?${qs}` : ''}`);
  },

  getRecordById: async (id: string): Promise<BackupRecord> => {
    return apiFetch<BackupRecord>(`/admin/backups/records/${id}`);
  },

  getDownloadUrl: async (
    id: string,
  ): Promise<{
    id: string;
    s3Key: string;
    fileSizeBytes: number;
    downloadUrl: string;
    expiresInSeconds: number;
  }> => {
    return apiFetch(`/admin/backups/records/${id}/download`);
  },

  triggerDatabaseBackup: async (input: TriggerDatabaseBackupInput = {}): Promise<BackupRecord> => {
    return apiFetch<BackupRecord>('/admin/backups/database/trigger', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  exportKeys: async (input: ExportKeysInput): Promise<EncryptedKeysEnvelope> => {
    return apiFetch<EncryptedKeysEnvelope>('/admin/backups/keys/export', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  restoreKeys: async (
    input: RestoreKeysInput,
  ): Promise<{
    success: boolean;
    restoredProvidersCount: number;
    restoredProviderNames: string[];
  }> => {
    return apiFetch('/admin/backups/keys/restore', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  triggerConfigBackup: async (description?: string): Promise<BackupRecord> => {
    return apiFetch<BackupRecord>('/admin/backups/configurations/trigger', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },

  restoreDatabase: async (
    input: RestoreDatabaseInput,
  ): Promise<{
    success: boolean;
    message: string;
    preRestoreSnapshotId?: string;
    restoredFromS3Key: string;
    selectiveCollections?: string[];
  }> => {
    return apiFetch('/admin/backups/restore/database', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  deleteRecord: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`/admin/backups/records/${id}`, {
      method: 'DELETE',
    });
  },
};
