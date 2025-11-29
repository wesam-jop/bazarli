import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useGetDeliveryLocationsQuery, 
  useAddDeliveryLocationMutation,
  useDeleteDeliveryLocationMutation,
  useSetDefaultLocationMutation 
} from '../../store/slices/locationSlice';
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import DashboardLayout from '../../components/DashboardLayout';

const AddressesPage = ({ onBack, embedded = false }) => {
  const { t, isRTL } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    notes: '',
    is_default: false,
  });

  const { data: locationsData, isLoading, refetch } = useGetDeliveryLocationsQuery();
  const [addLocation, { isLoading: isAdding }] = useAddDeliveryLocationMutation();
  const [deleteLocation, { isLoading: isDeleting }] = useDeleteDeliveryLocationMutation();
  const [setDefaultLocation] = useSetDefaultLocationMutation();

  const locations = locationsData?.data || [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAddLocation = async () => {
    if (!formData.address.trim()) {
      Alert.alert(t('error'), t('addressRequired') || 'العنوان مطلوب');
      return;
    }

    try {
      await addLocation({
        ...formData,
        latitude: 33.5138, // Default Damascus coordinates
        longitude: 36.2765,
      }).unwrap();
      
      setShowAddModal(false);
      setFormData({ label: '', address: '', notes: '', is_default: false });
      Alert.alert(t('success'), t('locationAdded') || 'تمت إضافة العنوان بنجاح');
      refetch();
    } catch (error) {
      Alert.alert(t('error'), error?.data?.message || t('addLocationFailed') || 'فشل إضافة العنوان');
    }
  };

  const handleDeleteLocation = (locationId) => {
    Alert.alert(
      t('deleteLocation') || 'حذف العنوان',
      t('confirmDeleteLocation') || 'هل أنت متأكد من حذف هذا العنوان؟',
      [
        { text: t('cancel') || 'إلغاء', style: 'cancel' },
        {
          text: t('delete') || 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocation(locationId).unwrap();
              Alert.alert(t('success'), t('locationDeleted') || 'تم حذف العنوان');
              refetch();
            } catch (error) {
              Alert.alert(t('error'), t('deleteFailed') || 'فشل الحذف');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (locationId) => {
    try {
      await setDefaultLocation(locationId).unwrap();
      refetch();
    } catch (error) {
      Alert.alert(t('error'), t('setDefaultFailed') || 'فشل تعيين العنوان الافتراضي');
    }
  };

  const renderLocationCard = (location) => (
    <View key={location.id} style={styles.locationCard}>
      <View style={[styles.locationHeader, isRTL && styles.locationHeaderRTL]}>
        <View style={styles.locationIconContainer}>
          <Ionicons name="location" size={24} color={colors.primary} />
        </View>
        <View style={styles.locationInfo}>
          <View style={[styles.locationLabelRow, isRTL && styles.locationLabelRowRTL]}>
            <CustomText variant="body" color={additionalColors.text} style={styles.locationLabel}>
              {location.label || t('address') || 'عنوان'}
            </CustomText>
            {location.is_default && (
              <View style={styles.defaultBadge}>
                <Ionicons name="star" size={10} color={colors.primary} />
                <CustomText variant="small" color={colors.primary}>
                  {t('default') || 'افتراضي'}
                </CustomText>
              </View>
            )}
          </View>
          <CustomText variant="caption" color={additionalColors.textLight} style={styles.coordinates}>
            {Number(location.latitude).toFixed(4)}, {Number(location.longitude).toFixed(4)}
          </CustomText>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <CustomText variant="body" color={additionalColors.text} style={styles.addressText}>
          {location.address}
        </CustomText>
        {location.notes && (
          <CustomText variant="caption" color={additionalColors.textLight} style={styles.notesText}>
            {location.notes}
          </CustomText>
        )}
      </View>

      <View style={[styles.locationActions, isRTL && styles.locationActionsRTL]}>
        {!location.is_default && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(location.id)}
          >
            <Ionicons name="star-outline" size={16} color={colors.primary} />
            <CustomText variant="small" color={colors.primary}>
              {t('setAsDefault') || 'تعيين كافتراضي'}
            </CustomText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteLocation(location.id)}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={16} color={additionalColors.error} />
          <CustomText variant="small" color={additionalColors.error}>
            {t('delete') || 'حذف'}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const content = (
    <>
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
        {/* Add New Location Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <View style={styles.addButtonIcon}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </View>
          <CustomText variant="body" color={colors.primary} style={styles.addButtonText}>
            {t('addNewLocation') || 'إضافة عنوان جديد'}
          </CustomText>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={colors.primary} />
        </TouchableOpacity>

        {isLoading && locations.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : locations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="location-outline" size={48} color={additionalColors.textLight} />
            </View>
            <CustomText variant="h3" color={additionalColors.text} style={styles.emptyTitle}>
              {t('noLocations') || 'لا توجد عناوين محفوظة'}
            </CustomText>
            <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
              {t('noLocationsDesc') || 'أضف عناوين التوصيل لتسريع عملية الطلب'}
            </CustomText>
          </View>
        ) : (
          locations.map(renderLocationCard)
        )}
      </ScrollView>

      {/* Add Location Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={additionalColors.text} />
            </TouchableOpacity>
            <CustomText variant="h3" color={additionalColors.text}>
              {t('addNewLocation') || 'إضافة عنوان جديد'}
            </CustomText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Label Field */}
            <View style={styles.formGroup}>
              <CustomText variant="caption" color={additionalColors.textLight} style={styles.formLabel}>
                {t('locationLabel') || 'اسم العنوان'}
              </CustomText>
              <View style={styles.inputContainer}>
                <Ionicons name="bookmark-outline" size={20} color={additionalColors.textLight} />
                <TextInput
                  value={formData.label}
                  onChangeText={(text) => setFormData({ ...formData, label: text })}
                  style={[styles.input, isRTL && styles.inputRTL]}
                  placeholder={t('locationLabelPlaceholder') || 'مثال: المنزل، المكتب'}
                  placeholderTextColor={additionalColors.textMuted}
                />
              </View>
            </View>

            {/* Address Field */}
            <View style={styles.formGroup}>
              <CustomText variant="caption" color={additionalColors.textLight} style={styles.formLabel}>
                {t('deliveryAddress')} *
              </CustomText>
              <View style={[styles.inputContainer, styles.textareaContainer]}>
                <Ionicons name="location-outline" size={20} color={additionalColors.textLight} style={styles.textareaIcon} />
                <TextInput
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  style={[styles.input, styles.textarea, isRTL && styles.inputRTL]}
                  placeholder={t('addressPlaceholder') || 'أدخل العنوان التفصيلي'}
                  placeholderTextColor={additionalColors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Notes Field */}
            <View style={styles.formGroup}>
              <CustomText variant="caption" color={additionalColors.textLight} style={styles.formLabel}>
                {t('notes')}
              </CustomText>
              <View style={[styles.inputContainer, styles.textareaContainer]}>
                <Ionicons name="document-text-outline" size={20} color={additionalColors.textLight} style={styles.textareaIcon} />
                <TextInput
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  style={[styles.input, styles.textarea, isRTL && styles.inputRTL]}
                  placeholder={t('notesPlaceholder') || 'ملاحظات إضافية (اختياري)'}
                  placeholderTextColor={additionalColors.textMuted}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Default Checkbox */}
            <TouchableOpacity
              style={[styles.checkboxContainer, isRTL && styles.checkboxContainerRTL]}
              onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}
            >
              <View style={[styles.checkbox, formData.is_default && styles.checkboxChecked]}>
                {formData.is_default && (
                  <Ionicons name="checkmark" size={14} color={colors.background} />
                )}
              </View>
              <CustomText variant="body" color={additionalColors.text}>
                {t('setAsDefault') || 'تعيين كعنوان افتراضي'}
              </CustomText>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isAdding && styles.saveButtonDisabled]}
              onPress={handleAddLocation}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={colors.background} />
                  <CustomText variant="body" color={colors.background}>
                    {t('saveLocation') || 'حفظ العنوان'}
                  </CustomText>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <DashboardLayout
      title={t('deliveryAddresses') || 'عناوين التوصيل'}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    gap: 12,
  },
  addButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    flex: 1,
    fontFamily: 'Cairo-SemiBold',
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
  locationCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  locationHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  locationLabelRowRTL: {
    flexDirection: 'row-reverse',
  },
  locationLabel: {
    fontFamily: 'Cairo-SemiBold',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  coordinates: {
    fontFamily: 'Cairo-Regular',
  },
  addressContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  addressText: {
    lineHeight: 22,
  },
  notesText: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: additionalColors.borderLight,
    borderStyle: 'dashed',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  locationActionsRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    borderColor: `${additionalColors.error}30`,
    backgroundColor: `${additionalColors.error}10`,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: additionalColors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Cairo-Regular',
    color: additionalColors.text,
  },
  inputRTL: {
    textAlign: 'right',
  },
  textareaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textareaIcon: {
    marginTop: 2,
  },
  textarea: {
    minHeight: 60,
    paddingVertical: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  checkboxContainerRTL: {
    flexDirection: 'row-reverse',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: additionalColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});

export default AddressesPage;

