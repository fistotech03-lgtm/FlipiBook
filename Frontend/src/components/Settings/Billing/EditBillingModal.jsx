import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Country, State } from 'country-state-city';

const EditBillingModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const [billingName, setBillingName] = useState(initialData.billingName || 'Luffy');
  const [billingCompany, setBillingCompany] = useState(initialData.billingCompany || 'EduVision Creatives');
  const [billingEmail, setBillingEmail] = useState(initialData.billingEmail || 'luffyonepiece@gmail.com');
  const [billingAddress, setBillingAddress] = useState(initialData.billingAddress || '123, Anna Nagar');
  const [selectedCountryCode, setSelectedCountryCode] = useState(initialData.selectedCountryCode || 'IN');
  const [billingState, setBillingState] = useState(initialData.billingState || 'Tamil Nadu');
  const [billingCity, setBillingCity] = useState(initialData.billingCity || 'Madurai');
  const [billingPostalCode, setBillingPostalCode] = useState(initialData.billingPostalCode || '625020');
  const [billingGstin, setBillingGstin] = useState(initialData.billingGstin || 'luffy@okaxis');

  // Dropdown states
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const countryRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setBillingName(initialData.billingName || 'Luffy');
      setBillingCompany(initialData.billingCompany || 'EduVision Creatives');
      setBillingEmail(initialData.billingEmail || 'luffyonepiece@gmail.com');
      setBillingAddress(initialData.billingAddress || '123, Anna Nagar');
      setSelectedCountryCode(initialData.selectedCountryCode || 'IN');
      setBillingState(initialData.billingState || 'Tamil Nadu');
      setBillingCity(initialData.billingCity || 'Madurai');
      setBillingPostalCode(initialData.billingPostalCode || '625020');
      setBillingGstin(initialData.billingGstin || 'luffy@okaxis');
      setIsCountryOpen(false);
      setIsStateOpen(false);
    }
  }, [isOpen, initialData]);

  // Close dropdowns when clicking outside
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

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const availableStates = useMemo(() => {
    return selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  }, [selectedCountryCode]);

  const countryAliases = {
    US: ['america', 'united states of america', 'usa', 'us'],
    GB: ['united kingdom', 'uk', 'great britain', 'england', 'britain'],
    AE: ['united arab emirates', 'uae', 'dubai'],
    RU: ['russia', 'russian federation'],
    KR: ['south korea', 'korea'],
  };

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return allCountries;
    const query = countrySearch.toLowerCase().trim();
    return allCountries.filter((c) => {
      const nameMatches = c.name.toLowerCase().includes(query);
      const codeMatches = c.isoCode.toLowerCase() === query;
      const aliasMatches = countryAliases[c.isoCode]?.some((alias) => alias.includes(query));
      return nameMatches || codeMatches || aliasMatches;
    });
  }, [allCountries, countrySearch]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return availableStates;
    return availableStates.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [availableStates, stateSearch]);

  const selectedCountryName = useMemo(() => {
    const c = allCountries.find((item) => item.isoCode === selectedCountryCode);
    return c ? c.name : 'India';
  }, [allCountries, selectedCountryCode]);

  const handleSelectCountry = (code) => {
    setSelectedCountryCode(code);
    setIsCountryOpen(false);
    setCountrySearch('');
    const states = State.getStatesOfCountry(code);
    setBillingState(states.length > 0 ? states[0].name : '');
  };

  const handleSelectState = (name) => {
    setBillingState(name);
    setIsStateOpen(false);
    setStateSearch('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave?.({
      billingName,
      billingCompany,
      billingEmail,
      billingAddress,
      selectedCountryCode,
      billingState,
      billingCity,
      billingPostalCode,
      billingGstin,
      selectedCountryName,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-[1vw]"
    >
      <div
        className="w-full max-w-[34vw] bg-white rounded-[1vw] shadow-xl border border-gray-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-[1.6vw] pt-[1.35vw] pb-[0.8vw] border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-[0.65vw]">
              <div className="mt-[0.1vw] text-[#EC5137]">
                <Icon icon="lucide:file-edit" className="w-[1.15vw] h-[1.15vw]" strokeWidth="2.2" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[1.15vw] font-semibold text-gray-800 leading-tight">
                  Edit Billing Information
                </h2>
                <p className="text-[0.72vw] text-gray-500 mt-[0.2vw] font-normal">
                  These details will be used for billing and invoices.
                </p>
              </div>
            </div>

            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100"
            >
              <Icon icon="lucide:x" className="w-[0.95vw] h-[0.95vw]" strokeWidth="2.2" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-[1.6vw] pb-[0.8vw] pt-[0.9vw] flex flex-col gap-[0.85vw] overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Field 1: Billing Name */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                Billing Name <span className="text-[#EC5137]">*</span>
              </label>
              <input
                type="text"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                placeholder="Luffy"
                className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Field 2: Company Name (Optional) */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                Company Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={billingCompany}
                onChange={(e) => setBillingCompany(e.target.value)}
                placeholder="EduVision Creatives"
                className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Field 3: Billing Email */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                Billing Email <span className="text-[#EC5137]">*</span>
              </label>
              <input
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="luffyonepiece@gmail.com"
                className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Field 4: Billing Address */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                Billing Address <span className="text-[#EC5137]">*</span>
              </label>
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="123, Anna Nagar"
                className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Row: Country & State */}
            <div className="grid grid-cols-2 gap-[0.85vw]">
              {/* Country Dropdown */}
              <div className="flex flex-col gap-[0.25vw]" ref={countryRef}>
                <label className="text-[0.74vw] font-medium text-gray-700">
                  Country <span className="text-[#EC5137]">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCountryOpen(!isCountryOpen);
                      setIsStateOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border bg-white text-[0.76vw] transition-colors cursor-pointer ${
                      isCountryOpen ? 'border-[#4c5add] ring-1 ring-[#4c5add]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="truncate text-gray-800 font-medium">{selectedCountryName}</span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`w-[0.85vw] h-[0.85vw] text-gray-400 transition-transform duration-200 shrink-0 ${
                        isCountryOpen ? 'rotate-180 text-gray-600' : ''
                      }`}
                      strokeWidth="2.2"
                    />
                  </button>

                  {/* Dropdown Popover */}
                  {isCountryOpen && (
                    <div className="absolute left-0 top-[110%] w-full bg-white rounded-[0.5vw] shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-[0.35vw] border-b border-gray-100 bg-gray-50/70">
                        <div className="flex items-center px-[0.5vw] py-[0.3vw] bg-white rounded-[0.4vw] border border-gray-200">
                          <Icon icon="lucide:search" className="w-[0.75vw] h-[0.75vw] text-gray-400 shrink-0 mr-[0.3vw]" />
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country..."
                            autoFocus
                            className="w-full text-[0.72vw] bg-transparent outline-none text-gray-800 placeholder-gray-400"
                          />
                          {countrySearch && (
                            <button
                              type="button"
                              onClick={() => setCountrySearch('')}
                              className="text-gray-400 hover:text-gray-600 text-[0.65vw]"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-[10.5vw] overflow-y-auto divide-y divide-gray-50 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => {
                            const isSelected = country.isoCode === selectedCountryCode;
                            return (
                              <button
                                key={country.isoCode}
                                type="button"
                                onClick={() => handleSelectCountry(country.isoCode)}
                                className={`w-full text-left px-[0.85vw] py-[0.42vw] text-[0.72vw] transition-colors flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#EEF4FF] text-[#3B82F6] font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className="truncate">{country.name}</span>
                                {isSelected && (
                                  <Icon icon="lucide:check" className="w-[0.8vw] h-[0.8vw] text-[#3B82F6] shrink-0" strokeWidth="2.5" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-[0.7vw] text-center text-gray-400 text-[0.7vw]">
                            No country found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* State Dropdown */}
              <div className="flex flex-col gap-[0.25vw]" ref={stateRef}>
                <label className="text-[0.74vw] font-medium text-gray-700">
                  State <span className="text-[#EC5137]">*</span>
                </label>
                <div className="relative">
                  {availableStates.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsStateOpen(!isStateOpen);
                          setIsCountryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border bg-white text-[0.76vw] transition-colors cursor-pointer ${
                          isStateOpen ? 'border-[#4c5add] ring-1 ring-[#4c5add]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="truncate text-gray-800 font-medium">
                          {billingState || 'Select state'}
                        </span>
                        <Icon
                          icon="lucide:chevron-down"
                          className={`w-[0.85vw] h-[0.85vw] text-gray-400 transition-transform duration-200 shrink-0 ${
                            isStateOpen ? 'rotate-180 text-gray-600' : ''
                          }`}
                          strokeWidth="2.2"
                        />
                      </button>

                      {/* State Dropdown Popover */}
                      {isStateOpen && (
                        <div className="absolute left-0 top-[110%] w-full bg-white rounded-[0.5vw] shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                          {availableStates.length > 5 && (
                            <div className="p-[0.35vw] border-b border-gray-100 bg-gray-50/70">
                              <div className="flex items-center px-[0.5vw] py-[0.3vw] bg-white rounded-[0.4vw] border border-gray-200">
                                <Icon icon="lucide:search" className="w-[0.75vw] h-[0.75vw] text-gray-400 shrink-0 mr-[0.3vw]" />
                                <input
                                  type="text"
                                  value={stateSearch}
                                  onChange={(e) => setStateSearch(e.target.value)}
                                  placeholder="Search state..."
                                  autoFocus
                                  className="w-full text-[0.72vw] bg-transparent outline-none text-gray-800 placeholder-gray-400"
                                />
                                {stateSearch && (
                                  <button
                                    type="button"
                                    onClick={() => setStateSearch('')}
                                    className="text-gray-400 hover:text-gray-600 text-[0.65vw]"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="max-h-[10.5vw] overflow-y-auto divide-y divide-gray-50 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {filteredStates.length > 0 ? (
                              filteredStates.map((state) => {
                                const isSelected = state.name === billingState;
                                return (
                                  <button
                                    key={state.isoCode || state.name}
                                    type="button"
                                    onClick={() => handleSelectState(state.name)}
                                    className={`w-full text-left px-[0.85vw] py-[0.42vw] text-[0.72vw] transition-colors flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#EEF4FF] text-[#3B82F6] font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span className="truncate">{state.name}</span>
                                    {isSelected && (
                                      <Icon icon="lucide:check" className="w-[0.8vw] h-[0.8vw] text-[#3B82F6] shrink-0" strokeWidth="2.5" />
                                    )}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-[0.7vw] text-center text-gray-400 text-[0.7vw]">
                                No state found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      placeholder="Enter state"
                      className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 transition-colors"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Row: City & Postal Code */}
            <div className="grid grid-cols-2 gap-[0.85vw]">
              <div className="flex flex-col gap-[0.25vw]">
                <label className="text-[0.74vw] font-medium text-gray-700">
                  City <span className="text-[#EC5137]">*</span>
                </label>
                <input
                  type="text"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                  placeholder="Madurai"
                  className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-[0.25vw]">
                <label className="text-[0.74vw] font-medium text-gray-700">
                  Postal Code <span className="text-[#EC5137]">*</span>
                </label>
                <input
                  type="text"
                  value={billingPostalCode}
                  onChange={(e) => setBillingPostalCode(e.target.value)}
                  placeholder="625020"
                  className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
                />
              </div>
            </div>

            {/* Field 7: GSTIN (Optional) */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                GSTIN <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={billingGstin}
                onChange={(e) => setBillingGstin(e.target.value)}
                placeholder="luffy@okaxis"
                className="w-full px-[0.85vw] py-[0.52vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-[0.76vw] text-gray-800 placeholder-gray-400 transition-colors"
              />
              <p className="text-[0.66vw] text-gray-400 mt-[0.1vw] font-normal">
                For applicable Indian business tax invoices.
              </p>
            </div>
          </div>

          {/* Action Buttons: Cancel & Save Changes */}
          <div className="px-[1.6vw] py-[0.9vw] border-t border-gray-100 flex items-center justify-end gap-[0.65vw] shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-[0.35vw] px-[1.05vw] py-[0.48vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-[0.76vw] font-medium text-gray-700 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Icon icon="lucide:x" className="w-[0.8vw] h-[0.8vw] text-gray-500" strokeWidth="2.2" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-[0.38vw] px-[1.25vw] py-[0.48vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white text-[0.76vw] font-medium shadow-xs transition-all cursor-pointer"
            >
              <Icon icon="lucide:check" className="w-[0.8vw] h-[0.8vw]" strokeWidth="2.8" />
              <span>Save changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBillingModal;

