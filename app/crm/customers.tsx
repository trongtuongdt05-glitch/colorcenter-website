import Link from 'next/link';
import { customerColumns, customerRows, orderUrl, type Order } from './model';

export function CustomerTable({orders}: {orders:Order[]}) {
  const rows = customerRows(orders);
  return <section className="crm-card">
    <div className="crm-toolbar">
      <strong>{rows.length} khách hàng / công trình</strong>
      <a className="button compact" href="/crm/export">Xuất Excel</a>
    </div>
    {rows.length ? <div className="crm-table crm-customer-table"><table>
      <thead><tr>{customerColumns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map(({id, cells}) => <tr key={id}>{cells.map((value,index) =>
        <td data-label={customerColumns[index]} key={index}>{index === 0 ? <Link href={orderUrl(id)}>{value}</Link> : value || '—'}</td>)}</tr>)}</tbody>
    </table></div> : <p>Khách hàng sẽ xuất hiện khi anh tạo đơn hàng.</p>}
  </section>;
}
