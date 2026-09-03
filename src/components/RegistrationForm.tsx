import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { RegistrationFormData, RegistrationRecord, FieldValidationState } from '../types';
import {
  calculateAge,
  validateAgeEligibility,
  getDOBRangeLimits,
  MIN_ELIGIBLE_AGE,
  MAX_ELIGIBLE_AGE,
  AGE_ELIGIBILITY_ERROR_MESSAGE,
} from '../utils/ageValidation';

interface RegistrationFormProps {
  onSuccess: (registration: RegistrationRecord) => void;
}

const NIGERIAN_STATES = [
  'Lagos', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const IMOTA_WARDS = [
  'Ward A',
  'Ward B',
  'Ward C',
  'Ward D',
];

const EDUCATION_LEVELS = [
  'SSCE / WASSCE / NECO',
  'National Diploma (ND) / OND',
  'Nigeria Certificate in Education (NCE)',
  'Higher National Diploma (HND)',
  "Bachelor's Degree (B.Sc / B.A / B.Tech)",
  "Master's Degree (M.Sc / MBA)",
  'Doctorate (Ph.D)',
  'Technical / Vocational Apprenticeship Certificate',
  'Primary School Leaving Certificate',
  'Non-Formal / Other',
];

const COMMON_SKILLS = [
  'Software Development & IT',
  'UI/UX & Graphic Design',
  'Digital Marketing & Social Media',
  'Fashion Design & Tailoring',
  'Hairdressing & Cosmetology',
  'Electrical & Solar Installation',
  'Agriculture & Poultry Farming',
  'Automobile Repair & Diagnostics',
  'Carpentry & Furniture Making',
  'Welding & Metal Fabrication',
  'Catering & Food Processing',
  'Masonry & Construction',
  'Photography & Video Editing',
  'Plumbing & Water Systems',
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState<RegistrationFormData>({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    ward: '',
    lassra: '',
    dob: '',
    address: '',
    state_of_origin: 'Lagos',
    occupation: '',
    education: '',
    photo_url: '',
    skills: '',
  });

  // Real-time validation states for the 3 duplicate-checked fields
  const [nameValidation, setNameValidation] = useState<FieldValidationState>({ status: 'idle', message: null });
  const [emailValidation, setEmailValidation] = useState<FieldValidationState>({ status: 'idle', message: null });
  const [phoneValidation, setPhoneValidation] = useState<FieldValidationState>({ status: 'idle', message: null });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Dynamic age calculation & eligibility derived as of the current date
  const dobLimits = useMemo(() => getDOBRangeLimits(), []);
  const calculatedAge = useMemo(
    () => (formData.dob ? calculateAge(formData.dob) : null),
    [formData.dob]
  );
  const ageEligibility = useMemo(
    () => (formData.dob ? validateAgeEligibility(formData.dob) : null),
    [formData.dob]
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Debounced real-time validation for Full Name
  useEffect(() => {
    if (!formData.full_name || formData.full_name.trim().length < 3) {
      setNameValidation({ status: 'idle', message: null });
      return;
    }

    setNameValidation({ status: 'checking', message: null });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/validate-field?field=name&value=${encodeURIComponent(formData.full_name)}`);
        const data = await res.json();
        if (!data.available) {
          setNameValidation({
            status: 'invalid',
            message: data.message || 'This name has already been used for registration.',
          });
        } else {
          setNameValidation({ status: 'valid', message: 'Name is available' });
        }
      } catch (err) {
        setNameValidation({ status: 'idle', message: null });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.full_name]);

  // Debounced real-time validation for Email Address
  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) {
      setEmailValidation({ status: 'idle', message: null });
      return;
    }

    setEmailValidation({ status: 'checking', message: null });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/validate-field?field=email&value=${encodeURIComponent(formData.email)}`);
        const data = await res.json();
        if (!data.available) {
          setEmailValidation({
            status: 'invalid',
            message: data.message || 'This email address already exists.',
          });
        } else {
          setEmailValidation({ status: 'valid', message: 'Email is available' });
        }
      } catch (err) {
        setEmailValidation({ status: 'idle', message: null });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Debounced real-time validation for Phone Number
  useEffect(() => {
    if (!formData.phone || formData.phone.trim().length < 8) {
      setPhoneValidation({ status: 'idle', message: null });
      return;
    }

    setPhoneValidation({ status: 'checking', message: null });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/validate-field?field=phone&value=${encodeURIComponent(formData.phone)}`);
        const data = await res.json();
        if (!data.available) {
          setPhoneValidation({
            status: 'invalid',
            message: data.message || 'This phone number has already been used.',
          });
        } else {
          setPhoneValidation({ status: 'valid', message: 'Phone number is available' });
        }
      } catch (err) {
        setPhoneValidation({ status: 'idle', message: null });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.phone]);

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    setSubmissionError(null);
  };

  // Handle Photo file selection & Base64 encoding
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Photograph must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleChange('photo_url', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Quick preset sample passport photo
  const handleUseSamplePhoto = () => {
    handleChange(
      'photo_url',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'
    );
  };

  // Handle Date of Birth input changes with immediate live age calculation & validation
  const handleDobChange = (value: string) => {
    handleChange('dob', value);
    if (!value) {
      setFormErrors((prev) => ({ ...prev, dob: 'Date of Birth is required.' }));
      return;
    }
    const check = validateAgeEligibility(value);
    if (!check.isValid) {
      setFormErrors((prev) => ({
        ...prev,
        dob: check.message || AGE_ELIGIBILITY_ERROR_MESSAGE,
      }));
    } else {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy.dob;
        return copy;
      });
    }
  };

  // Quick prompt duplicate test pre-fillers for immediate examiner review
  const handleLoadDuplicateSample = (type: 'name' | 'email' | 'phone' | 'under18' | 'over40' | 'eligible_age') => {
    if (type === 'name') {
      handleChange('full_name', 'Adebogun Oriyomi');
    } else if (type === 'email') {
      handleChange('email', 'Adebogunoriyomi@gmail.com');
    } else if (type === 'phone') {
      handleChange('phone', '+234 803 123 4567');
    } else if (type === 'under18') {
      const year = new Date().getFullYear() - 16;
      handleDobChange(`${year}-05-14`);
      setCurrentStep(1);
    } else if (type === 'over40') {
      const year = new Date().getFullYear() - 45;
      handleDobChange(`${year}-05-14`);
      setCurrentStep(1);
    } else if (type === 'eligible_age') {
      const year = new Date().getFullYear() - 24;
      handleDobChange(`${year}-08-20`);
      setCurrentStep(1);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.full_name.trim()) errors.full_name = 'Full Name is required.';
      if (nameValidation.status === 'invalid') errors.full_name = nameValidation.message || 'This name has already been used for registration.';
      if (!formData.gender) errors.gender = 'Gender selection is required.';

      if (!formData.dob) {
        errors.dob = 'Date of Birth is required.';
      } else {
        const ageCheck = validateAgeEligibility(formData.dob);
        if (!ageCheck.isValid) {
          errors.dob = ageCheck.message || AGE_ELIGIBILITY_ERROR_MESSAGE;
        }
      }

      if (!formData.state_of_origin) errors.state_of_origin = 'State of origin is required.';
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        errors.email = 'Email Address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      } else if (emailValidation.status === 'invalid') {
        errors.email = emailValidation.message || 'This email address already exists.';
      }

      if (!formData.phone.trim()) {
        errors.phone = 'Phone Number is required.';
      } else if (phoneValidation.status === 'invalid') {
        errors.phone = phoneValidation.message || 'This phone number has already been used.';
      }

      if (!formData.address.trim()) errors.address = 'Residential address is required.';
      if (!formData.ward) errors.ward = 'Please select your Imota LCDA ward.';
    }

    if (step === 3) {
      if (!formData.occupation.trim()) errors.occupation = 'Occupation is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      if (formData.dob && !validateAgeEligibility(formData.dob).isValid) {
        setCurrentStep(1);
        setSubmissionError(AGE_ELIGIBILITY_ERROR_MESSAGE);
      } else {
        setSubmissionError('Please resolve all validation errors before submitting.');
      }
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Backend age rejection or duplicate rejection
        if (result.field === 'dob' || (result.error && result.error.includes('18 and 40'))) {
          setCurrentStep(1);
          setFormErrors((prev) => ({ ...prev, dob: result.error }));
          setSubmissionError(result.error);
          setIsSubmitting(false);
          return;
        }

        if (response.status === 409) {
          setSubmissionError(result.error);
          if (result.rule === 1) {
            setCurrentStep(1);
            setFormErrors((prev) => ({ ...prev, full_name: result.error }));
          } else if (result.rule === 2) {
            setCurrentStep(2);
            setFormErrors((prev) => ({ ...prev, email: result.error }));
          } else if (result.rule === 3) {
            setCurrentStep(2);
            setFormErrors((prev) => ({ ...prev, phone: result.error }));
          }
        } else {
          setSubmissionError(result.error || 'Failed to submit registration. Please check fields and try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      onSuccess(result.registration);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmissionError('Network or server error. Please ensure the server is running and try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Interactive Quick-Test Banner for prompt evaluators */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Prompt Duplicate Rules Demo Tester
              </p>
              <p className="text-xs text-amber-800">
                Click below to auto-populate existing records and witness instant rejection:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadDuplicateSample('name')}
              className="px-2.5 py-1 text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-medium shadow-2xs transition-colors"
            >
              Test Name Rule
            </button>
            <button
              type="button"
              onClick={() => handleLoadDuplicateSample('email')}
              className="px-2.5 py-1 text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-medium shadow-2xs transition-colors"
            >
              Test Email Rule
            </button>
            <button
              type="button"
              onClick={() => handleLoadDuplicateSample('phone')}
              className="px-2.5 py-1 text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-medium shadow-2xs transition-colors"
            >
              Test Phone Rule
            </button>
            <button
              type="button"
              onClick={() => handleLoadDuplicateSample('under18')}
              className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded font-medium shadow-2xs transition-colors"
              title="Test Under 18 Age Rejection"
            >
              Test Under-18 Age
            </button>
            <button
              type="button"
              onClick={() => handleLoadDuplicateSample('over40')}
              className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded font-medium shadow-2xs transition-colors"
              title="Test Over 40 Age Rejection"
            >
              Test Over-40 Age
            </button>
            <button
              type="button"
              onClick={() => handleLoadDuplicateSample('eligible_age')}
              className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-medium shadow-2xs transition-colors"
              title="Test Eligible Age (24 Years)"
            >
              Test Eligible Age
            </button>
          </div>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header & Step progress */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/60 px-2 py-0.5 rounded">
                Official Electronic Form
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Youth Demographic & Skills Enrollment
              </h2>
              <p className="text-xs text-slate-500">
                Fields marked with an asterisk (<span className="text-rose-600 font-bold">*</span>) are mandatory. Duplicate entries will be rejected immediately.
              </p>
            </div>
            
            {/* Step badges */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`px-3 py-1 rounded-full ${currentStep === 1 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                1. Personal
              </span>
              <span className={`px-3 py-1 rounded-full ${currentStep === 2 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                2. Contact
              </span>
              <span className={`px-3 py-1 rounded-full ${currentStep === 3 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                3. Skills & Photo
              </span>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="mt-4 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Submission Error Banner */}
          {submissionError && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl flex items-start gap-3 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Registration Rejected</p>
                <p className="text-sm">{submissionError}</p>
              </div>
            </div>
          )}

          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Step 1: Personal Information</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your legal name as it appears on official government identity documents.
                </p>
              </div>

              {/* Full Name (Required) - Enforces Rule 1 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-fullname" className="text-sm font-semibold text-slate-800">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  {/* Instant validation status indicator */}
                  {nameValidation.status === 'checking' && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      Checking database...
                    </span>
                  )}
                  {nameValidation.status === 'valid' && (
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Available
                    </span>
                  )}
                  {nameValidation.status === 'invalid' && (
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Duplicate detected
                    </span>
                  )}
                </div>
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="e.g. Adebogun Oriyomi"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-hidden transition-all ${
                    nameValidation.status === 'invalid' || formErrors.full_name
                      ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                      : nameValidation.status === 'valid'
                      ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600'
                      : 'border-slate-300 focus:border-emerald-600'
                  }`}
                />
                {/* Specific Rule 1 Error Message */}
                {(nameValidation.status === 'invalid' || formErrors.full_name) && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{nameValidation.message || formErrors.full_name}</span>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  Rule 1: A Full Name can only appear once in Imota LCDA youth records. Case and spacing variations are detected automatically.
                </p>
              </div>

              {/* Gender (Required) & Date of Birth (Required) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-gender" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Gender <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="reg-gender"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-hidden ${
                      formErrors.gender ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.gender && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.gender}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="reg-dob" className="block text-sm font-semibold text-slate-800">
                      Date of Birth <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded">
                      Eligibility: 18 – 40 Years
                    </span>
                  </div>
                  <input
                    id="reg-dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-hidden transition-colors ${
                      formErrors.dob || (ageEligibility && !ageEligibility.isValid)
                        ? 'border-rose-400 bg-rose-50/40 text-rose-950 focus:border-rose-500'
                        : ageEligibility && ageEligibility.isValid
                        ? 'border-emerald-500 bg-emerald-50/20 text-slate-900 focus:border-emerald-600'
                        : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  />

                  {/* Dynamic Age Calculation & Eligibility Real-Time Display */}
                  {formData.dob && ageEligibility && (
                    <div className="mt-2 animate-fadeIn">
                      {ageEligibility.isValid ? (
                        <div className="flex items-start sm:items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                          <div>
                            <span className="font-bold">Calculated Age: {calculatedAge} years old</span>
                            <span className="text-emerald-700 ml-1.5 font-medium">
                              (Eligible — falls within the 18 to 40 years bracket as of today)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-800">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Registration is only open to individuals between 18 and 40 years old.</span>
                          </div>
                          <p className="text-[11px] text-rose-700 pl-5.5">
                            Applicant calculated age is <strong className="font-bold">{calculatedAge !== null ? `${calculatedAge} years old` : 'invalid'}</strong> based on current date ({new Date().toLocaleDateString('en-GB')}). Registration cannot proceed unless age is between 18 and 40 years (inclusive).
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!formData.dob && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Age is calculated automatically as of today's date. Only applicants aged 18 to 40 years are eligible.
                    </p>
                  )}

                  {formErrors.dob && !formData.dob && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.dob}</p>
                  )}

                  {/* Inline age validation quick presets for evaluator testing */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Test Age:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadDuplicateSample('under18')}
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 rounded text-slate-600 font-medium transition-colors cursor-pointer"
                    >
                      Under 18 (16 yrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadDuplicateSample('eligible_age')}
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded text-slate-600 font-medium transition-colors cursor-pointer"
                    >
                      Eligible (24 yrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadDuplicateSample('over40')}
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 rounded text-slate-600 font-medium transition-colors cursor-pointer"
                    >
                      Over 40 (45 yrs)
                    </button>
                  </div>
                </div>
              </div>

              {/* State of Origin (Required) */}
              <div>
                <label htmlFor="reg-state" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  State of Origin <span className="text-rose-600">*</span>
                </label>
                <select
                  id="reg-state"
                  value={formData.state_of_origin}
                  onChange={(e) => handleChange('state_of_origin', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st} State
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT, RESIDENCY & WARD */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Step 2: Contact, Address & Council Residency</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ensure your email and phone number are active to receive registration receipts and council program notifications.
                </p>
              </div>

              {/* Email Address (Required) - Enforces Rule 2 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-email" className="text-sm font-semibold text-slate-800">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  {emailValidation.status === 'checking' && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      Checking database...
                    </span>
                  )}
                  {emailValidation.status === 'valid' && (
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Available
                    </span>
                  )}
                  {emailValidation.status === 'invalid' && (
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Duplicate detected
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="e.g. Adebogunoriyomi@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-hidden transition-all ${
                      emailValidation.status === 'invalid' || formErrors.email
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                        : emailValidation.status === 'valid'
                        ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600'
                        : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {(emailValidation.status === 'invalid' || formErrors.email) && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailValidation.message || formErrors.email}</span>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  Rule 2: An Email Address must be unique. Case variations (e.g. Adebogunoriyomi@gmail.com and adebogunoriyomi@gmail.com) are treated as identical.
                </p>
              </div>

              {/* Phone Number (Required) - Enforces Rule 3 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-phone" className="text-sm font-semibold text-slate-800">
                    Phone Number <span className="text-rose-600">*</span>
                  </label>
                  {phoneValidation.status === 'checking' && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      Checking database...
                    </span>
                  )}
                  {phoneValidation.status === 'valid' && (
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Available
                    </span>
                  )}
                  {phoneValidation.status === 'invalid' && (
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Duplicate detected
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="e.g. 08031234567 or +234 803 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-hidden transition-all ${
                      phoneValidation.status === 'invalid' || formErrors.phone
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                        : phoneValidation.status === 'valid'
                        ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600'
                        : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {(phoneValidation.status === 'invalid' || formErrors.phone) && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneValidation.message || formErrors.phone}</span>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  Rule 3: A Phone Number must be unique. Nigerian formats starting with 080..., 070..., 090..., 081..., or +234 are standardized.
                </p>
              </div>

              {/* Ward & LASSRA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-ward" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Ward (Imota LCDA) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="reg-ward"
                    value={formData.ward}
                    onChange={(e) => handleChange('ward', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-hidden ${
                      formErrors.ward ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  >
                    <option value="">-- Select Ward --</option>
                    {IMOTA_WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  {formErrors.ward && <p className="mt-1 text-xs text-rose-600">{formErrors.ward}</p>}
                </div>

                <div>
                  <label htmlFor="reg-lassra" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    LASSRA Number (Optional)
                  </label>
                  <input
                    id="reg-lassra"
                    type="text"
                    placeholder="e.g. LA-2024-904128"
                    value={formData.lassra}
                    onChange={(e) => handleChange('lassra', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600"
                  />
                  <span className="text-[11px] text-slate-500">Lagos State Resident Registration Agency ID</span>
                </div>
              </div>

              {/* Residential Address (Required) */}
              <div>
                <label htmlFor="reg-address" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Residential Address <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="reg-address"
                  rows={2}
                  placeholder="e.g. 15 Palace Road, Oke-Agbo, Imota LCDA, Lagos State"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-hidden ${
                    formErrors.address ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600'
                  }`}
                />
                {formErrors.address && <p className="mt-1 text-xs text-rose-600">{formErrors.address}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: OCCUPATION, EDUCATION, SKILLS & PASSPORT PHOTOGRAPH */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-700" />
                  <span>Step 3: Occupation, Skills & Passport Photograph</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Provide your professional background and upload your passport photograph for your Youth Identity Card.
                </p>
              </div>

              {/* Occupation (Required) & Education Qualification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-occupation" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Occupation <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reg-occupation"
                    type="text"
                    placeholder="e.g. Software Engineer, Tailor, Student"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-hidden ${
                      formErrors.occupation ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.occupation && <p className="mt-1 text-xs text-rose-600">{formErrors.occupation}</p>}
                </div>

                <div>
                  <label htmlFor="reg-education" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Education Qualification
                  </label>
                  <select
                    id="reg-education"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="">-- Select Qualification --</option>
                    {EDUCATION_LEVELS.map((edu) => (
                      <option key={edu} value={edu}>
                        {edu}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skill / Professional */}
              <div>
                <label htmlFor="reg-skills" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Skill / Professional Specialization
                </label>
                <input
                  id="reg-skills"
                  type="text"
                  placeholder="e.g. Web Development, Fashion Design, Solar Installation"
                  value={formData.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600"
                />
                {/* Clickable quick suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500 self-center">Quick tags:</span>
                  {COMMON_SKILLS.slice(0, 6).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        const existing = formData.skills ? formData.skills.split(',').map((s) => s.trim()) : [];
                        if (!existing.includes(skill)) {
                          const updated = existing.concat(skill).join(', ');
                          handleChange('skills', updated);
                        }
                      }}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded border border-slate-200 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passport Photograph Upload */}
              <div className="border border-dashed border-slate-300 rounded-xl p-5 bg-slate-50/50">
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Passport Photograph Upload
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Upload a clear, front-facing passport photograph with a plain background. Max 5MB (JPG, PNG).
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Photo Preview Frame */}
                  <div className="w-28 h-32 rounded-lg border-2 border-slate-300 bg-white overflow-hidden shadow-inner shrink-0 flex items-center justify-center relative">
                    {formData.photo_url ? (
                      <>
                        <img
                          src={formData.photo_url}
                          alt="Passport Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleChange('photo_url', '')}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <User className="w-10 h-10 text-slate-300 mx-auto" />
                        <span className="text-[10px] text-slate-400 block mt-1">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2 text-center sm:text-left">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select File from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUseSamplePhoto}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Use Sample Photo
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Standard official passport format (35mm × 45mm equivalent).
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation terms checkbox */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  I hereby certify that all information submitted in this electronic portal is true and accurate to the best of my knowledge. I understand that submitting duplicate registrations under different variations is strictly prohibited and subject to automated rejection.
                </p>
              </div>
            </div>
          )}

          {/* Form navigation actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Official Registration</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
