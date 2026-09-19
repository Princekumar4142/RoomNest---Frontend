import { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    // Nav
    brand_sub: "Verified PGs & Co-Living",
    explore_pgs: "Explore PGs",
    find_roommates: "Find Roommates",
    how_it_works: "How It Works",
    list_your_pg: "List Your PG",
    admin_panel: "Admin Panel",
    sign_in: "Sign In",
    student_signup: "Student Sign Up",
    logout: "Logout",
    my_dashboard: "My Dashboard",
    select_campus: "Select Campus / Area",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",

    // Search & Home
    hero_title: "Verified Student PGs & Hostels Near Campus",
    hero_subtitle: "100% physically inspected rooms, zero brokerage, walking distance to your college gate.",
    search_placeholder: "Search college, campus gate, or locality (e.g. GEC Kumarbagh)...",
    search_btn: "Find Verified Rooms",
    zero_brokerage: "Zero Brokerage",
    verified_rooms: "Verified Accommodation",

    // Room & Distance
    campus_proximity: "Campus Proximity",
    live_map_title: "Live GPS Route & Distance Map",
    live_location: "Your Live Location",
    room_location: "Selected Accommodation",
    campus_gate: "College / University Gate",
    distance_you_to_room: "Live GPS to Room",
    distance_room_to_campus: "Room to Campus Gate",
    walking_time: "Walking Time",
    cycling_time: "Bicycle Time",
    driving_transit: "Driving / Auto",
    gps_active: "Live GPS Active",
    gps_locating: "Locating your live position...",
    gps_enable: "Enable Live GPS",
    gps_refresh: "Refresh Live GPS",
    google_maps_route: "Open in Google Maps",
    to_room_directions: "Directions to Room",
    to_campus_directions: "Directions to Campus",
    
    // Visit Schedule
    schedule_visit_title: "Schedule Free Campus Visit",
    book_visit_slot: "Book Visit Slot",
    visit_success_msg: "Visit scheduled! The owner has been notified via WhatsApp.",
    verified_owner: "Property Verified Owner",
    call_owner: "Call Owner",
    whatsapp_owner: "WhatsApp",
    in_app_chat: "In-app Chat",
    rent_breakdown: "Transparent Cost Breakdown",
    per_month: "/ month",
    deposit: "Security Deposit",
    food_included: "Food / Mess Included",
    curfew_timing: "Gate Timings & Curfew",
    facilities: "Facilities & Student Amenities",
    write_review: "Write Review",
  },
  hi: {
    // Nav
    brand_sub: "सत्यापित पीजी और हॉस्टल",
    explore_pgs: "पीजी खोजें",
    find_roommates: "रूममेट खोजें",
    how_it_works: "यह कैसे काम करता है",
    list_your_pg: "अपना पीजी लिस्ट करें",
    admin_panel: "एडमिन पैनल",
    sign_in: "लॉग इन",
    student_signup: "छात्र साइन अप",
    logout: "लॉग आउट",
    my_dashboard: "मेरा डैशबोर्ड",
    select_campus: "कैंपस / क्षेत्र चुनें",
    dark_mode: "डार्क मोड",
    light_mode: "लाइट मोड",

    // Search & Home
    hero_title: "कैंपस के पास सत्यापित छात्र पीजी और हॉस्टल",
    hero_subtitle: "100% भौतिक रूप से जांची गई संपत्तियां, शून्य ब्रोकरेज, कॉलेज गेट से पैदल दूरी।",
    search_placeholder: "कॉलेज, गेट या इलाका खोजें (उदा. जीईसी कुमारबाग)...",
    search_btn: "सत्यापित कमरे खोजें",
    zero_brokerage: "शून्य ब्रोकरेज",
    verified_rooms: "सत्यापित आवास",

    // Room & Distance
    campus_proximity: "कैंपस से नजदीकी",
    live_map_title: "लाइव जीपीएस रूट और दूरी मैप",
    live_location: "आपकी लाइव लोकेशन",
    room_location: "चुना हुआ पीजी / रूम",
    campus_gate: "कॉलेज / यूनिवर्सिटी गेट",
    distance_you_to_room: "आपकी लोकेशन से रूम तक",
    distance_room_to_campus: "रूम से कॉलेज गेट तक",
    walking_time: "पैदल समय",
    cycling_time: "साइकिल से",
    driving_transit: "ऑटो / बाइक",
    gps_active: "लाइव जीपीएस कनेक्टेड",
    gps_locating: "आपकी लोकेशन ट्रैक की जा रही है...",
    gps_enable: "लाइव जीपीएस चालू करें",
    gps_refresh: "जीपीएस रीफ़्रेश करें",
    google_maps_route: "गूगल मैप्स पर रूट खोलें",
    to_room_directions: "रूम तक का रास्ता",
    to_campus_directions: "कॉलेज तक का रास्ता",
    
    // Visit Schedule
    schedule_visit_title: "मुफ़्त कैंपस विज़िट शेड्यूल करें",
    book_visit_slot: "विज़िट स्लॉट बुक करें",
    visit_success_msg: "विज़िट बुक हो गई! रूम मालिक को व्हाट्सएप पर सूचना भेज दी गई है।",
    verified_owner: "सत्यापित रूम मालिक",
    call_owner: "कॉल करें",
    whatsapp_owner: "व्हाट्सएप",
    in_app_chat: "ऐप में चैट",
    rent_breakdown: "किराया विवरण",
    per_month: "/ महीना",
    deposit: "सिक्योरिटी डिपॉज़िट",
    food_included: "खाना / मेस शामिल",
    curfew_timing: "गेट बंद होने का समय",
    facilities: "सुविधाएं और एमेनिटीज",
    write_review: "रिव्यू लिखें",
  },
  "hi-en": {
    // Hinglish
    brand_sub: "Verified PGs & Co-Living",
    explore_pgs: "PGs Explore Karein",
    find_roommates: "Roommate Khojein",
    how_it_works: "Ye Kaise Kaam Karta Hai",
    list_your_pg: "Apna PG List Karein",
    admin_panel: "Admin Panel",
    sign_in: "Sign In",
    student_signup: "Student Sign Up",
    logout: "Log Out",
    my_dashboard: "Mera Dashboard",
    select_campus: "Campus / Area Chunein",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",

    // Search & Home
    hero_title: "Campus Ke Paas Verified Student PGs & Hostels",
    hero_subtitle: "100% physically inspected rooms, zero brokerage, college gate se walking distance.",
    search_placeholder: "College, gate ya locality search karein (jaise GEC Kumarbagh)...",
    search_btn: "Verified Rooms Dhoondhein",
    zero_brokerage: "Zero Brokerage",
    verified_rooms: "Verified Accommodation",

    // Room & Distance
    campus_proximity: "Campus Proximity",
    live_map_title: "Live GPS Route & Distance Map",
    live_location: "Aapki Live Location",
    room_location: "Selected Room",
    campus_gate: "College / University Gate",
    distance_you_to_room: "Aapki Location Se Room Tak",
    distance_room_to_campus: "Room Se College Gate Tak",
    walking_time: "Paidal Time",
    cycling_time: "Cycle Se",
    driving_transit: "Bike / Auto",
    gps_active: "Live GPS Connected",
    gps_locating: "Location track ho rahi hai...",
    gps_enable: "Live GPS On Karein",
    gps_refresh: "GPS Refresh Karein",
    google_maps_route: "Google Maps Par Route Dekhein",
    to_room_directions: "Room Tak Ka Route",
    to_campus_directions: "College Tak Ka Route",
    
    // Visit Schedule
    schedule_visit_title: "Free Visit Schedule Karein",
    book_visit_slot: "Visit Slot Book Karein",
    visit_success_msg: "Visit schedule ho gayi! Owner ko WhatsApp pe notification chala gaya.",
    verified_owner: "Verified Room Owner",
    call_owner: "Call Owner",
    whatsapp_owner: "WhatsApp",
    in_app_chat: "Chat Karein",
    rent_breakdown: "Total Rent Breakdown",
    per_month: "/ month",
    deposit: "Security Deposit",
    food_included: "Food / Mess Included",
    curfew_timing: "Curfew & Gate Timings",
    facilities: "Student Facilities",
    write_review: "Review Likhein",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  languages: [],
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("roomnest_lang");
      if (saved && translations[saved]) return saved;
    } catch {
      // ignore
    }
    return "en";
  });

  function setLanguage(lang) {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem("roomnest_lang", lang);
      } catch {
        // ignore
      }
    }
  }

  function t(key, fallback = "") {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || fallback || key;
  }

  const languages = [
    { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
    { code: "hi", label: "हिंदी", short: "HI", flag: "🇮🇳" },
    { code: "hi-en", label: "Hinglish", short: "HIN", flag: "🇮🇳" },
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
