import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { loadUser } from './src/store/slices/authSlice';
import { setSelectedCategoryId, setProductFilters } from './src/store/slices/productsSlice';
import { useGetSettingsQuery } from './src/store/slices/settingsSlice';
import { useGetCategoriesQuery } from './src/store/slices/productsSlice';
import { useGetGovernoratesQuery } from './src/store/slices/locationSlice';
import { colors, additionalColors } from './src/constants/colors';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { useCairoFonts } from './src/hooks/useFonts';
import Header from './src/components/Header';
import BottomNavigation from './src/components/BottomNavigation';
import Cart from './src/components/Cart';
import HeroSection from './src/components/HeroSection';
import CategoriesSection from './src/components/CategoriesSection';
import StoresSection from './src/components/StoresSection';
import ProductsSection from './src/components/ProductsSection';
import StoresPage from './src/pages/StoresPage';
import ProductsPage from './src/pages/ProductsPage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import OTPVerificationPage from './src/pages/OTPVerificationPage';
import CustomerDashboard from './src/pages/dashboard/CustomerDashboard';
import DriverDashboard from './src/pages/dashboard/DriverDashboard';
import StoreDashboard from './src/pages/dashboard/StoreDashboard';
import AdminDashboard from './src/pages/dashboard/AdminDashboard';
import CheckoutPage from './src/pages/CheckoutPage';
import TermsPage from './src/pages/TermsPage';
import PrivacyPage from './src/pages/PrivacyPage';
import StoreDetailsPage from './src/pages/StoreDetailsPage';
import CustomText from './src/components/CustomText';
import SearchBar from './src/components/SearchBar';
import FilterModal from './src/components/FilterModal';

const AppContent = () => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading: authLoading, user } = useAppSelector((state) => state.auth);
  const { filters } = useAppSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Load user and settings on mount
  const { data: settingsData } = useGetSettingsQuery();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Fetch filter options
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: governoratesData } = useGetGovernoratesQuery();

  const categories = categoriesData?.data || [];
  const governorates = governoratesData?.data || [];

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (filters) => {
    dispatch(setProductFilters(filters));
    setIsFilterModalVisible(false);
  };

  // Handle navigation
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setCurrentPage('login');
      } else {
        setCurrentPage(null);
      }
    }
  }, [isAuthenticated, authLoading]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show Terms or Privacy pages (without bottom navigation)
  if (currentPage === 'terms') {
    return (
      <>
        <View style={styles.container}>
          <TermsPage onBack={() => setCurrentPage(null)} />
        </View>
      </>
    );
  }
  if (currentPage === 'privacy') {
    return (
      <>
        <View style={styles.container}>
          <PrivacyPage onBack={() => setCurrentPage(null)} />
        </View>
      </>
    );
  }

  // Show login/register pages if not authenticated (without bottom navigation)
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return (
        <>
          <View style={styles.container}>
            <RegisterPage onNavigate={(page, data) => {
              if (page === 'otp' && data) {
                setCurrentPage({ type: 'otp', phone: data.phone, action: 'register' });
              } else {
                setCurrentPage(page);
              }
            }} />
          </View>
        </>
      );
    }
    if (currentPage?.type === 'otp') {
      return (
        <>
          <View style={styles.container}>
            <OTPVerificationPage
              onNavigate={(page) => setCurrentPage(page)}
              phone={currentPage.phone}
              action={currentPage.action || 'login'}
            />
          </View>
        </>
      );
    }
    return (
      <>
        <View style={styles.container}>
          <LoginPage
            onNavigate={(page, data) => {
              if (page === 'otp' && data) {
                setCurrentPage({ type: 'otp', phone: data.phone, action: 'login' });
              } else {
                setCurrentPage(page);
              }
            }}
          />
        </View>
      </>
    );
  }

  // Show checkout page (without bottom navigation for now)
  if (currentPage === 'checkout') {
    return (
      <>
        <View style={styles.container}>
          <CheckoutPage
            navigation={{ goBack: () => setCurrentPage(null) }}
            onSuccess={() => {
              setCurrentPage(null);
              setActiveTab('profile');
            }}
          />
        </View>
        <Cart onCheckout={() => setCurrentPage('checkout')} />
      </>
    );
  }

  // Show store details page (with bottom navigation)
  if (currentPage?.type === 'store' && currentPage.storeId) {
    return (
      <>
        <View style={styles.container}>
          <StoreDetailsPage
            storeId={currentPage.storeId}
            onBack={() => setCurrentPage(null)}
          />
        </View>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <Cart onCheckout={() => setCurrentPage('checkout')} />
      </>
    );
  }

  // Show dashboard based on user type (with bottom navigation)
  if (activeTab === 'profile') {
    let dashboardContent;
    if (user?.user_type === 'customer' || !user?.user_type) {
      dashboardContent = (
        <CustomerDashboard
          onBack={() => setActiveTab('home')}
        />
      );
    } else if (user?.user_type === 'driver') {
      dashboardContent = <DriverDashboard onBack={() => setActiveTab('home')} />;
    } else if (user?.user_type === 'store_owner') {
      dashboardContent = (
        <StoreDashboard
          onBack={() => setActiveTab('home')}
          onSetupStore={() => {/* Navigate to store setup */}}
          onManageProducts={() => {/* Navigate to products management */}}
        />
      );
    } else if (user?.user_type === 'admin') {
      dashboardContent = <AdminDashboard onBack={() => setActiveTab('home')} />;
    }

    return (
      <>
        <View style={styles.container}>
          {dashboardContent}
        </View>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <Cart onCheckout={() => setCurrentPage('checkout')} />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <HeroSection />

            {!categoriesLoading && (
              <CategoriesSection
                onViewAll={() => setActiveTab('products')}
                onCategoryPress={(category) => {
                  dispatch(setSelectedCategoryId(category.id));
                  setActiveTab('products');
                }}
              />
            )}
            <StoresSection
              onViewAll={(storeId) => {
                if (storeId) {
                  setCurrentPage({ type: 'store', storeId });
                } else {
                  setActiveTab('stores');
                }
              }}
            />
            <ProductsSection onViewAll={() => setActiveTab('products')} />
          </ScrollView>
        );
      case 'stores':
        return (
          <StoresPage
            onStorePress={(storeId) => {
              setCurrentPage({ type: 'store', storeId });
            }}
          />
        );
      case 'products':
        return <ProductsPage />;
      case 'profile':
        return (
          <View style={styles.contentContainer}>
            <CustomText 
              variant="h2" 
              color={colors.primary}
              translate={true}
              translationKey="profile"
              style={styles.text}
            />
          </View>
        );
      default:
        return null;
    }
  };

  // Show main app content with bottom navigation
  return (
    <>
      <View style={styles.container}>
        {renderContent()}
      </View>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Cart onCheckout={() => setCurrentPage('checkout')} />

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApplyFilters={handleFilterChange}
        filters={filters}
        categories={categories}
        governorates={governorates}
      />
    </>
  );
};

export default function App() {
  const fontsLoaded = useCairoFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <LanguageProvider>
        <SafeAreaView style={styles.appContainer}>
          <Header />
          <AppContent />
        </SafeAreaView>
      </LanguageProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
  },
  filterButton: {
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: additionalColors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
