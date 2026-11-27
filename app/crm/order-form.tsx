import type { Lead } from '../../lib/colorcenter-server';
import { addPayment, saveOrder } from './actions';
import { currency, stages, type Order, type Payment } from './model';

export function OrderForm({order, lead, payments, today}: {order?:Order;lead?:Lead;payments:Payment[];today:string}) {
  return <section className="crm-card">
    <h2>{order ? 'Chi tiết đơn hàng' : lead ? 'Tạo đơn từ yêu cầu báo giá' : 'Tạo đơn hàng'}</h2>
    <form className="crm-fields" key={order?.id ?? lead?.id ?? "new"} action={saveOrder}>
      <input type="hidden" name="id" value={order?.id ?? crypto.randomUUID()}/>
      <input type="hidden" name="edit" value={order ? '1' : '0'}/>
      <input type="hidden" name="lead_id" value={order?.lead_id ?? lead?.id ?? ''}/>
      <label>Tên đơn hoặc công trình<input name="title" required maxLength={200} defaultValue={order?.title ?? lead?.service}/></label>
      <label>Khách hàng<input name="customer" required maxLength={120} defaultValue={order?.customer ?? lead?.name}/></label>
      <label>Số điện thoại<input name="phone" type="tel" maxLength={32} defaultValue={order?.phone ?? lead?.phone}/></label>
      <label>Địa chỉ công trình<input name="address" maxLength={300} defaultValue={order?.address}/></label>
      <label>Người phụ trách<input name="assignee" maxLength={100} defaultValue={order?.assignee}/></label>
      <label>Trạng thái<select name="status" defaultValue={order?.status}>{stages.map(stage=><option key={stage}>{stage}</option>)}</select></label>
      <label>Giá trị đã chốt (đ)<input name="amount" type="number" min="0" max="1000000000000" step="1" required defaultValue={order?.amount ?? 0}/></label>
      <label>Ngày chốt<input name="closed_day" type="date" required defaultValue={order?.closed_day ?? today}/></label>
      <label>Việc tiếp theo<input name="next_task" maxLength={300} defaultValue={order?.next_task}/></label>
      <label>Hạn xử lý<input name="task_due" type="date" defaultValue={order?.task_due ?? ''}/></label>
      <label>Ngày khảo sát<input name="survey_day" type="date" defaultValue={order?.survey_day ?? ''}/></label>
      <label>Bắt đầu thi công<input name="install_day" type="date" defaultValue={order?.install_day ?? ''}/></label>
      <label>Kết thúc thi công<input name="install_end_day" type="date" defaultValue={order?.install_end_day ?? ''}/><small>Để trống nếu thi công trong một ngày.</small></label>
      <label>Hạn bàn giao<input name="handover_day" type="date" defaultValue={order?.handover_day ?? ''}/></label>
      <label>Ngày hẹn thanh toán<input name="payment_due" type="date" defaultValue={order?.payment_due ?? ''}/></label>
      <label className="crm-full">Hạng mục và ghi chú<textarea name="notes" maxLength={3000} defaultValue={order?.notes ?? lead?.message}/></label>
      <div className="crm-full"><button className="button">{order ? 'Lưu thay đổi' : 'Tạo đơn'}</button></div>
    </form>
    {order && <div className="crm-payments">
      <h3>Các khoản đã thu</h3>
      {payments.length>0 && <ul>{payments.map(payment=><li key={payment.id}>{payment.paid_day} · {currency(payment.amount)} {payment.note && `· ${payment.note}`}</li>)}</ul>}
      <form className="crm-fields" action={addPayment}>
        <input type="hidden" name="id" value={crypto.randomUUID()}/><input type="hidden" name="order_id" value={order.id}/>
        <label>Ngày nhận tiền<input name="paid_day" type="date" required defaultValue={today}/></label>
        <label>Số tiền (đ)<input name="amount" type="number" min="1" max="1000000000000" step="1" required/></label>
        <label className="crm-full">Ghi chú khoản thu<input name="note" maxLength={300}/></label>
        <div className="crm-full"><button className="button outline">Ghi nhận khoản thu</button></div>
      </form>
    </div>}
  </section>;
}
