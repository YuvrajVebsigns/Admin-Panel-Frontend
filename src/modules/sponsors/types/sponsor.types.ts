import { ImageLinks } from '@/modules/websites/types/website.types';

export enum SponsorType {
  INDIVIDUAL = 'Individual',
  COMPANY = 'Company',
  COMPANY_UNIT = 'CompanyUnit',
}

export enum SponsorTier {
  PLATINUM = 'Platinum',
  GOLD = 'Gold',
  SILVER = 'Silver',
  BRONZE = 'Bronze',
  PARTNER = 'Partner',
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  companyName?: string;
  companyDomain?: string;
  email?: string;
  phone?: string;
  designation?: string;
  logo?: string | ImageLinks;
  logoId?:
    | string
    | {
        id: string;
        metadata: Record<string, unknown>;
        url: string;
        urlVariants: Record<string, string>;
      };
  website?: string;
  valuation?: string;
  type: SponsorType;
  tier?: SponsorTier;
  description?: string;
  socialLinks?: SocialLinks;
  address?: Address;
  websites: (Record<string, unknown> | string)[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorDto {
  name: string;
  companyName?: string;
  companyDomain?: string;
  email?: string;
  phone?: string;
  designation?: string;
  logo?: string | ImageLinks;
  logoId?: string;
  website?: string;
  valuation?: string;
  type?: SponsorType;
  tier?: SponsorTier;
  description?: string;
  socialLinks?: SocialLinks;
  address?: Address;
  websites?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateSponsorDto extends Partial<CreateSponsorDto> {}

export interface SponsorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: SponsorType;
  tier?: SponsorTier;
  isActive?: boolean;
  websiteId?: string;
}
