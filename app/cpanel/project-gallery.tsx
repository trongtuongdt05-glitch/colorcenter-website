'use client';

import { useState } from 'react';
import { projectPhotoLimit } from '../../lib/colorcenter';

export async function uploadPhoto(file: File) {
  if (file.size > 4 * 1024 * 1024) throw new Error('Ảnh vượt quá 4 MB.');
  const body = new FormData();
  body.append('image', file);
  const response = await fetch('/api/admin-media', {method:'POST', body});
  const result = await response.json().catch(() => ({})) as {error?:string; url?:string};
  if (!response.ok || !result.url) throw new Error(result.error || 'Tải ảnh chưa thành công.');
  return result.url;
}

export function ProjectGallery({images, change, setUploading}: {images:string[]; change:(images:string[])=>void; setUploading:(busy:boolean)=>void}) {
  const [message,setMessage] = useState('');
  return <div className="project-gallery-editor">
    <label>Thư viện ảnh · {images.length}/{projectPhotoLimit}
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={images.length >= projectPhotoLimit} onChange={async event => {
        const input = event.currentTarget;
        const files = Array.from(input.files ?? []);
        input.value = '';
        if (!files.length) return;
        const selected = files.slice(0, projectPhotoLimit - images.length);
        const uploaded: string[] = [];
        const failed: string[] = [];
        setUploading(true);
        try {
          for (const [index,file] of selected.entries()) {
            setMessage(`Đang tải ảnh ${index + 1}/${selected.length}…`);
            try { uploaded.push(await uploadPhoto(file)); }
            catch (error) { failed.push(`${file.name} (${error instanceof Error ? error.message : 'Không tải được'})`); }
          }
          if (uploaded.length) change([...images,...uploaded]);
          setMessage([
            uploaded.length ? `Đã tải ${uploaded.length} ảnh. Bấm Lưu thay đổi.` : '',
            files.length > selected.length ? 'Một số ảnh vượt giới hạn số lượng.' : '',
            failed.length ? 'Chưa tải được: ' + failed.join(', ') : '',
          ].filter(Boolean).join(' '));
        } finally {
          setUploading(false);
        }
      }}/>
    </label>
    <p className="form-note">Có thể chọn nhiều ảnh cùng lúc. JPG, PNG hoặc WebP, tối đa 4 MB mỗi ảnh.</p>
    <div className="gallery-edit-grid">{images.map((image,index)=><div key={image + index}>
      <img src={image} alt={`Ảnh thư viện ${index + 1}`}/>
      <button type="button" className="plain" onClick={()=>change(images.filter((_,i)=>i!==index))}>Gỡ ảnh {index + 1}</button>
    </div>)}</div>
    <p role="status">{message}</p>
  </div>;
}
