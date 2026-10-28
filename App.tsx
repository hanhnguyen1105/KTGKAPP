import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {COLORS} from './src/theme/colors';
import {createSeedData} from './src/data/seedData';
import {Dish, Invoice, TabName} from './src/types';
import DishFormScreen from './src/screens/DishFormScreen';
import MainScreen from './src/screens/MainScreen';
import OrderScreen from './src/screens/OrderScreen';
import PaymentDetailScreen from './src/screens/PaymentDetailScreen';

export type RootStackParamList = {
  Main: {tab?: TabName} | undefined;
  DishForm: {dishId?: string} | undefined;
  Order: {tableNumber: number};
  PaymentDetail: {invoiceId: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const STORAGE_KEY = '@restaurant_app/data_v1';

type AppData = {
  dishes: Dish[];
  invoices: Invoice[];
};

type MainProps = NativeStackScreenProps<RootStackParamList, 'Main'>;
type DishFormProps = NativeStackScreenProps<RootStackParamList, 'DishForm'>;
type OrderProps = NativeStackScreenProps<RootStackParamList, 'Order'>;
type PaymentProps = NativeStackScreenProps<RootStackParamList, 'PaymentDetail'>;

function isAppData(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const data = value as {dishes?: unknown; invoices?: unknown};
  return Array.isArray(data.dishes) && Array.isArray(data.invoices);
}

function App() {
  const [data, setData] = useState<AppData>(() => createSeedData());
  const [isReady, setIsReady] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed: unknown = JSON.parse(savedData);
          if (!isAppData(parsed)) {
            throw new Error('Dữ liệu đã lưu không đúng định dạng.');
          }
          if (isMounted) {
            setData(parsed);
          }
        }
      } catch (error) {
        Alert.alert(
          'Không thể tải dữ liệu',
          error instanceof Error ? error.message : 'Vui lòng thử lại.',
        );
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const serializedData = JSON.stringify(data);
    saveQueue.current = saveQueue.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, serializedData))
      .catch(error => {
        Alert.alert(
          'Không thể lưu dữ liệu',
          error instanceof Error ? error.message : 'Vui lòng thử lại.',
        );
      });
  }, [data, isReady]);

  const saveDish = (dish: Dish) => {
    setData(current => {
      const exists = current.dishes.some(item => item.id === dish.id);
      return {
        ...current,
        dishes: exists
          ? current.dishes.map(item => (item.id === dish.id ? dish : item))
          : [...current.dishes, dish],
      };
    });
  };

  const deleteDish = (dishId: string) => {
    setData(current => ({
      ...current,
      dishes: current.dishes.filter(dish => dish.id !== dishId),
    }));
  };

  const toggleDishAvailability = (dishId: string, available: boolean) => {
    setData(current => ({
      ...current,
      dishes: current.dishes.map(dish =>
        dish.id === dishId ? {...dish, available} : dish,
      ),
    }));
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setData(current => ({
      ...current,
      invoices: current.invoices.map(invoice =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice,
      ),
    }));
  };

  const openTable = (navigation: MainProps['navigation'], tableNumber: number) => {
    const currentInvoice = data.invoices.find(
      invoice =>
        invoice.tableNumber === tableNumber && invoice.status === 'Đang phục vụ',
    );

    if (currentInvoice) {
      navigation.navigate('Order', {tableNumber});
      return;
    }

    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      tableNumber,
      items: [],
      status: 'Đang phục vụ',
      createdAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ` ${new Date().toLocaleDateString('vi-VN')}`,
    };

    setData(current => {
      const alreadyExists = current.invoices.some(
        invoice =>
          invoice.tableNumber === tableNumber &&
          invoice.status === 'Đang phục vụ',
      );
      return alreadyExists
        ? current
        : {...current, invoices: [...current.invoices, newInvoice]};
    });
    navigation.navigate('Order', {tableNumber});
  };

  const markAsPaid = (invoiceId: string) => {
    const invoice = data.invoices.find(item => item.id === invoiceId);
    if (!invoice || invoice.items.length === 0) {
      Alert.alert('Chưa thể thanh toán', 'Hoá đơn chưa có món ăn.');
      return;
    }
    updateInvoice({...invoice, status: 'Đã thanh toán'});
  };

  const mainScreen = (props: MainProps) => (
    <MainScreen
      {...props}
      dishes={data.dishes}
      invoices={data.invoices}
      onAddDish={() => props.navigation.navigate('DishForm')}
      onEditDish={dishId => props.navigation.navigate('DishForm', {dishId})}
      onDeleteDish={deleteDish}
      onToggleAvailability={toggleDishAvailability}
      onOpenTable={tableNumber => openTable(props.navigation, tableNumber)}
      onOpenPayment={invoiceId =>
        props.navigation.navigate('PaymentDetail', {invoiceId})
      }
    />
  );

  const dishFormScreen = (props: DishFormProps) => {
    const dish = data.dishes.find(item => item.id === props.route.params?.dishId);
    return (
      <DishFormScreen
        dish={dish}
        dishes={data.dishes}
        onBack={() => props.navigation.goBack()}
        onSave={saveDish}
      />
    );
  };

  const orderScreen = (props: OrderProps) => {
    const invoice = data.invoices.find(
      item =>
        item.tableNumber === props.route.params.tableNumber &&
        item.status === 'Đang phục vụ',
    );

    if (!invoice) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Không tìm thấy hoá đơn của bàn này.</Text>
        </View>
      );
    }

    return (
      <OrderScreen
        invoice={invoice}
        dishes={data.dishes}
        onBack={() => props.navigation.goBack()}
        onUpdateInvoice={updateInvoice}
        onPayment={() =>
          props.navigation.navigate('PaymentDetail', {invoiceId: invoice.id})
        }
      />
    );
  };

  const paymentScreen = (props: PaymentProps) => {
    const invoice = data.invoices.find(
      item => item.id === props.route.params.invoiceId,
    );
    const invoiceDishes = invoice
      ? invoice.items.map(item => {
          const dish = data.dishes.find(candidate => candidate.id === item.dishId);
          return {
            ...item,
            name: dish?.name ?? 'Món ăn không còn trong thực đơn',
            price: dish?.price ?? 0,
          };
        })
      : [];
    const total = invoiceDishes.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const grandTotal = total + Math.round(total * 0.08);

    if (!invoice) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Không tìm thấy hoá đơn.</Text>
        </View>
      );
    }

    return (
      <PaymentDetailScreen
        invoice={invoice}
        items={invoiceDishes}
        subtotal={total}
        vat={Math.round(total * 0.08)}
        grandTotal={grandTotal}
        onBack={() => props.navigation.goBack()}
        onConfirm={() => {
          markAsPaid(invoice.id);
          props.navigation.navigate('Main', {tab: 'payments'});
        }}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {isReady ? (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerShown: false,
              contentStyle: {backgroundColor: COLORS.background},
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Main">{mainScreen}</Stack.Screen>
            <Stack.Screen name="DishForm">{dishFormScreen}</Stack.Screen>
            <Stack.Screen name="Order">{orderScreen}</Stack.Screen>
            <Stack.Screen name="PaymentDetail">{paymentScreen}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
