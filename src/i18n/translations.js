// Translation dictionary, keyed by "section.key". Each entry has a value
// per supported language code (see ../data/languages.js). Missing keys/
// languages fall back to English, then to the raw key — see
// LanguageContext's t() function.
//
// This covers the app shell (sidebar nav, topbar titles), the Login/Signup
// screens, and the Settings language picker. It's deliberately scoped as a
// solid, working starting point rather than a translation of every string
// in the app — add new "section.key" entries here as you localize more
// pages, and every t() call site will pick them up automatically.
export const TRANSLATIONS = {
  // ── Sidebar navigation ──────────────────────────────────────────────
  "nav.home": { en: "Home", hi: "होम", te: "హోమ్", ta: "முகப்பு", kn: "ಮುಖಪುಟ" },
  "nav.physical": { en: "Physical", hi: "शारीरिक", te: "శారీరక", ta: "உடல்நலம்", kn: "ದೈಹಿಕ" },
  "nav.nutrition": { en: "Nutrition", hi: "पोषण", te: "పోషణ", ta: "ஊட்டச்சத்து", kn: "ಪೋಷಣೆ" },
  "nav.mental": { en: "Mental", hi: "मानसिक", te: "మానసిక", ta: "மனநலம்", kn: "ಮಾನಸಿಕ" },
  "nav.progress": { en: "Progress", hi: "प्रगति", te: "పురోగతి", ta: "முன்னேற்றம்", kn: "ಪ್ರಗತಿ" },
  "nav.womensCare": { en: "Women’s Care", hi: "महिला देखभाल", te: "మహిళా సంరక్షణ", ta: "பெண்கள் பராமரிப்பு", kn: "ಮಹಿಳಾ ಆರೈಕೆ" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स", te: "సెట్టింగ్‌లు", ta: "அமைப்புகள்", kn: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು" },
  "nav.lightMode": { en: "Light mode", hi: "लाइट मोड", te: "లైట్ మోడ్", ta: "லைட் மோட்", kn: "ಲೈಟ್ ಮೋಡ್" },
  "nav.darkMode": { en: "Dark mode", hi: "डार्क मोड", te: "డార్క్ మోడ్", ta: "டார்க் மோட்", kn: "ಡಾರ್ಕ್ ಮೋಡ್" },

  // ── Topbar titles / subtitles (per page) ────────────────────────────
  "topbar.homeSubtitle": {
    en: "Here's your personalized plan for today",
    hi: "यह रही आपकी आज की व्यक्तिगत योजना",
    te: "ఇదిగో మీ ఈరోజు వ్యక్తిగత ప్రణాళిక",
    ta: "இது இன்றைக்கான உங்கள் தனிப்பயன் திட்டம்",
    kn: "ಇದು ಇಂದಿನ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಯೋಜನೆ",
  },
  "topbar.physicalTitle": { en: "Physical Mode", hi: "शारीरिक मोड", te: "శారీరక మోడ్", ta: "உடல் பயிற்சி முறை", kn: "ದೈಹಿಕ ಮೋಡ್" },
  "topbar.physicalSubtitle": {
    en: "Your workout, food and hydration in one place.",
    hi: "आपकी वर्कआउट, भोजन और हाइड्रेशन एक ही जगह पर।",
    te: "మీ వర్కౌట్, ఆహారం మరియు హైడ్రేషన్ ఒకే చోట.",
    ta: "உங்கள் உடற்பயிற்சி, உணவு மற்றும் நீர்ச்சத்து ஒரே இடத்தில்.",
    kn: "ನಿಮ್ಮ ವರ್ಕೌಟ್, ಆಹಾರ ಮತ್ತು ಹೈಡ್ರೇಶನ್ ಒಂದೇ ಕಡೆ.",
  },
  "topbar.nutritionTitle": { en: "Nutrition Mode", hi: "पोषण मोड", te: "పోషణ మోడ్", ta: "ஊட்டச்சத்து முறை", kn: "ಪೋಷಣೆ ಮೋಡ್" },
  "topbar.nutritionSubtitle": {
    en: "Meals, hydration and calories for today.",
    hi: "आज के भोजन, हाइड्रेशन और कैलोरी।",
    te: "ఈరోజు భోజనాలు, హైడ్రేషన్ మరియు కేలరీలు.",
    ta: "இன்றைய உணவுகள், நீர்ச்சத்து மற்றும் கலோரிகள்.",
    kn: "ಇಂದಿನ ಊಟ, ಹೈಡ್ರೇಶನ್ ಮತ್ತು ಕ್ಯಾಲೋರಿಗಳು.",
  },
  "topbar.mentalTitle": { en: "Mental Mode", hi: "मानसिक मोड", te: "మానసిక మోడ్", ta: "மனநல முறை", kn: "ಮಾನಸಿಕ ಮೋಡ್" },
  "topbar.mentalSubtitle": {
    en: "A calmer space to check in with yourself.",
    hi: "खुद से जुड़ने के लिए एक शांत जगह।",
    te: "మీతో మీరు మాట్లాడుకోవడానికి ప్రశాంతమైన స్థలం.",
    ta: "உங்களுடன் நீங்களே பேசிக்கொள்ள ஒரு அமைதியான இடம்.",
    kn: "ನಿಮ್ಮೊಂದಿಗೆ ನೀವೇ ಮಾತನಾಡಲು ಶಾಂತ ಸ್ಥಳ.",
  },
  "topbar.settingsTitle": { en: "Settings", hi: "सेटिंग्स", te: "సెట్టింగ్‌లు", ta: "அமைப்புகள்", kn: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು" },
  "topbar.settingsSubtitle": {
    en: "Manage your FitBuddy preferences.",
    hi: "अपनी FitBuddy प्राथमिकताएँ प्रबंधित करें।",
    te: "మీ FitBuddy ప్రాధాన్యతలను నిర్వహించండి.",
    ta: "உங்கள் FitBuddy விருப்பங்களை நிர்வகிக்கவும்.",
    kn: "ನಿಮ್ಮ FitBuddy ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
  },
  "topbar.progressTitle": { en: "Progress", hi: "प्रगति", te: "పురోగతి", ta: "முன்னேற்றம்", kn: "ಪ್ರಗತಿ" },
  "topbar.progressSubtitle": {
    en: "See your recent fitness and wellbeing trends.",
    hi: "अपने हाल के फिटनेस और स्वास्थ्य रुझान देखें।",
    te: "మీ ఇటీవలి ఫిట్‌నెస్ మరియు వెల్‌బీయింగ్ ధోరణులను చూడండి.",
    ta: "உங்கள் சமீபத்திய உடற்தகுதி மற்றும் நல்வாழ்வு போக்குகளைப் பாருங்கள்.",
    kn: "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಫಿಟ್‌ನೆಸ್ ಮತ್ತು ಯೋಗಕ್ಷೇಮ ಪ್ರವೃತ್ತಿಗಳನ್ನು ನೋಡಿ.",
  },
  "topbar.cycleCareTitle": { en: "Women’s Care", hi: "महिला देखभाल", te: "మహిళా సంరక్షణ", ta: "பெண்கள் பராமரிப்பு", kn: "ಮಹಿಳಾ ಆರೈಕೆ" },
  "topbar.cycleCareSubtitle": {
    en: "Period and pregnancy-aware movement and care.",
    hi: "पीरियड और गर्भावस्था के अनुसार गतिविधि और देखभाल।",
    te: "పీరియడ్ మరియు గర్భధారణకు అనుగుణమైన కదలిక మరియు సంరక్షణ.",
    ta: "மாதவிடாய் மற்றும் கர்ப்ப காலத்திற்கு ஏற்ற இயக்கம் மற்றும் பராமரிப்பு.",
    kn: "ಪಿರಿಯಡ್ ಮತ್ತು ಗರ್ಭಧಾರಣೆಗೆ ಅನುಗುಣವಾದ ಚಲನೆ ಮತ್ತು ಆರೈಕೆ.",
  },

  // ── Common buttons / labels ──────────────────────────────────────────
  "common.login": { en: "Login", hi: "लॉगिन", te: "లాగిన్", ta: "உள்நுழை", kn: "ಲಾಗಿನ್" },
  "common.logout": { en: "Logout", hi: "लॉगआउट", te: "లాగ్అవుట్", ta: "வெளியேறு", kn: "ಲಾಗ್ ಔಟ್" },
  "common.getStarted": { en: "Get Started", hi: "शुरू करें", te: "ప్రారంభించండి", ta: "தொடங்குங்கள்", kn: "ಪ್ರಾರಂಭಿಸಿ" },
  "common.save": { en: "Save", hi: "सहेजें", te: "సేవ్ చేయండి", ta: "சேமி", kn: "ಉಳಿಸಿ" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें", te: "రద్దు చేయండి", ta: "ரத்து செய்", kn: "ರದ್ದುಮಾಡಿ" },
  "common.editProfile": { en: "Edit profile", hi: "प्रोफ़ाइल संपादित करें", te: "ప్రొఫైల్ సవరించండి", ta: "சுயவிவரத்தைத் திருத்து", kn: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ" },

  // ── Login page ───────────────────────────────────────────────────────
  "auth.welcomeBack": { en: "WELCOME BACK", hi: "वापसी पर स्वागत है", te: "తిరిగి స్వాగతం", ta: "மீண்டும் வரவேற்கிறோம்", kn: "ಮತ್ತೆ ಸ್ವಾಗತ" },
  "auth.loginTitle": { en: "Login", hi: "लॉगिन", te: "లాగిన్", ta: "உள்நுழை", kn: "ಲಾಗಿನ್" },
  "auth.loginSubtitle": {
    en: "Sign in to continue your FitBuddy plan.",
    hi: "अपनी FitBuddy योजना जारी रखने के लिए साइन इन करें।",
    te: "మీ FitBuddy ప్రణాళికను కొనసాగించడానికి సైన్ ఇన్ చేయండి.",
    ta: "உங்கள் FitBuddy திட்டத்தைத் தொடர உள்நுழையவும்.",
    kn: "ನಿಮ್ಮ FitBuddy ಯೋಜನೆಯನ್ನು ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.",
  },
  "auth.email": { en: "Email", hi: "ईमेल", te: "ఇమెయిల్", ta: "மின்னஞ்சல்", kn: "ಇಮೇಲ್" },
  "auth.password": { en: "Password", hi: "पासवर्ड", te: "పాస్‌వర్డ్", ta: "கடவுச்சொல்", kn: "ಪಾಸ್‌ವರ್ಡ್" },
  "auth.confirmPassword": { en: "Confirm password", hi: "पासवर्ड की पुष्टि करें", te: "పాస్‌వర్డ్‌ని నిర్ధారించండి", ta: "கடவுச்சொல்லை உறுதிப்படுத்தவும்", kn: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ" },
  "auth.continueWithGoogle": {
    en: "Continue with Google",
    hi: "Google से जारी रखें",
    te: "Googleతో కొనసాగించండి",
    ta: "Google மூலம் தொடரவும்",
    kn: "Google ಮೂಲಕ ಮುಂದುವರಿಸಿ",
  },
  "auth.forgotPassword": { en: "Forgot password?", hi: "पासवर्ड भूल गए?", te: "పాస్‌వర్డ్ మర్చిపోయారా?", ta: "கடவுச்சொல் மறந்துவிட்டதா?", kn: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?" },
  "auth.newHere": { en: "New here?", hi: "यहाँ नए हैं?", te: "ఇక్కడ కొత్తగా ఉన్నారా?", ta: "இங்கே புதியவரா?", kn: "ಇಲ್ಲಿ ಹೊಸಬರೇ?" },

  // ── Signup page ──────────────────────────────────────────────────────
  "auth.createAccountEyebrow": { en: "CREATE ACCOUNT", hi: "खाता बनाएं", te: "ఖాతా సృష్టించండి", ta: "கணக்கை உருவாக்கு", kn: "ಖಾತೆ ರಚಿಸಿ" },
  "auth.signupTitle": { en: "Sign up", hi: "साइन अप करें", te: "సైన్ అప్ చేయండి", ta: "பதிவு செய்யவும்", kn: "ಸೈನ್ ಅಪ್ ಮಾಡಿ" },
  "auth.name": { en: "Name", hi: "नाम", te: "పేరు", ta: "பெயர்", kn: "ಹೆಸರು" },
  "auth.createAccount": { en: "Create account", hi: "खाता बनाएं", te: "ఖాతా సృష్టించండి", ta: "கணக்கை உருவாக்கு", kn: "ಖಾತೆ ರಚಿಸಿ" },
  "auth.alreadyHaveAccount": {
    en: "Already have an account?",
    hi: "पहले से खाता है?",
    te: "ఇప్పటికే ఖాతా ఉందా?",
    ta: "ஏற்கனவே கணக்கு உள்ளதா?",
    kn: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
  },

  // ── Settings: language picker ───────────────────────────────────────
  "settings.language": { en: "Language", hi: "भाषा", te: "భాష", ta: "மொழி", kn: "ಭಾಷೆ" },
  "settings.chooseLanguage": {
    en: "Choose the language FitBuddy is displayed in.",
    hi: "वह भाषा चुनें जिसमें FitBuddy दिखाई दे।",
    te: "FitBuddy ప్రదర్శించే భాషను ఎంచుకోండి.",
    ta: "FitBuddy காட்டப்படும் மொழியைத் தேர்ந்தெடுக்கவும்.",
    kn: "FitBuddy ಪ್ರದರ್ಶಿಸುವ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  },
};
