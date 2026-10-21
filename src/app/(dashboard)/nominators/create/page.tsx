'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNominations } from '@/modules/nominations/hooks/useNominations';
import { useNominationCategories } from '@/modules/nominations/hooks/useNominationCategories';
import { CreateNominationDto, NomineeDto } from '@/modules/nominations/types/nomination.types';
import { registreeService } from '@/services/registree.service';
import Button from '@/components/ui/button/Button';
import {
  ArrowLeft,
  User,
  Building,
  MapPin,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  Search,
  Trash2,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface NomineeFormState extends NomineeDto {
  emailChecked: boolean;
  isChecking: boolean;
  found: boolean;
  editMode: boolean;
}

export default function CreateNominationPage() {
  const router = useRouter();
  const { createNomination, isCreating } = useNominations();
  const { categories, isLoading: isCategoriesLoading } = useNominationCategories({
    limit: 100,
    isActive: true,
  });

  // Nominator State
  const [nominatorData, setNominatorData] = useState({
    nominatorName: '',
    nominatorCompany: '',
    nominatorCity: '',
    nominatorEmail: '',
    nominatorPhone: '',
  });
  const [nominatorState, setNominatorState] = useState({
    emailChecked: false,
    isChecking: false,
    found: false,
    editMode: false,
    completed: false,
  });

  // Nominees State
  const [nominees, setNominees] = useState<NomineeFormState[]>([
    {
      category: '',
      contactName: '',
      companyName: '',
      contactEmail: '',
      mobileNo: '',
      emailChecked: false,
      isChecking: false,
      found: false,
      editMode: false,
    },
  ]);

  const checkNominatorEmail = async () => {
    if (!nominatorData.nominatorEmail) {
      toast.error('Please enter an email address first.');
      return;
    }

    setNominatorState((prev) => ({ ...prev, isChecking: true }));
    try {
      const res = await registreeService.getRegistrees({
        email: nominatorData.nominatorEmail,
        limit: 1,
      });
      if (res.data.length > 0) {
        const found = res.data[0];
        setNominatorData((prev) => ({
          ...prev,
          nominatorName: found?.name || prev.nominatorName,
          nominatorCompany: found?.organization || prev.nominatorCompany,
          nominatorCity: prev.nominatorCity,
          nominatorPhone: found?.phoneNumber || prev.nominatorPhone,
        }));
        setNominatorState((prev) => ({
          ...prev,
          emailChecked: true,
          found: true,
          editMode: false,
        }));
        toast.success('Nominator found! Details pre-filled.');
      } else {
        setNominatorState((prev) => ({
          ...prev,
          emailChecked: true,
          found: false,
          editMode: true,
        }));
        toast.success('No existing record found. Please fill out details.');
      }
    } catch (error) {
      toast.error('Failed to verify email.');
    } finally {
      setNominatorState((prev) => ({ ...prev, isChecking: false }));
    }
  };

  const completeNominatorSection = () => {
    if (
      !nominatorData.nominatorName ||
      !nominatorData.nominatorCompany ||
      !nominatorData.nominatorCity
    ) {
      toast.error('Please fill in all required nominator details.');
      return;
    }
    setNominatorState((prev) => ({ ...prev, completed: true }));
  };

  const checkNomineeEmail = async (index: number) => {
    const nominee = nominees[index];
    if (!nominee || !nominee.contactEmail) {
      toast.error('Please enter an email address first.');
      return;
    }

    updateNomineeState(index, { isChecking: true });
    try {
      const res = await registreeService.getRegistrees({ email: nominee.contactEmail, limit: 1 });
      if (res.data.length > 0) {
        const found = res.data[0];
        const updated = [...nominees];
        updated[index] = {
          ...updated[index],
          contactName: found?.name || updated[index]?.contactName,
          companyName: found?.organization || updated[index]?.companyName,
          mobileNo: found?.phoneNumber || updated[index]?.mobileNo,
          emailChecked: true,
          found: true,
          editMode: false,
          isChecking: false,
        } as NomineeFormState;
        setNominees(updated);
        toast.success(`Nominee #${index + 1} found! Details pre-filled.`);
      } else {
        updateNomineeState(index, {
          emailChecked: true,
          found: false,
          editMode: true,
          isChecking: false,
        });
        toast.success(`Nominee #${index + 1} not found. Please fill out details.`);
      }
    } catch (error) {
      toast.error('Failed to verify email.');
      updateNomineeState(index, { isChecking: false });
    }
  };

  const updateNomineeField = (index: number, field: keyof NomineeDto, value: string) => {
    const updated = [...nominees];
    updated[index] = { ...updated[index], [field]: value } as NomineeFormState;
    // If they change the email after checking, reset the check state
    if (field === 'contactEmail' && updated[index]?.emailChecked) {
      updated[index]!.emailChecked = false;
      updated[index]!.found = false;
      updated[index]!.editMode = false;
    }
    setNominees(updated);
  };

  const updateNomineeState = (index: number, stateUpdates: Partial<NomineeFormState>) => {
    const updated = [...nominees];
    updated[index] = { ...updated[index], ...stateUpdates } as NomineeFormState;
    setNominees(updated);
  };

  const handleAddNominee = () => {
    if (nominees.length >= 10) {
      toast.error('Maximum 10 nominees allowed.');
      return;
    }
    setNominees([
      ...nominees,
      {
        category: '',
        contactName: '',
        companyName: '',
        contactEmail: '',
        mobileNo: '',
        emailChecked: false,
        isChecking: false,
        found: false,
        editMode: false,
      },
    ]);
  };

  const handleRemoveNominee = (index: number) => {
    if (nominees.length === 1) return;
    const updated = [...nominees];
    updated.splice(index, 1);
    setNominees(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nominatorState.completed) {
      toast.error('Please complete the nominator section first.');
      return;
    }

    // Validate nominees
    for (let i = 0; i < nominees.length; i++) {
      const n = nominees[i];
      if (!n || !n.emailChecked) {
        toast.error(`Please verify the email for Nominee #${i + 1}.`);
        return;
      }
      if (!n.category || !n.contactName || !n.companyName) {
        toast.error(`Nominee #${i + 1} is missing required fields.`);
        return;
      }
    }

    try {
      const payload: CreateNominationDto = {
        nominatorName: nominatorData.nominatorName,
        nominatorCompany: nominatorData.nominatorCompany,
        nominatorCity: nominatorData.nominatorCity,
        nominatorEmail: nominatorData.nominatorEmail,
        nominatorPhone: nominatorData.nominatorPhone,
        nominees: nominees.map((n) => ({
          category: n.category,
          contactName: n.contactName,
          companyName: n.companyName,
          contactEmail: n.contactEmail,
          mobileNo: n.mobileNo,
        })),
      };

      await createNomination(payload);
      router.push('/nominators');
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const isNominatorLocked = nominatorState.emailChecked && !nominatorState.editMode;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/nominators"
          className="p-2 bg-white dark:bg-navy-900 rounded-xl border border-gray-200 dark:border-navy-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Nomination
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Follow the steps below to submit a nomination manually.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Nominator */}
        <div
          className={`bg-white dark:bg-navy-900 rounded-3xl border ${nominatorState.completed ? 'border-success-500/50 shadow-success-500/10' : 'border-gray-200 dark:border-navy-800 shadow-sm'} p-6 md:p-8 transition-all`}
        >
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-navy-800 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-3 text-brand-600 dark:text-brand-400">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${nominatorState.completed ? 'bg-success-500 text-white' : 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400'}`}
              >
                {nominatorState.completed ? <CheckCircle2 size={16} /> : '1'}
              </span>
              Nominator Details
            </h2>
            {nominatorState.completed && (
              <button
                type="button"
                onClick={() => setNominatorState((prev) => ({ ...prev, completed: false }))}
                className="text-sm font-bold text-brand-500 hover:underline"
              >
                Edit Step 1
              </button>
            )}
          </div>

          <div
            className={`space-y-6 ${nominatorState.completed ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    required
                    value={nominatorData.nominatorEmail}
                    onChange={(e) => {
                      setNominatorData({ ...nominatorData, nominatorEmail: e.target.value });
                      if (nominatorState.emailChecked)
                        setNominatorState((prev) => ({
                          ...prev,
                          emailChecked: false,
                          found: false,
                          editMode: false,
                        }));
                    }}
                    disabled={nominatorState.emailChecked}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all disabled:bg-gray-50 dark:disabled:bg-navy-800/50"
                    placeholder="Enter nominator email to check existing records..."
                  />
                </div>
                {!nominatorState.emailChecked ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={checkNominatorEmail}
                    isLoading={nominatorState.isChecking}
                    startIcon={<Search size={16} />}
                    className="sm:w-auto w-full px-6 shadow-md shadow-brand-500/20"
                  >
                    Verify Email
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setNominatorState((prev) => ({
                        ...prev,
                        emailChecked: false,
                        found: false,
                        editMode: false,
                      }))
                    }
                    className="sm:w-auto w-full px-6"
                  >
                    Change Email
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We will search the Registree database to auto-fill details if this user already
                exists.
              </p>
            </div>

            {nominatorState.emailChecked && (
              <div className="pt-6 border-t border-gray-100 dark:border-navy-800 space-y-4 animate-fade-in">
                {nominatorState.found && (
                  <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-100 dark:bg-brand-500/20 p-2 rounded-full text-brand-600 dark:text-brand-400">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          Existing User Found
                        </p>
                        <p className="text-xs text-brand-600 dark:text-brand-400">
                          Details have been pre-filled from our database.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-navy-900 px-3 py-1.5 rounded-lg border border-brand-200 dark:border-navy-700 shadow-sm">
                      <input
                        type="checkbox"
                        checked={nominatorState.editMode}
                        onChange={(e) =>
                          setNominatorState((prev) => ({ ...prev, editMode: e.target.checked }))
                        }
                        className="rounded text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Edit details
                      </span>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        disabled={isNominatorLocked}
                        value={nominatorData.nominatorName}
                        onChange={(e) =>
                          setNominatorData({ ...nominatorData, nominatorName: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-50 dark:disabled:bg-navy-800/50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Company *</label>
                    <div className="relative">
                      <Building
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        disabled={isNominatorLocked}
                        value={nominatorData.nominatorCompany}
                        onChange={(e) =>
                          setNominatorData({ ...nominatorData, nominatorCompany: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-50 dark:disabled:bg-navy-800/50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">City *</label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        disabled={isNominatorLocked}
                        value={nominatorData.nominatorCity}
                        onChange={(e) =>
                          setNominatorData({ ...nominatorData, nominatorCity: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-50 dark:disabled:bg-navy-800/50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        disabled={isNominatorLocked}
                        value={nominatorData.nominatorPhone}
                        onChange={(e) =>
                          setNominatorData({ ...nominatorData, nominatorPhone: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-50 dark:disabled:bg-navy-800/50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={completeNominatorSection}
                    className="shadow-lg shadow-brand-500/20 px-8"
                  >
                    Continue to Nominees
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Nominees */}
        <div
          className={`bg-white dark:bg-navy-900 rounded-3xl border border-gray-200 dark:border-navy-800 shadow-sm p-6 md:p-8 transition-all ${!nominatorState.completed ? 'opacity-50 pointer-events-none grayscale-[50%]' : ''}`}
        >
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-navy-800 pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-3 text-brand-600 dark:text-brand-400">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-bold">
                  2
                </span>
                Nominees ({nominees.length}/10)
              </h2>
            </div>
            {nominees.length < 10 && nominatorState.completed && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNominee}
                startIcon={<Plus size={14} />}
              >
                Add Nominee
              </Button>
            )}
          </div>

          <div className="space-y-8">
            {nominees.map((nominee, index) => {
              const isLocked = nominee.emailChecked && !nominee.editMode;

              return (
                <div
                  key={index}
                  className="p-6 bg-gray-50 dark:bg-navy-950/50 rounded-2xl border border-gray-100 dark:border-navy-800 relative"
                >
                  {nominees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNominee(index)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-xl transition-all"
                      title="Remove nominee"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <Award size={16} className="text-brand-500" /> Nominee #{index + 1}
                  </h3>

                  <div className="space-y-6">
                    {/* Email Lookup for Nominee */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Mail
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="email"
                            required
                            value={nominee.contactEmail}
                            onChange={(e) =>
                              updateNomineeField(index, 'contactEmail', e.target.value)
                            }
                            disabled={nominee.emailChecked}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-navy-800"
                            placeholder="Enter nominee email to verify..."
                          />
                        </div>
                        {!nominee.emailChecked ? (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => checkNomineeEmail(index)}
                            isLoading={nominee.isChecking}
                            startIcon={<Search size={14} />}
                          >
                            Verify
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateNomineeState(index, {
                                emailChecked: false,
                                found: false,
                                editMode: false,
                              })
                            }
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    </div>

                    {nominee.emailChecked && (
                      <div className="pt-4 border-t border-gray-200 dark:border-navy-800 animate-fade-in space-y-4">
                        {nominee.found && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-1">
                              <CheckCircle2 size={14} /> Existing user details loaded.
                            </span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={nominee.editMode}
                                onChange={(e) =>
                                  updateNomineeState(index, { editMode: e.target.checked })
                                }
                                className="rounded text-brand-500 focus:ring-brand-500"
                              />
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                Edit details
                              </span>
                            </label>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                              Category *
                            </label>
                            <select
                              required
                              value={nominee.category}
                              onChange={(e) =>
                                updateNomineeField(index, 'category', e.target.value)
                              }
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                            >
                              <option value="" disabled>
                                Select a category
                              </option>
                              {!isCategoriesLoading &&
                                categories.map((cat) => (
                                  <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              disabled={isLocked}
                              value={nominee.contactName}
                              onChange={(e) =>
                                updateNomineeField(index, 'contactName', e.target.value)
                              }
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-navy-800 disabled:text-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                              Company *
                            </label>
                            <input
                              type="text"
                              required
                              disabled={isLocked}
                              value={nominee.companyName}
                              onChange={(e) =>
                                updateNomineeField(index, 'companyName', e.target.value)
                              }
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-navy-800 disabled:text-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                              Mobile Number
                            </label>
                            <input
                              type="text"
                              disabled={isLocked}
                              value={nominee.mobileNo}
                              onChange={(e) =>
                                updateNomineeField(index, 'mobileNo', e.target.value)
                              }
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-navy-800 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-8 flex justify-end">
            <Button
              variant="primary"
              type="submit"
              isLoading={isCreating}
              className="shadow-lg shadow-brand-500/20 px-10 py-3 text-base font-bold"
            >
              Submit Nomination
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
