import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {COLORS} from '../theme/colors';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'light';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({pressed}) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'light' && styles.buttonLight,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
      {...props}>
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.buttonSecondaryText,
          variant === 'light' && styles.buttonLightText,
          disabled && styles.buttonDisabledText,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function ScreenTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function EmptyState({message}: {message: string}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>♡</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.accentLight,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
  },
  buttonLight: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{scale: 0.99}],
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonSecondaryText: {
    color: COLORS.primary,
  },
  buttonLightText: {
    color: COLORS.text,
  },
  buttonDisabledText: {
    color: COLORS.white,
  },
  titleContainer: {
    marginBottom: 18,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  screenSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyIcon: {
    color: COLORS.accent,
    fontSize: 36,
    marginBottom: 10,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: 'center',
  },
});
