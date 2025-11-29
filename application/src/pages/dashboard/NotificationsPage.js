import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation,
  useMarkAllAsReadMutation 
} from '../../store/slices/notificationsSlice';
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import DashboardLayout from '../../components/DashboardLayout';

const NotificationsPage = ({ onBack, embedded = false }) => {
  const { t, isRTL } = useLanguage();

  const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_confirmed':
        return { name: 'checkmark-circle', color: additionalColors.success };
      case 'order_preparing':
        return { name: 'restaurant', color: colors.primary };
      case 'order_on_delivery':
        return { name: 'bicycle', color: additionalColors.info };
      case 'order_delivered':
        return { name: 'checkmark-done-circle', color: additionalColors.success };
      case 'order_cancelled':
        return { name: 'close-circle', color: additionalColors.error };
      case 'promotion':
        return { name: 'gift', color: colors.accent };
      default:
        return { name: 'notifications', color: colors.primary };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('justNow') || 'الآن';
    if (minutes < 60) return `${minutes} ${t('minutesAgo') || 'دقيقة'}`;
    if (hours < 24) return `${hours} ${t('hoursAgo') || 'ساعة'}`;
    if (days < 7) return `${days} ${t('daysAgo') || 'يوم'}`;
    
    return date.toLocaleDateString('ar-SY', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderNotificationCard = (notification) => {
    const icon = getNotificationIcon(notification.type);
    const isUnread = !notification.read_at;

    return (
      <TouchableOpacity
        key={notification.id}
        style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
        onPress={() => handleMarkAsRead(notification.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.notificationContent, isRTL && styles.notificationContentRTL]}>
          <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
            <Ionicons name={icon.name} size={22} color={icon.color} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={[styles.headerRow, isRTL && styles.headerRowRTL]}>
              <CustomText 
                variant="body" 
                color={additionalColors.text} 
                style={[styles.title, isUnread && styles.titleUnread]}
                numberOfLines={1}
              >
                {notification.title || t('notification')}
              </CustomText>
              {isUnread && <View style={styles.unreadDot} />}
            </View>
            
            <CustomText 
              variant="body" 
              color={additionalColors.textLight} 
              style={styles.message}
              numberOfLines={2}
            >
              {notification.body || notification.message}
            </CustomText>
            
            <CustomText variant="caption" color={additionalColors.textMuted} style={styles.time}>
              {formatTime(notification.created_at)}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const rightAction = unreadCount > 0 ? (
    <TouchableOpacity
      onPress={handleMarkAllAsRead}
      disabled={isMarkingAll}
      style={styles.markAllButton}
    >
      {isMarkingAll ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <CustomText variant="small" color={colors.primary}>
          {t('markAllAsRead') || 'قراءة الكل'}
        </CustomText>
      )}
    </TouchableOpacity>
  ) : null;

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
      {/* Summary Card */}
      {notifications.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={[styles.summaryContent, isRTL && styles.summaryContentRTL]}>
            <View style={styles.summaryIcon}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
            </View>
            <View>
              <CustomText variant="body" color={additionalColors.text} style={styles.summaryTitle}>
                {notifications.length} {t('notifications') || 'إشعار'}
              </CustomText>
              <CustomText variant="caption" color={additionalColors.textLight}>
                {unreadCount} {t('unread') || 'غير مقروء'}
              </CustomText>
            </View>
          </View>
        </View>
      )}

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={48} color={additionalColors.textLight} />
          </View>
          <CustomText variant="h3" color={additionalColors.text} style={styles.emptyTitle}>
            {t('noNotifications') || 'لا توجد إشعارات'}
          </CustomText>
          <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
            {t('noNotificationsDesc') || 'ستظهر إشعاراتك هنا'}
          </CustomText>
        </View>
      ) : (
        <View style={styles.notificationsList}>
          {notifications.map(renderNotificationCard)}
        </View>
      )}
    </ScrollView>
  );

  if (embedded) {
    return content;
  }

  return (
    <DashboardLayout
      title={t('notifications') || 'الإشعارات'}
      subtitle={t('dashboard')}
      onBack={onBack}
      rightAction={rightAction}
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryContentRTL: {
    flexDirection: 'row-reverse',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 2,
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
    lineHeight: 22,
  },
  notificationsList: {
    gap: 10,
  },
  notificationCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  notificationCardUnread: {
    backgroundColor: colors.secondary,
    borderColor: colors.primaryLight,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationContentRTL: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerRowRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    flex: 1,
    fontFamily: 'Cairo-SemiBold',
  },
  titleUnread: {
    fontFamily: 'Cairo-Bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  message: {
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontFamily: 'Cairo-Regular',
  },
});

export default NotificationsPage;

