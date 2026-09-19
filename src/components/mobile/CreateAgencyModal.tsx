import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  ChevronRight,
  Check,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';

interface CreateAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CountryOption {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: CountryOption[] = [
  { name: 'India', code: 'IN', flag: '🇮🇳', dialCode: '+91' },
  { name: 'United States', code: 'US', flag: '🇺🇸', dialCode: '+1' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰', dialCode: '+92' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩', dialCode: '+880' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', dialCode: '+966' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dialCode: '+971' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', dialCode: '+63' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', dialCode: '+62' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬', dialCode: '+20' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', dialCode: '+90' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', dialCode: '+55' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', dialCode: '+234' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dialCode: '+44' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', dialCode: '+1' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾', dialCode: '+60' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', dialCode: '+84' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽', dialCode: '+52' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', dialCode: '+49' },
  { name: 'France', code: 'FR', flag: '🇫🇷', dialCode: '+33' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', dialCode: '+254' },
];

export const CreateAgencyModal: React.FC<CreateAgencyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createHostAgency } = useAppState();

  const [agencyName, setAgencyName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // ID Cards
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);

  // Modals & UI States
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Hidden File Inputs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdFrontImage(event.target?.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdBackImage(event.target?.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample ID fill for quick testing
  const useSampleIdFront = () => {
    setIdFrontImage(
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80'
    );
    setErrorMsg('');
  };

  const useSampleIdBack = () => {
    setIdBackImage(
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80'
    );
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agencyName.trim()) {
      setErrorMsg('Please enter an agency name (up to 20 characters).');
      return;
    }
    if (agencyName.trim().length > 20) {
      setErrorMsg('Agency name cannot exceed 20 characters.');
      return;
    }
    if (!selectedCountry) {
      setErrorMsg('Please choose your country.');
      return;
    }
    if (!idFrontImage) {
      setErrorMsg('Please upload the front side of your ID card.');
      return;
    }
    if (!idBackImage) {
      setErrorMsg('Please upload the back side of your ID card.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createHostAgency(agencyName.trim(), {
        country: selectedCountry.name,
        phone: phoneNumber.trim(),
        address: address.trim(),
        idCardFront: idFrontImage,
        idCardBack: idBackImage,
      });

      if (result.success) {
        setIsSubmittedSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setIsSubmitting(false);
        setErrorMsg(result.message);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Failed to submit agency application. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={frontInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFrontUpload}
      />
      <input
        type="file"
        ref={backInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleBackUpload}
      />

      <motion.div
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white text-slate-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-sans"
      >
        {/* SUCCESS OVERLAY STATE */}
        <AnimatePresence>
          {isSubmittedSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-md animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Review Submitted!</h3>
              <p className="text-sm text-slate-500 mb-6">
                Your agency <span className="font-bold text-slate-800 font-mono">"{agencyName}"</span> has been verified and registered. Welcome to your Agency Management Center.
              </p>
              <button
                onClick={() => {
                  setIsSubmittedSuccess(false);
                  onClose();
                }}
                className="w-full py-3.5 rounded-full bg-[#733B15] text-white font-bold text-sm shadow-md"
              >
                Go to Agency Center
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL HEADER: Centered "Create" & Circular Close X */}
        <div className="relative pt-4 pb-2 px-5 border-b border-slate-100 flex items-center justify-center">
          <h2 className="text-xl font-bold text-slate-900 text-center tracking-tight">
            Create
          </h2>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#E8EAEF] hover:bg-slate-300 active:bg-slate-400 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUBTITLE NOTICE: "Agency name cannot be modified once created" */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-[13px] text-slate-400 font-medium leading-tight">
            Agency name cannot be modified once created
          </p>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-1 space-y-4 no-scrollbar">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. AGENCY NAME INPUT */}
            <div>
              <input
                type="text"
                maxLength={20}
                value={agencyName}
                onChange={(e) => {
                  setAgencyName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="No more than 20 characters"
                className="w-full h-12 px-5 rounded-full bg-[#F4F5F8] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#733B15]/20 font-medium transition-all"
                required
              />
              <div className="flex justify-end px-3 mt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  {agencyName.length}/20
                </span>
              </div>
            </div>

            {/* 2. CHOOSE A COUNTRY SELECTOR */}
            <div>
              <button
                type="button"
                onClick={() => setIsCountryPickerOpen(true)}
                className="w-full h-12 px-5 rounded-full bg-[#F4F5F8] text-[14px] text-slate-800 flex items-center justify-between font-medium transition-all hover:bg-[#EBEEF3] active:bg-[#E3E6EC] cursor-pointer"
              >
                {selectedCountry ? (
                  <span className="flex items-center gap-2 text-slate-900 font-semibold">
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({selectedCountry.dialCode})</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Choose a country</span>
                )}
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            </div>

            {/* 3. *ID INFORMATION SECTION */}
            <div className="pt-2">
              <div className="flex items-center gap-1">
                <span className="text-rose-500 font-bold text-sm leading-none">*</span>
                <h3 className="text-[14px] font-bold text-slate-800">ID information</h3>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5 mb-3 font-normal">
                Please upload real and valid information
              </p>

              {/* ID Cards Upload Boxes Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* ID Card Front */}
                <div>
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    className="relative w-full h-28 rounded-2xl bg-[#EFF3FA] border border-[#DCE4F5] hover:border-indigo-300 active:bg-[#E5ECF7] transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group shadow-2xs"
                  >
                    {/* Corner Viewfinder Camera Brackets */}
                    <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-slate-600/60 rounded-tl-xs pointer-events-none" />
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-slate-600/60 rounded-tr-xs pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-slate-600/60 rounded-bl-xs pointer-events-none" />
                    <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-slate-600/60 rounded-br-xs pointer-events-none" />

                    {idFrontImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={idFrontImage}
                          alt="ID Front Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-2 py-0.5 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold">
                            Change
                          </span>
                        </div>
                        <span className="absolute top-2 right-2 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#344265] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <Camera className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="block text-center text-[12px] text-slate-700 font-medium mt-1.5">
                    ID card front
                  </span>

                  {/* Sample auto-fill helper */}
                  {!idFrontImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        useSampleIdFront();
                      }}
                      className="block mx-auto text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline mt-0.5 cursor-pointer"
                    >
                      Use sample front
                    </button>
                  )}
                </div>

                {/* ID Card Back */}
                <div>
                  <div
                    onClick={() => backInputRef.current?.click()}
                    className="relative w-full h-28 rounded-2xl bg-[#EFF3FA] border border-[#DCE4F5] hover:border-indigo-300 active:bg-[#E5ECF7] transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group shadow-2xs"
                  >
                    {/* Corner Viewfinder Camera Brackets */}
                    <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-slate-600/60 rounded-tl-xs pointer-events-none" />
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-slate-600/60 rounded-tr-xs pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-slate-600/60 rounded-bl-xs pointer-events-none" />
                    <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-slate-600/60 rounded-br-xs pointer-events-none" />

                    {idBackImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={idBackImage}
                          alt="ID Back Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-2 py-0.5 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold">
                            Change
                          </span>
                        </div>
                        <span className="absolute top-2 right-2 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#344265] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <Camera className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="block text-center text-[12px] text-slate-700 font-medium mt-1.5">
                    ID card back
                  </span>

                  {/* Sample auto-fill helper */}
                  {!idBackImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        useSampleIdBack();
                      }}
                      className="block mx-auto text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline mt-0.5 cursor-pointer"
                    >
                      Use sample back
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4. *PHONE AND ADDRESS SECTION */}
            <div className="pt-2">
              <div className="flex items-center gap-1 mb-2.5">
                <span className="text-rose-500 font-bold text-sm leading-none">*</span>
                <h3 className="text-[14px] font-bold text-slate-800">Phone and address</h3>
              </div>

              <div className="space-y-3">
                {/* Phone Number Input */}
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Phone number  (XX - XXXXXXX)"
                  className="w-full h-12 px-5 rounded-full bg-[#F4F5F8] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#733B15]/20 font-medium transition-all"
                  required
                />

                {/* Address Input (matches 'Adress' spelling in screenshot) */}
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Adress"
                  className="w-full h-12 px-5 rounded-full bg-[#F4F5F8] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#733B15]/20 font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* 5. SUBMIT REVIEW BUTTON */}
            <div className="pt-4 pb-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 rounded-full bg-[#733B15] hover:bg-[#603111] active:bg-[#50290E] disabled:opacity-60 text-white font-bold text-base shadow-lg shadow-amber-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit review</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* COUNTRY PICKER BOTTOM SHEET / MODAL */}
        <AnimatePresence>
          {isCountryPickerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="w-full bg-white rounded-t-3xl max-h-[75%] flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">Choose a country</h4>
                  <button
                    onClick={() => setIsCountryPickerOpen(false)}
                    className="p-1 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search input */}
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search country or dial code..."
                      className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-100 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Countries list */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSelectedCountry(c);
                        if (!phoneNumber) {
                          setPhoneNumber(`${c.dialCode} `);
                        }
                        setIsCountryPickerOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">{c.dialCode}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-400">
                      No countries found.
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
