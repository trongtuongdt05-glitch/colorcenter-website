import Link from 'next/link';
import { addPayment, saveOrder } from './actions';
import { DateField, MoneyField, ScheduleFields } from './fields';
import { currency, dateLabel, installDuration, sources, stages, type Order, type Payment } from './model';

export function OrderForm({order, payments, today}: {order?:Order;payments:Payment[];today:string}) {
  return <section className="crm-card crm-order-editor">
    <div className="crm-toolbar">
      <h2>{order ? 'Chi tiết đơn hàng' : 'Tạo đơn hàng'}</h2>
      <Link href="/crm?tab=orders">Quay lại danh sách</Link>
    </div>
    <form className="crm-fields" action={saveOrder}>
      <input type="hidden" name="id" value={order?.id ?? crypto.randomUUID()}/>
      <input type="hidden" name="edit" value={order ? '1' : '0'}/>
      <h3 className="crm-full">Thông tin đơn hàng</h3>
      <label>Tên KH/Công trình<input name="title" required maxLength={200} defaultValue={order?.title}/></label>
      <label>Số điện thoại<input name="phone" type="tel" maxLength={32} defaultValue={order?.phone}/></label>
      <label>Địa chỉ công trình<input name="address" maxLength={300} defaultValue={order?.address}/></label>
      <label>Người phụ trách<input name="assignee" maxLength={100} defaultValue={order?.assignee}/></label>
      <label>Trạng thái<select name="status" defaultValue={order?.status}>{stages.map(stage=><option key={stage}>{stage}</option>)}</select></label>
      <label>Nguồn<select name="source" defaultValue={order?.source ?? ''}><option value="">Chưa xác định</option>{sources.map(source => <option key={source}>{source}</option>)}</select></label>
      <MoneyField label="Giá trị đã chốt (₫)" initial={order?.amount ?? 0}/>
      <h3 className="crm-full">Lịch thi công và thanh toán</h3>
      <ScheduleFields start={order?.install_day} duration={order ? installDuration(order) : ''}/>
      <DateField name="payment_due" initial={order?.payment_due} label="Ngày hẹn thanh toán"/>
      <label className="crm-full">Hạng mục và ghi chú<textarea name="notes" maxLength={3000} defaultValue={order?.notes}/></label>
      <details className="crm-full crm-extra">
        <summary>Thông tin theo dõi bổ sung</summary>
        <div className="crm-fields">
          <DateField name="closed_day" initial={order?.closed_day ?? today} label="Ngày chốt đơn" required/>
          <DateField name="survey_day" initial={order?.survey_day} label="Ngày khảo sát"/>
        </div>
      </details>
      <div className="crm-full"><button className="button">{order ? 'Lưu thay đổi' : 'Tạo đơn'}</button></div>
    </form>
    {order && <div className="crm-payments">
      <h3>Các khoản đã thu</h3>
      {payments.length>0 && <ul>{payments.map(payment=><li key={payment.id}>{dateLabel(payment.paid_day)} · {currency(payment.amount)} {payment.note && `· ${payment.note}`}</li>)}</ul>}
      <form className="crm-fields" action={addPayment}>
        <input type="hidden" name="id" value={crypto.randomUUID()}/><input type="hidden" name="order_id" value={order.id}/>
        <DateField name="paid_day" initial={today} label="Ngày nhận tiền" required/>
        <MoneyField label="Số tiền (₫)"/>
        <label className="crm-full">Ghi chú khoản thu<input name="note" maxLength={300}/></label>
        <div className="crm-full"><button className="button outline">Ghi nhận khoản thu</button></div>
      </form>
    </div>}
  </section>;
}
