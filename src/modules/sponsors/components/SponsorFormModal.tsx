'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Switch from '@/components/form/switch/Switch';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import { UniversalImagePicker } from '@/components/form/UniversalImagePicker';
import { Sponsor, SponsorType, SponsorTier, CreateSponsorDto } from '../types/sponsor.types';
import { useSponsors } from '../hooks/useSponsors';
import { Loader2, Globe, User, MapPin } from 'lucide-react';

const sponsorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().optional().or(z.literal('')),
  companyDomain: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  valuation: z.string().optional().or(z.literal('')),
  type: z.nativeEnum(SponsorType).default(SponsorType.COMPANY),
  tier: z.nativeEnum(SponsorTier).default(SponsorTier.PARTNER),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  socialLinks: z
    .object({
      linkedin: z.string().optional().or(z.literal('')),
      twitter: z.string().optional().or(z.literal('')),
      facebook: z.string().optional().or(z.literal('')),
      instagram: z.string().optional().or(z.literal('')),
    })
    .default({}),
  address: z
    .object({
      street: z.string().optional().or(z.literal('')),
      city: z.string().optional().or(z.literal('')),
      state: z.string().optional().or(z.literal('')),
      country: z.string().optional().or(z.literal('')),
      zip: z.string().optional().or(z.literal('')),
    })
    .default({}),
});

type SponsorFormData = z.input<typeof sponsorSchema>;

interface SponsorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsorData?: Sponsor | null;
}

