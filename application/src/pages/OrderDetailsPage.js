import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { useGetOrderQuery, useCancelOrderMutation } from '../store/slices/ordersSlice';

const OrderDetailsPage = ({ orderId, onBack, onTrack }) => {
  const { t, isRTL, language } = useLanguage();

  const { data: orderData, isLoading, error, refetch } = useGetOrderQuery(orderId);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const order = orderData?.data;

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return additionalColors.success;
      case 'cancelled':
      case 'driver_rejected':
      case 'store_rejected':
        return additionalColors.error;
      case 'pending_driver_approval':
      case 'pending_store_approval':
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return 'checkmark-circle';
      case 'cancelled':
      case 'driver_rejected':
      case 'store_rejected':
        return 'close-circle';
      case 'out_for_delivery':
        return 'bicycle';
      case 'driver_picked_up':
        return 'bag-check';
      case 'store_preparing':
      case 'ready_for_delivery':
        return 'restaurant';
      default:
        return 'time';
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      t('cancel_order'),
      t('cancel_order_confirm'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId).unwrap();
              refetch();
            } catch (err) {
              Alert.alert(t('error'), err.data?.message || t('cancel_order_failed'));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={additionalColors.error} />
        <CustomText variant="h3" style={styles.errorText}>
          {t('order_not_found')}
        </CustomText>
        <CustomButton title={t('go_back')} onPress={onBack} />
      </View>
    );
  }

  const canCancel = ['pending_driver_approval', 'pending_store_approval', 'driver_accepted'].includes(order.status);
  const canTrack = !['delivered', 'cancelled', 'driver_rejected', 'store_rejected'].includes(order.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={additionalColors.text} />
        </TouchableOpacity>
        <CustomText variant="h2" style={styles.headerTitle}>
          {t('order_details')}
        </CustomText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Number & Status */}
        <View style={styles.orderHeader}>
          <View>
            <CustomText variant="caption" color={additionalColors.textLight}>
              {t('order_number')}
            </CustomText>
            <CustomText variant="h3" color={colors.primary}>
              {order.order_number || `#${order.id}`}
            </CustomText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
            <Ionicons name={getStatusIcon(order.status)} size={16} color={getStatusColor(order.status)} />
            <CustomText variant="small" color={getStatusColor(order.status)} style={styles.statusText}>
              {t(order.status)}
            </CustomText>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={additionalColors.textLight} />
            <CustomText variant="body" style={styles.infoText}>
              {new Date(order.created_at).toLocaleDateString()}
            </CustomText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={additionalColors.textLight} />
            <CustomText variant="body" style={styles.infoText}>
              {new Date(order.created_at).toLocaleTimeString()}
            </CustomText>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <CustomText variant="h4" style={styles.sectionTitle}>
            {t('delivery_address')}
          </CustomText>
          <View style={styles.addressCard}>
            <Ionicons name="location-outline" size={24} color={colors.primary} />
            <View style={styles.addressInfo}>
              <CustomText variant="body" style={styles.addressText}>
                {order.delivery_address}
              </CustomText>
              {order.location_notes && (
                <CustomText variant="caption" color={additionalColors.textLight}>
                  {order.location_notes}
                </CustomText>
              )}
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <CustomText variant="h4" style={styles.sectionTitle}>
            {t('order_items')}
          </CustomText>
          {order.order_items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              {item.product?.image ? (
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="image-outline" size={24} color={additionalColors.textLight} />
                </View>
              )}
              <View style={styles.itemInfo}>
                <CustomText variant="body" style={styles.itemName}>
                  {item.product?.name || t('unknown_product')}
                </CustomText>
                <CustomText variant="caption" color={additionalColors.textLight}>
                  {item.quantity} x {item.price?.toFixed(0)} {t('currency')}
                </CustomText>
              </View>
              <CustomText variant="body" color={colors.primary} style={styles.itemTotal}>
                {(item.quantity * item.price).toFixed(0)} {t('currency')}
              </CustomText>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <CustomText variant="h4" style={styles.sectionTitle}>
            {t('payment_summary')}
          </CustomText>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <CustomText variant="body" color={additionalColors.textLight}>
                {t('subtotal')}
              </CustomText>
              <CustomText variant="body">
                {order.subtotal?.toFixed(0) || (order.total_amount - (order.delivery_fee || 0)).toFixed(0)} {t('currency')}
              </CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText variant="body" color={additionalColors.textLight}>
                {t('delivery_fee')}
              </CustomText>
              <CustomText variant="body">
                {order.delivery_fee?.toFixed(0) || 0} {t('currency')}
              </CustomText>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <CustomText variant="h4" style={styles.totalLabel}>
                {t('total')}
              </CustomText>
              <CustomText variant="h3" color={colors.primary}>
                {order.total_amount?.toFixed(0)} {t('currency')}
              </CustomText>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons 
                name={order.payment_method === 'cash' ? 'cash-outline' : 'card-outline'} 
                size={20} 
                color={additionalColors.textLight} 
              />
              <CustomText variant="caption" color={additionalColors.textLight} style={styles.paymentText}>
                {t(order.payment_method)}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        {order.delivery_driver && (
          <View style={styles.section}>
            <CustomText variant="h4" style={styles.sectionTitle}>
              {t('delivery_driver')}
            </CustomText>
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={30} color={colors.primary} />
              </View>
              <View style={styles.driverInfo}>
                <CustomText variant="body" style={styles.driverName}>
                  {order.delivery_driver.name}
                </CustomText>
                <CustomText variant="caption" color={additionalColors.textLight}>
                  {order.delivery_driver.phone}
                </CustomText>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {canTrack && (
          <CustomButton
            title={t('track_order')}
            onPress={() => onTrack && onTrack(orderId)}
            style={styles.trackButton}
          />
        )}
        {canCancel && (
          <CustomButton
            title={t('cancel_order')}
            onPress={handleCancelOrder}
            loading={isCancelling}
            variant="outline"
            style={styles.cancelButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    marginVertical: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Cairo-Bold',
  },
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    marginLeft: 5,
    fontFamily: 'Cairo-SemiBold',
  },
  infoCard: {
    backgroundColor: additionalColors.divider,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    marginBottom: 5,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: additionalColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 2,
  },
  itemTotal: {
    fontFamily: 'Cairo-Bold',
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: additionalColors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontFamily: 'Cairo-Bold',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: additionalColors.border,
  },
  paymentText: {
    marginLeft: 8,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: additionalColors.border,
    gap: 10,
  },
  trackButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

export default OrderDetailsPage;

