import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { Loader2 } from 'lucide-react';
import welcomeBookImg from '../../assets/Onboardpage/welcomebook.webp';
import sendImg from '../../assets/Onboardpage/send.webp';
import { useAuth } from '../../context/AuthContext';
import { setClientUserCookie } from '../../utils/auth/authUtils';

export default function OnboardModalContent({ onClose }) {
  const navigate = useNavigate();
  const { user, setUser, closeAuthModal } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinishOrClose = (destination = '/my-flipbooks') => {
    if (onClose) {
      onClose();
    } else if (closeAuthModal) {
      closeAuthModal();
    }
    if (destination) {
      navigate(destination);
    }
  };

  // Steps: 1 = Welcome, 2 = Personal, 3 = Account Type, 4 = Professional, 5 = Purpose, 6 = All Set!
  const [currentStep, setCurrentStep] = useState(1);

  // Form state for Step 2: Personal
  const [personalData, setPersonalData] = useState({
    fullName: user?.name || user?.fullName || '',
    displayName: '',
    emailId: user?.emailId || user?.email || '',
  });
  const [displayNameError, setDisplayNameError] = useState('');

  // Update fields if user object loads asynchronously
  React.useEffect(() => {
    if (user?.emailId || user?.email) {
      setPersonalData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        emailId: user.emailId || user.email || prev.emailId,
      }));
      setBusinessEmail((prev) => (prev ? prev : (user.emailId || user.email || '')));
    }
  }, [user]);

  // Selection state for Step 3: Account Type ('individual' | 'freelancer' | 'agency' | 'company')
  const [selectedAccountType, setSelectedAccountType] = useState('individual');

  // Form state for Step 4: Professional (Dynamic per Account Type)
  const [professionalTitle, setProfessionalTitle] = useState('Fist-o Tech Pvt Lmt');
  const [industryType, setIndustryType] = useState('Software Development');
  const [yearsOfExperience, setYearsOfExperience] = useState('2 Years');
  const [teamSize, setTeamSize] = useState('40 - 50 Peoples');
  const [companySize, setCompanySize] = useState('100 - 120 Peoples');
  const [businessEmail, setBusinessEmail] = useState(
    user?.emailId || user?.email || ''
  );

  const [skills, setSkills] = useState([
    'Website',
    'Mobile Application',
    'IDC',
    '3D Models',
    'Immersive Website',
    'Customized Designs',
  ]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');

  // Selection state for Step 5: Purpose
  const [selectedPurpose, setSelectedPurpose] = useState('business-promotion');
  const [otherPurposeText, setOtherPurposeText] = useState('');

  const steps = [
    { number: 1, label: 'Welcome' },
    { number: 2, label: 'Personal' },
    { number: 3, label: 'Account Type' },
    { number: 4, label: 'Professional' },
    { number: 5, label: 'Purpose' },
    { number: 6, label: 'All Set!' },
  ];

  const accountTypes = [
    {
      id: 'individual',
      title: 'Individual',
      description: 'For Personal And Creative Professionals.',
      icon: 'solar:user-linear',
    },
    {
      id: 'freelancer',
      title: 'Freelancer',
      description: 'For Independent Professionals',
      icon: 'solar:suitcase-linear',
    },
    {
      id: 'agency',
      title: 'Agency',
      description: 'For Creative Agencies',
      icon: 'solar:users-group-rounded-linear',
    },
    {
      id: 'company',
      title: 'Company',
      description: 'For Businesses And Organizations.',
      icon: 'solar:buildings-2-linear',
    },
  ];

  const purposeOptions = [
    {
      id: 'business-promotion',
      title: 'Business Promotion',
      description: 'Showcase Products And Services.',
      icon: 'solar:case-minimalistic-linear',
    },
    {
      id: 'marketing-advertising',
      title: 'Marketing & Advertising',
      description: 'Promote Brands, Products And Campaigns.',
      icon: 'solar:bullhorn-linear',
    },
    {
      id: 'personal-portfolio',
      title: 'Personal Portfolio',
      description: 'Present Your Work And Achievements.',
      icon: 'solar:user-linear',
    },
    {
      id: 'client-presentations',
      title: 'Client Presentations',
      description: 'Share Professional Presentations.',
      icon: 'solar:monitor-linear',
    },
    {
      id: 'education-training',
      title: 'Education & Training',
      description: 'Present Learning Materials And Resources.',
      icon: 'solar:square-academic-cap-linear',
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Something Else In Mind.',
      icon: 'solar:menu-dots-linear',
    },
  ];

  const saveOnboardingProfile = async () => {
    setIsSubmitting(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const email = personalData.emailId || user?.emailId || user?.email;

    // Map fields according to selected account type and profile schema
    let experienceOrTeam = '';
    if (selectedAccountType === 'freelancer') {
      experienceOrTeam = yearsOfExperience;
    } else if (selectedAccountType === 'agency') {
      experienceOrTeam = teamSize;
    } else if (selectedAccountType === 'company') {
      experienceOrTeam = companySize;
    }

    const payload = {
      emailId: email,
      name: personalData.fullName || user?.name || '',
      displayName: personalData.displayName.trim() || personalData.fullName || user?.displayName || '',
      profileType: selectedAccountType,
      accountType: selectedAccountType,
      professionalTitle: professionalTitle,
      companyName: selectedAccountType === 'company' || selectedAccountType === 'agency' ? professionalTitle : (user?.companyName || ''),
      industryType: selectedAccountType !== 'individual' ? industryType : '',
      companyEmail: businessEmail || '',
      services: skills,
      experienceOrTeamSize: experienceOrTeam,
      primaryPurpose: selectedPurpose,
    };

    try {
      if (email) {
        const res = await axios.post(
          `${backendUrl}/api/profile/save`,
          payload,
          { withCredentials: true }
        );

        if (res.data?.success && res.data?.profile) {
          const updatedUser = {
            ...(user || {}),
            ...payload,
            ...res.data.profile,
          };
          if (setUser) setUser(updatedUser);
          setClientUserCookie(updatedUser);
          window.dispatchEvent(new CustomEvent('profileUpdate', { detail: updatedUser }));
        }
      }
    } catch (err) {
      console.warn('[Onboarding] Profile save fallback (saved locally):', err?.message);
      const fallbackUser = {
        ...(user || {}),
        ...payload,
      };
      if (setUser) setUser(fallbackUser);
      setClientUserCookie(fallbackUser);
      window.dispatchEvent(new CustomEvent('profileUpdate', { detail: fallbackUser }));
    } finally {
      setIsSubmitting(false);
      setCurrentStep(6);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!personalData.displayName.trim()) {
        setDisplayNameError('Please enter your Display Name');
        return;
      }
      setDisplayNameError('');
      setCurrentStep(3);
    } else if (currentStep === 5) {
      saveOnboardingProfile();
    } else if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinishOrClose('/my-flipbooks');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkipSetup = () => {
    handleFinishOrClose('/my-flipbooks');
  };

  const handleViewProfile = () => {
    handleFinishOrClose('/settings/profile');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleAddSkill = () => {
    const trimmed = newSkillText.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkillText('');
    setIsAddingSkill(false);
  };

  return (
    <div className="w-full max-w-[760px] max-h-[92vh] bg-white rounded-[22px] sm:rounded-[28px] border border-gray-100/90 shadow-[0_12px_45px_rgba(0,0,0,0.15)] px-6 py-6 sm:px-12 sm:py-7 md:px-14 md:py-8 flex flex-col justify-between items-center transition-all duration-300 select-none">
      
      {/* Step Progress Bar */}
      <div className="w-full max-w-[580px] mb-4 sm:mb-5">
        <div className="relative flex items-center justify-between">
          {/* Connecting line behind circles */}
          <div
            className={`absolute top-[14px] left-[14px] right-[14px] h-[1.5px] -z-0 transition-colors ${
              currentStep === 6 ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          />

          {steps.map((step) => {
            const isStep6AllSet = currentStep === 6;
            const isPassed = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isFilled = isPassed || isCurrent;

            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] rounded-full flex items-center justify-center text-[11.5px] sm:text-[12.5px] font-medium transition-all ${
                    isStep6AllSet
                      ? 'bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
                      : isFilled
                      ? 'bg-[#EC5137] text-white shadow-[0_2px_8px_rgba(236,81,55,0.35)]'
                      : 'bg-white border border-gray-300 text-gray-400'
                  }`}
                >
                  {isStep6AllSet ? (
                    <span className="text-[13px] font-bold">✓</span>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors ${
                    isStep6AllSet
                      ? 'text-emerald-600'
                      : isFilled
                      ? 'text-[#EC5137]'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: WELCOME SCREEN */}
      {currentStep === 1 && (
        <div className="w-full flex flex-col items-center flex-1 justify-center animate-in fade-in duration-200">
          <div className="text-center max-w-[520px]">
            <h1 className="text-[24px] sm:text-[30px] md:text-[33px] font-bold text-[#14151a] tracking-tight font-poppins leading-tight">
              Welcome to Flipibook!
            </h1>
            <p className="mt-1.5 text-[13px] sm:text-[14px] text-gray-400 font-normal">
              Turn Your Ideas Into Interactive Digital Experiences.
            </p>
          </div>

          <div className="my-3 sm:my-4 flex justify-center items-center w-full max-w-[340px]">
            <img
              src={welcomeBookImg}
              alt="Flipbook Welcome Experience"
              className="w-full h-auto max-h-[220px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
              loading="eager"
            />
          </div>

          <div className="text-center max-w-[480px] mb-4 sm:mb-5">
            <p className="text-[12px] sm:text-[13px] text-gray-400 font-normal leading-relaxed">
              Create Stunning Digital Catalogues, Showcase 3D Products And Bring Your Content To Life With Interactive Experiences.
            </p>
          </div>

          <div className="w-full max-w-[480px]">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3 sm:py-3.5 px-6 bg-gradient-to-r from-[#FF6B50] to-[#EC5137] hover:from-[#f85c3f] hover:to-[#e0452b] active:scale-[0.99] text-white font-semibold text-[14px] sm:text-[15px] rounded-[12px] shadow-[0_6px_20px_rgba(236,81,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Let's Get Started</span>
              <span className="text-[16px] transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PERSONAL INFO SCREEN */}
      {currentStep === 2 && (
        <div className="w-full flex flex-col items-center flex-1 justify-center animate-in fade-in duration-200">
          <div className="text-center max-w-[520px] mb-4 sm:mb-6">
            <h1 className="text-[24px] sm:text-[30px] md:text-[33px] font-bold text-[#14151a] tracking-tight font-poppins leading-tight">
              Let's get to know you!
            </h1>
            <p className="mt-1.5 text-[13px] sm:text-[14px] text-gray-400 font-normal">
              Tell Us A Little About Yourself To Personalize Your Flipibook Experience.
            </p>
          </div>

          <div className="w-full max-w-[460px] flex flex-col gap-3.5 sm:gap-4">
            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-[#EC5137]">*</span>
              </label>
              <input
                type="text"
                value={personalData.fullName}
                onChange={(e) =>
                  setPersonalData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-[10px] text-[13px] sm:text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137] focus:ring-1 focus:ring-[#EC5137] transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-medium text-gray-700 mb-1.5">
                Display Name <span className="text-[#EC5137]">*</span>
              </label>
              <input
                type="text"
                value={personalData.displayName}
                onChange={(e) => {
                  setPersonalData((prev) => ({ ...prev, displayName: e.target.value }));
                  if (displayNameError) setDisplayNameError('');
                }}
                placeholder="Enter your display name"
                className={`w-full px-3.5 py-2.5 sm:py-3 bg-white border rounded-[10px] text-[13px] sm:text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none transition-all ${
                  displayNameError
                    ? 'border-red-500 ring-1 ring-red-500'
                    : 'border-gray-200 focus:border-[#EC5137] focus:ring-1 focus:ring-[#EC5137]'
                }`}
              />
              {displayNameError && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {displayNameError}
                </p>
              )}
            </div>
          </div>

          <p className="mt-5 text-[11px] text-[#ff644c] text-center max-w-[460px]">
            You Can Update Or Change Any Of The Details You've Provided Anytime From Your Profile Settings.
          </p>

          <div className="w-full max-w-[460px] flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] text-gray-600 font-semibold text-[13px] sm:text-[14px] rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>← Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#FF6B50] to-[#EC5137] hover:from-[#f85c3f] hover:to-[#e0452b] active:scale-[0.99] text-white font-semibold text-[13px] sm:text-[14px] rounded-[12px] shadow-[0_6px_20px_rgba(236,81,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Next</span>
              <span className="text-[15px] transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ACCOUNT TYPE SCREEN */}
      {currentStep === 3 && (
        <div className="w-full flex flex-col items-center flex-1 justify-center animate-in fade-in duration-200">
          <div className="text-center max-w-[540px] mb-5 sm:mb-7">
            <h1 className="text-[24px] sm:text-[30px] md:text-[33px] font-bold text-[#14151a] tracking-tight font-poppins leading-tight">
              How do you identify yourself?
            </h1>
            <p className="mt-1.5 text-[13px] sm:text-[14px] text-gray-400 font-normal">
              Choose Your Account Type So We Can Tailor Your Profile To Your Work.
            </p>
          </div>

          <div className="w-full max-w-[560px] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {accountTypes.map((type) => {
              const isSelected = selectedAccountType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedAccountType(type.id)}
                  className={`p-4 sm:p-5 rounded-[14px] sm:rounded-[16px] text-left transition-all cursor-pointer flex flex-col justify-start border ${
                    isSelected
                      ? 'border-[#EC5137] bg-white ring-1 ring-[#EC5137] shadow-[0_4px_16px_rgba(236,81,55,0.08)]'
                      : 'border-gray-200/90 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="mb-3">
                    <Icon
                      icon={type.icon}
                      className={`w-6 h-6 transition-colors ${
                        isSelected ? 'text-[#EC5137]' : 'text-gray-300'
                      }`}
                    />
                  </div>
                  <h3 className="text-[15px] sm:text-[16px] font-semibold text-gray-800 tracking-tight font-poppins mb-1">
                    {type.title}
                  </h3>
                  <p className="text-[11.5px] sm:text-[12px] text-gray-400 leading-snug font-normal">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-[11px] text-[#ff644c] text-center max-w-[560px]">
            You Can Update Or Change Any Of The Details You've Provided Anytime From Your Profile Settings.
          </p>

          <div className="w-full max-w-[560px] flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] text-gray-600 font-semibold text-[13px] sm:text-[14px] rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>← Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#FF6B50] to-[#EC5137] hover:from-[#f85c3f] hover:to-[#e0452b] active:scale-[0.99] text-white font-semibold text-[13px] sm:text-[14px] rounded-[12px] shadow-[0_6px_20px_rgba(236,81,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Next</span>
              <span className="text-[15px] transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PROFESSIONAL INFO SCREEN (DYNAMIC BY ACCOUNT TYPE) */}
      {currentStep === 4 && (
        <div className="w-full flex flex-col items-center flex-1 justify-center animate-in fade-in duration-200">
          <div className="text-center max-w-[540px] mb-3 sm:mb-4">
            <h1 className="text-[23px] sm:text-[27px] md:text-[30px] font-bold text-[#14151a] tracking-tight font-poppins leading-tight">
              Tell us about your work.
            </h1>
            <p className="mt-1 text-[12px] sm:text-[13px] text-gray-400 font-normal">
              Add A Few Professional Details To Help Others Understand What You Do.
            </p>
          </div>

          <div className="w-full max-w-[500px] flex flex-col gap-2.5 sm:gap-3">
            {/* VARIANT 1: INDIVIDUAL */}
            {selectedAccountType === 'individual' && (
              <>
                {/* Professional Title */}
                <div>
                  <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder="e.g. Fist-o Tech Pvt Lmt"
                    className="w-full px-3.5 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-[10px] text-[12.5px] sm:text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137] focus:ring-1 focus:ring-[#EC5137] transition-all"
                  />
                </div>
              </>
            )}

            {/* VARIANT 2: FREELANCER */}
            {selectedAccountType === 'freelancer' && (
              <>
                {/* Row 1: Professional Title + Industry Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g. Fist-o Tech Pvt Lmt"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137] focus:ring-1 focus:ring-[#EC5137] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Industry Type
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:chart-2-linear" className="w-4 h-4" />
                      </div>
                      <select
                        value={industryType}
                        onChange={(e) => setIndustryType(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 focus:outline-none focus:border-[#EC5137] appearance-none cursor-pointer"
                      >
                        <option value="Software Development">Software Development</option>
                        <option value="Design & Creative">Design & Creative</option>
                        <option value="Marketing & Sales">Marketing & Sales</option>
                        <option value="Education">Education</option>
                        <option value="Architecture & 3D">Architecture & 3D</option>
                      </select>
                      <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Years of Experience + Business Gmail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:case-minimalistic-linear" className="w-4 h-4" />
                      </div>
                      <select
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 focus:outline-none focus:border-[#EC5137] appearance-none cursor-pointer"
                      >
                        <option value="1 Year">1 Year</option>
                        <option value="2 Years">2 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                      <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Business Gmail
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none">
                        <Icon icon="logos:google-icon" className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="fistotech@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VARIANT 3: AGENCY */}
            {selectedAccountType === 'agency' && (
              <>
                {/* Row 1: Agency Name + Industry Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g. Fist-o Tech Pvt Lmt"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137] focus:ring-1 focus:ring-[#EC5137] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Industry Type
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:chart-2-linear" className="w-4 h-4" />
                      </div>
                      <select
                        value={industryType}
                        onChange={(e) => setIndustryType(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 focus:outline-none focus:border-[#EC5137] appearance-none cursor-pointer"
                      >
                        <option value="Software Development">Software Development</option>
                        <option value="Design & Creative">Design & Creative</option>
                        <option value="Marketing & Advertising">Marketing & Advertising</option>
                        <option value="Digital Media">Digital Media</option>
                      </select>
                      <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Team Size + Business Gmail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Team Size
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:users-group-rounded-linear" className="w-4 h-4" />
                      </div>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 focus:outline-none focus:border-[#EC5137] appearance-none cursor-pointer"
                      >
                        <option value="1 - 10 Peoples">1 - 10 Peoples</option>
                        <option value="10 - 25 Peoples">10 - 25 Peoples</option>
                        <option value="40 - 50 Peoples">40 - 50 Peoples</option>
                        <option value="50+ Peoples">50+ Peoples</option>
                      </select>
                      <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Business Gmail
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none">
                        <Icon icon="logos:google-icon" className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="fistotech@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VARIANT 4: COMPANY */}
            {selectedAccountType === 'company' && (
              <>
                {/* Row 1: Company / Organization Name + Industry Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g. Fist-o Tech Pvt Lmt"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137] focus:ring-1 focus:ring-[#EC5137] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Industry Type
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:chart-2-linear" className="w-4 h-4" />
                      </div>
                      <select
                        value={industryType}
                        onChange={(e) => setIndustryType(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 focus:outline-none focus:border-[#EC5137] appearance-none cursor-pointer"
                      >
                        <option value="Software Development">Software Development</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail & E-commerce">Retail & E-commerce</option>
                        <option value="Finance & Banking">Finance & Banking</option>
                      </select>
                      <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Company Size + Business Gmail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Company Size
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:buildings-2-linear" className="w-4 h-4" />
                      </div>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 focus:outline-none focus:border-[#EC5137] appearance-none cursor-pointer"
                      >
                        <option value="10 - 50 Peoples">10 - 50 Peoples</option>
                        <option value="50 - 100 Peoples">50 - 100 Peoples</option>
                        <option value="100 - 120 Peoples">100 - 120 Peoples</option>
                        <option value="120+ Peoples">120+ Peoples</option>
                      </select>
                      <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
                        <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                      Business Gmail
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none">
                        <Icon icon="logos:google-icon" className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="fistotech@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-[10px] text-[12.5px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#EC5137]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* COMMON SERVICES / EXPERTISE FOR ALL TYPES */}
            <div>
              <label className="block text-[11.5px] sm:text-[12.5px] font-medium text-gray-700 mb-1">
                {selectedAccountType === 'individual'
                  ? 'Skills / Expertise'
                  : 'Services / Expertise *'}
              </label>
              <div className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] min-h-[95px] flex flex-wrap items-center content-start gap-1.5 sm:gap-2">
                {isAddingSkill ? (
                  <div className="flex items-center gap-1.5 bg-orange-50/70 border border-[#EC5137] rounded-[7px] px-2 py-1">
                    <input
                      type="text"
                      autoFocus
                      value={newSkillText}
                      onChange={(e) => setNewSkillText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        } else if (e.key === 'Escape') {
                          setIsAddingSkill(false);
                          setNewSkillText('');
                        }
                      }}
                      placeholder="Type & enter..."
                      className="text-[11px] bg-transparent text-gray-800 outline-none w-24"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="text-[#EC5137] text-[12px] font-bold hover:scale-110"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[7px] border border-[#ff7056] text-[#EC5137] bg-white hover:bg-orange-50/50 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <span className="text-[12px] font-bold leading-none">+</span>
                    <span>Add Service</span>
                  </button>
                )}

                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-[#f5f6f8] text-gray-600 text-[11px] font-normal border border-gray-100"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-gray-700 cursor-pointer text-[11px] leading-none transition-colors ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-3.5 text-[10.5px] text-[#ff644c] text-center max-w-[500px]">
            You Can Update Or Change Any Of The Details You've Provided Anytime From Your Profile Settings.
          </p>

          <div className="w-full max-w-[500px] flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 py-2 sm:py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] text-gray-600 font-semibold text-[13px] rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>← Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2 sm:py-2.5 px-4 bg-gradient-to-r from-[#FF6B50] to-[#EC5137] hover:from-[#f85c3f] hover:to-[#e0452b] active:scale-[0.99] text-white font-semibold text-[13px] rounded-[12px] shadow-[0_6px_20px_rgba(236,81,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Next</span>
              <span className="text-[14px] transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>

          {/* Skip Setup Footer */}
          <div className="mt-3 text-center">
            <span className="text-[11.5px] text-gray-400 font-normal">
              Already Familiar With Flipibook?{' '}
            </span>
            <button
              type="button"
              onClick={handleSkipSetup}
              className="text-[11.5px] text-[#EC5137] hover:text-[#d93f26] font-semibold cursor-pointer transition-colors"
            >
              Skip Setup
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PURPOSE SCREEN ("How Will You Use Flipibook?") */}
      {currentStep === 5 && (
        <div className="w-full flex flex-col items-center flex-1 justify-center animate-in fade-in duration-200">
          <div className="text-center max-w-[540px] mb-4 sm:mb-5">
            <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#14151a] tracking-tight font-poppins leading-tight">
              How Will You Use Flipibook?
            </h1>
            <p className="mt-1.5 text-[12.5px] sm:text-[13.5px] text-gray-400 font-normal">
              Tell Us How You Plan To Use Flipibook So We Can Make Your Experience More Relevant.
            </p>
          </div>

          <div className="w-full max-w-[620px] grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {purposeOptions.map((opt) => {
              const isSelected = selectedPurpose === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedPurpose(opt.id)}
                  className={`p-3.5 sm:p-4 rounded-[14px] text-left transition-all cursor-pointer flex flex-col justify-start border ${
                    isSelected
                      ? 'border-[#EC5137] bg-white ring-1 ring-[#EC5137] shadow-[0_4px_16px_rgba(236,81,55,0.08)]'
                      : 'border-gray-200/90 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2.5">
                    <Icon
                      icon={opt.icon}
                      className={`w-5 h-5 transition-colors ${
                        isSelected ? 'text-[#EC5137]' : 'text-gray-300'
                      }`}
                    />
                  </div>
                  <h3 className="text-[13.5px] sm:text-[14px] font-semibold text-gray-800 tracking-tight font-poppins mb-1">
                    {opt.title}
                  </h3>
                  <p className="text-[11px] sm:text-[11.5px] text-gray-400 leading-snug font-normal">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="mt-4 sm:mt-5 text-[11px] text-[#ff644c] text-center max-w-[560px]">
            You Can Update Or Change Any Of The Details You've Provided Anytime From Your Profile Settings.
          </p>

          <div className="w-full max-w-[560px] flex items-center gap-3 mt-3.5">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] text-gray-600 font-semibold text-[13px] sm:text-[14px] rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>← Previous</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#FF6B50] to-[#EC5137] hover:from-[#f85c3f] hover:to-[#e0452b] active:scale-[0.99] text-white font-semibold text-[13px] sm:text-[14px] rounded-[12px] shadow-[0_6px_20px_rgba(236,81,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Finish Setup</span>
                  <span className="text-[15px] transition-transform duration-200 group-hover:translate-x-1">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ALL SET SCREEN */}
      {currentStep === 6 && (
        <div className="w-full flex flex-col items-center flex-1 justify-center animate-in fade-in duration-200">
          <div className="my-2 sm:my-3 flex justify-center items-center w-full max-w-[280px]">
            <img
              src={sendImg}
              alt="All Set"
              className="w-full h-auto max-h-[190px] object-contain drop-shadow-[0_12px_28px_rgba(16,185,129,0.12)]"
              loading="eager"
            />
          </div>

          <div className="text-center max-w-[480px] mb-6">
            <h1 className="text-[26px] sm:text-[32px] md:text-[35px] font-bold text-[#14151a] tracking-tight font-poppins leading-tight">
              You're All Set!
            </h1>
            <p className="mt-2 text-[13px] sm:text-[14px] text-gray-400 font-normal leading-relaxed">
              Your Profile Is Ready. Start Creating Engaging Digital Experiences And Showcase Your Work With Flipibook.
            </p>
          </div>

          <div className="w-full max-w-[480px] flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleViewProfile}
              className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] text-gray-700 font-semibold text-[13px] sm:text-[14px] rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon icon="solar:eye-linear" className="w-4 h-4 text-gray-500" />
              <span>View My Profile</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FF6B50] to-[#EC5137] hover:from-[#f85c3f] hover:to-[#e0452b] active:scale-[0.99] text-white font-semibold text-[13px] sm:text-[14px] rounded-[12px] shadow-[0_6px_20px_rgba(236,81,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Go to Flipibook</span>
              <span className="text-[15px] transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
