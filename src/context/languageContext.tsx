import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navbar
        "nav.brand": "🍽️ Sync Restaurant",
        "nav.settings": "Settings",
        "nav.changePassword": "Change Password",
        "nav.updateCredentials": "Update your credentials",
        "nav.signOut": "Sign Out",
        "nav.signOutMsg": "You'll need to log in again to access the dashboard.",
        "nav.active": "Active",

        // Auth
        "auth.login": "Login to Continue",
        "auth.createAccount": "Create Account",
        "auth.signIn": "SIGN IN",
        "auth.signUp": "SIGN UP",
        "auth.newUser": "New User?",
        "auth.haveAccount": "Already have account?",
        "auth.rememberMe": "Remember Me",
        "auth.fullName": "Full Name",
        "auth.emailOrContact": "Email or Contact Number",
        "auth.contactNumber": "Contact Number (10 digits)",
        "auth.password": "Password",
        "auth.confirmPassword": "Confirm Password",

        // Settings
        "settings.title": "Settings",
        "settings.restaurantInfo": "Restaurant Info",
        "settings.tax": "Tax / GST",
        "settings.hours": "Operating Hours",
        "settings.tables": "Table Management",
        "settings.language": "Language",
        "settings.saveChanges": "Save Changes",
        "settings.restaurantSubtitle": "Basic details about your restaurant",
        "settings.taxSubtitle": "Configure applicable taxes on bills",
        "settings.hoursSubtitle": "Set your restaurant's open and close times",
        "settings.tablesSubtitle": "Add, edit, or remove dining tables",
        "settings.languageSubtitle": "Choose your preferred language",
        "settings.restaurantName": "Restaurant Name",
        "settings.email": "Email Address",
        "settings.phone": "Phone Number",
        "settings.website": "Website",
        "settings.address": "Full Address",
        "settings.gst": "GST Number",
        "settings.fssai": "FSSAI License",
        "settings.addTax": "Add Tax / Charge",
        "settings.closed": "Closed",
        "settings.active": "Active",
        "settings.inactive": "Inactive",
        "settings.addTable": "Add New Table",
        "settings.newTable": "New Table",
        "settings.tableNumber": "Table number (e.g. T7)",
        "settings.seats": "Seats",
        "settings.cancel": "Cancel",
        "settings.sections": "Sections",

        // Dashboard
        "dash.morning": "Good Morning",
        "dash.afternoon": "Good Afternoon",
        "dash.evening": "Good Evening",
        "dash.title": "Restaurant Dashboard",
        "dash.subtitle": "Manage your restaurant efficiently",
        "dash.billing": "Billing",
        "dash.billingDesc": "Manage orders easily",
        "dash.menu": "Menu",
        "dash.menuDesc": "Update food items",
        "dash.inventory": "Inventory",
        "dash.inventoryDesc": "Track stock",
        "dash.reports": "Reports",
        "dash.reportsDesc": "View analytics",
        "dash.clickManage": "Click to manage →",

        // Inventory
        "inv.title": "Inventory",
        "inv.dashboard": "Dashboard",
        "inv.log": "Today's Log",
        "inv.items": "Items",
        "inv.totalItems": "Total Items",
        "inv.lowStock": "Low Stock",
        "inv.stockToday": "Stocked Today",
        "inv.usedToday": "Used Today",
        "inv.currentStock": "Current Stock",
        "inv.search": "Search items...",
        "inv.stockIn": "Stock In",
        "inv.markUsed": "Mark Used",
        "inv.addItem": "+ Add Item",
        "inv.loading": "Loading inventory...",
        "inv.noItems": "No items match",
        "inv.noTransactions": "No transactions yet today.",
        "inv.useStockIn": "Use \"Stock In\" or \"Mark Used\" to log activity.",
        "inv.todayTransactions": "Today's Transactions",
        "inv.allItems": "All Items & Triggers",
        "inv.lowStockAlert": "Low Stock Alert",
        "inv.runningLow": "is running low!",
        "inv.remaining": "remaining",
        "inv.min": "min",
        "inv.restock": "Please restock soon.",
        "inv.networkError": "Network error. Please try again.",
        "inv.retry": "Retry",
        "inv.selectItem": "Please select an item.",
        "inv.validQty": "Enter a valid quantity.",
        "inv.available": "available",
        "inv.addToStock": "Add to Stock",
        "inv.deductStock": "Deduct from Stock",
        "inv.itemName": "Item Name",
        "inv.unit": "Unit",
        "inv.openingStock": "Opening Stock",
        "inv.minQty": "Min Qty Trigger",
        "inv.minQtyHint": "Alert fires when stock drops to this level.",
        "inv.newItem": "New Item",
        "inv.item": "Item",
        "inv.quantity": "Quantity",
        "inv.currentStockCol": "Current Stock",
        "inv.minTrigger": "Min Trigger",
        "inv.status": "Status",
    },

    hi: {
        // Navbar
        "nav.brand": "🍽️ सिंक रेस्टोरेंट",
        "nav.settings": "सेटिंग्स",
        "nav.changePassword": "पासवर्ड बदलें",
        "nav.updateCredentials": "अपनी जानकारी अपडेट करें",
        "nav.signOut": "साइन आउट",
        "nav.signOutMsg": "डैशबोर्ड एक्सेस करने के लिए फिर से लॉगिन करना होगा।",
        "nav.active": "सक्रिय",

        // Auth
        "auth.login": "लॉगिन करें",
        "auth.createAccount": "अकाउंट बनाएं",
        "auth.signIn": "साइन इन",
        "auth.signUp": "साइन अप",
        "auth.newUser": "नए यूजर?",
        "auth.haveAccount": "पहले से अकाउंट है?",
        "auth.rememberMe": "मुझे याद रखें",
        "auth.fullName": "पूरा नाम",
        "auth.emailOrContact": "ईमेल या मोबाइल नंबर",
        "auth.contactNumber": "मोबाइल नंबर (10 अंक)",
        "auth.password": "पासवर्ड",
        "auth.confirmPassword": "पासवर्ड की पुष्टि करें",

        // Settings
        "settings.title": "सेटिंग्स",
        "settings.restaurantInfo": "रेस्टोरेंट जानकारी",
        "settings.tax": "टैक्स / GST",
        "settings.hours": "काम के घंटे",
        "settings.tables": "टेबल प्रबंधन",
        "settings.language": "भाषा",
        "settings.saveChanges": "बदलाव सहेजें",
        "settings.restaurantSubtitle": "आपके रेस्टोरेंट की बुनियादी जानकारी",
        "settings.taxSubtitle": "बिल पर लागू टैक्स कॉन्फिगर करें",
        "settings.hoursSubtitle": "रेस्टोरेंट के खुलने/बंद होने का समय सेट करें",
        "settings.tablesSubtitle": "टेबल जोड़ें, संपादित करें या हटाएं",
        "settings.languageSubtitle": "अपनी पसंदीदा भाषा चुनें",
        "settings.restaurantName": "रेस्टोरेंट का नाम",
        "settings.email": "ईमेल पता",
        "settings.phone": "फोन नंबर",
        "settings.website": "वेबसाइट",
        "settings.address": "पूरा पता",
        "settings.gst": "GST नंबर",
        "settings.fssai": "FSSAI लाइसेंस",
        "settings.addTax": "टैक्स / शुल्क जोड़ें",
        "settings.closed": "बंद",
        "settings.active": "सक्रिय",
        "settings.inactive": "निष्क्रिय",
        "settings.addTable": "नई टेबल जोड़ें",
        "settings.newTable": "नई टेबल",
        "settings.tableNumber": "टेबल नंबर (जैसे T7)",
        "settings.seats": "सीटें",
        "settings.cancel": "रद्द करें",
        "settings.sections": "अनुभाग",

        // Dashboard
        "dash.morning": "सुप्रभात",
        "dash.afternoon": "नमस्कार",
        "dash.evening": "शुभ संध्या",
        "dash.title": "रेस्टोरेंट डैशबोर्ड",
        "dash.subtitle": "अपने रेस्टोरेंट को कुशलता से प्रबंधित करें",
        "dash.billing": "बिलिंग",
        "dash.billingDesc": "ऑर्डर आसानी से प्रबंधित करें",
        "dash.menu": "मेनू",
        "dash.menuDesc": "खाद्य पदार्थ अपडेट करें",
        "dash.inventory": "इन्वेंटरी",
        "dash.inventoryDesc": "स्टॉक ट्रैक करें",
        "dash.reports": "रिपोर्ट",
        "dash.reportsDesc": "विश्लेषण देखें",
        "dash.clickManage": "प्रबंधित करने के लिए क्लिक करें →",

        // Inventory
        "inv.title": "इन्वेंटरी",
        "inv.dashboard": "डैशबोर्ड",
        "inv.log": "आज का लॉग",
        "inv.items": "आइटम",
        "inv.totalItems": "कुल आइटम",
        "inv.lowStock": "कम स्टॉक",
        "inv.stockToday": "आज स्टॉक किया",
        "inv.usedToday": "आज उपयोग किया",
        "inv.currentStock": "वर्तमान स्टॉक",
        "inv.search": "आइटम खोजें...",
        "inv.stockIn": "स्टॉक इन",
        "inv.markUsed": "उपयोग किया",
        "inv.addItem": "+ आइटम जोड़ें",
        "inv.loading": "इन्वेंटरी लोड हो रही है...",
        "inv.noItems": "कोई आइटम नहीं मिला",
        "inv.noTransactions": "आज कोई लेनदेन नहीं हुआ।",
        "inv.useStockIn": "गतिविधि लॉग करने के लिए \"स्टॉक इन\" या \"उपयोग किया\" का उपयोग करें।",
        "inv.todayTransactions": "आज के लेनदेन",
        "inv.allItems": "सभी आइटम और ट्रिगर",
        "inv.lowStockAlert": "कम स्टॉक अलर्ट",
        "inv.runningLow": "का स्टॉक कम हो रहा है!",
        "inv.remaining": "बचा है",
        "inv.min": "न्यूनतम",
        "inv.restock": "कृपया जल्द स्टॉक भरें।",
        "inv.networkError": "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।",
        "inv.retry": "पुनः प्रयास",
        "inv.selectItem": "कृपया एक आइटम चुनें।",
        "inv.validQty": "वैध मात्रा दर्ज करें।",
        "inv.available": "उपलब्ध",
        "inv.addToStock": "स्टॉक में जोड़ें",
        "inv.deductStock": "स्टॉक से घटाएं",
        "inv.itemName": "आइटम का नाम",
        "inv.unit": "इकाई",
        "inv.openingStock": "प्रारंभिक स्टॉक",
        "inv.minQty": "न्यूनतम मात्रा ट्रिगर",
        "inv.minQtyHint": "स्टॉक इस स्तर तक गिरने पर अलर्ट मिलेगा।",
        "inv.newItem": "नया आइटम",
        "inv.item": "आइटम",
        "inv.quantity": "मात्रा",
        "inv.currentStockCol": "वर्तमान स्टॉक",
        "inv.minTrigger": "न्यूनतम ट्रिगर",
        "inv.status": "स्थिति",
    },
  
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("appLang") as Language) || "en";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("appLang", l);
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);