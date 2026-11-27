'use client';

import { useState } from 'react';
import { AdminBar } from '../_components/admin-bar';
import { ProjectGallery, uploadPhoto } from './project-gallery';
import { projectLimit, sampleProjects, statuses, type Card, type SiteContent } from '../../lib/colorcenter';

type Lead = {id:string; name:string; phone:string; service:string; message:string; created:number; status:string};
const tabs = ['Trang chủ', 'Dịch vụ', 'Dự án', 'Liên hệ', 'Edit Media', 'Email nhận lead', 'Yêu cầu báo giá'] as const;
type Tab = typeof tabs[number];

function PhotoField({label,value,change,setUploading}: {label:string; value:string; change:(value:string)=>void; setUploading?:(busy:boolean)=>void}) {
  const [state,setState] = useState('');
  const [busy,setBusy] = useState(false);
  return <div className="editor-image"><label>{label}<input value={value} placeholder="Dán đường dẫn ảnh hoặc tải ảnh lên" onChange={event=>change(event.target.value)}/></label>
    {value && (/^https:\/\//i.test(value) || /^\/(?:media|api\/media)\//.test(value)) && <img src={value} alt="Ảnh xem trước"/>}
    <label className="file-label">Tải ảnh (JPG, PNG, WebP, tối đa 4 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event=>{
      const input = event.currentTarget;
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      setUploading?.(true);
      setState('Đang tải ảnh…');
      try {
        change(await uploadPhoto(file));
        setState('Đã tải ảnh. Bấm Lưu thay đổi để đăng ảnh lên trang.');
      } catch (error) {
        setState(error instanceof Error ? error.message : 'Tải ảnh chưa thành công.');
      } finally {
        setBusy(false);
        setUploading?.(false);
        input.value = '';
      }
    }}/></label><span role="status">{state}</span></div>;
}

type EditableCard = Card & {category?:string; images?:string[]};

function Cards({items, update, projects, uploading = false, setUploading}: {
  items: EditableCard[]; update:(items:EditableCard[])=>void; projects:boolean;
  uploading?:boolean; setUploading?:(busy:boolean)=>void;
}) {
  const kind = projects ? 'dự án' : 'dịch vụ';
  const change = (i:number, patch:Partial<EditableCard>) => update(items.map((item,index)=>index===i?{...item,...patch}:item));
  const missingSamples = sampleProjects.filter(sample => !items.some(item => item.title === sample.title));
  return <div className="editor-cards">
    {items.map((item,i)=><fieldset key={i} disabled={uploading}><legend>{item.title || (projects ? 'Dự án mới' : 'Dịch vụ mới')}</legend>
      <label>Tên<input maxLength={140} value={item.title} onChange={e=>change(i,{title:e.target.value})}/></label>
      {projects && <label>Nhóm dự án<input maxLength={140} value={item.category ?? ''} onChange={e=>change(i,{category:e.target.value})}/></label>}
      <label>Mô tả<textarea rows={3} value={item.description} maxLength={1600} onChange={e=>change(i,{description:e.target.value})}/></label>
      <PhotoField setUploading={setUploading} label={projects ? 'Ảnh đại diện' : 'Ảnh minh họa'} value={item.image} change={image=>change(i,{image})}/>
      {projects && setUploading && <ProjectGallery images={item.images ?? []} change={images=>change(i,{images})} setUploading={setUploading}/>}
      <div className="editor-actions"><label className="checkbox"><input type="checkbox" checked={item.visible} onChange={e=>change(i,{visible:e.target.checked})}/> Hiển thị trên trang công ty</label>
      <button className="plain" type="button" onClick={()=>{if (window.confirm(`Gỡ ${kind} này khỏi danh sách?`)) update(items.filter((_,index)=>index!==i));}}>Gỡ mục</button></div>
    </fieldset>)}
    <button className="plain" type="button" disabled={uploading || items.length >= (projects ? projectLimit : 32)} onClick={()=>update([...items,{title:'',description:'',image:'',visible:true,...(projects ? {category:''} : {})}])}>Thêm {kind}</button>
    {projects && missingSamples.length > 0 && <button className="plain" type="button" disabled={uploading || items.length + missingSamples.length > projectLimit} onClick={()=>update([...items,...missingSamples])}>Thêm dự án mẫu</button>}
  </div>;
}

export function Editor({initial,initialRevision,leads,mailConfigured}: {initial:SiteContent; initialRevision:number; leads:Lead[]; mailConfigured:boolean}) {
  const [tab,setTab] = useState<Tab>('Trang chủ');
  const [draft,setDraft] = useState(initial);
  const [savedEmail,setSavedEmail] = useState(initial.leadEmail);
  const [revision,setRevision] = useState(initialRevision);
  const [result,setResult] = useState('');
  const [uploading,setUploading] = useState(false);
  const [saving,setSaving] = useState(false);
  const [records,setRecords] = useState(leads);
  const [leadPending,setLeadPending] = useState('');
  const [leadError,setLeadError] = useState('');
  const patch = <K extends keyof SiteContent>(key:K,value:SiteContent[K])=>setDraft(prev=>({...prev,[key]:value}));
  const field = (key:'name'|'title'|'phone'|'email'|'address'|'zalo',label:string,type='text') => <label>{label}<input value={draft[key]} type={type} onChange={e=>patch(key,e.target.value)}/></label>;

  return <><AdminBar area="cpanel"><nav className="workspace-tabs" aria-label="Mục CPanel">{tabs.map(name=><button key={name} type="button" disabled={uploading} aria-pressed={name===tab} onClick={()=>{if (tab !== name) {setTab(name);window.scrollTo({top:0,behavior:"instant"});}}}>{name}{name==='Yêu cầu báo giá' && ` (${records.filter(r=>r.status==='Mới').length})`}</button>)}</nav></AdminBar>
    <div className="admin-content workspace-content"><section className="admin-panel">
      <div className="panel-head"><h1>{tab}</h1>{tab!=='Yêu cầu báo giá' && <button type="button" className="button" disabled={saving || uploading} onClick={async ()=>{
        setSaving(true);
        setResult('');
        try {
          const response = await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:draft,revision})});
          const body = await response.json().catch(()=>({})) as {error?:string; revision?:number};
          if (!response.ok || typeof body.revision !== "number") throw new Error(body.error || 'Lưu chưa thành công. Vui lòng thử lại.');
          setRevision(body.revision);
          setSavedEmail(draft.leadEmail.trim());
          setResult('Đã lưu thay đổi.');
        } catch(error) {
          setResult(error instanceof Error ? error.message : 'Lưu chưa thành công.');
        } finally {setSaving(false);}
      }}>{saving?'Đang lưu…':'Lưu thay đổi'}</button>}</div>
      <p className="workspace-feedback" role="status">{result}</p>
      {tab==='Trang chủ' && <div className="editor-fields">
        {field('name','Tên hiển thị')}{field('title','Tiêu đề trang chủ')}
        <label>Mô tả dưới tiêu đề<textarea rows={3} value={draft.subtitle} onChange={e=>patch('subtitle',e.target.value)}/></label>
        <label>Giới thiệu công ty<textarea rows={4} value={draft.about} onChange={e=>patch('about',e.target.value)}/></label>
        <label>Màu nhấn<input type="color" value={draft.accent} onChange={e=>patch('accent',e.target.value)}/></label>
        <PhotoField label="Logo" value={draft.logo} change={value=>patch('logo',value)}/>
        <fieldset className="cover-fields">
          <legend>Ảnh bìa trang chủ</legend>
          <p>Ảnh tự chuyển sau mỗi 3 giây. Để trống ô nào thì bỏ qua ảnh đó.</p>
          <PhotoField label="Ảnh bìa 1" value={draft.hero} change={value=>patch('hero',value)}/>
          <PhotoField label="Ảnh bìa 2" value={draft.heroTwo} change={value=>patch('heroTwo',value)}/>
          <PhotoField label="Ảnh bìa 3" value={draft.heroThree} change={value=>patch('heroThree',value)}/>
        </fieldset>
      </div>}
      {tab==='Dịch vụ' && <Cards key="services" items={draft.services} update={items=>patch('services',items)} projects={false}/>}
      {tab==='Dự án' && <Cards key="projects" uploading={uploading} setUploading={setUploading} items={draft.projects} update={items=>patch('projects',items.map(item=>({...item,category:item.category??''})))} projects/>}
      {tab==='Liên hệ' && <div className="editor-fields">{field('phone','Số điện thoại tư vấn','tel')}{field('email','Địa chỉ email','email')}{field('address','Địa chỉ')}{field('zalo','Đường dẫn Zalo','url')}</div>}
      {tab==='Edit Media' && <div className="editor-fields">
        <p>Logo dùng cho cả ảnh và video. Khung dùng cho video. Nên dùng PNG hoặc WebP nền trong suốt, khung theo tỉ lệ 9:16.</p>
        <PhotoField setUploading={setUploading} label="Logo đóng dấu" value={draft.mediaLogo} change={value=>patch('mediaLogo',value)}/>
        <PhotoField setUploading={setUploading} label="Khung video 9:16" value={draft.mediaFrame} change={value=>patch('mediaFrame',value)}/>
        <a className="text-link" href="/editmedia">Mở Edit Media</a>
      </div>}
      {tab==='Email nhận lead' && <div className="editor-fields">
        <p role="status"><strong>{!mailConfigured ? 'Chưa kết nối dịch vụ gửi email' : savedEmail ? 'Đã cấu hình email nhận lead' : 'Chưa nhập email nhận lead'}</strong></p>
        <label>Email nhận thông báo báo giá<input type="email" maxLength={254} placeholder="ten@congty.vn" value={draft.leadEmail} onChange={e=>patch('leadEmail', e.target.value)}/></label>
        <p>Địa chỉ này dùng riêng để nhận thông báo. Để trống nếu muốn tắt thông báo qua email.</p>
        {!mailConfigured && <p>Yêu cầu báo giá vẫn được lưu trong CPanel. Cần kết nối Resend và xác minh địa chỉ gửi để bật thông báo qua email.</p>}
      </div>}
      {tab==='Yêu cầu báo giá' && <div className="lead-list">
        <p role="status">{leadError}</p>
        {!records.length && <p>Khi khách gửi yêu cầu báo giá, bạn sẽ thấy yêu cầu tại đây.</p>}
        {records.map(item=><article key={item.id}><div><h3>{item.name}</h3><a href={`tel:${item.phone.replace(/[^+\d]/g,'')}`}>{item.phone}</a><p>{new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(item.created)}</p></div>
          <div><strong>{item.service || 'Chưa chọn dịch vụ'}</strong><p>{item.message}</p></div>
          <label>Trạng thái<select value={item.status} disabled={leadPending===item.id} onChange={async e=>{
            const status=e.target.value;
            setLeadPending(item.id);setLeadError('');
            try {
              const response=await fetch('/api/inquiries',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,status})});
              if (!response.ok) throw new Error();
              setRecords(prev=>prev.map(r=>r.id===item.id?{...r,status}:r));
            } catch {setLeadError('Chưa cập nhật được trạng thái. Vui lòng thử lại.');}
            finally {setLeadPending('');}
          }}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
        </article>)}
      </div>}
    </section></div></>;
}
