import React, {useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, EmptyState} from '../components/Ui';
import {COLORS} from '../theme/colors';
import {Invoice} from '../types';
import {formatMoney} from '../utils/format';

type PaymentItem = {
  dishId: string;
  quantity: number;
  name: string;
  price: number;
};

type Props = {
  invoice: Invoice;
  items: PaymentItem[];
  subtotal: number;
  vat: number;
  grandTotal: number;
  onBack: () => void;
  onConfirm: () => void;
};

function PaymentDetailScreen({
  invoice,
  items,
  subtotal,
  vat,
  grandTotal,
  onBack,
  onConfirm,
}: Props) {
  const [cash, setCash] = useState('');
  const cashAmount = Number(cash.replace(/[.,\s]/g, '')) || 0;
  const change = Math.max(0, cashAmount - grandTotal);
  const canPay =
    invoice.status === 'Đang phục vụ' &&
    items.length > 0 &&
    cashAmount >= grandTotal;

  const confirmPayment = () => {
    if (invoice.status !== 'Đang phục vụ') {
      return;
    }
    if (items.length === 0) {
      return;
    }
    if (cashAmount < grandTotal) {
      return;
    }
    onConfirm();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View>
            <Text style={styles.title}>Thanh toán</Text>
            <Text style={styles.subtitle}>Hoá đơn Bàn {invoice.tableNumber}</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          {invoice.status === 'Đã thanh toán' ? (
            <View style={styles.paidBanner}>
              <Text style={styles.paidText}>Hoá đơn này đã được thanh toán.</Text>
            </View>
          ) : null}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Món đã gọi</Text>
              <Text style={styles.itemCount}>
                {items.reduce((sum, item) => sum + item.quantity, 0)} món
              </Text>
            </View>
            {items.length === 0 ? (
              <EmptyState message="Hoá đơn chưa có món nào." />
            ) : (
              items.map(item => (
                <View key={item.dishId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetail}>
                      SL: {item.quantity} · {formatMoney(item.price)}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {formatMoney(item.price * item.quantity)}
                  </Text>
                </View>
              ))
            )}
            <View style={styles.separator} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tạm tính</Text>
              <Text style={styles.priceValue}>{formatMoney(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Thuế VAT (8%)</Text>
              <Text style={styles.priceValue}>{formatMoney(vat)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <View>
                <Text style={styles.grandTotalLabel}>Tổng cộng thanh toán</Text>
                <Text style={styles.grandTotalHint}>Đã bao gồm VAT</Text>
              </View>
              <Text style={styles.grandTotalAmount}>{formatMoney(grandTotal)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tiền khách đưa (VNĐ)</Text>
              <Text style={styles.itemCount}>Tiền mặt</Text>
            </View>
            <TextInput
              value={cash}
              onChangeText={value => setCash(value.replace(/[^0-9.,\s]/g, ''))}
              placeholder="Nhập số tiền khách đưa"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              showSoftInputOnFocus
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.cashInput}
            />
            <View style={styles.quickAmounts}>
              {[grandTotal, Math.ceil(grandTotal / 10000) * 10000, 500000]
                .filter((amount, index, list) => amount > 0 && list.indexOf(amount) === index)
                .map(amount => (
                  <Pressable
                    key={amount}
                    onPress={() => setCash(String(amount))}
                    style={({pressed}) => [
                      styles.quickAmount,
                      pressed && styles.quickAmountPressed,
                    ]}>
                    <Text style={styles.quickAmountText}>
                      {formatMoney(amount)}
                    </Text>
                  </Pressable>
                ))}
            </View>
            <View style={styles.changeRow}>
              <Text style={styles.changeLabel}>Tiền thừa trả khách</Text>
              <Text
                style={[
                  styles.changeAmount,
                  cashAmount < grandTotal && styles.insufficient,
                ]}>
                {cashAmount < grandTotal && cash ? 'Chưa đủ tiền' : formatMoney(change)}
              </Text>
            </View>
          </View>

          <Button
            title={invoice.status === 'Đã thanh toán' ? 'Đã thanh toán' : 'Xác nhận thanh toán'}
            onPress={confirmPayment}
            disabled={!canPay}
            style={styles.confirmButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 42,
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: 34,
    lineHeight: 38,
  },
  title: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 15,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#4B2432',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  itemCount: {
    color: COLORS.muted,
    fontSize: 12,
  },
  itemRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  itemDetail: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  itemTotal: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },
  priceValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  grandTotalRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: COLORS.accentLight,
  },
  grandTotalLabel: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  grandTotalHint: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },
  grandTotalAmount: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
  },
  cashInput: {
    height: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: 15,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },
  quickAmount: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSoft,
  },
  quickAmountPressed: {
    opacity: 0.65,
  },
  quickAmountText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginTop: 12,
    borderRadius: 13,
    backgroundColor: COLORS.successLight,
  },
  changeLabel: {
    color: COLORS.text,
    fontSize: 12,
  },
  changeAmount: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '800',
  },
  insufficient: {
    color: COLORS.danger,
  },
  confirmButton: {
    marginTop: 2,
  },
  paidBanner: {
    padding: 13,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: COLORS.successLight,
  },
  paidText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PaymentDetailScreen;
