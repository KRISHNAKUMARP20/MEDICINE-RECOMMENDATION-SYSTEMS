import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Film,
  Flame,
  HeartPulse,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  MoveRight,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  RotateCcw,
  Scan,
  Smartphone,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  Video,
  X,
  Zap
} from 'lucide-react';
import { veoVideoService, VideoAspectRatio, GeneratedVideoRecord } from '../../services/veoVideoService';

// Medical preset sample images with reliable SVG/Canvas generation
const MEDICAL_SAMPLE_PRESETS = [
  {
    id: 'sample-heart',
    title: 'Cardiovascular Cardiac Cycle',
    category: 'Cardiology',
    description: 'Ventricular contraction and arterial blood flow animation',
    prompt: 'Animate this heart diagram with rhythmic myocardial contraction, pulsing arteries, and fluid hemodynamics',
    aspectRatio: '16:9' as VideoAspectRatio,
    previewSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="%230f172a"><rect width="800" height="450" fill="%230f172a"/><circle cx="400" cy="225" r="140" fill="%23e11d48" opacity="0.85"/><path d="M400 130 C350 80, 260 90, 260 170 C260 250, 400 330, 400 330 C400 330, 540 250, 540 170 C540 90, 450 80, 400 130 Z" fill="%23be123c"/><path d="M370 120 L370 70 C370 50, 430 50, 430 70 L430 120 Z" fill="%230284c7"/><text x="400" y="380" fill="%23ffffff" font-family="system-ui" font-size="20" font-weight="bold" text-anchor="middle">HUMAN MYOCARDIAL ANATOMY</text><text x="400" y="405" fill="%2394a3b8" font-family="system-ui" font-size="14" text-anchor="middle">Veo 3.1 Medical Motion Preset · 16:9 Landscape</text></svg>`
  },
  {
    id: 'sample-cells',
    title: 'Microscopic Blood Stream',
    category: 'Hematology',
    description: 'Erythrocytes and leukocyte circulation in vascular lumen',
    prompt: 'Animate red blood cells and leukocytes floating through microvascular capillary lumen with smooth cinematic depth of field',
    aspectRatio: '16:9' as VideoAspectRatio,
    previewSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="%23090d16"><rect width="800" height="450" fill="%23090d16"/><circle cx="280" cy="200" r="55" fill="%23ef4444" opacity="0.9"/><circle cx="480" cy="180" r="70" fill="%23dc2626" opacity="0.85"/><circle cx="360" cy="280" r="45" fill="%23b91c1c" opacity="0.95"/><circle cx="600" cy="260" r="40" fill="%23f87171" opacity="0.75"/><circle cx="200" cy="300" r="35" fill="%23ef4444" opacity="0.8"/><text x="400" y="390" fill="%23ffffff" font-family="system-ui" font-size="20" font-weight="bold" text-anchor="middle">ERYTHROCYTE FLOW TELEMETRY</text><text x="400" y="415" fill="%2394a3b8" font-family="system-ui" font-size="14" text-anchor="middle">High-Resolution Vascular Dynamics</text></svg>`
  },
  {
    id: 'sample-spine',
    title: 'Orthopedic Spine Posture',
    category: 'Biomechanics',
    description: 'Vertebral column articulation and postural alignment',
    prompt: 'Animate this spine anatomical model rotating slowly 360 degrees to showcase cervical and lumbar curvature in 9:16 portrait',
    aspectRatio: '9:16' as VideoAspectRatio,
    previewSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="800" viewBox="0 0 450 800" fill="%230f172a"><rect width="450" height="800" fill="%230f172a"/><g fill="%230d9488" opacity="0.9"><rect x="200" y="160" width="50" height="24" rx="6"/><rect x="195" y="200" width="60" height="26" rx="6"/><rect x="190" y="240" width="70" height="28" rx="6"/><rect x="185" y="280" width="80" height="30" rx="6"/><rect x="180" y="325" width="90" height="32" rx="6"/><rect x="175" y="375" width="100" height="34" rx="6"/><rect x="170" y="430" width="110" height="36" rx="6"/><rect x="175" y="485" width="100" height="36" rx="6"/><rect x="180" y="540" width="90" height="36" rx="6"/></g><text x="225" y="650" fill="%23ffffff" font-family="system-ui" font-size="18" font-weight="bold" text-anchor="middle">VERTEBRAL ALIGNMENT</text><text x="225" y="680" fill="%2394a3b8" font-family="system-ui" font-size="13" text-anchor="middle">Portrait 9:16 Mobility Sequence</text></svg>`
  },
  {
    id: 'sample-neuron',
    title: 'Neural Synapse Network',
    category: 'Neurology',
    description: 'Action potential and neurotransmitter release',
    prompt: 'Animate neurochemical action potential impulses pulsing along dendrites with electric teal illumination in 16:9',
    aspectRatio: '16:9' as VideoAspectRatio,
    previewSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="%23080e1a"><rect width="800" height="450" fill="%23080e1a"/><line x1="200" y1="225" x2="600" y2="225" stroke="%230d9488" stroke-width="4"/><circle cx="400" cy="225" r="45" fill="%2314b8a6"/><circle cx="200" cy="225" r="25" fill="%230284c7"/><circle cx="600" cy="225" r="25" fill="%230284c7"/><text x="400" y="380" fill="%23ffffff" font-family="system-ui" font-size="20" font-weight="bold" text-anchor="middle">SYNAPTIC NEUROTRANSMISSION</text><text x="400" y="405" fill="%2394a3b8" font-family="system-ui" font-size="14" text-anchor="middle">Neural Pathway Action Potential</text></svg>`
  }
];

