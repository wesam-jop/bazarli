import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import { useTrackOrderQuery } from '../store/slices/ordersSlice';

const ORDER_STATUSES = [
  { key: 'pending_driver_approval', icon: 'time', label: 'pending_driver_approval' },
  { key: 'driver_accepted', icon: 'checkmark-circle', label: 'driver_accepted' },
  { key: 'pending_store_approval', icon: 'storefront', label: 'pending_store_approval' },
  { key: 'store_preparing', icon: 'restaurant', label: 'store_preparing' },
  { key: 'ready_for_delivery', icon: 'bag-check', label: 'ready_for_delivery' },
  { key: 'driver_picked_up', icon: 'bicycle', label: 'driver_picked_up' },
  { key: 'out_for_delivery', icon: 'navigate', label: 'out_for_delivery' },
  { key: 'delivered', icon: 'checkmark-done-circle', label: 'delivered' },
];

const OrderTrackingPage = ({ orderId, onBack }) => {
  const { t, isRTL } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  const { data: trackData, isLoading, error, refetch } = useTrackOrderQuery(orderId, {
    pollingInterval: 30000, // Refresh every 30 seconds
  });

  const trackInfo = trackData?.data;
  const order = trackInfo?.order;
  const currentStatus = trackInfo?.status || order?.status;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getCurrentStatusIndex = () => {
    return ORDER_STATUSES.findIndex(s => s.key === currentStatus);
  };

  const isStatusCompleted = (statusKey) => {
    const currentIndex = getCurrentStatusIndex();
    const statusIndex = ORDER_STATUSES.findIndex(s => s.key === statusKey);
    return statusIndex <= currentIndex;
  };

  const isCurrentStatus = (statusKey) => {
    return currentStatus === statusKey;
  };

  const getStatusColor = (statusKey) => {
    if (isCurrentStatus(statusKey)) return colors.primary;
    if (isStatusCompleted(statusKey)) return additionalColors.success;
    return additionalColors.textLight;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={additionalColors.error} />
        <CustomText variant="h3" style={styles.errorText}>
          {t('tracking_error')}
        </CustomText>
        <TouchableOpacity onPress={onBack} style={styles.backButtonLarge}>
          <CustomText variant="body" color={colors.primary}>
            {t('go_back')}
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  }

  const isCancelled = ['cancelled', 'driver_rejected', 'store_rejected'].includes(currentStatus);
  const isDelivered = currentStatus === 'delivered';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={additionalColors.text} />
        </TouchableOpacity>
        <CustomText variant="h2" style={styles.headerTitle}>
          {t('track_order')}
        </CustomText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Order Info */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <CustomText variant="caption" color={additionalColors.textLight}>
              {t('order_number')}
            </CustomText>
            <CustomText variant="h4" color={colors.primary}>
              {order?.order_number || `#${orderId}`}
            </CustomText>
          </View>
          {trackInfo?.estimated_delivery_time && (
            <View style={styles.estimatedTime}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <CustomText variant="body" style={styles.estimatedTimeText}>
                {t('estimated_delivery')}: {trackInfo.estimated_delivery_time} {t('minutes')}
              </CustomText>
            </View>
          )}
        </View>

        {/* Status Message */}
        {isCancelled ? (
          <View style={styles.cancelledCard}>
            <Ionicons name="close-circle" size={50} color={additionalColors.error} />
            <CustomText variant="h3" color={additionalColors.error} style={styles.cancelledText}>
              {t('order_cancelled')}
            </CustomText>
            <CustomText variant="body" color={additionalColors.textLight} style={styles.cancelledSubtext}>
              {t(currentStatus)}
            </CustomText>
          </View>
        ) : isDelivered ? (
          <View style={styles.deliveredCard}>
            <Ionicons name="checkmark-circle" size={60} color={additionalColors.success} />
            <CustomText variant="h2" color={additionalColors.success} style={styles.deliveredText}>
              {t('order_delivered')}
            </CustomText>
            <CustomText variant="body" color={additionalColors.textLight} style={styles.deliveredSubtext}>
              {t('thank_you_order')}
            </CustomText>
          </View>
        ) : (
          <>
            {/* Progress Timeline */}
            <View style={styles.timelineContainer}>
              <CustomText variant="h4" style={styles.sectionTitle}>
                {t('order_progress')}
              </CustomText>
              
              {ORDER_STATUSES.map((status, index) => {
                const isCompleted = isStatusCompleted(status.key);
                const isCurrent = isCurrentStatus(status.key);
                const statusColor = getStatusColor(status.key);
                
                return (
                  <View key={status.key} style={styles.timelineItem}>
                    {/* Line */}
                    {index > 0 && (
                      <View 
                        style={[
                          styles.timelineLine,
                          { backgroundColor: isCompleted ? additionalColors.success : additionalColors.border }
                        ]} 
                      />
                    )}
                    
                    {/* Icon */}
                    <View 
                      style={[
                        styles.timelineIcon,
                        { 
                          backgroundColor: isCurrent ? colors.primary : isCompleted ? additionalColors.success : additionalColors.divider,
                          borderColor: isCurrent ? colors.primary : isCompleted ? additionalColors.success : additionalColors.border,
                        }
                      ]}
                    >
                      <Ionicons 
                        name={isCompleted || isCurrent ? status.icon : `${status.icon}-outline`} 
                        size={20} 
                        color={isCurrent || isCompleted ? colors.background : additionalColors.textLight} 
                      />
                    </View>
                    
                    {/* Text */}
                    <View style={styles.timelineText}>
                      <CustomText 
                        variant="body" 
                        color={isCurrent ? colors.primary : isCompleted ? additionalColors.text : additionalColors.textLight}
                        style={isCurrent && styles.currentStatusText}
                      >
                        {t(status.label)}
                      </CustomText>
                      {isCurrent && (
                        <CustomText variant="caption" color={colors.primary}>
                          {t('current_status')}
                        </CustomText>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Driver Info */}
            {trackInfo?.delivery_driver && (
              <View style={styles.driverSection}>
                <CustomText variant="h4" style={styles.sectionTitle}>
                  {t('your_driver')}
                </CustomText>
                <View style={styles.driverCard}>
                  <View style={styles.driverAvatar}>
                    <Ionicons name="person" size={30} color={colors.primary} />
                  </View>
                  <View style={styles.driverInfo}>
                    <CustomText variant="body" style={styles.driverName}>
                      {trackInfo.delivery_driver.name}
                    </CustomText>
                    <CustomText variant="caption" color={additionalColors.textLight}>
                      {trackInfo.delivery_driver.phone}
                    </CustomText>
                  </View>
                  <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call" size={20} color={colors.background} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* Delivery Address */}
        <View style={styles.addressSection}>
          <CustomText variant="h4" style={styles.sectionTitle}>
            {t('delivery_address')}
          </CustomText>
          <View style={styles.addressCard}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <CustomText variant="body" style={styles.addressText}>
              {order?.delivery_address}
            </CustomText>
          </View>
        </View>
      </ScrollView>
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
  backButtonLarge: {
    padding: 15,
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
  },
  orderInfoCard: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.primary}30`,
  },
  estimatedTimeText: {
    marginLeft: 8,
    fontFamily: 'Cairo-SemiBold',
  },
  cancelledCard: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: `${additionalColors.error}10`,
    borderRadius: 12,
    marginBottom: 20,
  },
  cancelledText: {
    marginTop: 15,
    fontFamily: 'Cairo-Bold',
  },
  cancelledSubtext: {
    marginTop: 5,
    textAlign: 'center',
  },
  deliveredCard: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: `${additionalColors.success}10`,
    borderRadius: 12,
    marginBottom: 20,
  },
  deliveredText: {
    marginTop: 15,
    fontFamily: 'Cairo-Bold',
  },
  deliveredSubtext: {
    marginTop: 5,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 15,
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: -20,
    width: 2,
    height: 20,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  timelineText: {
    marginLeft: 15,
    flex: 1,
  },
  currentStatusText: {
    fontFamily: 'Cairo-Bold',
  },
  driverSection: {
    marginBottom: 20,
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
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressSection: {
    marginBottom: 20,
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
  addressText: {
    flex: 1,
    marginLeft: 12,
  },
});

export default OrderTrackingPage;

