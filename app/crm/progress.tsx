'use client';

import { useFormStatus } from 'react-dom';
import { updateProgress } from './actions';
import { stageTone, stages, type Order } from './model';

function StageSelect({order}: {order: Order}) {
  const {pending} = useFormStatus();
  return <select disabled={pending} aria-label={`Tiến độ ${order.title}`} defaultValue={order.status}
    name="status" onChange={event => event.currentTarget.form?.requestSubmit()}>
    {stages.map(stage => <option key={stage}>{stage}</option>)}
  </select>;
}

function TaskButton({done}: {done:boolean}) {
  const {pending} = useFormStatus();
  return <button className="crm-task-button" disabled={pending}>{pending ? 'Đang lưu…' : done ? 'Mở lại việc' : '✓ Hoàn tất việc'}</button>;
}

export function QuickProgress({order, q, status}: {order: Order; q?:string; status?:string}) {
  const hidden = <>
    <input type="hidden" name="id" value={order.id}/>
    <input type="hidden" name="filter_q" value={q ?? ''}/>
    <input type="hidden" name="filter_status" value={status ?? ''}/>
  </>;
  return <>
    <form action={updateProgress} className="crm-stage-select" data-tone={stageTone(order.status)} key={order.status}>
      {hidden}<StageSelect order={order}/>
    </form>
    {order.next_task && <form action={updateProgress}>
      {hidden}<input type="hidden" name="task_done" value={order.task_done ? 'no' : 'yes'}/>
      <TaskButton done={order.task_done}/>
    </form>}
  </>;
}
