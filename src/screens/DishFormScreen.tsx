import React, {useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, ScreenTitle} from '../components/Ui';
import {COLORS} from '../theme/colors';
import {DISH_CATEGORIES, Dish, DishCategory} from '../types';
import {createId, formatMoney} from '../utils/format';

type Props = {
  dish?: Dish;
  dishes: Dish[];
  onBack: () => void;
  onSave: (dish: Dish) => void;
};

function DishFormScreen({dish, dishes, onBack, onSave}: Props) {
  const [name, setName] = useState(dish?.name ?? '');
  const [price, setPrice] = useState(dish ? String(dish.price) : '');
  const [category, setCategory] = useState<DishCategory>(
    dish?.category ?? 'Khai vị',
  );
  const [available, setAvailable] = useState(dish?.available ?? true);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  const save = () => {
    const cleanName = name.trim();
    const numericPrice = Number(price.replace(/[.,\s]/g, ''));
    const duplicate = dishes.some(
      item =>
        item.id !== dish?.id &&
        item.name.trim().toLocaleLowerCase('vi-VN') ===
          cleanName.toLocaleLowerCase('vi-VN'),
    );
    const nextNameError = !cleanName
      ? 'Vui lòng nhập tên món.'
      : duplicate
        ? 'Tên món này đã có trong thực đơn.'
        : '';
    const nextPriceError =
      !price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0
        ? 'Giá phải là số lớn hơn 0.'
        : numericPrice % 1000 !== 0
          ? 'Giá phải chia hết cho 1.000.'
          : '';

    setNameError(nextNameError);
    setPriceError(nextPriceError);
    if (nextNameError || nextPriceError) {
      return;
    }

    onSave({
      id: dish?.id ?? createId('dish'),
      name: cleanName,
      category,
      price: numericPrice,
      available,
    });
    onBack();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.back} onPress={onBack}>
            ‹  Quay lại
          </Text>
          <ScreenTitle
            title={dish ? 'Sửa món ăn' : 'Thêm món ăn'}
            subtitle="Điền thông tin món ăn trong thực đơn"
          />

          <View style={styles.card}>
            <Text style={styles.label}>Tên món ăn <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={name}
              onChangeText={value => {
                setName(value);
                if (nameError) {
                  setNameError('');
                }
              }}
              placeholder="Ví dụ: Phở bò đặc biệt"
              placeholderTextColor={COLORS.muted}
              maxLength={60}
              style={[styles.input, nameError ? styles.inputError : null]}
            />
            {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

            <Text style={styles.label}>Phân loại món <Text style={styles.required}>*</Text></Text>
            <View style={styles.categoryGrid}>
              {DISH_CATEGORIES.map(item => (
                <Button
                  key={item}
                  title={item}
                  variant={category === item ? 'primary' : 'light'}
                  onPress={() => setCategory(item)}
                  style={styles.categoryButton}
                />
              ))}
            </View>

            <Text style={styles.label}>Giá bán (VNĐ) <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={price}
              onChangeText={value => {
                setPrice(value.replace(/[^0-9.,\s]/g, ''));
                if (priceError) {
                  setPriceError('');
                }
              }}
              placeholder="Ví dụ: 45000"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              showSoftInputOnFocus
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={[styles.input, priceError ? styles.inputError : null]}
            />
            {priceError ? <Text style={styles.error}>{priceError}</Text> : null}
            <Text style={styles.hint}>
              {price.trim()
                ? `Giá hiển thị: ${formatMoney(Number(price.replace(/[.,\s]/g, '')) || 0)} · chia hết cho 1.000 đ`
                : 'Nhấn để nhập bằng bàn phím số · chia hết cho 1.000 đ'}
            </Text>

            <Text style={styles.label}>Trạng thái phục vụ</Text>
            <View style={styles.availabilityRow}>
              <View style={styles.statusIcon}>
                <Text style={styles.statusIconText}>{available ? '✓' : '×'}</Text>
              </View>
              <View style={styles.statusTextBox}>
                <Text style={styles.statusTitle}>
                  {available ? 'Còn phục vụ' : 'Đã hết món'}
                </Text>
                <Text style={styles.statusHint}>
                  {available
                    ? 'Khách có thể gọi món này'
                    : 'Món sẽ không xuất hiện để gọi'}
                </Text>
              </View>
              <Button
                title={available ? 'Tắt' : 'Bật'}
                variant={available ? 'secondary' : 'light'}
                onPress={() => setAvailable(value => !value)}
                style={styles.toggleButton}
              />
            </View>
          </View>
          <Button
            title={dish ? 'Lưu thay đổi' : 'Lưu món ăn'}
            onPress={save}
            style={styles.saveButton}
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
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  back: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#4B2432',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    height: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: 14,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 5,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    minHeight: 42,
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: 13,
  },
  availabilityRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSoft,
  },
  statusIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: COLORS.accentLight,
  },
  statusIconText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  statusTextBox: {
    flex: 1,
    paddingHorizontal: 10,
  },
  statusTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  statusHint: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  toggleButton: {
    minHeight: 38,
    paddingHorizontal: 14,
  },
  saveButton: {
    marginTop: 18,
  },
});

export default DishFormScreen;
