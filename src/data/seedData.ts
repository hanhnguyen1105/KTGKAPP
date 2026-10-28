import {Dish, Invoice} from '../types';

export function createSeedData(): {dishes: Dish[]; invoices: Invoice[]} {
  const dishes: Dish[] = [
    {id: 'dish-1', name: 'Gỏi cuốn tôm thịt', category: 'Khai vị', price: 35000, available: true},
    {id: 'dish-2', name: 'Nem rán Hà Nội', category: 'Khai vị', price: 45000, available: true},
    {id: 'dish-3', name: 'Salad mề gà', category: 'Khai vị', price: 40000, available: true},
    {id: 'dish-4', name: 'Phở bò đặc biệt', category: 'Món chính', price: 65000, available: true},
    {id: 'dish-5', name: 'Cơm sườn nướng', category: 'Món chính', price: 55000, available: true},
    {id: 'dish-6', name: 'Bún chả nướng', category: 'Món chính', price: 50000, available: true},
    {id: 'dish-7', name: 'Chè khúc bạch', category: 'Tráng miệng', price: 30000, available: true},
    {id: 'dish-8', name: 'Kem dừa cốt dừa', category: 'Tráng miệng', price: 25000, available: true},
    {id: 'dish-9', name: 'Trà đào cam sả', category: 'Đồ uống', price: 40000, available: true},
    {id: 'dish-10', name: 'Nước ép cam', category: 'Đồ uống', price: 35000, available: true},
  ];

  const invoices: Invoice[] = [
    {
      id: 'invoice-seed-1',
      tableNumber: 2,
      items: [
        {dishId: 'dish-4', quantity: 1},
        {dishId: 'dish-9', quantity: 1},
      ],
      status: 'Đang phục vụ',
      createdAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ` ${new Date().toLocaleDateString('vi-VN')}`,
    },
  ];

  return {dishes, invoices};
}
