export enum NominationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface RegistreeRef {
  id: string;
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  organization?: string;
  city?: string;
  tags?: string[];
  countryCode?: string;
}

export interface NomineeEntry {
  nomineeId: RegistreeRef | string;
  category: string;
}

export interface WebsiteRef {
  id: string;
  _id: string;
  name: string;
  domain: string;
  logo?: string;
}

export interface Nomination {
  id: string;
  nominatorId: RegistreeRef | string;
  nominees: NomineeEntry[];
  status: NominationStatus;
  websiteId?: WebsiteRef | string;
  submittedAt: string;
  createdAt?: string; // May be stripped by backend
  updatedAt: string;
}

export interface GroupedNominator {
  id?: string; // Nominator ID mapped by Mongoose
  _id: string; // Nominator ID
  nominationIds: string[];
  nomineesCount: number;
  statuses: NominationStatus[];
  submittedAt: string;
  createdAt?: string; // May be stripped by backend
  websiteId: string;
  nominator: RegistreeRef;
  website?: WebsiteRef;
}

export interface GroupedNominee {
  _id: string; // Nominee ID
  nominationIds: string[];
  nominatorsCount: number;
  statuses: NominationStatus[];
  categories: string[];
  submittedAt: string;
  createdAt?: string; // May be stripped by backend
  websiteId: string;
  nominee: RegistreeRef;
  website?: WebsiteRef;
  categoryDocs?: Array<NominationCategory | NominationSubCategory>;
}

export interface NominationCategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string | null;
  parent?: NominationCategory;
  children?: NominationCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface NominationSubCategory {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder?: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NominationSubCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  categoryId?: string;
}

// Queries
export interface NominationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: NominationStatus;
  websiteId?: string;
  nominatorEmail?: string;
  nominatorId?: string;
}

export interface NominationCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// DTOs
export interface NomineeDto {
  category: string;
  contactName: string;
  companyName: string;
  contactEmail: string;
  mobileNo?: string;
}

export interface CreateNominationDto {
  nominatorName: string;
  nominatorCompany: string;
  nominatorCity: string;
  nominatorEmail: string;
  nominatorPhone?: string;
  nominees: NomineeDto[];
}

export interface UpdateNominationStatusDto {
  status: NominationStatus;
}

export interface WebsiteNominationStatusPayload {
  isActive: boolean;
}

export interface WebsiteNominationStatusResponse {
  isActive: boolean;
  nominationActive?: boolean;
}

export interface CreateNominationCategoryDto {
  name: string;
  slug: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateNominationCategoryDto {
  name?: string;
  slug?: string;
  isActive?: boolean;
  sortOrder?: number;
}