export const SponsorFormModal: React.FC<SponsorFormModalProps> = ({
  isOpen,
  onClose,
  sponsorData,
}) => {
  const isEdit = !!sponsorData;
  const { createSponsor, updateSponsor, isCreating, isUpdating } = useSponsors();
  const [logoUrl, setLogoUrl] = useState('');
  const [logoId, setLogoId] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'socials' | 'address'>('general');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: '',
      companyName: '',
      companyDomain: '',
      email: '',
      phone: '',
      designation: '',
      website: '',
      valuation: '',
      type: SponsorType.COMPANY,
      tier: SponsorTier.PARTNER,
      description: '',
      isActive: true,
      sortOrder: 0,
      socialLinks: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (sponsorData) {
        reset({
          name: sponsorData.name || '',
          companyName: sponsorData.companyName || '',
          companyDomain: sponsorData.companyDomain || '',
          email: sponsorData.email || '',
          phone: sponsorData.phone || '',
          designation: sponsorData.designation || '',
          website: sponsorData.website || '',
          valuation: sponsorData.valuation || '',
          type: sponsorData.type || SponsorType.COMPANY,
          tier: sponsorData.tier || SponsorTier.PARTNER,
          description: sponsorData.description || '',
          isActive: sponsorData.isActive ?? true,
          sortOrder: sponsorData.sortOrder ?? 0,
          socialLinks: {
            linkedin: sponsorData.socialLinks?.linkedin || '',
            twitter: sponsorData.socialLinks?.twitter || '',
            facebook: sponsorData.socialLinks?.facebook || '',
            instagram: sponsorData.socialLinks?.instagram || '',
          },
          address: {
            street: sponsorData.address?.street || '',
            city: sponsorData.address?.city || '',
            state: sponsorData.address?.state || '',
            country: sponsorData.address?.country || '',
            zip: sponsorData.address?.zip || '',
          },
        });

        if (typeof sponsorData.logo === 'string') {
          setLogoUrl(sponsorData.logo);
        } else if (sponsorData.logo && typeof sponsorData.logo === 'object') {
          setLogoUrl(sponsorData.logo.original || sponsorData.logo.thumbnail || '');
        } else {
          setLogoUrl('');
        }

        if (sponsorData.logoId) {
          if (typeof sponsorData.logoId === 'string') {
            setLogoId(sponsorData.logoId);
          } else if (typeof sponsorData.logoId === 'object' && sponsorData.logoId.id) {
            setLogoId(sponsorData.logoId.id);
          }
        } else {
          setLogoId('');
        }
      } else {
        reset({
          name: '',
          companyName: '',
          companyDomain: '',
          email: '',
          phone: '',
          designation: '',
          website: '',
          valuation: '',
          type: SponsorType.COMPANY,
          tier: SponsorTier.PARTNER,
          description: '',
          isActive: true,
          sortOrder: 0,
          socialLinks: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: '',
          },
          address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zip: '',
          },
        });
        setLogoUrl('');
        setLogoId('');
      }
      setActiveTab('general');
    }
  }, [isOpen, sponsorData, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: SponsorFormData) => {
    const submitData: CreateSponsorDto = {
      ...values,
      sortOrder:
        values.sortOrder !== undefined && values.sortOrder !== null
          ? Number(values.sortOrder)
          : undefined,
      logo: logoUrl || undefined,
      logoId: logoId || undefined,
    };

    try {
      if (isEdit && sponsorData) {
        await updateSponsor({ id: sponsorData.id, data: submitData });
      } else {
        await createSponsor(submitData);
      }
      onClose();
    } catch (error) {
      // Handled centrally by hook
    }
  };

  const TYPE_OPTIONS = [
    { value: SponsorType.COMPANY, label: 'Company' },
    { value: SponsorType.INDIVIDUAL, label: 'Individual' },
    { value: SponsorType.COMPANY_UNIT, label: 'Company Unit' },
  ];

  const TIER_OPTIONS = [
    { value: SponsorTier.PLATINUM, label: 'Platinum' },
    { value: SponsorTier.GOLD, label: 'Gold' },
    { value: SponsorTier.SILVER, label: 'Silver' },
    { value: SponsorTier.BRONZE, label: 'Bronze' },
    { value: SponsorTier.PARTNER, label: 'Partner' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full md:w-[896px] transform rounded-3xl bg-white dark:bg-navy-900 p-6 text-left shadow-2xl transition-all border border-gray-100 dark:border-navy-800">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Sponsor Profile' : 'Add New Sponsor'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEdit
                  ? 'Update the details and metadata of this sponsor'
                  : 'Register a new individual or corporate sponsor'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Form Navigation Tabs */}
          <div className="flex gap-2 p-1 bg-gray-50 dark:bg-navy-950 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'general'
                  ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User size={16} />
              General Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('socials')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'socials'
                  ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe size={16} />
              Social Links
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'address'
                  ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MapPin size={16} />
              Location / Address
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="min-h-[500px] md:min-h-[520px]">
              {activeTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Image / Logo Picker */}
                  <div className="md:col-span-1 space-y-4">
                    <Label>Sponsor Logo</Label>
                    <UniversalImagePicker
                      value={logoUrl}
                      onChange={(url) => setLogoUrl(url)}
                      onSelect={(file) => setLogoId(file?.id || '')}
                      aspectRatio="square"
                      module="media"
                      placeholder="Choose Logo"
                    />
                    <div className="pt-2">
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white">
                                Active Status
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Toggle sponsor visibility
                              </p>
                            </div>
                            <Switch checked={field.value} onChange={field.onChange} />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Right Columns: Main Fields */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name / Representative"
                        placeholder="e.g. John Doe"
                        error={errors.name?.message as string}
                        {...register('name')}
                      />
                      <Input
                        label="Company Name"
                        placeholder="e.g. Acme Corp"
                        error={errors.companyName?.message as string}
                        {...register('companyName')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Sponsor Type"
                            options={TYPE_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        name="tier"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Sponsor Tier"
                            options={TIER_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Company Domain"
                        placeholder="e.g. acme.org"
                        error={errors.companyDomain?.message as string}
                        {...register('companyDomain')}
                      />
                      <Input
                        label="Website URL"
                        placeholder="e.g. https://acme.org"
                        error={errors.website?.message as string}
                        {...register('website')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        placeholder="e.g. sponsor@acme.org"
                        error={errors.email?.message as string}
                        {...register('email')}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="e.g. +1 234 567 890"
                        error={errors.phone?.message as string}
                        {...register('phone')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Designation / Role"
                        placeholder="e.g. Director"
                        error={errors.designation?.message as string}
                        {...register('designation')}
                      />
                      <Input
                        label="Support Valuation"
                        placeholder="e.g. $10,000"
                        error={errors.valuation?.message as string}
                        {...register('valuation')}
                      />
                      <Input
                        label="Sort Order"
                        type="number"
                        placeholder="0"
                        error={errors.sortOrder?.message as string}
                        {...register('sortOrder')}
                      />
                    </div>

                    <div>
                      <Label>Description / Partnership Context</Label>
                      <div className="mt-1">
                        <TextArea
                          placeholder="Brief description of the sponsor partnership..."
                          rows={3}
                          error={errors.description?.message as string}
                          {...register('description')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'socials' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="LinkedIn URL"
                      placeholder="https://linkedin.com/in/..."
                      {...register('socialLinks.linkedin')}
                    />
                    <Input
                      label="Twitter / X URL"
                      placeholder="https://x.com/..."
                      {...register('socialLinks.twitter')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Facebook URL"
                      placeholder="https://facebook.com/..."
                      {...register('socialLinks.facebook')}
                    />
                    <Input
                      label="Instagram URL"
                      placeholder="https://instagram.com/..."
                      {...register('socialLinks.instagram')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'address' && (
                <div className="space-y-4">
                  <Input
                    label="Street Address"
                    placeholder="e.g. 123 Business Rd"
                    {...register('address.street')}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="City" placeholder="e.g. New York" {...register('address.city')} />
                    <Input
                      label="State / Province"
                      placeholder="e.g. NY"
                      {...register('address.state')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Country"
                      placeholder="e.g. United States"
                      {...register('address.country')}
                    />
                    <Input
                      label="Zip / Postal Code"
                      placeholder="e.g. 10001"
                      {...register('address.zip')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isCreating || isUpdating}
                className="rounded-xl shadow-lg shadow-brand-500/10 min-w-[120px] flex items-center justify-center gap-2"
              >
                {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Register Sponsor'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
