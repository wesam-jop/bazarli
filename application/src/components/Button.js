import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseClasses = 'px-6 py-3 rounded-xl items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-purple-600',
    secondary: 'bg-gray-200',
    outline: 'bg-transparent border-2 border-purple-600',
  };

  const textClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-gray-900 font-semibold',
    outline: 'text-purple-600 font-semibold',
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#7c3aed'} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

