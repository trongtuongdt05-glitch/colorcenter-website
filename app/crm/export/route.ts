import { currentAdmin } from '../../../lib/admin-auth';
import { allRows } from '../data';
import { customerColumns, customerRows, vietnamDay, type Order } from '../model';
import { workbook } from './workbook';

export async function GET() {
  const headers = {'Cache-Control':'private, no-store'};
  if (!await currentAdmin()) return new Response('Vui lòng đăng nhập CPanel.', {status:401, headers});
  try {
    const orders = await allRows<Order>('crm_orders');
    const file = workbook([customerColumns, ...customerRows(orders).map(row => row.cells)]);
    return new Response(new Uint8Array(file), {headers:{
      ...headers,
      'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':`attachment; filename="ColorCenter-KhachHang-${vietnamDay(new Date())}.xlsx"`,
    }});
  } catch {
    return new Response('Chưa xuất được danh sách. Vui lòng thử lại.', {status:500, headers});
  }
}
