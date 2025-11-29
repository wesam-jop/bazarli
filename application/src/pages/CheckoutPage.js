import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetCartQuery } from '../store/slices/cartSlice';
import { useCreateOrderMutation } from '../store/slices/ordersSlice';
import { useGetDeliveryLocationsQuery } from '../store/slices/locationSlice';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Container from '../components/Container';

const CheckoutPage = ({ navigation, onSuccess }) => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const { data: cartData, isLoading: cartLoading } = useGetCartQuery();
  const { data: locationsData } = useGetDeliveryLocationsQuery();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const [formData, setFormData] = useState({
    delivery_address: '',
    delivery_latitude: null,
    delivery_longitude: null,
    customer_phone: user?.phone || '',
    payment_method: 'cash',
    notes: '',
    location_notes: '',
  });

  const cartItems = cartData?.data?.items || [];
  const total = cartData?.data?.total || 0;
  const deliveryLocations = locationsData?.data || [];

  useEffect(() => {
    // Set default delivery location if available
    const defaultLocation = deliveryLocations.find((loc) => loc.is_default);
    if (defaultLocation) {
      setFormData((prev) => ({
        ...prev,
        delivery_address: defaultLocation.address,
        delivery_latitude: defaultLocation.latitude,
        delivery_longitude: defaultLocation.longitude,
      }));
    }
  }, [deliveryLocations]);


  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.delivery_address.trim()) {
      Alert.alert(t('error'), t('deliveryAddressRequired'));
      return;
    }

    if (!formData.customer_phone.trim()) {
      Alert.alert(t('error'), t('phoneNumberRequired'));
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert(t('error'), t('cartEmpty'));
      return;
    }

    // Group items by store
    const storesMap = {};
    cartItems.forEach((item) => {
      const storeId = item.product?.store?.id;
      if (storeId) {
        if (!storesMap[storeId]) {
          storesMap[storeId] = [];
        }
        storesMap[storeId].push({
          product_id: item.product.id,
          quantity: item.quantity,
        });
      }
    });

    // Convert to stores array format
    const stores = Object.keys(storesMap).map((storeId) => ({
      store_id: parseInt(storeId),
      items: storesMap[storeId],
    }));

    if (stores.length === 0) {
      Alert.alert(t('error'), t('storeRequired'));
      return;
    }

    const orderData = {
      stores,
      delivery_address: formData.delivery_address,
      delivery_latitude: formData.delivery_latitude || 0,
      delivery_longitude: formData.delivery_longitude || 0,
      customer_phone: formData.customer_phone,
      payment_method: formData.payment_method,
      location_notes: formData.location_notes || '',
      notes: formData.notes,
    };

    try {
      const result = await createOrder(orderData).unwrap();
      Alert.alert(
        t('success'),
        t('orderPlacedSuccessfully'),
        [
          {
            text: t('ok'),
            onPress: () => {
              onSuccess?.(result);
              navigation?.goBack?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('error'), error?.data?.message || t('orderFailed'));
    }
  };

  if (cartLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={additionalColors.textLight} />
        <CustomText variant="h3" color={additionalColors.textLight} style={styles.emptyText}>
          {t('cartEmpty')}
        </CustomText>
        <CustomButton
          variant="outline"
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
          translate={true}
          translationKey="back"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        <CustomText variant="h2" color={colors.primary} style={styles.title}>
          {t('checkout')}
        </CustomText>

        {/* Order Summary */}
        <View style={styles.section}>
          <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
            {t('orderSummary')}
          </CustomText>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <CustomText variant="body" color={additionalColors.text}>
                {item.product.name} x {item.quantity}
              </CustomText>
              <CustomText variant="body" color={colors.primary}>
                {(item.subtotal || 0).toFixed(0)} ل.س
              </CustomText>
            </View>
          ))}
          <View style={styles.totalRow}>
            <CustomText variant="h3" color={additionalColors.text}>
              {t('total')}
            </CustomText>
            <CustomText variant="h2" color={colors.primary}>
              {total.toFixed(0)} ل.س
            </CustomText>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
            {t('deliveryAddress')}
          </CustomText>
          <CustomInput
            value={formData.delivery_address}
            onChangeText={(value) => handleChange('delivery_address', value)}
            placeholder={t('deliveryAddress')}
            multiline
            numberOfLines={3}
            leftIcon={<Ionicons name="location-outline" size={20} color={additionalColors.textLight} />}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.section}>
          <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
            {t('phoneNumber')}
          </CustomText>
          <CustomInput
            value={formData.customer_phone}
            onChangeText={(value) => handleChange('customer_phone', value)}
            placeholder={t('phoneNumber')}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={20} color={additionalColors.textLight} />}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
            {t('paymentMethod')}
          </CustomText>
          <View style={styles.paymentMethods}>
            {['cash', 'card', 'wallet'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentMethod,
                  formData.payment_method === method && styles.paymentMethodSelected,
                ]}
                onPress={() => handleChange('payment_method', method)}
              >
                <Ionicons
                  name={
                    method === 'cash'
                      ? 'cash-outline'
                      : method === 'card'
                      ? 'card-outline'
                      : 'wallet-outline'
                  }
                  size={24}
                  color={formData.payment_method === method ? colors.primary : additionalColors.textLight}
                />
                <CustomText
                  variant="body"
                  color={formData.payment_method === method ? colors.primary : additionalColors.text}
                >
                  {t(method)}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Notes */}
        <View style={styles.section}>
          <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
            {t('location_notes')}
          </CustomText>
          <CustomInput
            value={formData.location_notes}
            onChangeText={(value) => handleChange('location_notes', value)}
            placeholder={t('location_notes_placeholder')}
            multiline
            numberOfLines={2}
            leftIcon={<Ionicons name="navigate-outline" size={20} color={additionalColors.textLight} />}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
            {t('notes')}
          </CustomText>
          <CustomInput
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            placeholder={t('notesPlaceholder')}
            multiline
            numberOfLines={3}
            leftIcon={<Ionicons name="document-text-outline" size={20} color={additionalColors.textLight} />}
          />
        </View>

        {/* Place Order Button */}
        <CustomButton
          onPress={handlePlaceOrder}
          loading={isCreating}
          disabled={isCreating}
          style={styles.placeOrderButton}
          translate={true}
          translationKey="placeOrder"
        />
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.background,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: additionalColors.border,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: additionalColors.border,
    gap: 8,
  },
  paymentMethodSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}10`,
  },
  placeOrderButton: {
    marginTop: 8,
    marginBottom: 40,
  },
});

export default CheckoutPage;

