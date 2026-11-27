'use client';

import { useRef, useState } from 'react';
import { dateLabel, installationEnd, parseDisplayDate } from './model';

export function DateField({name, initial, label, required, onValue}: {
  name:string; initial?:string|null; label:string; required?:boolean; onValue?:(iso:string|null)=>void;
}) {
  const picker = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initial ? dateLabel(initial) : '');
  function change(next:string) {
    setValue(next);
    onValue?.(parseDisplayDate(next));
  }
  return <div className="crm-date-field">
    <label>{label}
      <input name={name} value={value} placeholder="dd/mm/yyyy" inputMode="numeric" required={required}
        pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" maxLength={10} onChange={event => {
          const input = event.currentTarget;
          const digits = input.value.replace(/\D/g, '').slice(0,8);
          const next = [digits.slice(0,2),digits.slice(2,4),digits.slice(4)].filter(Boolean).join('/');
          input.setCustomValidity(next && !parseDisplayDate(next) ? 'Nhập ngày hợp lệ theo định dạng dd/mm/yyyy.' : '');
          change(next);
        }}/>
    </label>
    <div className="crm-picker">
      <input type="date" ref={picker} tabIndex={-1} aria-hidden="true" value={parseDisplayDate(value) ?? ''}
        onChange={event => {
          picker.current?.closest('.crm-date-field')?.querySelector<HTMLInputElement>('input:not([type=date])')?.setCustomValidity('');
          change(event.currentTarget.value ? dateLabel(event.currentTarget.value) : '');
        }}/>
      <button type="button" aria-label={`Chọn ${label.toLowerCase()} trên lịch`} onClick={() => {
        try {
          picker.current?.showPicker();
        } catch {
          picker.current?.focus();
        }
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4m8-4v4M3 10h18"/></svg>
      </button>
    </div>
  </div>;
}

export function MoneyField({label, initial}: {label:string; initial?:number}) {
  const [digits, setDigits] = useState(initial == null ? '' : String(initial));
  return <label>{label}<input name="amount" inputMode="numeric" required placeholder="100.000"
    value={digits.replace(/\B(?=(\d{3})+(?!\d))/g,'.')} onChange={event => {
      setDigits(event.currentTarget.value.replace(/\D/g,'').slice(0,13));
    }}/></label>;
}

export function ScheduleFields({start, duration}: {start?:string|null; duration:string}) {
  const [first, setFirst] = useState(start ?? null);
  const [days, setDays] = useState(duration);
  const end = first ? installationEnd(first, Number(days)) : null;
  return <>
    <DateField name="install_day" initial={start} label="Ngày bắt đầu thi công" required={Boolean(days)} onValue={setFirst}/>
    <label>Số ngày thi công<input name="install_duration" type="number" min={1} max={3650} step={1} value={days}
      required={Boolean(first)} onChange={event=>setDays(event.currentTarget.value)}/></label>
    <div className="crm-calculated"><span>Hạn bàn giao</span><output aria-live="polite">{end ? dateLabel(end) : '—'}</output></div>
  </>;
}
