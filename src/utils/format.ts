export function formatMoney(amount: number): string {
  const roundedAmount = Math.round(amount);
  return `${roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ`;
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
