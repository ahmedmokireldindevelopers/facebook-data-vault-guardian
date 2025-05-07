
type Locale = 'en' | 'ar';

type Translations = {
  [key: string]: {
    [locale in Locale]: string;
  };
};

// Translation strings
const translations: Translations = {
  // Common
  "app.name": {
    en: "FB Data Vault",
    ar: "خزنة بيانات فيسبوك"
  },
  "app.tagline": {
    en: "Secure Facebook Data Extraction",
    ar: "استخراج آمن لبيانات فيسبوك"
  },
  
  // Dashboard
  "dashboard.title": {
    en: "Dashboard",
    ar: "لوحة التحكم"
  },
  "dashboard.stats": {
    en: "Statistics",
    ar: "الإحصائيات"
  },
  "dashboard.extract": {
    en: "Extract Data",
    ar: "استخراج البيانات"
  },
  
  // Data types
  "data.friends": {
    en: "Friends",
    ar: "الأصدقاء"
  },
  "data.messages": {
    en: "Messages",
    ar: "الرسائل"
  },
  "data.posts": {
    en: "Posts",
    ar: "المنشورات"
  },
  "data.groups": {
    en: "Groups",
    ar: "المجموعات"
  },
  
  // Actions
  "action.extract": {
    en: "Extract",
    ar: "استخراج"
  },
  "action.export": {
    en: "Export",
    ar: "تصدير"
  },
  "action.delete": {
    en: "Delete",
    ar: "حذف"
  },
  "action.cancel": {
    en: "Cancel",
    ar: "إلغاء"
  },
  "action.confirm": {
    en: "Confirm",
    ar: "تأكيد"
  },
  "action.save": {
    en: "Save",
    ar: "حفظ"
  },
  
  // Settings
  "settings.title": {
    en: "Settings",
    ar: "الإعدادات"
  },
  "settings.general": {
    en: "General",
    ar: "عام"
  },
  "settings.security": {
    en: "Security",
    ar: "الأمان"
  },
  "settings.data": {
    en: "Data",
    ar: "البيانات"
  },
  "settings.account": {
    en: "Account",
    ar: "الحساب"
  },
  "settings.language": {
    en: "Language",
    ar: "اللغة"
  },
  "settings.theme": {
    en: "Theme",
    ar: "المظهر"
  },
  "settings.subscription": {
    en: "Subscription",
    ar: "الاشتراك"
  },
  
  // Subscription
  "subscription.status": {
    en: "Subscription Status",
    ar: "حالة الاشتراك"
  },
  "subscription.basic": {
    en: "Basic",
    ar: "أساسي"
  },
  "subscription.premium": {
    en: "Premium",
    ar: "متميز"
  },
  "subscription.enterprise": {
    en: "Enterprise",
    ar: "مؤسسات"
  },
  "subscription.features": {
    en: "Available Features",
    ar: "المميزات المتاحة"
  },
  "subscription.upgrade": {
    en: "Upgrade Plan",
    ar: "ترقية الخطة"
  },
  
  // Login/Auth
  "auth.login": {
    en: "Login",
    ar: "تسجيل الدخول"
  },
  "auth.logout": {
    en: "Logout",
    ar: "تسجيل الخروج"
  },
  "auth.signup": {
    en: "Sign Up",
    ar: "إنشاء حساب"
  },
  "auth.email": {
    en: "Email",
    ar: "البريد الإلكتروني"
  },
  "auth.password": {
    en: "Password",
    ar: "كلمة المرور"
  },
  "auth.forgot": {
    en: "Forgot Password?",
    ar: "نسيت كلمة المرور؟"
  }
};

// Current locale
let currentLocale: Locale = 'en';

// Get translated string
export const t = (key: string): string => {
  if (translations[key] && translations[key][currentLocale]) {
    return translations[key][currentLocale];
  }
  return key;
};

// Set locale
export const setLocale = (locale: Locale): void => {
  currentLocale = locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  // Dispatch event to notify components about language change
  window.dispatchEvent(new Event('languagechange'));
};

// Get current locale
export const getLocale = (): Locale => currentLocale;

// Initialize locale based on browser preference
export const initLocale = (): void => {
  const savedLocale = localStorage.getItem('locale') as Locale;
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
    setLocale(savedLocale);
  } else {
    // Check browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (browserLang === 'ar') {
      setLocale('ar');
    } else {
      setLocale('en');
    }
  }
};
