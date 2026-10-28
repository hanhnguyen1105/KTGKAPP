import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, EmptyState} from '../components/Ui';
import {COLORS} from '../theme/colors';
import {Dish, Invoice} from '../types';
import {formatMoney} from '../utils/format';

type Props = {
  invoice: Invoice;
  dishes: Dish[];
  onBack: () => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onPayment: () => void;
};

function OrderScreen({
  invoice,
  dishes,
  onBack,
  onUpdateInvoice,
  onPayment,
}: Props) {
  const subtotal = invoice.items.reduce((sum, item) => {
    const dish = dishes.find(candidate => candidate.id === item.dishId);
    return sum + (dish?.price ?? 0) * item.quantity;
  }, 0);

  const changeQuantity = (dish: Dish, amount: number) => {
    const currentQuantity =
      invoice.items.find(item => item.dishId === dish.id)?.quantity ?? 0;
    const nextQuantity = currentQuantity + amount;
    if (amount > 0 && !dish.available) {
      return;
    }

    const items =
      nextQuantity <= 0
        ? invoice.items.filter(item => item.dishId !== dish.id)
        : invoice.items.some(item => item.dishId === dish.id)
          ? invoice.items.map(item =>
              item.dishId === dish.id
                ? {...item, quantity: nextQuantity}
                : item,
            )
          : [...invoice.items, {dishId: dish.id, quantity: nextQuantity}];

    onUpdateInvoice({...invoice, items});
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Gọi món · Bàn {invoice.tableNumber}</Text>
          <Text style={styles.subtitle}>Chọn món và điều chỉnh số lượng</Text>
        </View>
      </View>

      <FlatList
        data={dishes}
        keyExtractor={dish => dish.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoTitle}>Hoá đơn đang phục vụ</Text>
            <Text style={styles.orderInfoText}>Tạo lúc {invoice.createdAt}</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState message="Thực đơn hiện chưa có món." />}
        renderItem={({item: dish}) => {
          const quantity =
            invoice.items.find(item => item.dishId === dish.id)?.quantity ?? 0;
          return (
            <View
              style={[
                styles.dishCard,
                !dish.available && styles.unavailableCard,
              ]}>
              <View style={styles.dishIcon}>
                <Text style={styles.dishEmoji}>
                  {dish.category === 'Đồ uống'
                    ? '🥤'
                    : dish.category === 'Tráng miệng'
                      ? '🍨'
                      : dish.category === 'Khai vị'
                        ? '🥗'
                        : '🍲'}
                </Text>
              </View>
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <Text style={styles.dishPrice}>{formatMoney(dish.price)}</Text>
                {!dish.available && (
                  <Text style={styles.soldOutText}>Hết món</Text>
                )}
              </View>
              <View style={styles.quantityControls}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Giảm ${dish.name}`}
                  disabled={quantity === 0}
                  onPress={() => changeQuantity(dish, -1)}
                  style={({pressed}) => [
                    styles.quantityButton,
                    quantity === 0 && styles.quantityDisabled,
                    pressed && styles.quantityPressed,
                  ]}>
                  <Text style={styles.quantityButtonText}>−</Text>
                </Pressable>
                <Text style={styles.quantity}>{quantity}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Tăng ${dish.name}`}
                  disabled={!dish.available}
                  onPress={() => changeQuantity(dish, 1)}
                  style={({pressed}) => [
                    styles.quantityButton,
                    !dish.available && styles.quantityDisabled,
                    pressed && styles.quantityPressed,
                  ]}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalCaption}>
              Tạm tính ({invoice.items.reduce((sum, item) => sum + item.quantity, 0)} món)
            </Text>
            <Text style={styles.totalAmount}>{formatMoney(subtotal)}</Text>
          </View>
          <Button
            title="Thanh toán"
            onPress={onPayment}
            disabled={invoice.items.length === 0}
            style={styles.payButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: 34,
    lineHeight: 38,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },
  orderInfo: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
  },
  orderInfoTitle: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  orderInfoText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  dishCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#4B2432',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  unavailableCard: {
    opacity: 0.65,
  },
  dishIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishEmoji: {
    fontSize: 24,
  },
  dishInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  dishName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  dishPrice: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  soldOutText: {
    color: COLORS.danger,
    fontSize: 10,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisabled: {
    backgroundColor: COLORS.disabled,
  },
  quantityPressed: {
    opacity: 0.7,
  },
  quantityButtonText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 22,
  },
  quantity: {
    width: 28,
    color: COLORS.text,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalCaption: {
    color: COLORS.muted,
    fontSize: 12,
  },
  totalAmount: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 4,
  },
  payButton: {
    minWidth: 138,
  },
});

export default OrderScreen;
