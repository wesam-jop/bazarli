import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { loadUser } from './src/store/slices/authSlice';
import { colors } from './src/constants/colors';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { useCairoFonts } from './src/hooks/useFonts';
import Header from './src/components/Header';
import BottomNavigation from './src/components/BottomNavigation';
import Cart from './src/components/Cart';
import HeroSection from './src/components/HeroSection';
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

const AppContent = () => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading: authLoading, user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  // Load user on mount
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

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

  // Show Terms or Privacy pages
  if (currentPage === 'terms') {
    return <TermsPage onBack={() => setCurrentPage(null)} />;
  }
  if (currentPage === 'privacy') {
    return <PrivacyPage onBack={() => setCurrentPage(null)} />;
  }

  // Show login/register pages if not authenticated
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={(page, data) => {
        if (page === 'otp' && data) {
          setCurrentPage({ type: 'otp', phone: data.phone, action: 'register' });
        } else {
          setCurrentPage(page);
        }
      }} />;
    }
    if (currentPage?.type === 'otp') {
      return (
        <OTPVerificationPage
          onNavigate={(page) => setCurrentPage(page)}
          phone={currentPage.phone}
          action={currentPage.action || 'login'}
        />
      );
    }
    return (
      <LoginPage
        onNavigate={(page, data) => {
          if (page === 'otp' && data) {
            setCurrentPage({ type: 'otp', phone: data.phone, action: 'login' });
          } else {
            setCurrentPage(page);
          }
        }}
      />
    );
  }

  // Show checkout page
  if (currentPage === 'checkout') {
    return (
      <CheckoutPage
        navigation={{ goBack: () => setCurrentPage(null) }}
        onSuccess={() => {
          setCurrentPage(null);
          setActiveTab('profile');
        }}
      />
    );
  }

  // Show store details page
  if (currentPage?.type === 'store' && currentPage.storeId) {
    return (
      <StoreDetailsPage
        storeId={currentPage.storeId}
        onBack={() => setCurrentPage(null)}
      />
    );
  }

  // Show dashboard based on user type
  if (activeTab === 'profile') {
    if (user?.user_type === 'customer' || !user?.user_type) {
      return (
        <CustomerDashboard 
          onBack={() => setActiveTab('home')} 
        />
      );
    }
    if (user?.user_type === 'driver') {
      return <DriverDashboard onBack={() => setActiveTab('home')} />;
    }
    if (user?.user_type === 'store_owner') {
      return (
        <StoreDashboard 
          onBack={() => setActiveTab('home')}
          onSetupStore={() => {/* Navigate to store setup */}}
          onManageProducts={() => {/* Navigate to products management */}}
        />
      );
    }
    if (user?.user_type === 'admin') {
      return <AdminDashboard onBack={() => setActiveTab('home')} />;
    }
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

  return (
    <>
      <View style={styles.container}>
        {renderContent()}
      </View>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Cart onCheckout={() => setCurrentPage('checkout')} />
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
});
