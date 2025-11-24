import { GoogleGenAI } from "@google/genai";
import { getSystemInstruction } from '../constants';
import { Platform, Tone, ModelType, Attachment, GeneratedContent, PostFormat, AppSettings, ModelTier, ImageModelTier } from '../types';

// We do not initialize a global `ai` instance anymore because the key might change.
// Instead we initialize it per request or manage a singleton that updates.
// For simplicity in this structure, we'll initialize per request if a custom key is present,
// or fall back to the env var.

export const generatePost = async (
  topic: string,
  context: string,
  platform: Platform,
  tone: Tone,
  modelType: ModelType,
  format: PostFormat,
  url: string,
  attachments: Attachment[],
  settings?: AppSettings
): Promise<GeneratedContent> => {
  
  // Determine API Key
  // Priority: Settings Override -> Environment Variable
  const effectiveApiKey = settings?.apiKey || process.env.API_KEY || '';

  if (!effectiveApiKey) {
    throw new Error("API Key is missing. Please check your settings or environment configuration.");
  }

  // Determine Model Name based on settings
  // Default to Flash if not specified
  const modelName = settings?.modelTier === ModelTier.Pro 
    ? 'gemini-3-pro-preview' 
    : 'gemini-2.5-flash';

  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

  const systemInstruction = getSystemInstruction(platform, tone, format);

  // Build the content parts
  const parts: any[] = [];

  // 1. Add Attachments (Images, PDFs, Text)
  attachments.forEach((file) => {
    // Strip the data:image/png;base64, prefix if present for clean raw base64
    const base64Data = file.data.includes('base64,') 
      ? file.data.split('base64,')[1] 
      : file.data;

    parts.push({
      inlineData: {
        mimeType: file.type,
        data: base64Data
      }
    });
  });

  // 2. Build the Text Prompt
  let userPrompt = `Topic: ${topic}\n`;
  
  if (context) {
    userPrompt += `Additional Context: ${context}\n`;
  }

  if (url) {
    userPrompt += `\nReference URL: ${url}\nACTION REQUIRED: Use the Google Search tool to find and extract the specific content, arguments, and data from this URL. Use this extracted information as the primary source for the post. Do not hallucinate content if you cannot access the URL; instead, rely on the search results about this specific page.\n`;
  }

  if (attachments.length > 0) {
    userPrompt += `\nSource Material Provided: Please analyze the attached documents/images deeply. Extract specific facts, quotes, or technical details to use in the post.\n`;
  }

  userPrompt += `\nPlease write the content now following the strict format requirements for: ${format}.`;

  parts.push({ text: userPrompt });

  // 3. Configure Model & Tools
  const config: any = {
    systemInstruction: systemInstruction,
    temperature: 0.7,
  };

  // Enable Thinking for Complex Reasoning if selected
  // Note: Thinking is supported on 2.5 Flash and 3 Pro.
  if (modelType === ModelType.Thinking) {
    // 3 Pro supports higher budget, but 2048 is safe for both
    config.thinkingConfig = { thinkingBudget: 2048 }; 
  }

  // Enable Search if URL is provided to ground the content
  if (url) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config,
    });

    let text = response.text || "Failed to generate content.";
    
    // --- POST-PROCESSING ---
    // Systematically remove em-dashes (—) and replace with line breaks
    text = text.replace(/—/g, '\n');
    text = text.replace(/ – /g, '\n'); 

    const hashtagRegex = /#\w+/g;
    const hashtags = text.match(hashtagRegex) || [];

    // Extract grounding chunks (Sources)
    let sources: { uri: string; title: string }[] = [];
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri)
        .map((web: any) => ({
          uri: web.uri,
          title: web.title || web.uri
        }));
    }

    // --- IMAGE GENERATION (If Applicable) ---
    let images: string[] = [];
    let imageError: string | undefined;

    if (format === PostFormat.ImageQuote || format === PostFormat.Infographic) {
      // Robust Extraction using strict tags [IMAGE_PROMPT] and [CAPTION]
      // Matches: [IMAGE_PROMPT] ...content... [CAPTION]
      const strictRegex = /\[IMAGE_PROMPT\]([\s\S]*?)\[CAPTION\]/i;
      
      // Fallback Loose Match: "IMAGE PROMPT:" ...content... "CAPTION:"
      const looseRegex = /(?:IMAGE_PROMPT|IMAGE PROMPT|Image Prompt)[\s\:\-]+([\s\S]*?)(?=\n\n|\n(?:CAPTION|Caption)|$)/i;

      let promptMatch = text.match(strictRegex);
      if (!promptMatch) {
         promptMatch = text.match(looseRegex);
      }
      
      if (promptMatch && promptMatch[1]) {
        const imagePrompt = promptMatch[1].trim().replace(/\*\*/g, ''); // Clean markdown
        
        try {
          const imageModelName = settings?.imageModelTier === ImageModelTier.NanoBananaPro
             ? 'gemini-3-pro-image-preview'
             : 'gemini-2.5-flash-image';

          const aspectRatio = format === PostFormat.Infographic ? "3:4" : "1:1";

          const imageResponse = await ai.models.generateContent({
            model: imageModelName,
            contents: { parts: [{ text: imagePrompt }] },
            config: {
              imageConfig: {
                aspectRatio: aspectRatio
              }
            }
          });

          // Extract image from response parts
          if (imageResponse.candidates?.[0]?.content?.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                images.push(part.inlineData.data);
              }
            }
          }
        } catch (imgError: any) {
          console.error("Image Generation Failed:", imgError);
          
          let errString = JSON.stringify(imgError);
          if (imgError.message) errString += " " + imgError.message;
          if (imgError.response?.data) errString += " " + JSON.stringify(imgError.response.data);

          if (errString.includes('403') || errString.includes('PERMISSION_DENIED') || errString.includes('permission')) {
             imageError = "Permission Denied: Your API key cannot access 'Nano Banana Pro'. Try using 'Nano Banana (Fast)' in settings.";
          } else if (errString.includes('404') || errString.includes('not found')) {
             imageError = "Model Not Found: Model not enabled for this API key. Try 'Nano Banana (Fast)'.";
          } else {
             imageError = "Generation Failed: " + (imgError.message || "Unknown error");
          }
        }
      } else {
        imageError = "Could not parse image prompt from content.";
      }
      
      // Clean the text to show only the Caption part if we used strict parsing
      // This makes the text preview cleaner
      if (text.includes('[CAPTION]')) {
         text = text.split('[CAPTION]')[1].trim();
      }
    }

    return {
      content: text,
      hashtags,
      platform,
      tone,
      sources,
      images,
      imageError
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // enhance error message for common issues
    if (error.message?.includes('400')) {
       throw new Error(`Bad Request: Please check if the file format is supported or text is too long.`);
    }
    if (error.message?.includes('403')) {
        throw new Error("API Key Invalid or Quota Exceeded. Please check your settings.");
    }
    throw new Error("Failed to generate post. " + (error.message || "Please try again."));
  }
};