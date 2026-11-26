'use client';

import { useEffect, useRef, useState } from 'react';
import { compose, height, loadImage, renderVideo, width } from './composition';

type Mode = 'video' | 'image';

function openVideo(url: string) {
  const video = document.createElement('video');
  video.playsInline = true;
  video.preload = 'auto';
  return new Promise<HTMLVideoElement>((resolve,reject) => {
    video.onloadeddata = () => {
      video.onloadeddata = null;
      video.onerror = null;
      if (!Number.isFinite(video.duration) || video.duration <= 0) reject(new Error('Không đọc được thời lượng video.'));
      else resolve(video);
    };
    video.onerror = () => reject(new Error('Không mở được video. Hãy thử file MP4 tương thích với trình duyệt.'));
    video.src = url;
  });
}

export function MediaEditor({logo,frame}: {logo:string; frame:string}) {
  const [mode,setMode] = useState<Mode>('video');
  const [source,setSource] = useState<File>();
  const [ready,setReady] = useState(false);
  const [error,setError] = useState('');
  const [progress,setProgress] = useState<number>();
  const [result,setResult] = useState<{url:string; filename:string}>();
  const canvas = useRef<HTMLCanvasElement>(null);
  const job = useRef<AbortController | null>(null);
  const prepared = useRef<{url:string; logo:HTMLImageElement; frame?:HTMLImageElement} | null>(null);

  useEffect(() => () => job.current?.abort(), []);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  useEffect(() => {
    if (!source || !logo || (mode === 'video' && !frame)) return;
    let cancelled = false;
    const url = URL.createObjectURL(source);
    Promise.all([
      mode === 'video' ? openVideo(url) : loadImage(url),
      loadImage(logo),
      mode === 'video' ? loadImage(frame) : Promise.resolve(undefined),
    ]).then(([media,logoImage,frameImage]) => {
      if (cancelled || !canvas.current) return;
      compose(canvas.current,media,logoImage,frameImage);
      prepared.current = {url,logo:logoImage,frame:frameImage};
      setReady(true);
    }).catch(reason => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Không đọc được tệp.');
    });
    return () => {
      cancelled = true;
      prepared.current = null;
      URL.revokeObjectURL(url);
    };
  }, [source,mode,logo,frame]);

  function reset() {
    const output = canvas.current;
    output?.getContext('2d')?.clearRect(0,0,width,height);
    setReady(false);
    setError('');
    setResult(undefined);
  }

  async function exportMedia() {
    const output = canvas.current;
    const assets = prepared.current;
    if (!ready || !output || !assets || !source || job.current) return;
    setError('');
    setResult(undefined);
    const controller = new AbortController();
    job.current = controller;
    setProgress(0);
    let audio: AudioContext | undefined;
    try {
      const blob = mode === 'image'
        ? await new Promise<Blob>((resolve,reject) => output.toBlob(value => value ? resolve(value) : reject(new Error('Không xuất được ảnh.')), 'image/png'))
        : await (async () => {
          audio = new AudioContext();
          await audio.resume();
          controller.signal.throwIfAborted();
          const video = await openVideo(assets.url);
          try {
            return await renderVideo(output,video,() => compose(output,video,assets.logo,assets.frame),setProgress,controller.signal,audio);
          } finally {
            video.removeAttribute('src');
            video.load();
          }
        })();
      controller.signal.throwIfAborted();
      const extension = mode === 'image' ? 'png' : blob.type.startsWith('video/mp4') ? 'mp4' : 'webm';
      setResult({url:URL.createObjectURL(blob),filename:source.name.replace(/\.[^.]+$/, '') + '-colorcenter.' + extension});
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chưa xuất được tệp.');
    } finally {
      if (audio) await audio.close().catch(() => {});
      job.current = null;
      setProgress(undefined);
    }
  }

  const available = Boolean(logo && (mode === 'image' || frame));
  const busy = progress !== undefined;
  return <div className="media-grid">
    <section className="media-panel" aria-label="Tạo ảnh hoặc video">
      <div className="filters" aria-label="Loại tệp">
        <button className="pill" type="button" disabled={busy} aria-pressed={mode==='video'} onClick={() => { if (mode !== 'video') { reset();setSource(undefined);setMode('video'); } }}>Video</button>
        <button className="pill" type="button" disabled={busy} aria-pressed={mode==='image'} onClick={() => { if (mode !== 'image') { reset();setSource(undefined);setMode('image'); } }}>Ảnh</button>
      </div>
      <p>{mode === 'video' ? 'Ghép logo và khung vào video dọc 9:16.' : 'Đóng logo lên ảnh dọc 9:16.'} Tệp nguồn xử lý ngay trong trình duyệt.</p>
      {!available && <p role="status">Hãy tải {mode === 'video' ? 'logo và khung video' : 'logo'} trong <a href="/cpanel">CPanel → Edit Media</a> rồi mở lại trang này.</p>}
      <label>{mode === 'video' ? 'Chọn video nguồn' : 'Chọn ảnh nguồn'}
        <input type="file" key={mode} accept={mode === 'video' ? 'video/*' : 'image/*'} disabled={!available || busy} onChange={event => { reset();setSource(event.currentTarget.files?.[0]); }}/>
      </label>
      {busy && <><label>Đang xuất {progress}%<progress max="100" value={progress}/></label>
        {mode === 'video' && <p>Giữ tab này mở và ở phía trước cho đến khi hoàn tất.</p>}
        <button type="button" className="plain" onClick={() => job.current?.abort()}>Dừng xuất</button>
      </>}
      {error && <p role="alert">{error}</p>}
      <div className="actions">
        <button type="button" className="button" disabled={!ready || busy} onClick={exportMedia}>{mode === 'video' ? 'Xuất video' : 'Xuất ảnh PNG'}</button>
        {result && <a className="button outline" href={result.url} download={result.filename}>Tải kết quả</a>}
      </div>
    </section>
    <figure className="media-preview">
      <canvas ref={canvas} width={width} height={height} aria-label="Bản xem trước 9:16"/>
      {!ready && <figcaption>Bản xem trước 9:16</figcaption>}
    </figure>
  </div>;
}
