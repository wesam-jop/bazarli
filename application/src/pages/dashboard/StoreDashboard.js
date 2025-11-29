import React, { useState } from 'react';
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
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  useGetStoreDetailsQuery,
  useGetStoreStatisticsQuery,
  useGetStoreOrdersQuery,
  useApproveStoreOrderMutation,
  useRejectStoreOrderMutation,
  useStartPreparingOrderMutation,
  useFinishPreparingOrderMutation,
} from '../../store/slices/storeOwnerSlice';

const StoreDashboard = ({ onBack, onSetupStore, onManageProducts }) => {
  const { t, isRTL, language } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const { data: storeData, isLoading: loadingStore, refetch: refetchStore } = useGetStoreDetailsQuery();
  const { data: statsData, isLoading: loadingStats, refetch: refetchStats } = useGetStoreStatisticsQuery();
  const { data: ordersData, isLoading: loadingOrders, refetch: refetchOrders } = useGetStoreOrdersQuery();

  const [approveOrder, { isLoading: isApproving }] = useApproveStoreOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectStoreOrderMutation();
  const [startPreparing, { isLoading: isStarting }] = useStartPreparingOrderMutation();
  const [finishPreparing, { isLoading: isFinishing }] = useFinishPreparingOrderMutation();

  const store = storeData?.data;
  const stats = statsData?.data || {};
  const orders = ordersData?.data || {};

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStore(), refetchStats(), refetchOrders()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(t('logout'), t('logout_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const handleOrderAction = async (orderStoreId, action) => {
    try {
      switch (action) {
        case 'approve':
          await approveOrder(orderStoreId).unwrap();
          break;
        case 'reject':
          await rejectOrder(orderStoreId).unwrap();
          break;
        case 'start':
          await startPreparing(orderStoreId).unwrap();
          break;
        case 'finish':
          await finishPreparing(orderStoreId).unwrap();
          break;
      }
      refetchOrders();
    } catch (err) {
      Alert.alert(t('error'), err.data?.message || t('action_failed'));
    }
  };

  const isLoading = loadingStore || loadingStats || loadingOrders;

  // If store doesn't exist, show setup prompt
  if (!isLoading && !store) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={additionalColors.text} />
          </TouchableOpacity>
          <CustomText variant="h2" style={styles.headerTitle}>
            {t('store_dashboard')}
          </CustomText>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={additionalColors.error} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.setupContainer}>
          <Ionicons name="storefront-outline" size={80} color={additionalColors.textLight} />
          <CustomText variant="h3" style={styles.setupTitle}>
            {t('no_store_yet')}
          </CustomText>
          <CustomText variant="body" color={additionalColors.textLight} style={styles.setupText}>
            {t('create_store_description')}
          </CustomText>
          <CustomButton
            title={t('create_store')}
            onPress={onSetupStore}
            style={styles.setupButton}
          />
        </View>
      </View>
    );
  }

  const renderOverview = () => (
    <>
      {/* Store Info */}
      <View style={styles.storeCard}>
        <View style={styles.storeIcon}>
          <Ionicons name="storefront" size={30} color={colors.primary} />
        </View>
        <View style={styles.storeInfo}>
          <CustomText variant="h3" style={styles.storeName}>
            {store?.name}
          </CustomText>
          <CustomText variant="caption" color={additionalColors.textLight}>
            {store?.store_type_label}
          </CustomText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: store?.is_active ? `${additionalColors.success}20` : `${additionalColors.error}20` }]}>
          <CustomText variant="small" color={store?.is_active ? additionalColors.success : additionalColors.error}>
            {store?.is_active ? t('active') : t('inactive')}
          </CustomText>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={28} color={colors.primary} />
          <CustomText variant="h2" color={colors.primary} style={styles.statValue}>
            {stats.total?.orders || 0}
          </CustomText>
          <CustomText variant="caption" color={additionalColors.textLight}>
            {t('total_orders')}
          </CustomText>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={28} color={colors.accent} />
          <CustomText variant="h2" color={colors.accent} style={styles.statValue}>
            {stats.pending_orders || 0}
          </CustomText>
          <CustomText variant="caption" color={additionalColors.textLight}>
            {t('pending')}
          </CustomText>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="restaurant-outline" size={28} color={additionalColors.warning} />
          <CustomText variant="h2" color={additionalColors.warning} style={styles.statValue}>
            {stats.preparing_orders || 0}
          </CustomText>
          <CustomText variant="caption" color={additionalColors.textLight}>
            {t('preparing')}
          </CustomText>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={28} color={additionalColors.success} />
          <CustomText variant="h2" color={additionalColors.success} style={styles.statValue}>
            {stats.total?.products || 0}
          </CustomText>
          <CustomText variant="caption" color={additionalColors.textLight}>
            {t('products')}
          </CustomText>
        </View>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <CustomText variant="h4" style={styles.sectionTitle}>
          {t('today_stats')}
        </CustomText>
        <View style={styles.todayCard}>
          <View style={styles.todayRow}>
            <CustomText variant="body" color={additionalColors.textLight}>
              {t('orders_today')}
            </CustomText>
            <CustomText variant="h4" color={colors.primary}>
              {stats.today?.orders || 0}
            </CustomText>
          </View>
          <View style={styles.todayRow}>
            <CustomText variant="body" color={additionalColors.textLight}>
              {t('revenue_today')}
            </CustomText>
            <CustomText variant="h4" color={additionalColors.success}>
              {(stats.today?.revenue || 0).toFixed(0)} {t('currency')}
            </CustomText>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <CustomText variant="h4" style={styles.sectionTitle}>
          {t('quick_actions')}
        </CustomText>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onManageProducts}>
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="cube-outline" size={24} color={colors.primary} />
            </View>
            <CustomText variant="caption">{t('manage_products')}</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('orders')}>
            <View style={[styles.actionIcon, { backgroundColor: `${colors.accent}15` }]}>
              <Ionicons name="receipt-outline" size={24} color={colors.accent} />
            </View>
            <CustomText variant="caption">{t('view_orders')}</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderOrders = () => {
    const pendingOrders = orders.pending_orders || [];
    const preparingOrders = orders.preparing_orders || [];
    const readyOrders = orders.ready_orders || [];

    const renderOrderCard = (order, type) => (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <CustomText variant="body" color={colors.primary} style={styles.orderNumber}>
            #{order.id}
          </CustomText>
          <CustomText variant="caption" color={additionalColors.textLight}>
            {new Date(order.created_at).toLocaleString()}
          </CustomText>
        </View>
        
        <View style={styles.orderItems}>
          {order.items?.map((item, idx) => (
            <CustomText key={idx} variant="caption" color={additionalColors.text}>
              {item.quantity}x {item.product?.name}
            </CustomText>
          ))}
        </View>

        <View style={styles.orderTotal}>
          <CustomText variant="body" color={additionalColors.textLight}>
            {t('total')}:
          </CustomText>
          <CustomText variant="h4" color={colors.primary}>
            {order.total?.toFixed(0)} {t('currency')}
          </CustomText>
        </View>

        <View style={styles.orderActions}>
          {type === 'pending' && (
            <>
              <CustomButton
                title={t('approve')}
                onPress={() => handleOrderAction(order.id, 'approve')}
                loading={isApproving}
                size="small"
                style={styles.orderButton}
              />
              <CustomButton
                title={t('reject')}
                onPress={() => handleOrderAction(order.id, 'reject')}
                loading={isRejecting}
                variant="outline"
                size="small"
                style={styles.orderButton}
              />
            </>
          )}
          {type === 'preparing' && (
            <CustomButton
              title={t('mark_ready')}
              onPress={() => handleOrderAction(order.id, 'finish')}
              loading={isFinishing}
              size="small"
              style={styles.orderButton}
            />
          )}
        </View>
      </View>
    );

    return (
      <>
        {pendingOrders.length > 0 && (
          <View style={styles.section}>
            <CustomText variant="h4" style={styles.sectionTitle}>
              {t('pending_orders')} ({pendingOrders.length})
            </CustomText>
            {pendingOrders.map((order) => renderOrderCard(order, 'pending'))}
          </View>
        )}

        {preparingOrders.length > 0 && (
          <View style={styles.section}>
            <CustomText variant="h4" style={styles.sectionTitle}>
              {t('preparing_orders')} ({preparingOrders.length})
            </CustomText>
            {preparingOrders.map((order) => renderOrderCard(order, 'preparing'))}
          </View>
        )}

        {readyOrders.length > 0 && (
          <View style={styles.section}>
            <CustomText variant="h4" style={styles.sectionTitle}>
              {t('ready_orders')} ({readyOrders.length})
            </CustomText>
            {readyOrders.map((order) => renderOrderCard(order, 'ready'))}
          </View>
        )}

        {pendingOrders.length === 0 && preparingOrders.length === 0 && readyOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={additionalColors.textLight} />
            <CustomText variant="h4" color={additionalColors.textLight} style={styles.emptyText}>
              {t('no_active_orders')}
            </CustomText>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={additionalColors.text} />
        </TouchableOpacity>
        <CustomText variant="h2" style={styles.headerTitle}>
          {t('store_dashboard')}
        </CustomText>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={additionalColors.error} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <CustomText variant="body" color={activeTab === 'overview' ? colors.primary : additionalColors.textLight}>
            {t('overview')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <CustomText variant="body" color={activeTab === 'orders' ? colors.primary : additionalColors.textLight}>
            {t('orders')}
          </CustomText>
          {(stats.pending_orders > 0 || stats.preparing_orders > 0) && (
            <View style={styles.badge}>
              <CustomText variant="small" color={colors.background}>
                {(stats.pending_orders || 0) + (stats.preparing_orders || 0)}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        >
          {activeTab === 'overview' ? renderOverview() : renderOrders()}
        </ScrollView>
      )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginRight: 25,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  badge: {
    backgroundColor: additionalColors.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  setupTitle: {
    marginTop: 20,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
  setupText: {
    marginTop: 10,
    textAlign: 'center',
  },
  setupButton: {
    marginTop: 30,
    width: '80%',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  storeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontFamily: 'Cairo-Bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 20,
  },
  statCard: {
    width: '50%',
    padding: 5,
  },
  statCardInner: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  statValue: {
    marginTop: 8,
    fontFamily: 'Cairo-Bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 12,
  },
  todayCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontFamily: 'Cairo-Bold',
  },
  orderItems: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  orderButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    textAlign: 'center',
  },
});

export default StoreDashboard;

