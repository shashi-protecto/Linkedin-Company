export enum Platform {
  LinkedIn = 'LinkedIn',
  Twitter = 'Twitter'
}

export enum Tone {
  ThoughtLeader = 'Thought Leader',
  Educational = 'Educational',
  Controversial = 'Controversial',
  Storytelling = 'Storytelling',
  Hiring = 'Hiring & Culture',
  Humorous = 'Viral / Humorous',
  Launch = 'Product Launch',
  CaseStudy = 'Case Study'
}

export enum ModelType {
  Writing = 'Writing',
  Thinking = 'Thinking'
}

export enum PostFormat {
  Standard = 'Standard Post',
  Carousel = 'Carousel',
  Article = 'Article',
  ImageQuote = 'Quote/Stat',
  Infographic = 'Infographic'
}

export enum ModelTier {
  Flash = 'Gemini 2.5 Flash',
  Pro = 'Gemini 3 Pro'
}

export enum ImageModelTier {
  NanoBanana = 'Nano Banana (Fast)',
  NanoBananaPro = 'Nano Banana Pro (High Quality)'
}

export interface AppSettings {
  apiKey: string;
  modelTier: ModelTier;
  imageModelTier: ImageModelTier;
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64 string
}

export interface GeneratedContent {
  content: string;
  hashtags: string[];
  platform: Platform;
  tone: Tone;
  sources?: { uri: string; title: string }[];
  images?: string[]; // Base64 data from image generation
  imageError?: string; // Error message if image generation failed
}

export interface GeneratorState {
  topic: string;
  context: string;
  platform: Platform;
  tone: Tone;
  modelType: ModelType;
  format: PostFormat;
  url: string;
  attachments: Attachment[];
  isLoading: boolean;
  result: GeneratedContent | null;
  error: string | null;
}