export const DISH_CATEGORIES = [
  'Khai vị',
  'Món chính',
  'Tráng miệng',
  'Đồ uống',
] as const;

export type DishCategory = (typeof DISH_CATEGORIES)[number];
export type TabName = 'menu' | 'tables' | 'payments';

export type Dish = {
  id: string;
  name: string;
  category: DishCategory;
  price: number;
  available: boolean;
};

export type InvoiceItem = {
  dishId: string;
  quantity: number;
};

export type Invoice = {
  id: string;
  tableNumber: number;
  items: InvoiceItem[];
  status: 'Đang phục vụ' | 'Đã thanh toán';
  createdAt: string;
};
