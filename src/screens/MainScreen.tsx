import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {Button, EmptyState} from '../components/Ui';
import {COLORS} from '../theme/colors';
import {DISH_CATEGORIES, Dish, Invoice, TabName} from '../types';
import {formatMoney} from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'> & {
  dishes: Dish[];
  invoices: Invoice[];
  onAddDish: () => void;
  onEditDish: (dishId: string) => void;
  onDeleteDish: (dishId: string) => void;
  onToggleAvailability: (dishId: string, available: boolean) => void;
  onOpenTable: (tableNumber: number) => void;
  onOpenPayment: (invoiceId: string) => void;
};

const TABS: {key: TabName; label: string; icon: string}[] = [
  {key: 'menu', label: 'Thực đơn', icon: '☷'},
  {key: 'tables', label: 'Sơ đồ bàn', icon: '▦'},
  {key: 'payments', label: 'Thanh toán', icon: '▤'},
];

function invoiceSubtotal(invoice: Invoice, dishes: Dish[]) {
  return invoice.items.reduce((sum, item) => {
    const dish = dishes.find(candidate => candidate.id === item.dishId);
    return sum + (dish?.price ?? 0) * item.quantity;
  }, 0);
}

function MainScreen({
  route,
  dishes,
  invoices,
  onAddDish,
  onEditDish,
  onDeleteDish,
  onToggleAvailability,
  onOpenTable,
  onOpenPayment,
}: Props) {
  const [tab, setTab] = useState<TabName>(
    route.params?.tab === 'tables' || route.params?.tab === 'payments'
      ? route.params.tab
      : 'menu',
  );
  const [search, setSearch] = useState('');
  const occupiedTables = new Set(
    invoices
      .filter(invoice => invoice.status === 'Đang phục vụ')
      .map(invoice => invoice.tableNumber),
  );

  useEffect(() => {
    if (route.params?.tab) {
      setTab(route.params.tab);
    }
  }, [route.params?.tab]);

  const groupedDishes = useMemo(
    () =>
      DISH_CATEGORIES.map(category => ({
        title: category,
        data: dishes.filter(dish => {
          const matchesCategory = dish.category === category;
          const matchesSearch = dish.name
            .toLocaleLowerCase('vi-VN')
            .includes(search.trim().toLocaleLowerCase('vi-VN'));
          return matchesCategory && matchesSearch;
        }),
      })).filter(section => section.data.length > 0),
    [dishes, search],
  );

  const renderMenu = () => (
    <>
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryTitle}>Nhà hàng ấm cúng</Text>
          <Text style={styles.summaryText}>
            {dishes.length} món · {occupiedTables.size}/10 bàn có khách
          </Text>
        </View>
        <Text style={styles.summaryIcon}>✦</Text>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm món ăn..."
          placeholderTextColor={COLORS.muted}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          style={styles.searchInput}
        />
        <Button
          title="+ Thêm món"
          onPress={onAddDish}
          style={styles.addButton}
        />
      </View>
      {dishes.length === 0 ? (
        <EmptyState message="Thực đơn chưa có món nào. Hãy thêm món đầu tiên." />
      ) : groupedDishes.length === 0 ? (
        <EmptyState message="Không tìm thấy món ăn phù hợp." />
      ) : (
        <SectionList
          sections={groupedDishes}
          keyExtractor={dish => dish.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderSectionHeader={({section}) => (
            <View style={styles.sectionHeading}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.data.length} món</Text>
            </View>
          )}
          renderItem={({item}) => (
            <Pressable
              onPress={() => onEditDish(item.id)}
              onLongPress={() => {
                const inOpenInvoice = invoices.some(
                  invoice =>
                    invoice.status === 'Đang phục vụ' &&
                    invoice.items.some(orderItem => orderItem.dishId === item.id),
                );
                if (inOpenInvoice) {
                  Alert.alert(
                    'Không thể xoá món',
                    'Món này đang có trong hoá đơn phục vụ.',
                  );
                  return;
                }
                Alert.alert(
                  'Xoá món ăn',
                  `Bạn có chắc muốn xoá "${item.name}" khỏi thực đơn không?`,
                  [
                    {text: 'Huỷ', style: 'cancel'},
                    {
                      text: 'Xoá',
                      style: 'destructive',
                      onPress: () => onDeleteDish(item.id),
                    },
                  ],
                );
              }}
              style={({pressed}) => [
                styles.dishCard,
                !item.available && styles.dishCardUnavailable,
                pressed && styles.cardPressed,
              ]}>
              <View style={styles.dishIcon}>
                <Text style={styles.dishEmoji}>
                  {item.category === 'Đồ uống'
                    ? '🥤'
                    : item.category === 'Tráng miệng'
                      ? '🍨'
                      : item.category === 'Khai vị'
                        ? '🥗'
                        : '🍲'}
                </Text>
              </View>
              <View style={styles.dishInfo}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.dishName,
                    !item.available && styles.unavailableText,
                  ]}>
                  {item.name}
                </Text>
                <Text style={styles.dishPrice}>{formatMoney(item.price)}</Text>
                {!item.available && (
                  <Text style={styles.soldOutLabel}>Hết món</Text>
                )}
              </View>
              <View style={styles.switchBox}>
                <Switch
                  value={item.available}
                  onValueChange={value =>
                    onToggleAvailability(item.id, value)
                  }
                  trackColor={{false: COLORS.disabled, true: COLORS.accent}}
                  thumbColor={COLORS.white}
                />
                <Text style={styles.switchCaption}>
                  {item.available ? 'Còn món' : 'Đã hết'}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </>
  );

  const renderTables = () => (
    <FlatList
      key="tables-grid"
      data={Array.from({length: 10}, (_, index) => index + 1)}
      numColumns={2}
      keyExtractor={tableNumber => tableNumber.toString()}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Sơ đồ bàn</Text>
          <Text style={styles.pageSubtitle}>
            Chọn bàn để bắt đầu hoặc tiếp tục gọi món
          </Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.emptyDot]} />
              <Text style={styles.legendText}>Bàn trống</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.occupiedDot]} />
              <Text style={styles.legendText}>Có khách</Text>
            </View>
          </View>
        </View>
      }
      renderItem={({item: tableNumber}) => {
        const invoice = invoices.find(
          current =>
            current.tableNumber === tableNumber &&
            current.status === 'Đang phục vụ',
        );
        const occupied = Boolean(invoice);
        return (
          <Pressable
            onPress={() => onOpenTable(tableNumber)}
            style={({pressed}) => [
              styles.tableCard,
              occupied && styles.tableCardOccupied,
              pressed && styles.cardPressed,
            ]}>
            <View style={styles.tableTopRow}>
              <Text style={styles.tableNumber}>Bàn {tableNumber}</Text>
              <Text
                style={[
                  styles.tableBadge,
                  occupied ? styles.occupiedBadge : styles.emptyBadge,
                ]}>
                {occupied ? 'Đang phục vụ' : 'Trống'}
              </Text>
            </View>
            <Text style={styles.tableCaption}>
              {occupied
                ? `${invoice?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0} món`
                : 'Nhấn để gọi món'}
            </Text>
            {occupied && invoice ? (
              <Text style={styles.tableAmount}>
                {formatMoney(invoiceSubtotal(invoice, dishes))}
              </Text>
            ) : null}
          </Pressable>
        );
      }}
    />
  );

  const renderPayments = () => {
    const activeInvoices = invoices.filter(
      invoice => invoice.status === 'Đang phục vụ',
    );
    const paidInvoices = invoices.filter(
      invoice => invoice.status === 'Đã thanh toán',
    );
    return (
      <FlatList
        key="payments-list"
        data={[...activeInvoices, ...paidInvoices]}
        keyExtractor={invoice => invoice.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Hoá đơn</Text>
            <Text style={styles.pageSubtitle}>
              Theo dõi và thanh toán hoá đơn theo bàn
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState message="Chưa có hoá đơn nào. Hãy chọn bàn để gọi món." />
        }
        renderItem={({item: invoice}) => {
          const paid = invoice.status === 'Đã thanh toán';
          const subtotal = invoiceSubtotal(invoice, dishes);
          return (
            <Pressable
              disabled={paid}
              onPress={() => onOpenPayment(invoice.id)}
              style={({pressed}) => [
                styles.invoiceCard,
                pressed && !paid && styles.cardPressed,
                paid && styles.paidInvoiceCard,
              ]}>
              <View style={styles.invoiceHeader}>
                <View>
                  <Text style={styles.invoiceTitle}>Hoá đơn Bàn {invoice.tableNumber}</Text>
                  <Text style={styles.invoiceDate}>{invoice.createdAt}</Text>
                </View>
                <Text
                  style={[
                    styles.invoiceStatus,
                    paid ? styles.paidStatus : styles.activeStatus,
                  ]}>
                  {invoice.status}
                </Text>
              </View>
              <View style={styles.invoiceFooter}>
                <Text style={styles.invoiceItems}>
                  {invoice.items.reduce((sum, item) => sum + item.quantity, 0)} món
                </Text>
                <Text style={styles.invoiceAmount}>
                  {formatMoney(paid ? subtotal + Math.round(subtotal * 0.08) : subtotal)}
                </Text>
              </View>
              {!paid && (
                <Text style={styles.invoiceAction}>Xem chi tiết và thanh toán ›</Text>
              )}
            </Pressable>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <View style={styles.content}>
        {tab === 'menu'
          ? renderMenu()
          : tab === 'tables'
            ? renderTables()
            : renderPayments()}
      </View>
      <View style={styles.bottomBar}>
        {TABS.map(item => (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{selected: tab === item.key}}
            onPress={() => setTab(item.key)}
            style={({pressed}) => [
              styles.tabButton,
              pressed && styles.tabPressed,
            ]}>
            <Text
              style={[
                styles.tabIcon,
                tab === item.key && styles.tabSelected,
              ]}>
              {item.icon}
            </Text>
            <Text
              style={[
                styles.tabLabel,
                tab === item.key && styles.tabSelected,
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    minHeight: 88,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    color: COLORS.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
  summaryIcon: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  searchRow: {
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 14,
  },
  addButton: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  sectionHeading: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  sectionTitle: {
    flex: 1,
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCount: {
    color: COLORS.muted,
    fontSize: 12,
  },
  dishCard: {
    minHeight: 88,
    padding: 12,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#4B2432',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  dishCardUnavailable: {
    opacity: 0.65,
  },
  cardPressed: {
    opacity: 0.82,
  },
  dishIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentLight,
  },
  dishEmoji: {
    fontSize: 25,
  },
  dishInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  dishName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  unavailableText: {
    color: COLORS.muted,
  },
  dishPrice: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 5,
  },
  soldOutLabel: {
    color: COLORS.danger,
    fontSize: 11,
    marginTop: 2,
  },
  switchBox: {
    alignItems: 'center',
  },
  switchCaption: {
    color: COLORS.muted,
    fontSize: 10,
  },
  pageHeader: {
    paddingTop: 20,
    paddingBottom: 18,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '800',
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },
  emptyDot: {
    backgroundColor: COLORS.disabled,
  },
  occupiedDot: {
    backgroundColor: COLORS.primary,
  },
  legendText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  tableCard: {
    flex: 1,
    minHeight: 128,
    marginBottom: 12,
    marginHorizontal: 5,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#4B2432',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  tableCardOccupied: {
    backgroundColor: COLORS.accentLight,
    borderColor: '#F3C3CE',
  },
  tableTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableNumber: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  tableBadge: {
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: '700',
  },
  occupiedBadge: {
    color: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  emptyBadge: {
    color: COLORS.muted,
    backgroundColor: COLORS.surfaceSoft,
  },
  tableCaption: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 16,
  },
  tableAmount: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5,
  },
  invoiceCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#4B2432',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 3},
  },
  paidInvoiceCard: {
    opacity: 0.72,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  invoiceTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  invoiceDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  invoiceStatus: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '700',
  },
  activeStatus: {
    color: COLORS.primary,
    backgroundColor: COLORS.accentLight,
  },
  paidStatus: {
    color: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 12,
    marginTop: 14,
  },
  invoiceItems: {
    color: COLORS.muted,
    fontSize: 13,
  },
  invoiceAmount: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  invoiceAction: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 11,
  },
  bottomBar: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  tabPressed: {
    opacity: 0.65,
  },
  tabIcon: {
    color: COLORS.muted,
    fontSize: 21,
    marginBottom: 3,
  },
  tabLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },
  tabSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});

export default MainScreen;
