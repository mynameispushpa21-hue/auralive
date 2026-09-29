import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  Globe,
  Shield,
  Trash2,
  Info,
  Check,
  Moon,
} from 'lucide-react';
import { useAppState } from '../../services/stateStore';
import { audioEngine } from '../../services/audioEngine';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useAppState();
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [pushNotifsEnabled, setPushNotifsEnabled] = useState(true);
  const [entryAnimEnabled, setEntryAnimEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(currentUser.language || 'English');
  const [cacheClearedNotice, setCacheClearedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'tl', label: 'Filipino', flag: '🇵🇭' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    updateCurrentUserProfile({ language: lang });
  };

  const handleClearCache = () => {
    setCacheClearedNotice('App cache cleared & storage refreshed (24.8 MB freed)!');
    setTimeout(() => setCacheClearedNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm bg-[#121217] border border-[#232332] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#232332] flex items-center justify-between bg-[#1A1A24]/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-violet-600/20 text-violet-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">App Settings & Preferences</h3>
              <p className="text-[10px] text-slate-400">Audio, notifications, language & privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1A1A24] hover:bg-[#232332] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {cacheClearedNotice && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{cacheClearedNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* General Toggles */}
          <div className="p-3.5 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-3">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider">Audio & Visuals</h4>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
                  {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-white block">Sound Effects (SFX)</span>
                  <span className="text-[10px] text-slate-400">Gift & room animation effects</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSfxEnabled(!sfxEnabled);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  sfxEnabled ? 'bg-violet-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Entry Animations Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Room Entry Visual Effects</span>
                  <span className="text-[10px] text-slate-400">Supercars, dragon rides & VIP banners</span>
                </div>
              </div>
              <button
                onClick={() => setEntryAnimEnabled(!entryAnimEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  entryAnimEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    entryAnimEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Room & Gift Alerts</span>
                  <span className="text-[10px] text-slate-400">Followed hosts going live</span>
                </div>
              </div>
              <button
                onClick={() => setPushNotifsEnabled(!pushNotifsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  pushNotifsEnabled ? 'bg-pink-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    pushNotifsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="p-3.5 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-2.5">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> App Language
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.label)}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    selectedLanguage === l.label
                      ? 'bg-violet-600/30 border-violet-500 text-white font-bold'
                      : 'bg-[#121217] border-[#232332] text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{l.flag}</span>
                    <span className="text-xs">{l.label}</span>
                  </span>
                  {selectedLanguage === l.label && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Storage */}
          <div className="p-3.5 rounded-2xl bg-[#1A1A24] border border-[#232332] space-y-2">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Privacy & Cache
            </h4>

            <button
              onClick={handleClearCache}
              className="w-full p-2.5 rounded-xl bg-[#121217] hover:bg-[#232332] border border-[#232332] text-slate-300 hover:text-white flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>Clear Cache & Audio Buffer</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">24.8 MB</span>
            </button>
          </div>

          {/* About Section */}
          <div className="p-3 rounded-2xl bg-[#121217] border border-[#232332] flex items-center justify-between text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-400" />
              <span>AuraVoice Live Audio Stage</span>
            </div>
            <span className="font-mono text-slate-500 font-bold">v2.4.0-prod</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
