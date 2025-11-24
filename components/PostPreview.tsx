import React, { useState } from 'react';
import { GeneratedContent, Platform } from '../types';
import { LinkedinIcon, TwitterIcon, CopyIcon, CheckIcon, LinkIcon, ImageIcon } from './Icons';

interface PostPreviewProps {
  data: GeneratedContent | null;
  isLoading: boolean;
}

const PostPreview: React.FC<PostPreviewProps> = ({ data, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data?.content) {
      navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
        <p className="text-slate-500 animate-pulse font-medium">Analyzing Protecto.ai brand voice...</p>
        <p className="text-slate-400 text-sm mt-2">Crafting human-centric content...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col justify-center items-center text-slate-400 p-8 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <span className="text-4xl">✨</span>
        </div>
        <p className="font-medium text-lg">Ready to Create</p>
        <p className="text-sm mt-1 max-w-xs">Enter your topic on the left to generate on-brand social content.</p>
      </div>
    );
  }

  const isLinkedIn = data.platform === Platform.LinkedIn;

  return (
    <div className="w-full flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          {isLinkedIn ? <LinkedinIcon className="w-5 h-5 text-[#0077b5]" /> : <TwitterIcon className="w-5 h-5 text-black" />}
          Preview
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy Text'}
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
        {/* Mock Platform Header */}
        <div className="p-4 border-b border-slate-100 flex items-start gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
            P
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm truncate">Protecto.ai</span>
              {isLinkedIn && <span className="text-slate-500 text-xs">• 1st</span>}
              {!isLinkedIn && <span className="text-slate-500 text-sm">@protecto_ai</span>}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {isLinkedIn ? 'GenAI Security | Data Privacy | Red Teaming' : ''}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              Just now • {isLinkedIn ? <span className="text-xs">🌐</span> : ''}
            </p>
          </div>
        </div>

        {/* Content Body - Scrollable Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="whitespace-pre-wrap font-sans text-sm md:text-[15px] leading-relaxed text-slate-800">
            {data.content}
          </div>
          
          {/* Media / Generated Image Section */}
          {data.images && data.images.length > 0 ? (
            <div className="mt-4 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <img 
                src={`data:image/png;base64,${data.images[0]}`} 
                alt="Generated Content" 
                className="w-full h-auto object-cover max-h-[600px]" 
              />
              <div className="p-2 bg-slate-50 text-xs text-slate-400 flex justify-between items-center">
                <span>AI Generated Visual</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Nano Banana</span>
              </div>
            </div>
          ) : (
             <div className="mt-4 w-full bg-slate-50 rounded-lg flex flex-col items-center justify-center border border-slate-200 text-slate-400 p-6">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                {data.imageError ? (
                  <div className="text-center">
                    <span className="text-red-500 text-sm font-medium block">Image Generation Failed</span>
                    <span className="text-xs text-red-400 block mt-1 max-w-[200px] mx-auto">{data.imageError}</span>
                  </div>
                ) : (
                  <span className="text-sm italic">No Image Generated</span>
                )}
             </div>
          )}

          {/* Sources Section */}
          {data.sources && data.sources.length > 0 && (
            <div className="mt-5 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> 
                Sources & Grounding
              </p>
              <div className="flex flex-col gap-1.5">
                {data.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-xs text-brand-600 hover:text-brand-800 transition-colors p-1.5 hover:bg-slate-50 rounded"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-brand-500"></span>
                    <span className="truncate underline decoration-transparent group-hover:decoration-brand-300 underline-offset-2">
                      {source.title || source.uri}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Platform Actions Mockup */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-slate-500 text-sm font-medium">
             {isLinkedIn ? (
               <>
                 <span className="cursor-pointer hover:bg-slate-50 p-2 rounded">Like</span>
                 <span className="cursor-pointer hover:bg-slate-50 p-2 rounded">Comment</span>
                 <span className="cursor-pointer hover:bg-slate-50 p-2 rounded">Repost</span>
                 <span className="cursor-pointer hover:bg-slate-50 p-2 rounded">Send</span>
               </>
             ) : (
                <>
                  <span className="cursor-pointer hover:text-blue-500">💬 2</span>
                  <span className="cursor-pointer hover:text-green-500">⚡ 5</span>
                  <span className="cursor-pointer hover:text-pink-500">♥ 12</span>
                  <span className="cursor-pointer hover:text-blue-500">📊 1.2K</span>
                </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;