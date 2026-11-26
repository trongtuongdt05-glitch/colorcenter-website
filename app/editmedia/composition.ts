export const width = 1080;
export const height = 1920;

export async function loadImage(url: string) {
  const image = new Image();
  if (/^https?:/i.test(url) && new URL(url).origin !== window.location.origin)
    image.crossOrigin = 'anonymous';
  image.src = url;
  await image.decode();
  return image;
}

export function compose(canvas: HTMLCanvasElement, source: HTMLVideoElement | HTMLImageElement, logo: HTMLImageElement, frame?: HTMLImageElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không hỗ trợ dựng hình.');
  const [sourceWidth, sourceHeight] = source instanceof HTMLVideoElement
    ? [source.videoWidth, source.videoHeight] : [source.naturalWidth, source.naturalHeight];
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  context.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
  if (frame) context.drawImage(frame, 0, 0, width, height);
  const logoScale = Math.min(215 / logo.naturalWidth, 135 / logo.naturalHeight);
  const logoWidth = logo.naturalWidth * logoScale;
  const logoHeight = logo.naturalHeight * logoScale;
  context.drawImage(logo, width - logoWidth - 46, 54, logoWidth, logoHeight);
}

export async function renderVideo(
  canvas: HTMLCanvasElement, video: HTMLVideoElement, paint: () => void,
  progress: (percent: number) => void, signal: AbortSignal, audio: AudioContext,
) {
  if (typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function')
    throw new Error('Hãy dùng Chrome hoặc Edge để xuất video.');
  const mimeType = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    .find(type => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error('Trình duyệt chưa hỗ trợ định dạng xuất video.');

  let stream: MediaStream | undefined;
  let recorder: MediaRecorder | undefined;
  let animation = 0;
  try {
    // The playback element is recreated for each export so each Web Audio source is unique.
    const audioSource = audio.createMediaElementSource(video);
    const destination = audio.createMediaStreamDestination();
    audioSource.connect(destination);
    signal.throwIfAborted();
    paint();
    stream = canvas.captureStream(30);
    destination.stream.getAudioTracks().forEach(track => stream?.addTrack(track));
    recorder = new MediaRecorder(stream, {mimeType, videoBitsPerSecond: 8_000_000});
    const activeRecorder = recorder;
    return await new Promise<Blob>((resolve, reject) => {
      const chunks: Blob[] = [];
      const fail = () => reject(new Error('Xuất video chưa hoàn tất.'));
      const abort = () => reject(new DOMException('Đã dừng xuất video.', 'AbortError'));
      const finish = () => {
        if (activeRecorder.state !== 'inactive') activeRecorder.stop();
      };
      const tick = () => {
        try {
          paint();
          progress(Math.min(99, Math.floor(video.currentTime / video.duration * 100)));
          if (!video.ended) animation = requestAnimationFrame(tick);
        } catch (error) { reject(error); }
      };
      activeRecorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      activeRecorder.onerror = fail;
      activeRecorder.onstop = () => {
        signal.removeEventListener('abort', abort);
        const blob = new Blob(chunks, {type: activeRecorder.mimeType});
        if (blob.size) resolve(blob);
        else fail();
      };
      video.onended = () => {
        try { paint(); finish(); }
        catch (error) { reject(error); }
      };
      video.onerror = fail;
      signal.addEventListener('abort', abort, {once:true});
      activeRecorder.start(1000);
      video.play().then(tick, reject);
    });
  } finally {
    cancelAnimationFrame(animation);
    video.pause();
    video.onended = null;
    video.onerror = null;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    stream?.getTracks().forEach(track => track.stop());
  }
}
