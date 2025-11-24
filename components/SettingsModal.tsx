import React, { useState, useEffect } from 'react';
import { XIcon, SparklesIcon, BrainIcon, ImageIcon } from './Icons';
import { AppSettings, ModelTier, ImageModelTier } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Settings</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Model Selection (Text) */}
          <div>
             <label className="block text-sm font-semibold text-slate-900 mb-3">Text Model (Writing & Thinking)</label>
             <div className="space-y-3">
               
               <div 
                 onClick={() => setLocalSettings({...localSettings, modelTier: ModelTier.Flash})}
                 className={`cursor-pointer p-3 rounded-lg border-2 transition-all flex items-start gap-3 ${
                   localSettings.modelTier === ModelTier.Flash 
                   ? 'border-brand-500 bg-brand-50/50' 
                   : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                 }`}
               >
                 <div className={`mt-0.5 p-1.5 rounded-md ${localSettings.modelTier === ModelTier.Flash ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                   <SparklesIcon className="w-4 h-4" />
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                     <p className="font-semibold text-sm text-slate-900">Gemini 2.5 Flash</p>
                     {localSettings.modelTier === ModelTier.Flash && <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">Active</span>}
                   </div>
                   <p className="text-xs text-slate-500 mt-1">Fast & efficient. Good for drafts.</p>
                 </div>
               </div>

               <div 
                 onClick={() => setLocalSettings({...localSettings, modelTier: ModelTier.Pro})}
                 className={`cursor-pointer p-3 rounded-lg border-2 transition-all flex items-start gap-3 ${
                   localSettings.modelTier === ModelTier.Pro 
                   ? 'border-brand-500 bg-brand-50/50' 
                   : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                 }`}
               >
                 <div className={`mt-0.5 p-1.5 rounded-md ${localSettings.modelTier === ModelTier.Pro ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                   <BrainIcon className="w-4 h-4" />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                     <p className="font-semibold text-sm text-slate-900">Gemini 3 Pro</p>
                     {localSettings.modelTier === ModelTier.Pro && <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded-full">Active</span>}
                   </div>
                   <p className="text-xs text-slate-500 mt-1">High reasoning & quality.</p>
                 </div>
               </div>

             </div>
          </div>

          {/* Model Selection (Image) */}
          <div>
             <label className="block text-sm font-semibold text-slate-900 mb-3">Image Model</label>
             <div className="space-y-3">
               
               <div 
                 onClick={() => setLocalSettings({...localSettings, imageModelTier: ImageModelTier.NanoBanana})}
                 className={`cursor-pointer p-3 rounded-lg border-2 transition-all flex items-start gap-3 ${
                   localSettings.imageModelTier === ImageModelTier.NanoBanana 
                   ? 'border-brand-500 bg-brand-50/50' 
                   : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                 }`}
               >
                 <div className={`mt-0.5 p-1.5 rounded-md ${localSettings.imageModelTier === ImageModelTier.NanoBanana ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                   <ImageIcon className="w-4 h-4" />
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                     <p className="font-semibold text-sm text-slate-900">Nano Banana</p>
                     {localSettings.imageModelTier === ImageModelTier.NanoBanana && <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">Active</span>}
                   </div>
                   <p className="text-xs text-slate-500 mt-1">Standard generation (gemini-2.5-flash-image).</p>
                 </div>
               </div>

               <div 
                 onClick={() => setLocalSettings({...localSettings, imageModelTier: ImageModelTier.NanoBananaPro})}
                 className={`cursor-pointer p-3 rounded-lg border-2 transition-all flex items-start gap-3 ${
                   localSettings.imageModelTier === ImageModelTier.NanoBananaPro 
                   ? 'border-brand-500 bg-brand-50/50' 
                   : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                 }`}
               >
                 <div className={`mt-0.5 p-1.5 rounded-md ${localSettings.imageModelTier === ImageModelTier.NanoBananaPro ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                   <ImageIcon className="w-4 h-4" />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                     <p className="font-semibold text-sm text-slate-900">Nano Banana Pro</p>
                     {localSettings.imageModelTier === ImageModelTier.NanoBananaPro && <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded-full">Active</span>}
                   </div>
                   <p className="text-xs text-slate-500 mt-1">High fidelity (gemini-3-pro-image-preview).</p>
                 </div>
               </div>

             </div>
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-semibold text-slate-900 mb-2">
              Gemini API Key
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Required for Pro & Image models. Leave blank to use env default.
            </p>
            <input
              type="password"
              id="apiKey"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-mono text-sm"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;