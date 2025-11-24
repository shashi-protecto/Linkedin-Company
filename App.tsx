import React, { useState, useRef } from 'react';
import { generatePost } from './services/geminiService';
import PostPreview from './components/PostPreview';
import SettingsModal from './components/SettingsModal';
import { Platform, Tone, ModelType, GeneratorState, Attachment, PostFormat, AppSettings, ModelTier, ImageModelTier } from './types';
import { 
  LinkedinIcon, TwitterIcon, SparklesIcon, RefreshIcon, 
  BrainIcon, PenIcon, LinkIcon, PaperclipIcon, TrashIcon,
  CarouselIcon, ArticleIcon, QuoteIcon, InfographicIcon, PostIcon,
  SettingsIcon
} from './components/Icons';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    apiKey: '',
    modelTier: ModelTier.Flash,
    imageModelTier: ImageModelTier.NanoBanana // Default to fast image model
  });

  const [state, setState] = useState<GeneratorState>({
    topic: '',
    context: '',
    platform: Platform.LinkedIn,
    tone: Tone.ThoughtLeader,
    modelType: ModelType.Writing,
    format: PostFormat.Standard,
    url: '',
    attachments: [],
    isLoading: false,
    result: null,
    error: null,
  });

  const handleGenerate = async () => {
    if (!state.topic && !state.url && state.attachments.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await generatePost(
        state.topic || 'Analysis of provided context', // Fallback topic if only files/URL provided
        state.context,
        state.platform,
        state.tone,
        state.modelType,
        state.format,
        state.url,
        state.attachments,
        appSettings // Pass current settings
      );
      setState(prev => ({ ...prev, isLoading: false, result }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "Something went wrong" 
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const newAttachment: Attachment = {
            name: file.name,
            type: file.type,
            data: base64String
          };
          setState(prev => ({
            ...prev,
            attachments: [...prev.attachments, newAttachment]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setState(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const platforms = [
    { id: Platform.LinkedIn, icon: LinkedinIcon, label: 'LinkedIn' },
    { id: Platform.Twitter, icon: TwitterIcon, label: 'Twitter / X' },
  ];

  const models = [
    { id: ModelType.Writing, icon: PenIcon, label: 'Standard Writing', desc: 'Fast, creative content' },
    { id: ModelType.Thinking, icon: BrainIcon, label: 'Deep Thinking', desc: 'Reasoning for complex topics' },
  ];

  const formats = [
    { id: PostFormat.Standard, icon: PostIcon, label: 'Post' },
    { id: PostFormat.Carousel, icon: CarouselIcon, label: 'Carousel' },
    { id: PostFormat.Article, icon: ArticleIcon, label: 'Article' },
    { id: PostFormat.ImageQuote, icon: QuoteIcon, label: 'Quote/Img' },
    { id: PostFormat.Infographic, icon: InfographicIcon, label: 'Infographic' },
  ];

  const tones = Object.values(Tone);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900 flex flex-col overflow-hidden">
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onSave={setAppSettings}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-10">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Social Architect</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">For Protecto.ai</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {/* Model Badge */}
            <div className={`hidden sm:flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full border ${
              appSettings.modelTier === ModelTier.Pro 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : 'bg-brand-50 text-brand-700 border-brand-100'
            }`}>
              {appSettings.modelTier === ModelTier.Pro ? <BrainIcon className="w-4 h-4"/> : <SparklesIcon className="w-4 h-4" />}
              {appSettings.modelTier === ModelTier.Pro ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash'}
            </div>
            
            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-6 py-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Controls - Wider Column (Span 7/8) */}
          <div className="lg:col-span-7 xl:col-span-8 h-full overflow-y-auto pr-2 pb-2 scroll-smooth">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              
              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Generation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setState({ ...state, modelType: m.id })}
                      className={`flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-lg border transition-all text-center ${
                        state.modelType === m.id
                          ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm ring-1 ring-brand-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <m.icon className={`w-4 h-4 ${state.modelType === m.id ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span className="font-semibold text-sm">{m.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Platform</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setState({ ...state, platform: p.id })}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                        state.platform === p.id
                          ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm ring-1 ring-brand-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <p.icon className={`w-5 h-5 ${state.platform === p.id ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span className="font-medium text-sm">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Post Format</label>
                <div className="grid grid-cols-3 xl:grid-cols-5 gap-2">
                  {formats.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setState({ ...state, format: f.id })}
                      className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border transition-all text-center ${
                        state.format === f.id
                          ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm ring-1 ring-brand-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <f.icon className={`w-4 h-4 ${state.format === f.id ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-medium">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Tone of Voice</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t}
                      onClick={() => setState({ ...state, tone: t })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-center truncate ${
                        state.tone === t
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div className="mb-4">
                <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-2">
                  Topic / Headline
                </label>
                <input
                  type="text"
                  id="topic"
                  value={state.topic}
                  onChange={(e) => setState({ ...state, topic: e.target.value })}
                  placeholder="e.g. Red Teaming for LLMs"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Reference URL */}
              <div className="mb-4">
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
                  Reference URL (Scrape & Analyze)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={state.url}
                    onChange={(e) => setState({ ...state, url: e.target.value })}
                    placeholder="https://protecto.ai/blog/..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Attachments (PDF, Images)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-xs border border-slate-200">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-red-500">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                   <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                   >
                     <PaperclipIcon className="w-4 h-4" />
                     Upload Files
                   </button>
                   <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFileUpload}
                     className="hidden"
                     accept=".pdf,.png,.jpg,.jpeg,.txt"
                     multiple
                   />
                   <span className="text-xs text-slate-400">Supported: PDF, PNG, JPG</span>
                </div>
              </div>

              {/* Additional Context */}
              <div className="mb-8">
                <label htmlFor="context" className="block text-sm font-medium text-slate-700 mb-2">
                  Key Points / Extra Context
                </label>
                <textarea
                  id="context"
                  value={state.context}
                  onChange={(e) => setState({ ...state, context: e.target.value })}
                  placeholder="Specific angle, stats, or quotes to include..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 resize-none text-sm"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={state.isLoading || (!state.topic && !state.url && state.attachments.length === 0)}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
              >
                {state.isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    {state.result ? <RefreshIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    {state.result ? 'Regenerate Content' : 'Generate Post'}
                  </>
                )}
              </button>
              
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {state.error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview - Narrower Column (Span 5/4) */}
          <div className="lg:col-span-5 xl:col-span-4 h-full flex flex-col min-h-0">
             <PostPreview data={state.result} isLoading={state.isLoading} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;