import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { User, Building, MapPin, Globe, Check, X, Upload, Trash2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import { Country, State } from 'country-state-city';
import PhoneInputModule from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { useToast } from '../../CustomToast';
import { useAuth } from '../../../context/AuthContext';
const resolveUploadsPath = (path) => path || '';

const PhoneInput = PhoneInputModule?.default || PhoneInputModule;

// Validate mobile numbers for all countries using libphonenumber-js/max metadata:
// Ensures the number matches the country's exact length, starting digits, and is a MOBILE number.
export const validateWorldwideMobile = (value, countryCode) => {
  if (!value || !value.toString().trim()) return true;
  const rawNum = value.toString().replace(/\D/g, '');
  if (!rawNum) return true;

  const dial = (countryCode || '+91').replace(/\D/g, '');
  const fullE164 = '+' + dial + rawNum;

  try {
    const phoneNumber = parsePhoneNumberFromString(fullE164);
    if (!phoneNumber || !phoneNumber.isValid()) {
      return false;
    }
    const type = phoneNumber.getType();
    // Allow MOBILE and FIXED_LINE_OR_MOBILE (used in countries like US/Canada where mobile and landlines share ranges)
    return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
  } catch (e) {
    return false;
  }
};

// Reusable phone component with flag dropdown and validity styling
const ProfilePhoneField = ({ value, countryCode, onChange, onBlur, placeholder = "1234567890", hasError }) => {
  const defaultCountry = 'in';
  const defaultDialCode = '91';

  const getCountryFromCode = (code) => {
    const rawDial = (code || '+91').replace(/\D/g, '') || defaultDialCode;
    try {
      const parsed = parsePhoneNumberFromString('+' + rawDial + '1234567890');
      if (parsed && parsed.country) return parsed.country.toLowerCase();
    } catch (e) {}
    if (rawDial === '1') return 'us';
    if (rawDial === '44') return 'gb';
    if (rawDial === '91') return 'in';
    return defaultCountry;
  };

  const initialDialCode = (countryCode || '+91').replace(/\D/g, '') || defaultDialCode;
  const [selectedCountry, setSelectedCountry] = useState(() => getCountryFromCode(countryCode));
  const [dialCode, setDialCode] = useState(initialDialCode);
  const [localValue, setLocalValue] = useState(() => (value || '').replace(/\D/g, ''));
  const containerRef = useRef(null);

  useEffect(() => {
    const rawDial = (countryCode || '+91').replace(/\D/g, '') || defaultDialCode;
    const rawNum = (value || '').replace(/\D/g, '');
    setLocalValue(rawNum);
    setDialCode(rawDial);
    setSelectedCountry(getCountryFromCode(countryCode));
  }, [countryCode]);

  let isInvalid = false;
  let hasDigits = localValue.trim().length > 0;
  if (hasDigits) {
    isInvalid = !validateWorldwideMobile(localValue, '+' + dialCode);
  }

  const isValidAndFilled = hasDigits && !isInvalid;
  const textColor = isInvalid ? '#EF4444' : '#374151';
  const borderColor = hasError || isInvalid ? '#EF4444' : (isValidAndFilled ? '#22C55E' : '#D1D5DB');
  const bgColor = isInvalid ? '#FEF2F2' : '#F3F4F6';

  useEffect(() => {
    if (!containerRef.current) return;
    const removeTitle = () => {
      if (!containerRef.current) return;
      const flags = containerRef.current.querySelectorAll('.selected-flag');
      flags.forEach(el => {
        if (el.hasAttribute('title')) el.removeAttribute('title');
      });
    };
    removeTitle();
    const observer = new MutationObserver(removeTitle);
    observer.observe(containerRef.current, { childList: true, subtree: true, attributes: true, attributeFilter: ['title'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <style>{`
        .profile-phone-container .react-tel-input .flag-dropdown .selected-flag,
        .profile-phone-container .react-tel-input .flag-dropdown:hover .selected-flag,
        .profile-phone-container .react-tel-input .flag-dropdown.open-dropdown .selected-flag,
        .profile-phone-container .react-tel-input .flag-dropdown:focus .selected-flag {
          background-color: transparent !important;
          width: 100% !important;
          justify-content: center !important;
        }
        .profile-phone-container .react-tel-input .country-list .country {
          padding: 0.6vw 0.6vw 0.6vw 2.6vw !important;
        }
        .profile-phone-container .react-tel-input .country-list .flag {
          left: 0.8vw !important;
          margin-top: 0.2vw !important;
        }
        .profile-phone-container .react-tel-input .country-list {
          margin: 0 !important;
          left: 0 !important;
          transform: none !important;
          top: 100% !important;
          bottom: auto !important;
          margin-top: 0.2vw !important;
          z-index: 99999 !important;
          scrollbar-width: thin !important;
          scrollbar-color: #cbd5e1 transparent !important;
        }
        .profile-phone-container .react-tel-input .country-list::-webkit-scrollbar {
          width: 0.35vw !important;
        }
        .profile-phone-container .react-tel-input .country-list::-webkit-scrollbar-track {
          background: transparent !important;
          border-radius: 1vw !important;
        }
        .profile-phone-container .react-tel-input .country-list::-webkit-scrollbar-thumb {
          background-color: #cbd5e1 !important;
          border-radius: 1vw !important;
        }
        .profile-phone-container .react-tel-input .country-list::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8 !important;
        }
        .profile-phone-container .react-tel-input .country-list::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      <div className="profile-phone-container w-full h-[2.15vw] relative">
        <PhoneInput
          country={selectedCountry}
          preferredCountries={['in', 'us', 'gb']}
          disableCountryGuess={true}
          value={'+' + dialCode + localValue}
          onChange={(phone, data) => {
            let nationalNum = phone;
            if (data && data.dialCode && phone.startsWith(data.dialCode)) {
              nationalNum = phone.substring(data.dialCode.length);
            }
            setLocalValue(nationalNum);

            const newDialCode = data?.dialCode ? `+${data.dialCode}` : `+${dialCode}`;
            if (data && data.countryCode && data.countryCode !== selectedCountry) {
              setSelectedCountry(data.countryCode);
              setDialCode(data.dialCode);
            }
            onChange(nationalNum, newDialCode);
          }}
          onBlur={() => {
            if (onBlur) onBlur(localValue, `+${dialCode}`);
          }}
          placeholder={placeholder}
          containerStyle={{
            width: '100%',
            height: '100%'
          }}
          inputStyle={{
            width: '100%',
            height: '100%',
            border: `1px solid ${borderColor}`,
            borderRadius: '0.55vw',
            fontSize: '0.78vw',
            color: textColor,
            fontWeight: '400',
            paddingLeft: '3.2vw',
            backgroundColor: '#FFFFFF',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
          }}
          buttonStyle={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRight: '1px solid #D1D5DB',
            borderRadius: '0.55vw 0 0 0.55vw',
            width: '2.7vw',
            height: '100%',
            top: '0',
            left: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          dropdownStyle={{
            width: '14vw',
            maxHeight: '20vh',
            fontSize: '0.78vw',
            borderRadius: '0.55vw',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB',
            textAlign: 'left',
            zIndex: 50
          }}
        />
        {isValidAndFilled && (
          <div className="absolute right-[0.8vw] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
            <div className="w-[1.1vw] h-[1.1vw] bg-[#22C55E] rounded-full flex items-center justify-center shadow-sm">
              <Icon icon="lucide:check" className="text-white text-[0.7vw]" strokeWidth="3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditProfile = ({ user, setUser, onActionReady }) => {
  const { setUser: setAuthUser } = useAuth();
  const [editedUser, setEditedUser] = useState(() => ({
    ...user,
    visibilitySettings: {
      showInExplore: true,
      showContact: true,
      showAddress: true,
      showSocial: true,
      ...(user?.visibilitySettings || {})
    }
  }));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Update local editedUser state only (no live sync to parent until Save Changes is clicked)
  const updateEditedUser = (updater) => {
    setEditedUser(prev => {
      return typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    });
  };

  // Dynamic Country and State lists using country-state-city
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Dropdown open/close & search states for custom dropdowns
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const countryRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setIsStateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resolve country isoCode from editedUser.country (which could be country name e.g. "India" or isoCode "IN")
  const currentCountryObj = useMemo(() => {
    const raw = (editedUser?.country || 'India').trim().toLowerCase();
    return allCountries.find(c => c.name.toLowerCase() === raw || c.isoCode.toLowerCase() === raw) || null;
  }, [editedUser?.country, allCountries]);

  const availableStates = useMemo(() => {
    if (!currentCountryObj) return [];
    return State.getStatesOfCountry(currentCountryObj.isoCode);
  }, [currentCountryObj]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return allCountries;
    const query = countrySearch.toLowerCase().trim();
    return allCountries.filter(c => c.name.toLowerCase().includes(query) || c.isoCode.toLowerCase() === query);
  }, [allCountries, countrySearch]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return availableStates;
    const query = stateSearch.toLowerCase().trim();
    return availableStates.filter(s => s.name.toLowerCase().includes(query));
  }, [availableStates, stateSearch]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  // Only update from parent when user identifier changes or is reset, not on every re-render
  const userKey = `${user?.emailId || user?.email || ''}-${user?.name || ''}`;
  const prevUserKeyRef = useRef(userKey);

  useEffect(() => {
    if (prevUserKeyRef.current !== userKey) {
      prevUserKeyRef.current = userKey;
      setEditedUser({
        ...user,
        visibilitySettings: {
          showInExplore: true,
          showContact: true,
          showAddress: true,
          showSocial: true,
          ...(user?.visibilitySettings || {})
        }
      });
      setErrors({});
    }
  }, [user, userKey]);

  const getComparableUser = (u) => {
    if (!u) return {};
    return {
      name: (u.name || '').trim(),
      displayName: (u.displayName || '').trim(),
      about: (u.about || '').trim(),
      mobile: (u.mobile || '').trim(),
      countryCode: (u.countryCode || '+91').trim(),
      companyName: (u.companyName || u.agencyName || u.businessName || '').trim(),
      profileType: (u.profileType || 'Individual').trim(),
      industryType: (u.industryType || u.industry || 'Software Development').trim(),
      experience: (u.experience || '').trim(),
      teamSize: (u.teamSize || '').trim(),
      companySize: (u.companySize || '').trim(),
      companyEmail: (u.companyEmail || u.businessEmail || '').trim(),
      website: (u.website || '').trim(),
      services: Array.isArray(u.services) ? [...u.services].sort() : [],
      specialization: Array.isArray(u.specialization) ? [...u.specialization].sort() : [],
      companyLogo: (u.company_logo_url || u.companyLogo || '').trim(),
      address1: (u.address1 || '').trim(),
      address2: (u.address2 || '').trim(),
      city: (u.city || '').trim(),
      pincode: (u.pincode || '').trim(),
      state: (u.state || '').trim(),
      country: (u.country || 'INDIA').trim(),
      socials: {
        website: (u.socials?.website || '').trim(),
        instagram: (u.socials?.instagram || '').trim(),
        linkedin: (u.socials?.linkedin || '').trim(),
        facebook: (u.socials?.facebook || '').trim(),
        whatsapp: (u.socials?.whatsapp || '').trim()
      },
      visibilitySettings: {
        showInExplore: u.visibilitySettings?.showInExplore !== false,
        showContact: u.visibilitySettings?.showContact !== false,
        showAddress: u.visibilitySettings?.showAddress !== false,
        showSocial: u.visibilitySettings?.showSocial !== false
      }
    };
  };

  const [hasSavedInSession, setHasSavedInSession] = useState(false);

  const isAlreadySaved = useMemo(() => {
    if (hasSavedInSession) return true;
    if (user?.isProfileSaved) return true;
    return Boolean(
      (user?.about && user.about.trim() !== '') ||
      (user?.mobile && user.mobile.trim() !== '') ||
      (user?.companyName && user.companyName.trim() !== '') ||
      (user?.address1 && user.address1.trim() !== '') ||
      (user?.city && user.city.trim() !== '') ||
      (user?.website && user.website.trim() !== '') ||
      (Array.isArray(user?.services) && user.services.length > 0) ||
      (user?.pincode && user.pincode.trim() !== '') ||
      (user?.companyEmail && user.companyEmail.trim() !== '') ||
      (user?.companyLogo && user.companyLogo.trim() !== '') ||
      (user?.socials && Object.values(user.socials).some(v => typeof v === 'string' && v.trim() !== ''))
    );
  }, [user, hasSavedInSession]);

  const isEdited = useMemo(() => {
    return JSON.stringify(getComparableUser(user)) !== JSON.stringify(getComparableUser(editedUser));
  }, [user, editedUser]);

  const validate = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/i;

    if (!editedUser.name || !editedUser.name.trim()) newErrors.name = "Full Name is required";
    if (!editedUser.displayName || !editedUser.displayName.trim()) newErrors.displayName = "Display Name is required";

    if (editedUser.email && !emailRegex.test(editedUser.email)) newErrors.email = "Invalid email format";
    if (editedUser.mobile && editedUser.mobile.trim()) {
      const isValid = validateWorldwideMobile(editedUser.mobile, editedUser.countryCode || '+91');
      if (!isValid) {
        newErrors.mobile = "Please enter a valid mobile number";
      }
    }
    if (editedUser.companyEmail && !emailRegex.test(editedUser.companyEmail)) newErrors.companyEmail = "Invalid email format";
    if (editedUser.website && !urlRegex.test(editedUser.website)) newErrors.website = "Invalid URL format";
    if (editedUser.pincode && !/^\d{5,6}$/.test(editedUser.pincode)) newErrors.pincode = "Invalid Pin Code";

    if (editedUser.socials?.website && !urlRegex.test(editedUser.socials.website)) newErrors.socialWebsite = "Invalid URL format";
    if (editedUser.socials?.instagram && !urlRegex.test(editedUser.socials.instagram)) newErrors.instagram = "Invalid URL format";
    if (editedUser.socials?.linkedin && !urlRegex.test(editedUser.socials.linkedin)) newErrors.linkedin = "Invalid URL format";
    if (editedUser.socials?.facebook && !urlRegex.test(editedUser.socials.facebook)) newErrors.facebook = "Invalid URL format";
    if (editedUser.socials?.whatsapp && !urlRegex.test(editedUser.socials.whatsapp)) newErrors.whatsapp = "Invalid URL format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field, value) => {
    let newErrors = { ...errors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/i;

    switch (field) {
      case 'name':
        if (!value || !value.trim()) newErrors.name = "Full Name is required";
        else delete newErrors.name;
        break;
      case 'displayName':
        if (!value || !value.trim()) newErrors.displayName = "Display Name is required";
        else delete newErrors.displayName;
        break;
      case 'email':
      case 'companyEmail':
        if (value && !emailRegex.test(value)) newErrors[field] = "Invalid email format";
        else delete newErrors[field];
        break;
      case 'mobile':
        if (value && value.trim()) {
          const isValid = validateWorldwideMobile(value, editedUser.countryCode || '+91');
          if (!isValid) {
            newErrors.mobile = "Please enter a valid mobile number";
          } else {
            delete newErrors.mobile;
          }
        } else {
          delete newErrors.mobile;
        }
        break;
      case 'website':
      case 'socialWebsite':
      case 'instagram':
      case 'linkedin':
      case 'facebook':
      case 'whatsapp':
        if (value && !urlRegex.test(value)) newErrors[field] = "Invalid URL format";
        else delete newErrors[field];
        break;
      case 'pincode':
        if (value && !/^\d{5,6}$/.test(value)) newErrors.pincode = "Invalid Pin Code";
        else delete newErrors.pincode;
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const toast = useToast();

  const handleSave = async () => {
    if (!validate()) {
      toast?.error?.('Please fix the errors before saving.');
      return;
    }
    setIsSaving(true);
    try {
      // Clean up and sanitize socials: only keep keys that are in activeSocialKeys with non-empty values; explicitly clear others
      const sanitizedSocials = {
        website: '',
        instagram: '',
        linkedin: '',
        facebook: '',
        whatsapp: ''
      };
      activeSocialKeys.forEach(key => {
        const val = editedUser.socials?.[key];
        if (typeof val === 'string' && val.trim() !== '') {
          sanitizedSocials[key] = val.trim();
        }
      });

      const updatedEditedUser = {
        ...editedUser,
        socials: sanitizedSocials
      };

      const email = updatedEditedUser.email || updatedEditedUser.emailId;
      let savedProfile = null;

      try {
        const res = await axios.post(`${backendUrl}/api/profile/save`, {
          emailId: email,
          ...updatedEditedUser
        });
        if (res.data?.success && res.data?.profile) {
          savedProfile = res.data.profile;
        }
      } catch (networkErr) {
        console.warn("Backend save request failed or not implemented, saving locally:", networkErr);
      }

      const merged = {
        ...updatedEditedUser,
        ...(savedProfile || {}),
        email: savedProfile?.emailId || email,
        emailId: savedProfile?.emailId || email,
        company_logo_url: savedProfile?.company_logo_url || savedProfile?.companyLogo || updatedEditedUser.company_logo_url || updatedEditedUser.companyLogo || '',
        companyLogo: savedProfile?.company_logo_url || savedProfile?.companyLogo || updatedEditedUser.company_logo_url || updatedEditedUser.companyLogo || '',
        services: savedProfile?.services || updatedEditedUser.services || [],
        specialization: savedProfile?.specialization || updatedEditedUser.specialization || [],
        // The user's explicit sanitized socials MUST take precedence over stale backend fields
        socials: sanitizedSocials
      };

      setEditedUser(merged);
      if (setUser) setUser(merged);
      if (setAuthUser) setAuthUser(merged);
      window.dispatchEvent(new CustomEvent('profileUpdate', { detail: merged }));

      setHasSavedInSession(true);
      toast?.success?.('Profile updated successfully!');
    } catch (err) {
      console.error("Error saving profile:", err);
      toast?.error?.('Failed to save profile changes');
      if (setUser) setUser(editedUser);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      ...user,
      visibilitySettings: {
        showInExplore: true,
        showContact: true,
        showAddress: true,
        showSocial: true,
        ...(user?.visibilitySettings || {})
      }
    });
    setActiveSocialKeys(getFilledSocialKeys(user?.socials));
    setErrors({});
  };

  const actionRef = useRef({});
  actionRef.current = { handleSave, handleCancel, isSaving, isDirty: isEdited };

  useEffect(() => {
    if (onActionReady) {
      onActionReady({
        handleSave: () => actionRef.current.handleSave?.(),
        handleCancel: () => actionRef.current.handleCancel?.(),
        isSaving,
        isEdited,
        isAlreadySaved
      });
    }
  }, [onActionReady, isSaving, isEdited, isAlreadySaved]);

  const [portalTarget, setPortalTarget] = useState(null);

  const [isProfileTypeOpen, setIsProfileTypeOpen] = useState(false);
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);

  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceInput, setNewServiceInput] = useState('');

  const profileTypeOptions = [
    { label: 'Individual', icon: 'lucide:user' },
    { label: 'Freelancer', icon: 'lucide:briefcase' },
    { label: 'Agency', icon: 'lucide:building-2' },
    { label: 'Company', icon: 'lucide:building' }
  ];

  const industryOptions = [
    { label: 'Software Developer', icon: 'lucide:briefcase' },
    { label: 'Graphic Designer', icon: 'lucide:palette' },
    { label: 'Digital Marketer', icon: 'lucide:trending-up' },
    { label: 'Content Creator', icon: 'lucide:video' },
    { label: 'E-commerce Specialist', icon: 'lucide:shopping-bag' },
    { label: 'Architect / 3D Visualizer', icon: 'lucide:box' },
    { label: 'Consultant', icon: 'lucide:user-check' },
    { label: 'Educator', icon: 'lucide:book-open' }
  ];

  // Services tags helper
  const defaultServicesList = [];

  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isTeamSizeOpen, setIsTeamSizeOpen] = useState(false);
  const [isCompanySizeOpen, setIsCompanySizeOpen] = useState(false);
  const [isAddingSpecialization, setIsAddingSpecialization] = useState(false);
  const [newSpecializationInput, setNewSpecializationInput] = useState('');
  const [editingContactKey, setEditingContactKey] = useState(null); // 'contact1' | 'contact2' | 'contact3'

  const teamSizeOptions = [
    '1 - 5 Peoples',
    '5 - 10 Peoples',
    '10 - 20 Peoples',
    '20 - 40 Peoples',
    '40 - 50 Peoples',
    '50 - 100 Peoples',
    '100+ Peoples'
  ];

  const companySizeOptions = [
    '1 - 10 Peoples',
    '10 - 50 Peoples',
    '50 - 100 Peoples',
    '100 - 120 Peoples',
    '120 - 250 Peoples',
    '250 - 500 Peoples',
    '500+ Peoples'
  ];

  const experienceOptions = [
    'Fresher / < 1 Year',
    '1 Year',
    '2 Years',
    '3 Years',
    '4 Years',
    '5+ Years',
    '8+ Years',
    '10+ Years'
  ];

  const specializationList = Array.isArray(editedUser?.specialization)
    ? editedUser.specialization
    : [];

  const handleAddSpecialization = () => {
    if (!newSpecializationInput.trim()) return;
    const val = newSpecializationInput.trim();
    if (!specializationList.includes(val)) {
      const updated = [...specializationList, val];
      updateEditedUser({ specialization: updated });
    }
    setNewSpecializationInput('');
    setIsAddingSpecialization(false);
  };

  const handleRemoveSpecialization = (itemToRemove) => {
    const nextList = specializationList.filter(s => s !== itemToRemove);
    updateEditedUser({ specialization: nextList });
  };

  const servicesList = Array.isArray(editedUser?.services)
    ? editedUser.services
    : (Array.isArray(editedUser?.skills) ? editedUser.skills : []);

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    const val = newServiceInput.trim();
    if (!servicesList.includes(val)) {
      const updated = [...servicesList, val];
      updateEditedUser({
        services: updated,
        skills: updated
      });
    }
    setNewServiceInput('');
    setIsAddingService(false);
  };

  const handleRemoveService = (itemToRemove) => {
    const nextList = servicesList.filter(s => s !== itemToRemove);
    updateEditedUser({
      services: nextList,
      skills: nextList
    });
  };

  // Social platform definitions
  const socialPlatformConfig = {
    website: {
      key: 'website',
      label: 'Website',
      placeholder: 'https://www.fistotech.com',
      badgeBg: 'bg-[#1a1a1a]',
      icon: 'lucide:globe',
      isLucide: true,
      errKey: 'socialWebsite'
    },
    instagram: {
      key: 'instagram',
      label: 'Instagram',
      placeholder: 'https://www.instagram.com/fistotech',
      badgeBg: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
      icon: 'mdi:instagram',
      errKey: 'instagram'
    },
    linkedin: {
      key: 'linkedin',
      label: 'LinkedIn',
      placeholder: 'https://www.linkedin.com/company/fistotech',
      badgeBg: 'bg-[#0077b5]',
      icon: 'mdi:linkedin',
      errKey: 'linkedin'
    },
    facebook: {
      key: 'facebook',
      label: 'Facebook',
      placeholder: 'https://www.facebook.com/fistotech',
      badgeBg: 'bg-[#1877f2]',
      icon: 'mdi:facebook',
      errKey: 'facebook'
    },
    whatsapp: {
      key: 'whatsapp',
      label: 'WhatsApp',
      placeholder: 'https://wa.me/919876543210',
      badgeBg: 'bg-[#25d366]',
      icon: 'mdi:whatsapp',
      errKey: 'whatsapp'
    }
  };

  const getFilledSocialKeys = (socialsObj) => {
    if (!socialsObj) return [];
    const ordered = ['website', 'instagram', 'linkedin', 'facebook', 'whatsapp'];
    return ordered.filter(k => Boolean(socialsObj[k] && typeof socialsObj[k] === 'string' && socialsObj[k].trim() !== ''));
  };

  const [activeSocialKeys, setActiveSocialKeys] = useState(() => getFilledSocialKeys(user?.socials));
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const socialDropdownRef = useRef(null);

  useEffect(() => {
    setActiveSocialKeys(getFilledSocialKeys(user?.socials));
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (socialDropdownRef.current && !socialDropdownRef.current.contains(e.target)) {
        setIsAddingSocial(false);
      }
    };
    if (isAddingSocial) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingSocial]);

  const handleAddSocial = (key) => {
    if (!activeSocialKeys.includes(key)) {
      setActiveSocialKeys(prev => [...prev, key]);
    }
    setIsAddingSocial(false);
  };

  const handleRemoveSocial = (key) => {
    setActiveSocialKeys(prev => prev.filter(k => k !== key));
    setEditedUser(prev => ({
      ...prev,
      socials: {
        ...(prev?.socials || {}),
        [key]: ''
      }
    }));
    const errKey = socialPlatformConfig[key]?.errKey;
    if (errKey && errors[errKey]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  };

  const availableSocialOptions = Object.values(socialPlatformConfig).filter(
    p => !activeSocialKeys.includes(p.key)
  );

  return (
    <div className="flex flex-col flex-1 w-full relative h-full">
      <div className="flex flex-col gap-[2vw]">
        {/* Personal Details */}
        <section>
          <div className="flex items-center gap-[0.5vw] mb-[1.2vw]">
            <Icon icon="solar:user-bold" className="w-[1.1vw] h-[1.1vw] text-gray-700" />
            <h3 className="text-[0.95vw] font-medium text-gray-800">Personal Details</h3>
          </div>

          <div className="flex flex-col gap-[1.1vw]">
            {/* Row 1: Full Name & Display Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={editedUser?.name || ''}
                  onChange={(e) => {
                    updateEditedUser({ name: e.target.value });
                    if (errors.name) validateField('name', e.target.value);
                  }}
                  onBlur={(e) => validateField('name', e.target.value)}
                  className={`w-full h-[2.15vw] border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white`}
                />
                {errors.name && <p className="text-red-500 text-[0.65vw] mt-[0.2vw]">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Johnny"
                  value={editedUser?.displayName || ''}
                  onChange={(e) => {
                    updateEditedUser({ displayName: e.target.value });
                    if (errors.displayName) validateField('displayName', e.target.value);
                  }}
                  onBlur={(e) => validateField('displayName', e.target.value)}
                  className={`w-full h-[2.15vw] border ${errors.displayName ? 'border-red-500' : 'border-gray-200'} rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white`}
                />
                {errors.displayName && <p className="text-red-500 text-[0.65vw] mt-[0.2vw]">{errors.displayName}</p>}
              </div>
            </div>

            {/* Row 2: Email ID & Mobile Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-[0.85vw] flex items-center justify-center pointer-events-none">
                    <Icon icon="logos:google-icon" className="w-[1vw] h-[1vw]" />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={editedUser?.email || ''}
                    disabled
                    className="w-full h-[2.15vw] border border-gray-200 bg-white cursor-default pointer-events-none rounded-[0.55vw] pl-[2.6vw] pr-[0.85vw] text-[0.78vw] focus:outline-none text-gray-700 font-normal"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[0.65vw] mt-[0.2vw]">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Mobile Number
                </label>
                <div className="w-full min-h-[2.15vw]">
                  <ProfilePhoneField
                    value={editedUser?.mobile || ''}
                    countryCode={editedUser?.countryCode || '+91'}
                    onChange={(nationalNum, newDialCode) => {
                      updateEditedUser({
                        mobile: nationalNum,
                        countryCode: newDialCode
                      });
                      setErrors(prev => ({ ...prev, mobile: null }));
                    }}
                    onBlur={(val) => validateField('mobile', val)}
                    hasError={Boolean(errors.mobile)}
                    placeholder="1234567890"
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-[0.65vw] mt-[0.2vw]">{errors.mobile}</p>}
              </div>
            </div>

            {/* Row 3: About */}
            <div>
              <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                About
              </label>
              <textarea
                rows={4}
                placeholder="Tell us a little about yourself..."
                value={editedUser?.about || ''}
                onChange={(e) => updateEditedUser({ about: e.target.value })}
                className="w-full border border-gray-200 rounded-[0.55vw] px-[0.85vw] py-[0.7vw] text-[0.78vw] focus:outline-none focus:border-gray-300 resize-none text-gray-700 bg-white leading-relaxed custom-scrollbar"
              />
            </div>
          </div>
        </section>

        {/* Professional Details */}
        <section>
          <div className="flex items-center gap-[0.5vw] mb-[1.2vw]">
            <Icon icon="material-symbols-light:home-work-rounded" className="w-[1.15vw] h-[1.15vw] text-gray-700" />
            <h3 className="text-[0.95vw] font-medium text-gray-800">Professional Details</h3>
          </div>

          <div className="flex flex-col gap-[1.2vw]">
            {/* 1. Profile Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
              <div className="relative">
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Profile Type <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => {
                    setIsProfileTypeOpen(!isProfileTypeOpen);
                    setIsIndustryOpen(false);
                  }}
                  className="w-full h-[2.15vw] flex items-center justify-between border border-gray-200 rounded-[0.55vw] px-[0.85vw] bg-white cursor-pointer hover:border-gray-300 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-[0.7vw] text-[0.78vw] text-gray-800">
                    <div className="w-[1.25vw] h-[1.25vw] rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                      <Icon icon={profileTypeOptions.find(p => p.label === (editedUser?.profileType || 'Individual'))?.icon || 'lucide:user'} className="w-[0.8vw] h-[0.8vw]" />
                    </div>
                    <span className="font-normal">{editedUser?.profileType || 'Individual'}</span>
                  </div>
                  <Icon icon="lucide:chevron-down" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                </div>

                {isProfileTypeOpen && (
                  <div className="absolute top-[calc(100%+0.3vw)] left-0 w-full bg-white border border-gray-200 rounded-[0.55vw] shadow-lg py-[0.4vw] z-50 animate-in fade-in zoom-in-95 duration-100">
                    {profileTypeOptions.map((opt) => (
                      <div
                        key={opt.label}
                        onClick={() => {
                          setEditedUser({ ...editedUser, profileType: opt.label });
                          setIsProfileTypeOpen(false);
                        }}
                        className={`flex items-center gap-[0.7vw] px-[1vw] py-[0.55vw] hover:bg-gray-50 cursor-pointer text-[0.78vw] ${editedUser?.profileType === opt.label ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'}`}
                      >
                        <Icon icon={opt.icon} className="w-[0.9vw] h-[0.9vw]" />
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Conditional Rendering: Freelancer & Agency & Company vs Individual / other */}
            {(editedUser?.profileType === 'Freelancer' || editedUser?.profileType === 'Agency' || editedUser?.profileType === 'Company') ? (
              <>
                {/* Row: Industry Type & Business / Brand Name (or Agency Name * or Company / Organization Name *) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
                  {/* Industry Type */}
                  <div className="relative">
                    <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                      Industry Type <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={() => {
                        setIsIndustryOpen(!isIndustryOpen);
                        setIsProfileTypeOpen(false);
                        setIsExperienceOpen(false);
                        setIsTeamSizeOpen(false);
                        setIsCompanySizeOpen(false);
                      }}
                      className="w-full h-[2.15vw] flex items-center justify-between border border-gray-200 rounded-[0.55vw] px-[0.85vw] bg-white cursor-pointer hover:border-gray-300 transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-[0.7vw] text-[0.78vw] text-gray-800">
                        <div className="w-[1.25vw] h-[1.25vw] rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                          <Icon icon="lucide:trending-up" className="w-[0.8vw] h-[0.8vw]" />
                        </div>
                        <span className="font-normal">{editedUser?.industryType || editedUser?.industry || 'Software Development'}</span>
                      </div>
                      <Icon icon="lucide:chevron-down" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                    </div>

                    {isIndustryOpen && (
                      <div className="absolute top-[calc(100%+0.3vw)] left-0 w-full bg-white border border-gray-200 rounded-[0.55vw] shadow-lg py-[0.4vw] z-50 max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                        {industryOptions.map((ind) => (
                          <div
                            key={ind.label}
                            onClick={() => {
                              updateEditedUser({ industryType: ind.label, industry: ind.label });
                              setIsIndustryOpen(false);
                            }}
                            className={`flex items-center gap-[0.7vw] px-[1vw] py-[0.55vw] hover:bg-gray-50 cursor-pointer text-[0.78vw] ${(editedUser?.industryType || editedUser?.industry) === ind.label ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'}`}
                          >
                            <Icon icon={ind.icon} className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                            <span>{ind.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Name field: Company / Organization Name * vs Agency Name * vs Business / Brand Name */}
                  <div>
                    <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                      {editedUser?.profileType === 'Company' ? (
                        <>Company / Organization Name <span className="text-red-500">*</span></>
                      ) : editedUser?.profileType === 'Agency' ? (
                        <>Agency Name <span className="text-red-500">*</span></>
                      ) : (
                        'Business / Brand Name'
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="Fist-o Tech Private Limited"
                      value={editedUser?.companyName || editedUser?.agencyName || editedUser?.businessName || ''}
                      onChange={(e) => updateEditedUser({
                        companyName: e.target.value,
                        agencyName: e.target.value,
                        businessName: e.target.value
                      })}
                      className="w-full h-[2.15vw] border border-gray-200 rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs"
                    />
                  </div>
                </div>

                {/* Row: Experience / Team Size / Company Size & Business Gmail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
                  {/* Company Size OR Team Size OR Experience */}
                  {editedUser?.profileType === 'Company' ? (
                    <div className="relative">
                      <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                        Company Size
                      </label>
                      <div
                        onClick={() => {
                          setIsCompanySizeOpen(!isCompanySizeOpen);
                          setIsProfileTypeOpen(false);
                          setIsIndustryOpen(false);
                          setIsExperienceOpen(false);
                          setIsTeamSizeOpen(false);
                        }}
                        className="w-full h-[2.15vw] flex items-center justify-between border border-gray-200 rounded-[0.55vw] px-[0.85vw] bg-white cursor-pointer hover:border-gray-300 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-[0.7vw] text-[0.78vw] text-gray-800">
                          <div className="w-[1.25vw] h-[1.25vw] rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                            <Icon icon="lucide:building-2" className="w-[0.8vw] h-[0.8vw]" />
                          </div>
                          <span className="font-normal">{editedUser?.companySize || '100 - 120 Peoples'}</span>
                        </div>
                        <Icon icon="lucide:chevron-down" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                      </div>

                      {isCompanySizeOpen && (
                        <div className="absolute top-[calc(100%+0.3vw)] left-0 w-full bg-white border border-gray-200 rounded-[0.55vw] shadow-lg py-[0.4vw] z-50 max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                          {companySizeOptions.map((size) => (
                            <div
                              key={size}
                              onClick={() => {
                                updateEditedUser({ companySize: size });
                                setIsCompanySizeOpen(false);
                              }}
                              className={`flex items-center gap-[0.7vw] px-[1vw] py-[0.55vw] hover:bg-gray-50 cursor-pointer text-[0.78vw] ${editedUser?.companySize === size ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'}`}
                            >
                              <span>{size}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : editedUser?.profileType === 'Agency' ? (
                    <div className="relative">
                      <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                        Team Size
                      </label>
                      <div
                        onClick={() => {
                          setIsTeamSizeOpen(!isTeamSizeOpen);
                          setIsProfileTypeOpen(false);
                          setIsIndustryOpen(false);
                          setIsExperienceOpen(false);
                          setIsCompanySizeOpen(false);
                        }}
                        className="w-full h-[2.15vw] flex items-center justify-between border border-gray-200 rounded-[0.55vw] px-[0.85vw] bg-white cursor-pointer hover:border-gray-300 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-[0.7vw] text-[0.78vw] text-gray-800">
                          <div className="w-[1.25vw] h-[1.25vw] rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                            <Icon icon="lucide:users" className="w-[0.8vw] h-[0.8vw]" />
                          </div>
                          <span className="font-normal">{editedUser?.teamSize || '40 - 50 Peoples'}</span>
                        </div>
                        <Icon icon="lucide:chevron-down" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                      </div>

                      {isTeamSizeOpen && (
                        <div className="absolute top-[calc(100%+0.3vw)] left-0 w-full bg-white border border-gray-200 rounded-[0.55vw] shadow-lg py-[0.4vw] z-50 max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                          {teamSizeOptions.map((size) => (
                            <div
                              key={size}
                              onClick={() => {
                                updateEditedUser({ teamSize: size });
                                setIsTeamSizeOpen(false);
                              }}
                              className={`flex items-center gap-[0.7vw] px-[1vw] py-[0.55vw] hover:bg-gray-50 cursor-pointer text-[0.78vw] ${editedUser?.teamSize === size ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'}`}
                            >
                              <span>{size}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                        Experience <span className="text-red-500">*</span>
                      </label>
                      <div
                        onClick={() => {
                          setIsExperienceOpen(!isExperienceOpen);
                          setIsProfileTypeOpen(false);
                          setIsIndustryOpen(false);
                          setIsTeamSizeOpen(false);
                          setIsCompanySizeOpen(false);
                        }}
                        className="w-full h-[2.15vw] flex items-center justify-between border border-gray-200 rounded-[0.55vw] px-[0.85vw] bg-white cursor-pointer hover:border-gray-300 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-[0.7vw] text-[0.78vw] text-gray-800">
                          <div className="w-[1.25vw] h-[1.25vw] rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                            <Icon icon="lucide:briefcase" className="w-[0.8vw] h-[0.8vw]" />
                          </div>
                          <span className="font-normal">{editedUser?.experience || '2 Years'}</span>
                        </div>
                        <Icon icon="lucide:chevron-down" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                      </div>

                      {isExperienceOpen && (
                        <div className="absolute top-[calc(100%+0.3vw)] left-0 w-full bg-white border border-gray-200 rounded-[0.55vw] shadow-lg py-[0.4vw] z-50 max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                          {experienceOptions.map((exp) => (
                            <div
                              key={exp}
                              onClick={() => {
                                updateEditedUser({ experience: exp });
                                setIsExperienceOpen(false);
                              }}
                              className={`flex items-center gap-[0.7vw] px-[1vw] py-[0.55vw] hover:bg-gray-50 cursor-pointer text-[0.78vw] ${editedUser?.experience === exp ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'}`}
                            >
                              <span>{exp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Business Gmail */}
                  <div>
                    <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                      Business Gmail
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-[0.85vw] flex items-center justify-center pointer-events-none">
                        <Icon icon="logos:google-icon" className="w-[0.9vw] h-[0.9vw]" />
                      </div>
                      <input
                        type="email"
                        placeholder="fistotech@gmail.com"
                        value={editedUser?.businessEmail || editedUser?.companyEmail || ''}
                        onChange={(e) => updateEditedUser({ businessEmail: e.target.value, companyEmail: e.target.value })}
                        className="w-full h-[2.15vw] border border-gray-200 rounded-[0.55vw] pl-[2.4vw] pr-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Description (Company only) */}
                {editedUser?.profileType === 'Company' && (
                  <div>
                    <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                      Company Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="I'm going to be the King of the Pirates — that's my dream, and I'm never giving up on it. I love adventure, freedom, and good food (especially meat). I may not be the smartest, but I always trust my instincts and fight for what I believe in."
                      value={editedUser?.companyDescription || editedUser?.aboutCompany || ''}
                      onChange={(e) => updateEditedUser({
                        companyDescription: e.target.value,
                        aboutCompany: e.target.value
                      })}
                      className="w-full border border-gray-200 rounded-[0.55vw] p-[0.7vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white resize-none leading-[1.6]"
                    />
                  </div>
                )}

                {/* Specialization */}
                <div>
                  <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full border border-gray-200 rounded-[0.55vw] p-[0.6vw] bg-white flex flex-wrap items-center gap-[0.5vw] min-h-[2.8vw]">
                    {isAddingSpecialization ? (
                      <div className="flex items-center gap-[0.3vw] border border-[#EC5137] rounded-[0.4vw] px-[0.6vw] py-[0.3vw] bg-[#EC5137]/5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Specialization..."
                          value={newSpecializationInput}
                          onChange={(e) => setNewSpecializationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSpecialization();
                            } else if (e.key === 'Escape') {
                              setIsAddingSpecialization(false);
                              setNewSpecializationInput('');
                            }
                          }}
                          className="text-[0.78vw] bg-transparent focus:outline-none w-[7.5vw] text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={handleAddSpecialization}
                          className="text-[#EC5137] hover:opacity-80 font-bold text-[0.78vw]"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingSpecialization(false);
                            setNewSpecializationInput('');
                          }}
                          className="text-gray-400 hover:text-gray-600 text-[0.78vw]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingSpecialization(true)}
                        className="flex items-center gap-[0.3vw] px-[0.75vw] py-[0.4vw] border border-[#EC5137] text-[#EC5137] rounded-[0.4vw] text-[0.74vw] font-semibold hover:bg-[#EC5137]/5 transition-colors cursor-pointer bg-white"
                      >
                        <span>+</span> Add Service
                      </button>
                    )}

                    {specializationList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-[0.4vw] px-[0.75vw] py-[0.4vw] bg-[#F3F4F6] text-gray-700 rounded-[0.4vw] text-[0.74vw] font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(item)}
                          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          <X className="w-[0.75vw] h-[0.75vw]" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services / Expertise */}
                <div>
                  <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                    Services / Expertise <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full border border-gray-200 rounded-[0.55vw] p-[0.6vw] bg-white flex flex-wrap items-center gap-[0.5vw] min-h-[2.8vw]">
                    {isAddingService ? (
                      <div className="flex items-center gap-[0.3vw] border border-[#EC5137] rounded-[0.4vw] px-[0.6vw] py-[0.3vw] bg-[#EC5137]/5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Service name..."
                          value={newServiceInput}
                          onChange={(e) => setNewServiceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddService();
                            } else if (e.key === 'Escape') {
                              setIsAddingService(false);
                              setNewServiceInput('');
                            }
                          }}
                          className="text-[0.78vw] bg-transparent focus:outline-none w-[7.5vw] text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={handleAddService}
                          className="text-[#EC5137] hover:opacity-80 font-bold text-[0.78vw]"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingService(false);
                            setNewServiceInput('');
                          }}
                          className="text-gray-400 hover:text-gray-600 text-[0.78vw]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingService(true)}
                        className="flex items-center gap-[0.3vw] px-[0.75vw] py-[0.4vw] border border-[#EC5137] text-[#EC5137] rounded-[0.4vw] text-[0.74vw] font-semibold hover:bg-[#EC5137]/5 transition-colors cursor-pointer bg-white"
                      >
                        <span>+</span> Add Service
                      </button>
                    )}

                    {servicesList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-[0.4vw] px-[0.75vw] py-[0.4vw] bg-[#F3F4F6] text-gray-700 rounded-[0.4vw] text-[0.74vw] font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(item)}
                          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          <X className="w-[0.75vw] h-[0.75vw]" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio / Website (Freelancer) OR Agency Website (Agency) OR Company Website (Company) */}
                <div>
                  <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                    {editedUser?.profileType === 'Company'
                      ? 'Company Website'
                      : (editedUser?.profileType === 'Agency' ? 'Agency Website' : 'Portfolio / Website')}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-[0.85vw] flex items-center justify-center pointer-events-none text-gray-500">
                      <Icon icon="lucide:globe" className="w-[0.9vw] h-[0.9vw]" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://fisto.com"
                      value={editedUser?.website || ''}
                      onChange={(e) => {
                        updateEditedUser({ website: e.target.value });
                        setErrors(prev => ({ ...prev, website: null }));
                      }}
                      onBlur={(e) => validateField('website', e.target.value)}
                      className="w-full h-[2.15vw] border border-gray-200 rounded-[0.55vw] pl-[2.4vw] pr-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-[0.65vw] mt-[0.2vw]">{errors.website}</p>}
                </div>

                {/* Contact Number / Business Contact Number */}
                <div className="flex flex-col gap-[0.6vw]">
                  <h4 className="text-[0.85vw] font-semibold text-gray-800">
                    {editedUser?.profileType === 'Company' ? 'Business Contact Number' : 'Contact Number'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
                    {/* Contact 1 */}
                    <div>
                      <div className="flex items-center gap-[0.35vw] mb-[0.35vw]">
                        {editingContactKey === 'contact1' ? (
                          <div className="flex items-center gap-[0.3vw]">
                            <input
                              type="text"
                              autoFocus
                              value={editedUser?.contact1Label !== undefined ? editedUser.contact1Label : 'Contact 1'}
                              onChange={(e) => updateEditedUser({ contact1Label: e.target.value })}
                              onBlur={() => setEditingContactKey(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingContactKey(null);
                              }}
                              className="text-[0.74vw] font-medium text-gray-700 border-b border-[#EC5137] bg-transparent outline-none px-[0.1vw] py-0 w-[6vw]"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingContactKey(null)}
                              className="text-[#EC5137] hover:opacity-80 text-[0.75vw] font-bold"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingContactKey('contact1')}
                            className="flex items-center gap-[0.35vw] cursor-pointer group"
                            title="Click to rename contact"
                          >
                            <span className="text-[0.74vw] font-medium text-gray-700 group-hover:text-[#EC5137] transition-colors">
                              {editedUser?.contact1Label || 'Contact 1'}
                            </span>
                            <Icon icon="lucide:pencil" className="w-[0.75vw] h-[0.75vw] text-gray-400 group-hover:text-[#EC5137] transition-colors" />
                          </div>
                        )}
                      </div>
                      <div className="w-full min-h-[2.15vw]">
                        <ProfilePhoneField
                          value={editedUser?.contact1 || editedUser?.mobile || ''}
                          countryCode={editedUser?.contact1CountryCode || editedUser?.countryCode || '+91'}
                          onChange={(nationalNum, newDialCode) => {
                            updateEditedUser({
                              contact1: nationalNum,
                              contact1CountryCode: newDialCode,
                              mobile: nationalNum,
                              countryCode: newDialCode
                            });
                          }}
                          placeholder="1234567890"
                        />
                      </div>
                    </div>

                    {/* Contact 2 */}
                    {(editedUser?.contactCount >= 2 || editedUser?.contact2 || editedUser?.contactCount === undefined) && (
                      <div>
                        <div className="flex items-center justify-between mb-[0.35vw]">
                          <div className="flex items-center gap-[0.35vw]">
                            {editingContactKey === 'contact2' ? (
                              <div className="flex items-center gap-[0.3vw]">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editedUser?.contact2Label !== undefined ? editedUser.contact2Label : 'Contact 2'}
                                  onChange={(e) => updateEditedUser({ contact2Label: e.target.value })}
                                  onBlur={() => setEditingContactKey(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingContactKey(null);
                                  }}
                                  className="text-[0.74vw] font-medium text-gray-700 border-b border-[#EC5137] bg-transparent outline-none px-[0.1vw] py-0 w-[6vw]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingContactKey(null)}
                                  className="text-[#EC5137] hover:opacity-80 text-[0.75vw] font-bold"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => setEditingContactKey('contact2')}
                                className="flex items-center gap-[0.35vw] cursor-pointer group"
                                title="Click to rename contact"
                              >
                                <span className="text-[0.74vw] font-medium text-gray-700 group-hover:text-[#EC5137] transition-colors">
                                  {editedUser?.contact2Label || 'Contact 2'}
                                </span>
                                <Icon icon="lucide:pencil" className="w-[0.75vw] h-[0.75vw] text-gray-400 group-hover:text-[#EC5137] transition-colors" />
                              </div>
                            )}
                          </div>
                          {editedUser?.contactCount === 2 && !editedUser?.contact3 && (
                            <button
                              type="button"
                              onClick={() => {
                                updateEditedUser({
                                  contactCount: 1,
                                  contact2: '',
                                  contact2Label: 'Contact 2'
                                });
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors text-[0.7vw] flex items-center gap-[0.2vw]"
                              title="Remove Contact 2"
                            >
                              <X className="w-[0.75vw] h-[0.75vw]" />
                            </button>
                          )}
                        </div>
                        <div className="w-full min-h-[2.15vw]">
                          <ProfilePhoneField
                            value={editedUser?.contact2 || ''}
                            countryCode={editedUser?.contact2CountryCode || '+91'}
                            onChange={(nationalNum, newDialCode) => {
                              updateEditedUser({
                                contact2: nationalNum,
                                contact2CountryCode: newDialCode
                              });
                            }}
                            placeholder="1234567890"
                          />
                        </div>
                      </div>
                    )}

                    {/* Contact 3 */}
                    {(editedUser?.contactCount >= 3 || editedUser?.contact3) && (
                      <div>
                        <div className="flex items-center justify-between mb-[0.35vw]">
                          <div className="flex items-center gap-[0.35vw]">
                            {editingContactKey === 'contact3' ? (
                              <div className="flex items-center gap-[0.3vw]">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editedUser?.contact3Label !== undefined ? editedUser.contact3Label : 'Contact 3'}
                                  onChange={(e) => updateEditedUser({ contact3Label: e.target.value })}
                                  onBlur={() => setEditingContactKey(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingContactKey(null);
                                  }}
                                  className="text-[0.74vw] font-medium text-gray-700 border-b border-[#EC5137] bg-transparent outline-none px-[0.1vw] py-0 w-[6vw]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingContactKey(null)}
                                  className="text-[#EC5137] hover:opacity-80 text-[0.75vw] font-bold"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => setEditingContactKey('contact3')}
                                className="flex items-center gap-[0.35vw] cursor-pointer group"
                                title="Click to rename contact"
                              >
                                <span className="text-[0.74vw] font-medium text-gray-700 group-hover:text-[#EC5137] transition-colors">
                                  {editedUser?.contact3Label || 'Contact 3'}
                                </span>
                                <Icon icon="lucide:pencil" className="w-[0.75vw] h-[0.75vw] text-gray-400 group-hover:text-[#EC5137] transition-colors" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              updateEditedUser({
                                contactCount: 2,
                                contact3: '',
                                contact3Label: 'Contact 3'
                              });
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors text-[0.7vw] flex items-center gap-[0.2vw]"
                            title="Remove Contact 3"
                          >
                            <X className="w-[0.75vw] h-[0.75vw]" />
                          </button>
                        </div>
                        <div className="w-full min-h-[2.15vw]">
                          <ProfilePhoneField
                            value={editedUser?.contact3 || ''}
                            countryCode={editedUser?.contact3CountryCode || '+91'}
                            onChange={(nationalNum, newDialCode) => {
                              updateEditedUser({
                                contact3: nationalNum,
                                contact3CountryCode: newDialCode
                              });
                            }}
                            placeholder="1234567890"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Contact Number button (Max 3 contacts total) */}
                  {((editedUser?.contactCount || (editedUser?.contact3 ? 3 : (editedUser?.contact2 !== undefined ? 2 : 2))) < 3) && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentCount = editedUser?.contactCount || (editedUser?.contact2 !== undefined ? 2 : 1);
                          if (currentCount < 3) {
                            updateEditedUser({ contactCount: currentCount + 1 });
                          }
                        }}
                        className="inline-flex items-center gap-[0.3vw] px-[0.9vw] py-[0.55vw] border border-[#EC5137] text-[#EC5137] rounded-[0.45vw] text-[0.78vw] font-semibold hover:bg-[#EC5137]/5 transition-colors cursor-pointer bg-white"
                      >
                        <span className="text-[0.9vw] leading-none">+</span> Add Contact Number
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 2. Industry (for Individual / default) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
                  <div className="relative">
                    <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                      Industry
                    </label>
                    <div
                      onClick={() => {
                        setIsIndustryOpen(!isIndustryOpen);
                        setIsProfileTypeOpen(false);
                      }}
                      className="w-full h-[2.15vw] flex items-center justify-between border border-gray-200 rounded-[0.55vw] px-[0.85vw] bg-white cursor-pointer hover:border-gray-300 transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-[0.7vw] text-[0.78vw] text-gray-800">
                        <div className="w-[1.25vw] h-[1.25vw] rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                          <Icon icon="lucide:briefcase" className="w-[0.8vw] h-[0.8vw]" />
                        </div>
                        <span className="font-normal">{editedUser?.industryType || editedUser?.industry || 'Software Developer'}</span>
                      </div>
                      <Icon icon="lucide:chevron-down" className="w-[0.85vw] h-[0.85vw] text-gray-400" />
                    </div>

                    {isIndustryOpen && (
                      <div className="absolute top-[calc(100%+0.3vw)] left-0 w-full bg-white border border-gray-200 rounded-[0.55vw] shadow-lg py-[0.4vw] z-50 max-h-[14vw] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                        {industryOptions.map((ind) => (
                          <div
                            key={ind.label}
                            onClick={() => {
                              setEditedUser({ ...editedUser, industryType: ind.label, industry: ind.label });
                              setIsIndustryOpen(false);
                            }}
                            className={`flex items-center gap-[0.7vw] px-[1vw] py-[0.55vw] hover:bg-gray-50 cursor-pointer text-[0.78vw] ${(editedUser?.industryType || editedUser?.industry) === ind.label ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'}`}
                          >
                            <Icon icon={ind.icon} className="w-[0.9vw] h-[0.9vw] text-gray-500" />
                            <span>{ind.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                    Specialization
                  </label>
                  <div className="w-full border border-gray-200 rounded-[0.55vw] p-[0.6vw] bg-white flex flex-wrap items-center gap-[0.5vw] min-h-[2.8vw]">
                    {isAddingSpecialization ? (
                      <div className="flex items-center gap-[0.3vw] border border-[#EC5137] rounded-[0.4vw] px-[0.6vw] py-[0.3vw] bg-[#EC5137]/5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Specialization..."
                          value={newSpecializationInput}
                          onChange={(e) => setNewSpecializationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSpecialization();
                            } else if (e.key === 'Escape') {
                              setIsAddingSpecialization(false);
                              setNewSpecializationInput('');
                            }
                          }}
                          className="text-[0.78vw] bg-transparent focus:outline-none w-[7.5vw] text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={handleAddSpecialization}
                          className="text-[#EC5137] hover:opacity-80 font-bold text-[0.78vw]"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingSpecialization(false);
                            setNewSpecializationInput('');
                          }}
                          className="text-gray-400 hover:text-gray-600 text-[0.78vw]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingSpecialization(true)}
                        className="flex items-center gap-[0.3vw] px-[0.75vw] py-[0.4vw] border border-[#EC5137] text-[#EC5137] rounded-[0.4vw] text-[0.74vw] font-semibold hover:bg-[#EC5137]/5 transition-colors cursor-pointer bg-white"
                      >
                        <span>+</span> Add Service
                      </button>
                    )}

                    {specializationList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-[0.4vw] px-[0.75vw] py-[0.4vw] bg-[#F3F4F6] text-gray-700 rounded-[0.4vw] text-[0.74vw] font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(item)}
                          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          <X className="w-[0.75vw] h-[0.75vw]" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills / Expertise */}
                <div>
                  <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                    Skills / Expertise
                  </label>
                  <div className="w-full border border-gray-200 rounded-[0.55vw] p-[0.6vw] bg-white flex flex-wrap items-center gap-[0.5vw] min-h-[2.8vw]">
                    {isAddingService ? (
                      <div className="flex items-center gap-[0.3vw] border border-[#EC5137] rounded-[0.4vw] px-[0.6vw] py-[0.3vw] bg-[#EC5137]/5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Service name..."
                          value={newServiceInput}
                          onChange={(e) => setNewServiceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddService();
                            } else if (e.key === 'Escape') {
                              setIsAddingService(false);
                              setNewServiceInput('');
                            }
                          }}
                          className="text-[0.78vw] bg-transparent focus:outline-none w-[7.5vw] text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={handleAddService}
                          className="text-[#EC5137] hover:opacity-80 font-bold text-[0.78vw]"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingService(false);
                            setNewServiceInput('');
                          }}
                          className="text-gray-400 hover:text-gray-600 text-[0.78vw]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingService(true)}
                        className="flex items-center gap-[0.3vw] px-[0.75vw] py-[0.4vw] border border-[#EC5137] text-[#EC5137] rounded-[0.4vw] text-[0.74vw] font-semibold hover:bg-[#EC5137]/5 transition-colors cursor-pointer bg-white"
                      >
                        <span>+</span> Add Service
                      </button>
                    )}

                    {servicesList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-[0.4vw] px-[0.75vw] py-[0.4vw] bg-[#F3F4F6] text-gray-700 rounded-[0.4vw] text-[0.74vw] font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(item)}
                          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          <X className="w-[0.75vw] h-[0.75vw]" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. Portfolio / Website */}
                <div>
                  <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                    Portfolio / Website
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-[0.85vw] flex items-center justify-center pointer-events-none text-gray-500">
                      <Icon icon="lucide:globe" className="w-[0.9vw] h-[0.9vw]" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://fisto.com"
                      value={editedUser?.website || ''}
                      onChange={(e) => {
                        setEditedUser({ ...editedUser, website: e.target.value });
                        setErrors({ ...errors, website: null });
                      }}
                      onBlur={(e) => validateField('website', e.target.value)}
                      className="w-full h-[2.15vw] border border-gray-200 rounded-[0.55vw] pl-[2.4vw] pr-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-[0.65vw] mt-[0.2vw]">{errors.website}</p>}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Address */}
        <section>
          <div className="flex items-center gap-[0.5vw] mb-[1.2vw]">
            <Icon icon="carbon:location-company-filled" className="w-[1.15vw] h-[1.15vw] text-gray-700" />
            <h3 className="text-[0.95vw] font-medium text-gray-800">Address</h3>
          </div>

          <div className="flex flex-col gap-[1.2vw]">
            {/* Row 1: Address Line 1 & Address Line 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw]">
              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Address Line 1
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main Street"
                  value={editedUser?.address1 || ''}
                  onChange={(e) => updateEditedUser({ address1: e.target.value })}
                  className="w-full h-[2.15vw] border border-gray-200 rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Address Line 2
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suite / Apartment"
                  value={editedUser?.address2 || ''}
                  onChange={(e) => updateEditedUser({ address2: e.target.value })}
                  className="w-full h-[2.15vw] border border-gray-200 rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs placeholder-gray-400"
                />
              </div>
            </div>

            {/* Row 2: City, State, Country (3 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5vw]">
              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore"
                  value={editedUser?.city || ''}
                  onChange={(e) => updateEditedUser({ city: e.target.value })}
                  className="w-full h-[2.15vw] border border-gray-200 rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs placeholder-gray-400"
                />
              </div>

              {/* Custom State Dropdown */}
              <div className="relative" ref={stateRef}>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  State
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStateOpen(!isStateOpen);
                      setIsCountryOpen(false);
                      setStateSearch('');
                    }}
                    className={`w-full h-[2.15vw] flex items-center justify-between border rounded-[0.55vw] px-[0.85vw] text-[0.78vw] bg-white transition-colors cursor-pointer shadow-xs ${
                      isStateOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`truncate ${editedUser?.state ? 'text-gray-700 font-normal' : 'text-gray-400'}`}>
                      {editedUser?.state || 'Select State'}
                    </span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`w-[0.85vw] h-[0.85vw] text-gray-400 transition-transform duration-200 shrink-0 ${
                        isStateOpen ? 'rotate-180 text-gray-600' : ''
                      }`}
                    />
                  </button>

                  {isStateOpen && (
                    <div className="absolute left-0 top-[110%] w-full bg-white rounded-[0.55vw] shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col">
                      {/* Search box if there are states */}
                      <div className="p-[0.4vw] border-b border-gray-100 bg-gray-50/70">
                        <div className="flex items-center px-[0.6vw] py-[0.35vw] bg-white rounded-[0.4vw] border border-gray-200">
                          <Icon icon="lucide:search" className="w-[0.85vw] h-[0.85vw] text-gray-400 shrink-0 mr-[0.35vw]" />
                          <input
                            type="text"
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                            placeholder="Search state..."
                            autoFocus
                            className="w-full text-[0.75vw] bg-transparent outline-none text-gray-800 placeholder-gray-400"
                          />
                          {stateSearch && (
                            <button
                              type="button"
                              onClick={() => setStateSearch('')}
                              className="text-gray-400 hover:text-gray-600 text-[0.7vw]"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* State list */}
                      <div className="max-h-[14vw] overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        <button
                          type="button"
                          onClick={() => {
                            updateEditedUser({ state: '' });
                            setIsStateOpen(false);
                          }}
                          className={`w-full text-left px-[1vw] py-[0.55vw] text-[0.78vw] transition-colors flex items-center justify-between cursor-pointer ${
                            !editedUser?.state ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate text-gray-400">None / Clear</span>
                        </button>
                        {filteredStates.length > 0 ? (
                          filteredStates.map((st) => {
                            const isSelected = editedUser?.state === st.name;
                            return (
                              <button
                                key={st.isoCode || st.name}
                                type="button"
                                onClick={() => {
                                  updateEditedUser({ state: st.name });
                                  setIsStateOpen(false);
                                }}
                                className={`w-full text-left px-[1vw] py-[0.55vw] text-[0.78vw] transition-colors flex items-center justify-between cursor-pointer ${
                                  isSelected ? 'bg-gray-100 text-[#EC5137] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className="truncate">{st.name}</span>
                                {isSelected && (
                                  <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw] text-[#EC5137] shrink-0" strokeWidth="2.5" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-[0.8vw] text-center text-gray-400 text-[0.75vw]">
                            {availableStates.length === 0 ? 'No states available for this country' : 'No state found'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Country Dropdown */}
              <div className="relative" ref={countryRef}>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Country
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCountryOpen(!isCountryOpen);
                      setIsStateOpen(false);
                      setCountrySearch('');
                    }}
                    className={`w-full h-[2.15vw] flex items-center justify-between border rounded-[0.55vw] px-[0.85vw] text-[0.78vw] bg-white transition-colors cursor-pointer shadow-xs ${
                      isCountryOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate text-gray-700 font-normal">
                      {currentCountryObj ? currentCountryObj.name : (editedUser?.country || 'India')}
                    </span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`w-[0.85vw] h-[0.85vw] text-gray-400 transition-transform duration-200 shrink-0 ${
                        isCountryOpen ? 'rotate-180 text-gray-600' : ''
                      }`}
                    />
                  </button>

                  {isCountryOpen && (
                    <div className="absolute left-0 top-[110%] w-full bg-white rounded-[0.55vw] shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col">
                      {/* Search box */}
                      <div className="p-[0.4vw] border-b border-gray-100 bg-gray-50/70">
                        <div className="flex items-center px-[0.6vw] py-[0.35vw] bg-white rounded-[0.4vw] border border-gray-200">
                          <Icon icon="lucide:search" className="w-[0.85vw] h-[0.85vw] text-gray-400 shrink-0 mr-[0.35vw]" />
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country..."
                            autoFocus
                            className="w-full text-[0.75vw] bg-transparent outline-none text-gray-800 placeholder-gray-400"
                          />
                          {countrySearch && (
                            <button
                              type="button"
                              onClick={() => setCountrySearch('')}
                              className="text-gray-400 hover:text-gray-600 text-[0.7vw]"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Country List */}
                      <div className="max-h-[14vw] overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c) => {
                            const isSelected = (currentCountryObj?.isoCode === c.isoCode) || (editedUser?.country === c.name);
                            return (
                              <button
                                key={c.isoCode}
                                type="button"
                                onClick={() => {
                                  const newStates = State.getStatesOfCountry(c.isoCode);
                                  updateEditedUser({
                                    country: c.name,
                                    state: newStates.some(s => s.name === editedUser?.state) ? editedUser.state : (newStates[0]?.name || '')
                                  });
                                  setIsCountryOpen(false);
                                }}
                                className={`w-full text-left px-[1vw] py-[0.55vw] text-[0.78vw] transition-colors flex items-center justify-between cursor-pointer ${
                                  isSelected ? 'bg-gray-100 text-[#EC5137] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className="truncate">{c.name}</span>
                                {isSelected && (
                                  <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw] text-[#EC5137] shrink-0" strokeWidth="2.5" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-[0.8vw] text-center text-gray-400 text-[0.75vw]">
                            No country found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Pin Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5vw]">
              <div>
                <label className="block text-[0.74vw] font-medium text-gray-700 mb-[0.3vw]">
                  Pin Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 641001"
                  value={editedUser?.pincode || ''}
                  onChange={(e) => {
                    updateEditedUser({ pincode: e.target.value });
                    setErrors(prev => ({ ...prev, pincode: null }));
                  }}
                  className={`w-full h-[2.15vw] border ${errors.pincode ? 'border-red-500' : 'border-gray-200'} rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs placeholder-gray-400`}
                />
                {errors.pincode && <p className="text-red-500 text-[0.65vw] mt-[0.2vw]">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section>
          <div className="flex items-center gap-[0.5vw] mb-[1.2vw]">
            <Icon icon="lucide:link-2" className="w-[1.15vw] h-[1.15vw] text-gray-700" />
            <h3 className="text-[0.95vw] font-medium text-gray-800">Social Media</h3>
          </div>

          <div className="flex flex-col gap-[1vw]">
            {activeSocialKeys.map((key) => {
              const platform = socialPlatformConfig[key];
              if (!platform) return null;
              const hasErr = Boolean(errors[platform.errKey]);

              return (
                <div key={key} className="flex flex-col gap-[0.2vw]">
                  <div className="flex items-center gap-[0.8vw]">
                    <div className={`w-[2.15vw] h-[2.15vw] ${platform.badgeBg} rounded-[0.55vw] flex items-center justify-center shrink-0`}>
                      {platform.isLucide ? (
                        <Globe className="w-[1.05vw] h-[1.05vw] text-white" />
                      ) : (
                        <Icon icon={platform.icon} className="w-[1.1vw] h-[1.1vw] text-white" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={platform.placeholder}
                      value={editedUser?.socials?.[key] || ''}
                      onChange={(e) => {
                        setEditedUser(prev => ({
                          ...prev,
                          socials: { ...(prev?.socials || {}), [key]: e.target.value }
                        }));
                        if (errors[platform.errKey]) {
                          setErrors(prev => ({ ...prev, [platform.errKey]: null }));
                        }
                      }}
                      onBlur={(e) => validateField(platform.errKey, e.target.value)}
                      className={`flex-1 h-[2.15vw] border ${hasErr ? 'border-red-500' : 'border-gray-200'} rounded-[0.55vw] px-[0.85vw] text-[0.78vw] focus:outline-none focus:border-gray-300 text-gray-700 bg-white shadow-xs`}
                    />
                    <button
                      type="button"
                      title={`Remove ${platform.label}`}
                      onClick={() => handleRemoveSocial(key)}
                      className="w-[2.15vw] h-[2.15vw] border border-gray-200 rounded-[0.55vw] flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors bg-white shrink-0 cursor-pointer shadow-xs"
                    >
                      <X className="w-[0.9vw] h-[0.9vw]" />
                    </button>
                  </div>
                  {hasErr && (
                    <p className="text-red-500 text-[0.65vw] pl-[2.95vw]">{errors[platform.errKey]}</p>
                  )}
                </div>
              );
            })}

            {/* + Add Social Links Dropdown Button */}
            <div className="relative mt-[0.4vw] mb-[2vw]" ref={socialDropdownRef}>
              <button
                type="button"
                onClick={() => setIsAddingSocial(!isAddingSocial)}
                className="flex items-center gap-[0.35vw] px-[0.9vw] py-[0.45vw] border border-[#EC5137] text-[#EC5137] rounded-[0.45vw] text-[0.75vw] font-medium hover:bg-[#EC5137]/5 transition-colors cursor-pointer bg-white"
              >
                <span className="text-[0.9vw] leading-none">+</span> Add Social Links
              </button>

              {/* Dropdown list of platforms not yet added */}
              {isAddingSocial && (
                <div className="absolute left-0 mt-[0.4vw] w-[14vw] bg-white border border-gray-200 rounded-[0.6vw] shadow-lg py-[0.4vw] z-50 animate-in fade-in zoom-in-95 duration-100">
                  {availableSocialOptions.length > 0 ? (
                    availableSocialOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleAddSocial(opt.key)}
                        className="w-full flex items-center gap-[0.7vw] px-[0.9vw] py-[0.55vw] text-[0.78vw] text-gray-700 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                      >
                        <div className={`w-[1.5vw] h-[1.5vw] ${opt.badgeBg} rounded-[0.35vw] flex items-center justify-center shrink-0`}>
                          {opt.isLucide ? (
                            <Globe className="w-[0.85vw] h-[0.85vw] text-white" />
                          ) : (
                            <Icon icon={opt.icon} className="w-[0.95vw] h-[0.95vw] text-white" />
                          )}
                        </div>
                        <span className="font-normal text-gray-800">{opt.label}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-[0.8vw] py-[0.5vw] text-[0.72vw] text-gray-400 text-center">
                      All social platforms added
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Visibility Section */}
        <section className="border border-gray-200/80 rounded-[0.8vw] p-[1.5vw] bg-white shadow-xs mb-[2.5vw]">
          <div className="flex items-start gap-[0.7vw] mb-[1.4vw]">
            <Icon icon="lucide:eye" className="w-[1.15vw] h-[1.15vw] text-gray-700 mt-[0.1vw]" />
            <div>
              <h3 className="text-[0.95vw] font-medium text-gray-800 leading-tight">Visibility</h3>
              <p className="text-[0.72vw] text-gray-400 mt-[0.2vw]">Control what information is visible to others</p>
            </div>
          </div>

          <div className="flex flex-col gap-[1.2vw] pt-[0.2vw]">
            {/* Toggle Row */}
            <div className="flex flex-col gap-[0.2vw] w-full">
              <div className="flex items-center gap-[1.2vw] w-full">
                <h4 className="text-[0.82vw] font-medium text-gray-800 shrink-0">
                  Show my profile in Explore Page
                </h4>

                {/* Straight Dashed line */}
                <div className="flex-1 border-b border-dashed border-gray-200"></div>

                {/* Pill Switch with checkmark matching screenshot */}
                <button
                  type="button"
                  onClick={() => {
                    setEditedUser(prev => {
                      const currentVal = prev?.visibilitySettings?.showInExplore !== false;
                      return {
                        ...prev,
                        visibilitySettings: {
                          ...(prev?.visibilitySettings || {}),
                          showInExplore: !currentVal
                        }
                      };
                    });
                  }}
                  className="relative inline-flex items-center w-[2.8vw] h-[1.6vw] shrink-0 cursor-pointer focus:outline-none"
                >
                  {/* Track */}
                  <span
                    className={`w-[2.5vw] h-[1.1vw] rounded-full transition-colors duration-200 ease-in-out ${
                      editedUser?.visibilitySettings?.showInExplore !== false ? 'bg-[#EC5137]' : 'bg-gray-200'
                    }`}
                  />

                  {/* Circular Button with Centered White Checkmark */}
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 w-[1.45vw] h-[1.45vw] rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.22)] flex items-center justify-center transition-transform duration-200 ease-in-out ${
                      editedUser?.visibilitySettings?.showInExplore !== false
                        ? 'translate-x-[1.35vw] bg-[#EC5137]'
                        : 'translate-x-0 bg-white'
                    }`}
                  >
                    {editedUser?.visibilitySettings?.showInExplore !== false ? (
                      <Icon icon="lucide:check" className="w-[0.85vw] h-[0.85vw] text-white stroke-[3.5]" />
                    ) : null}
                  </span>
                </button>
              </div>

              <p className="text-[0.75vw] text-gray-400">
                Make your profile visible to others in Explore page
              </p>
            </div>

            {/* Checkbox Items */}
            <div className="flex flex-col gap-[0.9vw] pt-[0.4vw]">
              {/* Option 1: Contact Information */}
              <div
                onClick={() => {
                  setEditedUser(prev => {
                    const currentVal = prev?.visibilitySettings?.showContact !== false;
                    return {
                      ...prev,
                      visibilitySettings: {
                        ...(prev?.visibilitySettings || {}),
                        showContact: !currentVal
                      }
                    };
                  });
                }}
                className="flex items-center gap-[0.7vw] cursor-pointer select-none"
              >
                <div
                  className={`w-[1.1vw] h-[1.1vw] rounded-[0.25vw] flex items-center justify-center transition-colors shrink-0 ${
                    editedUser?.visibilitySettings?.showContact !== false
                      ? 'bg-[#EC5137] text-white'
                      : 'border border-gray-300 bg-white'
                  }`}
                >
                  {editedUser?.visibilitySettings?.showContact !== false && (
                    <Icon icon="lucide:check" className="w-[0.8vw] h-[0.8vw] stroke-[3.5]" />
                  )}
                </div>
                <span className="text-[0.8vw] text-gray-600">
                  Show <strong className="font-semibold text-gray-900">contact information</strong> like email, phone and website in your public profile
                </span>
              </div>

              {/* Option 2: Address */}
              <div
                onClick={() => {
                  setEditedUser(prev => {
                    const currentVal = prev?.visibilitySettings?.showAddress !== false;
                    return {
                      ...prev,
                      visibilitySettings: {
                        ...(prev?.visibilitySettings || {}),
                        showAddress: !currentVal
                      }
                    };
                  });
                }}
                className="flex items-center gap-[0.7vw] cursor-pointer select-none"
              >
                <div
                  className={`w-[1.1vw] h-[1.1vw] rounded-[0.25vw] flex items-center justify-center transition-colors shrink-0 ${
                    editedUser?.visibilitySettings?.showAddress !== false
                      ? 'bg-[#EC5137] text-white'
                      : 'border border-gray-300 bg-white'
                  }`}
                >
                  {editedUser?.visibilitySettings?.showAddress !== false && (
                    <Icon icon="lucide:check" className="w-[0.8vw] h-[0.8vw] stroke-[3.5]" />
                  )}
                </div>
                <span className="text-[0.8vw] text-gray-600">
                  Show <strong className="font-semibold text-gray-900">Address</strong> in your public profile
                </span>
              </div>

              {/* Option 3: Social Media Navigation Icons */}
              <div
                onClick={() => {
                  setEditedUser(prev => {
                    const currentVal = prev?.visibilitySettings?.showSocial !== false;
                    return {
                      ...prev,
                      visibilitySettings: {
                        ...(prev?.visibilitySettings || {}),
                        showSocial: !currentVal
                      }
                    };
                  });
                }}
                className="flex items-center gap-[0.7vw] cursor-pointer select-none"
              >
                <div
                  className={`w-[1.1vw] h-[1.1vw] rounded-[0.25vw] flex items-center justify-center transition-colors shrink-0 ${
                    editedUser?.visibilitySettings?.showSocial !== false
                      ? 'bg-[#EC5137] text-white'
                      : 'border border-gray-300 bg-white'
                  }`}
                >
                  {editedUser?.visibilitySettings?.showSocial !== false && (
                    <Icon icon="lucide:check" className="w-[0.8vw] h-[0.8vw] stroke-[3.5]" />
                  )}
                </div>
                <span className="text-[0.8vw] text-gray-600">
                  Show <strong className="font-semibold text-gray-900">Social Media</strong> Navigation Icons in your public profile
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default EditProfile;
