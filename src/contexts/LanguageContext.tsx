import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  native: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

// Translation dictionary
export const translations: Record<string, Record<string, string>> = {
  en: {
    // Dashboard
    'dashboard': 'Dashboard',
    'agribot_chat': 'AgriBot Chat',
    'yield_prediction': 'Yield Prediction',
    'market_intel': 'Market Intel',
    'disease_detector': 'Disease Detector',
    'crop_insurance': 'Crop Insurance',
    'community_chat': 'Community Chat',
    'settings': 'Settings',
    'logout': 'Logout',
    'refresh_data': 'Refresh Data',
    
    // Common
    'submit': 'Submit',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Information',
    
    // Forms
    'name': 'Name',
    'email': 'Email',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'land_size': 'Land Size',
    'location': 'Location',
    'crop_type': 'Crop Type',
    
    // Agricultural terms
    'acres': 'Acres',
    'hectares': 'Hectares',
    'temperature': 'Temperature',
    'humidity': 'Humidity',
    'rainfall': 'Rainfall',
    'soil_ph': 'Soil pH',
    'nitrogen': 'Nitrogen',
    'phosphorus': 'Phosphorus',
    'potassium': 'Potassium',
    
    // Auth
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'create_account': 'Create Account',
    'already_have_account': 'Already have an account?',
    'dont_have_account': "Don't have an account?",
    'sign_in_here': 'Sign in here',
    'sign_up_here': 'Sign up here',
    
    // AgriBot
    'agribot_welcome': "Hello! I'm AgriBot, your AI agricultural assistant. I can help you with crop recommendations, farming techniques, pest management, and answer any questions about your farm. What would you like to know?",
    'ai_assistant': 'Your AI agricultural assistant',
    'ai_online': 'AI Assistant Online',
    'quick_questions': 'Quick Questions',
    'click_question': 'Click on any question to get started',
    'conversation': 'Conversation',
    'bot_thinking': 'AgriBot is thinking...',
    'chat_placeholder': 'Ask AgriBot about farming, crops, or agricultural practices...',
    'quick_q1': 'What crop should I plant this season?',
    'quick_q2': 'How to manage pest problems?',
    'quick_q3': 'What fertilizer should I use?',
    'quick_q4': 'When should I irrigate my crops?',
  },
  
  hi: {
    // Dashboard
    'dashboard': 'डैशबोर्ड',
    'agribot_chat': 'एग्रीबॉट चैट',
    'yield_prediction': 'उत्पादन पूर्वानुमान',
    'market_intel': 'बाजार जानकारी',
    'disease_detector': 'रोग डिटेक्टर',
    'crop_insurance': 'फसल बीमा',
    'community_chat': 'समुदायिक चैट',
    'settings': 'सेटिंग्स',
    'logout': 'लॉगआउट',
    'refresh_data': 'डेटा रीफ्रेश करें',
    
    // Common
    'submit': 'जमा करें',
    'cancel': 'रद्द करें',
    'save': 'सहेजें',
    'delete': 'हटाएं',
    'edit': 'संपादित करें',
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफलता',
    'warning': 'चेतावनी',
    'info': 'जानकारी',
    
    // Forms
    'name': 'नाम',
    'email': 'ईमेल',
    'password': 'पासवर्ड',
    'confirm_password': 'पासवर्ड की पुष्टि करें',
    'land_size': 'भूमि का आकार',
    'location': 'स्थान',
    'crop_type': 'फसल का प्रकार',
    
    // Agricultural terms
    'acres': 'एकड़',
    'hectares': 'हेक्टेयर',
    'temperature': 'तापमान',
    'humidity': 'आर्द्रता',
    'rainfall': 'वर्षा',
    'soil_ph': 'मिट्टी पीएच',
    'nitrogen': 'नाइट्रोजन',
    'phosphorus': 'फास्फोरस',
    'potassium': 'पोटेशियम',
    
    // Auth
    'sign_in': 'साइन इन',
    'sign_up': 'साइन अप',
    'create_account': 'खाता बनाएं',
    'already_have_account': 'पहले से ही एक खाता है?',
    'dont_have_account': 'कोई खाता नहीं है?',
    'sign_in_here': 'यहाँ साइन इन करें',
    'sign_up_here': 'यहाँ साइन अप करें',
    
    // AgriBot
    'agribot_welcome': 'नमस्ते! मैं एग्रीबॉट हूं, आपका AI कृषि सहायक। मैं फसल की सिफारिशों, खेती की तकनीकों, कीट प्रबंधन और आपके खेत के बारे में किसी भी प्रश्न में आपकी मदद कर सकता हूं। आप क्या जानना चाहेंगे?',
    'ai_assistant': 'आपका AI कृषि सहायक',
    'ai_online': 'AI सहायक ऑनलाइन',
    'quick_questions': 'त्वरित प्रश्न',
    'click_question': 'शुरू करने के लिए किसी भी प्रश्न पर क्लिक करें',
    'conversation': 'बातचीत',
    'bot_thinking': 'एग्रीबॉट सोच रहा है...',
    'chat_placeholder': 'खेती, फसलों या कृषि प्रथाओं के बारे में एग्रीबॉट से पूछें...',
    'quick_q1': 'इस मौसम में मुझे कौन सी फसल लगानी चाहिए?',
    'quick_q2': 'कीट समस्याओं का प्रबंधन कैसे करें?',
    'quick_q3': 'मुझे कौन सा उर्वरक उपयोग करना चाहिए?',
    'quick_q4': 'मुझे अपनी फसलों की सिंचाई कब करनी चाहिए?',
  }
  
  // Add more languages as needed
};

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  initialLanguage = 'en' 
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred_language', language);
    
    // Update HTML dir attribute for RTL languages
    const isRTLLanguage = ['ar', 'he', 'fa', 'ur'].includes(language);
    document.documentElement.dir = isRTLLanguage ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage]?.[key] || translations['en'][key] || key;
    return translation;
  };

  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};