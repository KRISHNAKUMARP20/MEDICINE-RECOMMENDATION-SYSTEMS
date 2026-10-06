export type VideoAspectRatio = '16:9' | '9:16';

export interface GeneratedVideoRecord {
  id: string;
  operationName: string;
  sourceImage: string;
  prompt: string;
  aspectRatio: VideoAspectRatio;
  videoBlobUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  model: string;
  errorMessage?: string;
}

const STORAGE_KEY = 'medassist_veo_generated_videos_v1';

class VeoVideoService {
  public getStoredVideos(): GeneratedVideoRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load stored video records', e);
    }
    return [];
  }

  public saveVideoRecord(record: GeneratedVideoRecord): void {
    try {
      const existing = this.getStoredVideos().filter(v => v.id !== record.id);
      // Store record without blob url because blob urls are session-bound
      const toSave = { ...record, videoBlobUrl: undefined };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([toSave, ...existing].slice(0, 10)));
    } catch (e) {
      console.error('Failed to save video record', e);
    }
  }

  public async startVideoGeneration(params: {
    imageBase64: string;
    mimeType?: string;
    prompt?: string;
    aspectRatio: VideoAspectRatio;
  }): Promise<{ operationName: string; model: string }> {
    const res = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base64Image: params.imageBase64,
        mimeType: params.mimeType,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server returned HTTP ${res.status}`);
    }

    return await res.json();
  }

  public async pollVideoStatus(operationName: string): Promise<{ done: boolean; error?: any; model?: string }> {
    const res = await fetch('/api/video-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ operationName })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Polling returned HTTP ${res.status}`);
    }

    return await res.json();
  }

  public async downloadVideoBlob(operationName: string): Promise<Blob> {
    const res = await fetch('/api/video-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ operationName })
    });

    if (!res.ok) {
      throw new Error(`Video download returned HTTP ${res.status}`);
    }

    return await res.blob();
  }
}

export const veoVideoService = new VeoVideoService();
