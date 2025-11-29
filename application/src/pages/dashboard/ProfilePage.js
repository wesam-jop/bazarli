import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useUpdateProfileMutation, useGetProfileQuery } from '../../store/slices/dashboardSlice';
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import DashboardLayout from '../../components/DashboardLayout';

const ProfilePage = ({ onBack, embedded = false }) => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const { data: profileData, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    governorate_id: user?.governorate_id || '',
    city_id: user?.city_id || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        name: profileData.data.name || '',
        phone: profileData.data.phone || '',
        address: profileData.data.address || '',
        governorate_id: profileData.data.governorate_id || '',
        city_id: profileData.data.city_id || '',
      });
    }
  }, [profileData]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('error'), t('cameraPermissionRequired') || 'يجب السماح بالوصول للصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('address', formData.address || '');
      
      if (avatar) {
        const filename = avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        data.append('avatar', {
          uri: avatar,
          name: filename,
          type,
        });
      }

      await updateProfile(data).unwrap();
      setIsEditing(false);
      Alert.alert(t('success'), t('profileUpdated') || 'تم تحديث الملف الشخصي');
      refetch();
    } catch (error) {
      Alert.alert(t('error'), error?.data?.message || t('updateFailed') || 'فشل التحديث');
    }
  };

  const profileInfo = profileData?.data || user || {};
  const currentAvatar = avatar || profileInfo.avatar;

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
          {currentAvatar ? (
            <Image source={{ uri: currentAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <CustomText variant="h1" color={colors.primary}>
                {(profileInfo.name || 'U')[0].toUpperCase()}
              </CustomText>
            </View>
          )}
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={14} color={colors.background} />
          </View>
        </TouchableOpacity>
        
        <CustomText variant="h2" color={additionalColors.text} style={styles.profileName}>
          {profileInfo.name || t('customer')}
        </CustomText>
        <CustomText variant="body" color={additionalColors.textLight}>
          {profileInfo.phone}
        </CustomText>
        
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, profileInfo.is_verified && styles.badgeVerified]}>
            <Ionicons 
              name={profileInfo.is_verified ? "checkmark-circle" : "alert-circle"} 
              size={14} 
              color={profileInfo.is_verified ? additionalColors.success : additionalColors.warning} 
            />
            <CustomText 
              variant="small" 
              color={profileInfo.is_verified ? additionalColors.success : additionalColors.warning}
            >
              {profileInfo.is_verified ? (t('verified') || 'موثق') : (t('unverified') || 'غير موثق')}
            </CustomText>
          </View>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <CustomText variant="h3" color={additionalColors.text}>
            {t('personalInfo') || 'المعلومات الشخصية'}
          </CustomText>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <CustomText variant="small" color={colors.primary}>
              {isEditing ? (t('cancel') || 'إلغاء') : (t('edit') || 'تعديل')}
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          {/* Name Field */}
          <View style={styles.formGroup}>
            <CustomText variant="caption" color={additionalColors.textLight} style={styles.label}>
              {t('name')}
            </CustomText>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={additionalColors.textLight} />
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={[styles.input, isRTL && styles.inputRTL]}
                editable={isEditing}
                placeholder={t('enterName') || 'أدخل اسمك'}
                placeholderTextColor={additionalColors.textMuted}
              />
            </View>
          </View>

          {/* Phone Field */}
          <View style={styles.formGroup}>
            <CustomText variant="caption" color={additionalColors.textLight} style={styles.label}>
              {t('phoneNumber')}
            </CustomText>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={additionalColors.textLight} />
              <TextInput
                value={formData.phone}
                style={[styles.input, styles.inputDisabled]}
                editable={false}
              />
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color={additionalColors.textMuted} />
              </View>
            </View>
          </View>

          {/* Address Field */}
          <View style={styles.formGroup}>
            <CustomText variant="caption" color={additionalColors.textLight} style={styles.label}>
              {t('address') || 'العنوان'}
            </CustomText>
            <View style={[styles.inputContainer, styles.textareaContainer]}>
              <Ionicons name="location-outline" size={20} color={additionalColors.textLight} style={styles.textareaIcon} />
              <TextInput
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                style={[styles.input, styles.textarea, isRTL && styles.inputRTL]}
                editable={isEditing}
                placeholder={t('enterAddress') || 'أدخل عنوانك'}
                placeholderTextColor={additionalColors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={colors.background} />
                  <CustomText variant="body" color={colors.background}>
                    {t('saveChanges') || 'حفظ التغييرات'}
                  </CustomText>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
          {t('accountInfo') || 'معلومات الحساب'}
        </CustomText>

        <View style={styles.infoCard}>
          <View style={[styles.infoRow, isRTL && styles.infoRowRTL]}>
            <CustomText variant="body" color={additionalColors.textLight}>
              {t('userType') || 'نوع الحساب'}
            </CustomText>
            <CustomText variant="body" color={additionalColors.text} style={styles.infoValue}>
              {t('customer')}
            </CustomText>
          </View>
          
          <View style={styles.divider} />
          
          <View style={[styles.infoRow, isRTL && styles.infoRowRTL]}>
            <CustomText variant="body" color={additionalColors.textLight}>
              {t('memberSince') || 'عضو منذ'}
            </CustomText>
            <CustomText variant="body" color={additionalColors.text} style={styles.infoValue}>
              {profileInfo.created_at ? new Date(profileInfo.created_at).toLocaleDateString('ar-SY') : '-'}
            </CustomText>
          </View>
        </View>
      </View>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark-outline" size={20} color={additionalColors.info} />
        <CustomText variant="caption" color={additionalColors.textLight} style={styles.securityText}>
          {t('securityNote') || 'نحترم خصوصيتك ولا نشارك بياناتك الشخصية مع أي طرف آخر'}
        </CustomText>
      </View>
    </ScrollView>
  );

  if (embedded) {
    return content;
  }

  return (
    <DashboardLayout
      title={t('profile')}
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
  profileCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileName: {
    marginBottom: 4,
    fontFamily: 'Cairo-Bold',
  },
  badgeContainer: {
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: `${additionalColors.warning}15`,
    borderWidth: 1,
    borderColor: `${additionalColors.warning}30`,
  },
  badgeVerified: {
    backgroundColor: `${additionalColors.success}15`,
    borderColor: `${additionalColors.success}30`,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    marginBottom: 16,
    fontFamily: 'Cairo-Bold',
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
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
  inputDisabled: {
    color: additionalColors.textMuted,
  },
  lockedBadge: {
    padding: 4,
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowRTL: {
    flexDirection: 'row-reverse',
  },
  infoValue: {
    fontFamily: 'Cairo-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: additionalColors.borderLight,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${additionalColors.info}10`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${additionalColors.info}20`,
  },
  securityText: {
    flex: 1,
    lineHeight: 20,
  },
});

export default ProfilePage;

