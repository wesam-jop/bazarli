import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserOrdersQuery, useCancelOrderMutation } from '../../store/slices/ordersSlice';
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors, statusColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import DashboardLayout from '../../components/DashboardLayout';

const OrdersPage = ({ onBack, embedded = false }) => {
  const { t, isRTL } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const { data: ordersData, isLoading, refetch } = useGetUserOrdersQuery({ per_page: 20 });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = ordersData?.data?.data || [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      t('cancelOrder'),
      t('confirmCancelOrder') || 'هل أنت متأكد من إلغاء هذا الطلب؟',
      [
        { text: t('no') || 'لا', style: 'cancel' },
        {
          text: t('yes') || 'نعم',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId).unwrap();
              Alert.alert(t('success'), t('orderCancelled') || 'تم إلغاء الطلب بنجاح');
              refetch();
            } catch (error) {
              Alert.alert(t('error'), error?.data?.message || t('cancelFailed') || 'فشل إلغاء الطلب');
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status) => {
    return statusColors[status] || statusColors.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = (item, index) => (
    <View key={index} style={[styles.orderItem, isRTL && styles.orderItemRTL]}>
      <View style={styles.orderItemIcon}>
        <Ionicons name="cube-outline" size={20} color={additionalColors.textLight} />
      </View>
      <View style={styles.orderItemContent}>
        <CustomText variant="body" color={additionalColors.text}>
          {item.product_name || item.product?.name || t('unknownProduct')}
        </CustomText>
        <CustomText variant="caption" color={additionalColors.textLight}>
          {t('quantity')}: {item.quantity}
        </CustomText>
      </View>
      <CustomText variant="body" color={colors.primary} style={styles.orderItemPrice}>
        {(item.total_price || item.price * item.quantity || 0).toFixed(0)} ل.س
      </CustomText>
    </View>
  );

  const renderOrderCard = (order) => {
    const statusStyle = getStatusStyle(order.status);
    const isExpanded = selectedOrder === order.id;

    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Order Header */}
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => setSelectedOrder(isExpanded ? null : order.id)}
        >
          <View style={[styles.orderHeaderContent, isRTL && styles.orderHeaderContentRTL]}>
            <View>
              <CustomText variant="h3" color={colors.primary}>
                #{order.order_number || order.id}
              </CustomText>
              <CustomText variant="caption" color={additionalColors.textLight}>
                {formatDate(order.created_at)}
              </CustomText>
            </View>
            <View style={styles.orderHeaderRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.background, borderColor: statusStyle.border }]}>
                <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                <CustomText variant="small" color={statusStyle.text}>
                  {t(order.status)}
                </CustomText>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={additionalColors.textLight}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <CustomText variant="caption" color={additionalColors.textLight}>
                {t('store') || 'المتجر'}
              </CustomText>
              <CustomText variant="small" color={additionalColors.text} style={styles.summaryValue}>
                {order.store?.name || t('noStoreInfo') || '-'}
              </CustomText>
            </View>
            <View style={styles.summaryItem}>
              <CustomText variant="caption" color={additionalColors.textLight}>
                {t('products')}
              </CustomText>
              <CustomText variant="small" color={additionalColors.text} style={styles.summaryValue}>
                {order.items_count || order.order_items?.length || 0} {t('products')}
              </CustomText>
            </View>
            <View style={styles.summaryItem}>
              <CustomText variant="caption" color={additionalColors.textLight}>
                {t('total')}
              </CustomText>
              <CustomText variant="body" color={colors.primary} style={styles.summaryValue}>
                {(order.total_amount || 0).toFixed(0)} ل.س
              </CustomText>
            </View>
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.orderDetails}>
            {/* Delivery Address */}
            <View style={styles.detailSection}>
              <View style={[styles.detailHeader, isRTL && styles.detailHeaderRTL]}>
                <Ionicons name="location-outline" size={18} color={additionalColors.textLight} />
                <CustomText variant="caption" color={additionalColors.textLight}>
                  {t('deliveryAddress')}
                </CustomText>
              </View>
              <CustomText variant="body" color={additionalColors.text} style={styles.detailText}>
                {order.delivery_address || t('noAddressInfo') || '-'}
              </CustomText>
            </View>

            {/* Order Items */}
            <View style={styles.detailSection}>
              <View style={[styles.detailHeader, isRTL && styles.detailHeaderRTL]}>
                <Ionicons name="list-outline" size={18} color={additionalColors.textLight} />
                <CustomText variant="caption" color={additionalColors.textLight}>
                  {t('orderItems') || 'عناصر الطلب'}
                </CustomText>
              </View>
              <View style={styles.orderItemsList}>
                {order.order_items?.map((item, index) => renderOrderItem(item, index))}
              </View>
            </View>

            {/* Order Totals */}
            <View style={styles.orderTotals}>
              <View style={[styles.totalRow, isRTL && styles.totalRowRTL]}>
                <CustomText variant="body" color={additionalColors.textLight}>
                  {t('subtotal')}
                </CustomText>
                <CustomText variant="body" color={additionalColors.text}>
                  {(order.subtotal || order.total_amount || 0).toFixed(0)} ل.س
                </CustomText>
              </View>
              <View style={[styles.totalRow, isRTL && styles.totalRowRTL]}>
                <CustomText variant="body" color={additionalColors.textLight}>
                  {t('deliveryFee')}
                </CustomText>
                <CustomText variant="body" color={additionalColors.text}>
                  {(order.delivery_fee || 0).toFixed(0)} ل.س
                </CustomText>
              </View>
              <View style={styles.totalDivider} />
              <View style={[styles.totalRow, isRTL && styles.totalRowRTL]}>
                <CustomText variant="h3" color={additionalColors.text}>
                  {t('total')}
                </CustomText>
                <CustomText variant="h3" color={colors.primary}>
                  {(order.total_amount || 0).toFixed(0)} ل.س
                </CustomText>
              </View>
            </View>

            {/* Actions */}
            {order.status === 'pending' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order.id)}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={additionalColors.error} />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color={additionalColors.error} />
                    <CustomText variant="body" color={additionalColors.error}>
                      {t('cancelOrder')}
                    </CustomText>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {isLoading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={48} color={additionalColors.textLight} />
          </View>
          <CustomText variant="h3" color={additionalColors.text} style={styles.emptyTitle}>
            {t('noOrders')}
          </CustomText>
          <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
            {t('noOrdersDesc') || 'ابدأ التسوق لتظهر طلباتك هنا'}
          </CustomText>
          <TouchableOpacity style={styles.shopButton} onPress={onBack}>
            <Ionicons name="bag-outline" size={20} color={colors.background} />
            <CustomText variant="body" color={colors.background}>
              {t('shopNow') || 'ابدأ التسوق'}
            </CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map(renderOrderCard)
      )}
    </ScrollView>
  );

  if (embedded) {
    return content;
  }

  return (
    <DashboardLayout
      title={t('myOrders')}
      subtitle={t('dashboard')}
      onBack={onBack}
    >
      {content}
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: additionalColors.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: additionalColors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    fontFamily: 'Cairo-Bold',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  orderHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.borderLight,
  },
  orderHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderHeaderContentRTL: {
    flexDirection: 'row-reverse',
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderSummary: {
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    marginTop: 4,
    fontFamily: 'Cairo-SemiBold',
  },
  orderDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: additionalColors.borderLight,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  detailHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  detailText: {
    lineHeight: 22,
  },
  orderItemsList: {
    gap: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  orderItemRTL: {
    flexDirection: 'row-reverse',
  },
  orderItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemPrice: {
    fontFamily: 'Cairo-Bold',
  },
  orderTotals: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalRowRTL: {
    flexDirection: 'row-reverse',
  },
  totalDivider: {
    height: 1,
    backgroundColor: additionalColors.border,
    marginVertical: 10,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${additionalColors.error}10`,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: `${additionalColors.error}30`,
  },
});

export default OrdersPage;

