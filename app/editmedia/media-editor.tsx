'use client';

import { useEffect, useRef, useState } from 'react';
import { compose, height, loadImage, renderVideo, width } from './composition';

import { ImageBatch } from './image-batch';

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
  const [lang,setLang] = useState<'vi'|'en'>('vi');
  const [mode,setMode] = useState<'video'|'image'>('video');
  return <div lang={lang}>
    <div className="media-toolbar">
      <div className="filters" role="group" aria-label={lang === 'vi' ? 'Loại tệp' : 'Media type'}>
        <button className="pill" type="button" aria-pressed={mode==='video'} onClick={()=>setMode('video')}>Video</button>
        <button className="pill" type="button" aria-pressed={mode==='image'} onClick={()=>setMode('image')}>{lang==='vi' ? 'Ảnh' : 'Images'}</button>
      </div>
      <div className="filters" role="group" aria-label="Language">
        <button className="pill" type="button" lang="vi" aria-pressed={lang==='vi'} onClick={()=>setLang('vi')}>Tiếng Việt</button>
        <button className="pill" type="button" lang="en" aria-pressed={lang==='en'} onClick={()=>setLang('en')}>English</button>
      </div>
    </div>
    <div hidden={mode !== 'video'}><VideoEditor logo={logo} frame={frame} lang={lang}/></div>
    <div hidden={mode !== 'image'}><ImageBatch logo={logo} lang={lang}/></div>
  </div>;
}

function VideoEditor({logo,frame,lang}: {logo:string;frame:string;lang:'vi'|'en'}) {
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
    if (!source || !logo || !frame) return;
    let cancelled = false;
    const url = URL.createObjectURL(source);
    Promise.all([
      openVideo(url),
      loadImage(logo),
      loadImage(frame),
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
  }, [source,logo,frame]);

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
      const blob = await (async () => {
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
      const extension = blob.type.startsWith('video/mp4') ? 'mp4' : 'webm';
      setResult({url:URL.createObjectURL(blob),filename:source.name.replace(/\.[^.]+$/, '') + '-colorcenter.' + extension});
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Chưa xuất được tệp.');
    } finally {
      if (audio) await audio.close().catch(() => {});
      job.current = null;
      setProgress(undefined);
    }
  }

  const available = Boolean(logo && frame);
  const busy = progress !== undefined;
  const en = lang === 'en';
  const preview = en ? '9:16 preview' : 'Bản xem trước 9:16';
  return <div className="media-grid">
    <section className="media-panel" aria-label={en ? 'Video editor' : 'Trình chỉnh video'}>
      <p>{en ? 'Add a logo and frame to a vertical 9:16 video. Processing happens in your browser.' : 'Ghép logo và khung vào video dọc 9:16. Tệp nguồn xử lý ngay trong trình duyệt.'}</p>
      {!available && <p role="status"><a href="/cpanel">{en ? 'Upload the logo and frame in CPanel → Edit Media.' : 'Tải logo và khung video trong CPanel → Edit Media.'}</a></p>}
      <label>{en ? 'Choose source video' : 'Chọn video nguồn'}
        <input type="file" accept="video/*" disabled={!available || busy} onChange={event => { reset();setSource(event.currentTarget.files?.[0]); }}/>
      </label>
      {busy && <><label>{en ? 'Exporting' : 'Đang xuất'} {progress}%<progress max="100" value={progress}/></label>
        <p>{en ? 'Keep this tab in the foreground until the export finishes.' : 'Giữ tab này ở phía trước cho đến khi xuất xong.'}</p>
        <button type="button" className="plain" onClick={() => job.current?.abort()}>{en ? 'Cancel export' : 'Dừng xuất'}</button>
      </>}
      {error && <p role="alert">{en ? 'Video processing did not complete. Try a supported MP4 file.' : error}</p>}
      <div className="actions">
        <button type="button" className="button" disabled={!ready || busy} onClick={exportMedia}>{en ? 'Export video' : 'Xuất video'}</button>
        {result && <a className="button outline" href={result.url} download={result.filename}>{en ? 'Download video' : 'Tải kết quả'}</a>}
      </div>
    </section>
    <figure className="media-preview">
      <canvas ref={canvas} width={width} height={height} aria-label={preview}/>
      {!ready && <figcaption>{preview}</figcaption>}
    </figure>
  </div>;
}
