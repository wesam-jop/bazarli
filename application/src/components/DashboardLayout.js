import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, additionalColors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import CustomText from './CustomText';

const DashboardLayout = ({ 
  children, 
  title, 
  subtitle, 
  onBack, 
  showBack = true,
  rightAction = null,
  scrollable = true,
  refreshControl = null,
}) => {
  const { t, isRTL } = useLanguage();

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons 
              name={isRTL ? "chevron-forward" : "chevron-back"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        )}
        <View style={[styles.titleContainer, !showBack && styles.titleContainerNoBack]}>
          {subtitle && (
            <CustomText variant="caption" color={additionalColors.textLight} style={styles.subtitle}>
              {subtitle}
            </CustomText>
          )}
          <CustomText variant="h2" color={additionalColors.text} style={styles.title}>
            {title}
          </CustomText>
        </View>
        {rightAction && (
          <View style={styles.rightAction}>
            {rightAction}
          </View>
        )}
      </View>
    </View>
  );

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {renderHeader()}
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  headerContentRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleContainerNoBack: {
    paddingStart: 0,
  },
  subtitle: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
    fontSize: 10,
  },
  title: {
    fontFamily: 'Cairo-Bold',
  },
  rightAction: {
    marginStart: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default DashboardLayout;