export const AnimateImageToVideoTab: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(MEDICAL_SAMPLE_PRESETS[0].previewSvg);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/svg+xml');
  const [imageFileName, setImageFileName] = useState<string>('Human_Myocardial_Anatomy.svg');
  const [prompt, setPrompt] = useState<string>(MEDICAL_SAMPLE_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active / Completed Video
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoRecord, setActiveVideoRecord] = useState<GeneratedVideoRecord | null>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [historyList, setHistoryList] = useState<GeneratedVideoRecord[]>(() => veoVideoService.getStoredVideos());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const pollIntervalRef = useRef<any>(null);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Handle local photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WEBP, or SVG).');
      return;
    }

    setErrorMessage(null);
    setImageFileName(file.name);
    setSelectedMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Select a medical sample preset
  const handleSelectPreset = (preset: typeof MEDICAL_SAMPLE_PRESETS[0]) => {
    setSelectedImage(preset.previewSvg);
    setSelectedMimeType('image/svg+xml');
    setImageFileName(`${preset.title.replace(/\s+/g, '_')}.svg`);
    setPrompt(preset.prompt);
    setAspectRatio(preset.aspectRatio);
    setErrorMessage(null);
  };

  // Start Veo Video Generation
  const handleGenerateVideo = async () => {
    if (!selectedImage) {
      setErrorMessage('Please upload or select an image to animate.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationPhase('Submitting image asset to Google Veo (veo-3.1-fast-generate-preview)...');

    try {
      // 1. Start generation operation
      const startResult = await veoVideoService.startVideoGeneration({
        imageBase64: selectedImage,
        mimeType: selectedMimeType,
        prompt: prompt.trim() || 'Animate this clinical image with smooth, high-fidelity cinematic motion',
        aspectRatio
      });

      const opName = startResult.operationName;
      setOperationName(opName);
      setGenerationProgress(20);
      setGenerationPhase('Veo neural diffusion synthesizing motion vectors and optical flow...');

      let attempts = 0;
      const maxAttempts = 30; // 30 * 3s = 90 seconds max

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      // 2. Poll operation status
      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        const pct = Math.min(92, 20 + Math.round((attempts / 15) * 70));
        setGenerationProgress(pct);

        if (attempts === 3) {
          setGenerationPhase(`Rendering 720p frames in ${aspectRatio} (${aspectRatio === '16:9' ? 'Landscape' : 'Portrait'})...`);
        } else if (attempts === 6) {
          setGenerationPhase('Interpolating temporal fluidity and depth geometry...');
        } else if (attempts === 9) {
          setGenerationPhase('Encoding high-bitrate H.264 MP4 video stream...');
        }

        try {
          const status = await veoVideoService.pollVideoStatus(opName);

          if (status.done) {
            clearInterval(pollIntervalRef.current);
            setGenerationProgress(98);
            setGenerationPhase('Downloading completed MP4 video...');

            // 3. Download video blob
            const blob = await veoVideoService.downloadVideoBlob(opName);
            const videoObjectUrl = URL.createObjectURL(blob);

            const newRecord: GeneratedVideoRecord = {
              id: `veo-vid-${Date.now()}`,
              operationName: opName,
              sourceImage: selectedImage,
              prompt: prompt || 'Animate image',
              aspectRatio,
              videoBlobUrl: videoObjectUrl,
              status: 'completed',
              createdAt: new Date().toISOString(),
              model: 'veo-3.1-fast-generate-preview'
            };

            veoVideoService.saveVideoRecord(newRecord);
            setActiveVideoUrl(videoObjectUrl);
            setActiveVideoRecord(newRecord);
            setHistoryList(prev => [newRecord, ...prev]);

            setIsGenerating(false);
            setGenerationProgress(100);
            setGenerationPhase('Complete!');
          } else if (status.error) {
            clearInterval(pollIntervalRef.current);
            throw new Error(status.error.message || 'Veo video generation operation reported an error.');
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollIntervalRef.current);
            throw new Error('Video generation timed out. Please try again.');
          }
        } catch (pollErr: any) {
          clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          setErrorMessage(pollErr.message || 'Error occurred while checking video rendering status.');
        }
      }, 3000);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || 'Failed to start Veo video generation. Please check your image or prompt.');
    }
  };

  // Download active video file
  const handleDownloadActiveVideo = () => {
    if (!activeVideoUrl) return;
    const a = document.createElement('a');
    a.href = activeVideoUrl;
    a.download = `Veo_Medical_${aspectRatio === '16:9' ? 'Landscape' : 'Portrait'}_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Medical Motion Studio */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 tracking-wide uppercase mb-3 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Veo Video Generation</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">veo-3.1-fast-generate-preview</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-medium">16:9 Landscape &amp; 9:16 Portrait</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Animate Medical Images into Video
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Transform anatomical diagrams, diagnostic scans, pathology slides, or medical photos into dynamic, high-definition video simulations powered by Google Veo.
          </p>
        </div>
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Studio Grid: Left = Input & Controls, Right = Video Player & Render View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Motion Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Photo Input & Upload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Starting Photo</h3>
                  <p className="text-xs text-slate-500">Provide the base image frame to animate with Veo</p>
                </div>
              </div>

              {selectedImage && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Replace Photo</span>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload Area / Selected Image Preview */}
            {selectedImage ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[300px]">
                <img
                  src={selectedImage}
                  alt="Starting Frame"
                  className="w-full h-full object-contain max-h-[280px]"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-2xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Different Photo</span>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
                  {imageFileName}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-8 text-center transition-all cursor-pointer space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  Click or drag and drop your photo here
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Supports JPEG, PNG, WEBP, or SVG. Clinical scans, diagrams, or patient pathology images.
                </p>
              </div>
            )}

            {/* Medical Presets Selector */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Or select a clinical demonstration preset:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MEDICAL_SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/40 hover:border-teal-300 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {preset.category} · {preset.aspectRatio}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Aspect Ratio & Motion Prompt Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Veo Generation Parameters</h3>
                <p className="text-xs text-slate-500">Configure video aspect ratio and animation directions</p>
              </div>
            </div>

            {/* Required Aspect Ratio Selector: 16:9 vs 9:16 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Aspect Ratio (Required):</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {aspectRatio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    aspectRatio === '16:9'
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold ring-2 ring-teal-600/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <div className="w-9 h-6 border-2 border-current rounded flex items-center justify-center shrink-0">
                    <Monitor className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">16:9 Landscape</div>
                    <div className="text-[10px] opacity-75">Widescreen Monitor / Tablet</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold ring-2 ring-teal-600/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <div className="w-6 h-9 border-2 border-current rounded flex items-center justify-center shrink-0">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">9:16 Portrait</div>
                    <div className="text-[10px] opacity-75">Vertical Mobile / Social</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Motion Prompt Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Motion Direction Prompt:
                </label>
                <span className="text-[11px] text-slate-400">
                  {prompt.length}/300 characters
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Describe how the image should animate (e.g., rhythmic heartbeat, smooth 3D camera pan, fluid flow)..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden resize-none bg-slate-50/50"
              />

              {/* Quick Prompt Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Smooth 3D orbit around subject',
                  'Simulate arterial pulse and contraction',
                  'Cinematic slow zoom with depth of field',
                  'Fluid microscopic flow through lumen'
                ].map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(sugg)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-800 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* Model & Spec Badge */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-teal-600" />
                <span>Model: <strong className="text-slate-900 font-mono">veo-3.1-fast-generate-preview</strong></span>
              </div>
              <span className="font-semibold text-slate-700">720p HD · H.264 MP4</span>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={isGenerating || !selectedImage}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Veo Generating Video ({generationProgress}%)...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Generate Video with Veo (veo-3.1-fast-generate-preview)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Video Player & Output Display (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Generated Video Canvas</h3>
              </div>

              {activeVideoUrl && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      isLooping ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                    title="Toggle continuous looping"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Loop</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadActiveVideo}
                    className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Download MP4 video"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video Canvas Container */}
            {isGenerating ? (
              <div className="rounded-2xl border border-teal-200 bg-slate-950 p-6 text-center text-white space-y-4 min-h-[320px] flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin flex items-center justify-center">
                    <Video className="w-6 h-6 text-teal-400" />
                  </div>
                </div>

                <div className="space-y-1 max-w-xs">
                  <div className="text-sm font-bold text-white">
                    Google Veo Neural Rendering
                  </div>
                  <p className="text-xs text-teal-200/80 leading-relaxed">
                    {generationPhase}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs space-y-1">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{aspectRatio === '16:9' ? '16:9 Landscape' : '9:16 Portrait'}</span>
                    <span>{generationProgress}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 max-w-xs">
                  Video synthesis typically takes 10–25 seconds. Please hold on while frames are generated.
                </div>
              </div>
            ) : activeVideoUrl ? (
              <div className="space-y-3">
                {/* Video Player */}
                <div className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center ${
                  aspectRatio === '9:16' ? 'aspect-9/16 max-w-[280px] mx-auto' : 'aspect-video w-full'
                }`}>
                  <video
                    ref={videoPlayerRef}
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    loop={isLooping}
                    playsInline
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-bold text-teal-300">
                    Veo 3.1 · {aspectRatio}
                  </div>
                </div>

                {/* Active Video Info Sheet */}
                {activeVideoRecord && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Render Model:</span>
                      <strong className="text-slate-800 font-mono text-[11px]">veo-3.1-fast-generate-preview</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Aspect Ratio:</span>
                      <strong className="text-slate-800">{activeVideoRecord.aspectRatio}</strong>
                    </div>
                    <div className="text-slate-600 pt-1 border-t border-slate-200">
                      <strong>Prompt:</strong> "{activeVideoRecord.prompt}"
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-3 min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Film className="w-6 h-6" />
                </div>
                <div className="text-slate-800 font-bold text-sm">
                  No Video Rendered Yet
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  Upload an image on the left, select 16:9 or 9:16 aspect ratio, and click "Generate Video with Veo".
                </p>
              </div>
            )}
          </div>

          {/* History Shelf */}
          {historyList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Generated Video Library ({historyList.length})</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {historyList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.sourceImage ? (
                          <img src={item.sourceImage} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-4 h-4 text-teal-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {item.prompt || 'Veo Animated Video'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.aspectRatio} · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (item.videoBlobUrl) {
                          setActiveVideoUrl(item.videoBlobUrl);
                          setActiveVideoRecord(item);
                          setAspectRatio(item.aspectRatio);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
