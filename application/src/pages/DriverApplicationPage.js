import React, { useState, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SelectInput from '../components/SelectInput';
import {
  useGetDriverApplicationFormQuery,
  useSubmitDriverApplicationMutation,
  useGetDriverApplicationStatusQuery,
} from '../store/slices/driverSlice';

const DriverApplicationPage = ({ onBack, onSuccess }) => {
  const { t, isRTL, language } = useLanguage();
  
  const { data: formData, isLoading: loadingForm } = useGetDriverApplicationFormQuery();
  const { data: statusData, isLoading: loadingStatus } = useGetDriverApplicationStatusQuery();
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitDriverApplicationMutation();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [governorateId, setGovernorateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [personalPhoto, setPersonalPhoto] = useState(null);
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);

  const formInfo = formData?.data;
  const applicationStatus = statusData?.data;
  const governorates = formInfo?.governorates || [];
  const cities = formInfo?.cities || [];
  const profile = formInfo?.profile;
  const existingApplication = formInfo?.application;

  useEffect(() => {
    if (profile) {
      setFullName(profile.name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setGovernorateId(profile.governorate_id?.toString() || '');
      setCityId(profile.city_id?.toString() || '');
    }
    if (existingApplication) {
      setFullName(existingApplication.full_name || '');
      setPhone(existingApplication.phone || '');
      setAddress(existingApplication.address || '');
      setBirthDate(existingApplication.birth_date || '');
      setGovernorateId(existingApplication.governorate_id?.toString() || '');
      setCityId(existingApplication.city_id?.toString() || '');
      setVehicleType(existingApplication.vehicle_type || '');
    }
  }, [profile, existingApplication]);

  const governorateOptions = governorates.map((gov) => ({
    label: language === 'ar' ? gov.name_ar : gov.name_en,
    value: gov.id.toString(),
  }));

  const filteredCities = cities.filter(
    (city) => city.governorate_id?.toString() === governorateId
  );
  const cityOptions = filteredCities.map((city) => ({
    label: language === 'ar' ? city.name_ar : city.name_en,
    value: city.id.toString(),
  }));

  const vehicleOptions = [
    { label: t('motorcycle'), value: 'motorcycle' },
    { label: t('car'), value: 'car' },
    { label: t('bicycle'), value: 'bicycle' },
  ];

  const pickImage = async (setImage, imageType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permission_required'), t('permission_gallery_denied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: imageType === 'personal' ? [1, 1] : [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !phone || !address || !birthDate || !governorateId || !cityId) {
      Alert.alert(t('error'), t('please_fill_required_fields'));
      return;
    }

    if (!existingApplication && (!personalPhoto || !idPhoto)) {
      Alert.alert(t('error'), t('please_upload_required_photos'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('birth_date', birthDate);
      formData.append('governorate_id', governorateId);
      formData.append('city_id', cityId);
      if (vehicleType) formData.append('vehicle_type', vehicleType);

      if (personalPhoto) {
        const uriParts = personalPhoto.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('personal_photo', {
          uri: personalPhoto.uri,
          name: `personal.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      if (vehiclePhoto) {
        const uriParts = vehiclePhoto.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('vehicle_photo', {
          uri: vehiclePhoto.uri,
          name: `vehicle.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      if (idPhoto) {
        const uriParts = idPhoto.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('id_photo', {
          uri: idPhoto.uri,
          name: `id.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      await submitApplication(formData).unwrap();
      Alert.alert(t('success'), t('application_submitted_successfully'));
      if (onSuccess) onSuccess();
    } catch (err) {
      Alert.alert(t('error'), err.data?.message || t('failed_to_submit_application'));
    }
  };

  const renderStatusCard = () => {
    if (!applicationStatus && !existingApplication) return null;

    const status = applicationStatus?.status || existingApplication?.status;
    let statusColor = colors.accent;
    let statusIcon = 'time';

    if (status === 'approved') {
      statusColor = additionalColors.success;
      statusIcon = 'checkmark-circle';
    } else if (status === 'rejected') {
      statusColor = additionalColors.error;
      statusIcon = 'close-circle';
    }

    return (
      <View style={[styles.statusCard, { borderColor: statusColor }]}>
        <Ionicons name={statusIcon} size={40} color={statusColor} />
        <CustomText variant="h3" color={statusColor} style={styles.statusTitle}>
          {t(`application_${status}`)}
        </CustomText>
        <CustomText variant="body" color={additionalColors.textLight} style={styles.statusText}>
          {t(`application_${status}_description`)}
        </CustomText>
      </View>
    );
  };

  if (loadingForm || loadingStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasExistingApprovedApplication = applicationStatus?.status === 'approved';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={additionalColors.text} />
        </TouchableOpacity>
        <CustomText variant="h2" style={styles.headerTitle}>
          {t('driver_application')}
        </CustomText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStatusCard()}

        {!hasExistingApprovedApplication && (
          <View style={styles.formContainer}>
            <CustomText variant="h4" style={styles.sectionTitle}>
              {t('personal_information')}
            </CustomText>

            <CustomInput
              label={t('full_name')}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('full_name_placeholder')}
              icon="person-outline"
            />

            <CustomInput
              label={t('phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('phone_placeholder')}
              icon="call-outline"
              keyboardType="phone-pad"
            />

            <CustomInput
              label={t('address')}
              value={address}
              onChangeText={setAddress}
              placeholder={t('address_placeholder')}
              icon="location-outline"
              multiline
            />

            <CustomInput
              label={t('birth_date')}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
            />

            <SelectInput
              label={t('governorate')}
              options={governorateOptions}
              selectedValue={governorateId}
              onValueChange={(val) => {
                setGovernorateId(val);
                setCityId('');
              }}
              placeholder={t('select_governorate')}
              icon="map-outline"
            />

            <SelectInput
              label={t('city')}
              options={cityOptions}
              selectedValue={cityId}
              onValueChange={setCityId}
              placeholder={t('select_city')}
              icon="business-outline"
              disabled={!governorateId}
            />

            <SelectInput
              label={t('vehicle_type')}
              options={vehicleOptions}
              selectedValue={vehicleType}
              onValueChange={setVehicleType}
              placeholder={t('select_vehicle_type')}
              icon="bicycle-outline"
            />

            {/* Photo Uploads */}
            <CustomText variant="h4" style={[styles.sectionTitle, { marginTop: 20 }]}>
              {t('required_documents')}
            </CustomText>

            {/* Personal Photo */}
            <View style={styles.photoSection}>
              <CustomText variant="body" style={styles.photoLabel}>
                {t('personal_photo')} *
              </CustomText>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={() => pickImage(setPersonalPhoto, 'personal')}
              >
                {personalPhoto ? (
                  <Image source={{ uri: personalPhoto.uri }} style={styles.photoPreview} />
                ) : existingApplication?.personal_photo ? (
                  <Image source={{ uri: existingApplication.personal_photo }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={30} color={additionalColors.textLight} />
                    <CustomText variant="caption" color={additionalColors.textLight}>
                      {t('tap_to_upload')}
                    </CustomText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* ID Photo */}
            <View style={styles.photoSection}>
              <CustomText variant="body" style={styles.photoLabel}>
                {t('id_photo')} *
              </CustomText>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={() => pickImage(setIdPhoto, 'id')}
              >
                {idPhoto ? (
                  <Image source={{ uri: idPhoto.uri }} style={styles.photoPreview} />
                ) : existingApplication?.id_photo ? (
                  <Image source={{ uri: existingApplication.id_photo }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="id-card-outline" size={30} color={additionalColors.textLight} />
                    <CustomText variant="caption" color={additionalColors.textLight}>
                      {t('tap_to_upload')}
                    </CustomText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Vehicle Photo */}
            <View style={styles.photoSection}>
              <CustomText variant="body" style={styles.photoLabel}>
                {t('vehicle_photo')}
              </CustomText>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={() => pickImage(setVehiclePhoto, 'vehicle')}
              >
                {vehiclePhoto ? (
                  <Image source={{ uri: vehiclePhoto.uri }} style={styles.photoPreview} />
                ) : existingApplication?.vehicle_photo ? (
                  <Image source={{ uri: existingApplication.vehicle_photo }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="car-outline" size={30} color={additionalColors.textLight} />
                    <CustomText variant="caption" color={additionalColors.textLight}>
                      {t('tap_to_upload')}
                    </CustomText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <CustomButton
              title={existingApplication ? t('update_application') : t('submit_application')}
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </View>
        )}
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
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  statusTitle: {
    marginTop: 10,
    fontFamily: 'Cairo-Bold',
  },
  statusText: {
    marginTop: 5,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 15,
  },
  photoSection: {
    marginBottom: 15,
  },
  photoLabel: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 8,
  },
  photoUpload: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: additionalColors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: additionalColors.divider,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default DriverApplicationPage;

