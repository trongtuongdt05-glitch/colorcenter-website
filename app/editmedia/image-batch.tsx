'use client';

import { useEffect, useState } from 'react';
import { loadImage } from './composition';

type Output = {name:string; url?:string; dimensions?:string};

export function ImageBatch({logo,lang}: {logo:string;lang:'vi'|'en'}) {
  const en = lang === 'en';
  const [files,setFiles] = useState<File[]>([]);
  const [outputs,setOutputs] = useState<Output[]>([]);
  const [progress,setProgress] = useState<number>();
  const [logoError,setLogoError] = useState(false);

  useEffect(() => {
    if (!files.length || !logo) return;
    let stopped = false;
    const urls: string[] = [];
    const canvas = document.createElement('canvas');
    async function run() {
      try {
        const mark = await loadImage(logo);
        for (const [index,file] of files.entries()) {
          if (stopped) break;
          const input = URL.createObjectURL(file);
          const name = file.name.replace(/\.[^.]+$/, '') + '-colorcenter.png';
          const result: Output = {name};
          try {
            const image = await loadImage(input);
            if (stopped) break;
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas unavailable');
            context.drawImage(image,0,0);
            const unit = Math.min(canvas.width,canvas.height);
            const scale = Math.min(unit * .2 / mark.naturalWidth, unit * .125 / mark.naturalHeight);
            const w = mark.naturalWidth * scale;
            const h = mark.naturalHeight * scale;
            const inset = unit * .045;
            context.drawImage(mark,canvas.width - w - inset,inset,w,h);
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve,'image/png'));
            if (blob && !stopped) {
              result.url = URL.createObjectURL(blob);
              urls.push(result.url);
              result.dimensions = `${canvas.width} × ${canvas.height}`;
            }
          } catch { /* A failed file is shown alongside successful files. */ }
          finally { URL.revokeObjectURL(input); }
          if (!stopped) {
            setOutputs(previous => [...previous,result]);
            setProgress(index + 1);
          }
        }
      } catch { if (!stopped) setLogoError(true); }
      finally { canvas.width = canvas.height = 0; if (!stopped) setProgress(undefined); }
    }
    void run();
    return () => { stopped = true; urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [files,logo]);

  return <div className="media-panel">
    <p>{en ? 'Add the logo to multiple images while keeping each original size and aspect ratio.' : 'Ghép logo cho nhiều ảnh, giữ nguyên kích thước và tỷ lệ của từng ảnh.'}</p>
    {!logo && <p><a href="/cpanel">{en ? 'Upload a logo in CPanel → Edit Media.' : 'Tải logo trong CPanel → Edit Media.'}</a></p>}
    <label>{en ? 'Choose source images' : 'Chọn ảnh nguồn'}
      <input type="file" multiple accept="image/*" disabled={!logo} onChange={event => {
        const chosen = Array.from(event.currentTarget.files ?? []);
        event.currentTarget.value = '';
        if (!chosen.length) return;
        setOutputs([]); setLogoError(false); setProgress(0); setFiles(chosen);
      }}/>
    </label>
    {progress !== undefined && <p role="status">{en ? 'Processing' : 'Đang xử lý'} {progress}/{files.length}</p>}
    {logoError && <p role="alert">{en ? 'Could not load the logo.' : 'Không tải được logo.'}</p>}
    <div className="media-image-results">
      {outputs.map(({name,url,dimensions},index) => <figure key={index}>
        {url && <img src={url} alt={name} loading="lazy"/>}
        <figcaption>
          <strong>{name}</strong>
          {url ? <><span>{dimensions} px</span><a className="button compact" href={url} download={name}>{en ? 'Download PNG' : 'Tải PNG'}</a></> :
            <span>{en ? 'Could not process this image.' : 'Không xử lý được ảnh này.'}</span>}
        </figcaption>
      </figure>)}
    </div>
  </div>;
}
