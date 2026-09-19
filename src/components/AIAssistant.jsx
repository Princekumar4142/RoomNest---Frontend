import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X, Send, Bot, Sparkles, Volume2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const ROOM_KEYWORDS = {
  boys: { occupancy: "Boys" },
  girls: { occupancy: "Girls" },
  "co-ed": { occupancy: "Co-ed" },
  "co ed": { occupancy: "Co-ed" },
  coed: { occupancy: "Co-ed" },
  single: { roomType: "Single Room" },
  private: { roomType: "Single Room" },
  shared: { roomType: "Shared Room" },
  pg: { roomType: "PG" },
  hostel: { roomType: "Hostel" },
  food: { foodIncluded: "true" },
  meals: { foodIncluded: "true" },
  mess: { foodIncluded: "true" },
  khana: { foodIncluded: "true" },
  wifi: { amenities: "wifi" },
  ac: { amenities: "ac" },
  // Hindi keywords
  "लड़कों": { occupancy: "Boys" },
  "लड़कियों": { occupancy: "Girls" },
  "भोजन": { foodIncluded: "true" },
  "खाना": { foodIncluded: "true" },
};

const LOCATION_KEYWORDS = {
  kumarbagh: "Kumarbagh",
  gec: "GEC West Champaran",
  bettiah: "Bettiah",
  chanpatia: "Chanpatia",
  narkatiaganj: "Narkatiaganj",
  delhi: "Delhi University North Campus",
  du: "Delhi University North Campus",
  cuhp: "Central University of Himachal Pradesh",
  dharamshala: "Dharamshala",
  // Hindi
  "कुमारबाग": "Kumarbagh",
  "बेतिया": "Bettiah",
  "दिल्ली": "Delhi University North Campus",
};

function parseQuery(text) {
  const lower = text.toLowerCase();
  const params = {};

  // Extract budget
  const budgetMatch = lower.match(/(?:under|below|less than|kam|se kam|अंदर|कम)\s*(?:rs\.?|₹|रुपय?े?)?\s*(\d+)/i)
    || lower.match(/(\d+)\s*(?:se kam|ke andar|से कम|के अंदर)/i)
    || lower.match(/(?:rs\.?|₹)\s*(\d+)/i);
  if (budgetMatch) {
    params.maxRent = budgetMatch[1];
  }

  // Extract room keywords
  for (const [keyword, filter] of Object.entries(ROOM_KEYWORDS)) {
    if (lower.includes(keyword)) {
      Object.assign(params, filter);
    }
  }

  // Extract location
  for (const [keyword, campus] of Object.entries(LOCATION_KEYWORDS)) {
    if (lower.includes(keyword)) {
      params.campus = campus;
      break;
    }
  }

  return params;
}

function generateResponse(params, t, language) {
  const parts = [];

  if (language === "hi") {
    if (params.campus) parts.push(`📍 "${params.campus}" के पास`);
    if (params.occupancy === "Boys") parts.push("🧑 लड़कों का");
    if (params.occupancy === "Girls") parts.push("👩 लड़कियों का");
    if (params.roomType) parts.push(`🏠 ${params.roomType}`);
    if (params.foodIncluded) parts.push("🍽️ भोजन शामिल");
    if (params.maxRent) parts.push(`💰 ₹${Number(params.maxRent).toLocaleString("en-IN")} से कम`);

    if (parts.length > 0) {
      return `मैं ${parts.join(", ")} खोज रहा हूं... एक सेकंड! 🔍`;
    }
    return "माफ़ करें, मैं समझ नहीं पाया। कृपया बताएं: किस शहर में, लड़कों/लड़कियों का, बजट कितना, और भोजन चाहिए या नहीं?";
  } else if (language === "hi-en") {
    if (params.campus) parts.push(`📍 "${params.campus}" ke paas`);
    if (params.occupancy === "Boys") parts.push("🧑 Boys ka");
    if (params.occupancy === "Girls") parts.push("👩 Girls ka");
    if (params.roomType) parts.push(`🏠 ${params.roomType}`);
    if (params.foodIncluded) parts.push("🍽️ Khana included");
    if (params.maxRent) parts.push(`💰 ₹${Number(params.maxRent).toLocaleString("en-IN")} se kam`);

    if (parts.length > 0) {
      return `Main ${parts.join(", ")} dhundh raha hoon... Ek second! 🔍`;
    }
    return "Sorry, samajh nahi aaya. Please batayein: kis city mein, boys/girls ka, budget kitna, aur khana chahiye ya nahi?";
  } else {
    if (params.campus) parts.push(`📍 near "${params.campus}"`);
    if (params.occupancy === "Boys") parts.push("🧑 Boys");
    if (params.occupancy === "Girls") parts.push("👩 Girls");
    if (params.roomType) parts.push(`🏠 ${params.roomType}`);
    if (params.foodIncluded) parts.push("🍽️ Meals included");
    if (params.maxRent) parts.push(`💰 Under ₹${Number(params.maxRent).toLocaleString("en-IN")}`);

    if (parts.length > 0) {
      return `Searching for ${parts.join(", ")}... One moment! 🔍`;
    }
    return "Sorry, I didn't understand. Please tell me: which city, boys/girls, your budget, and if you need meals included.";
  }
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const { t, language, setLanguage, languages } = useLanguage();

  // Add greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        type: "bot",
        text: t("ai_greeting"),
        time: new Date(),
      }]);
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  function speak(text) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[🔍📍🧑👩🏠🍽️💰✅]/g, ""));
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  function startListening() {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : language === "hi-en" ? "hi-IN" : "en-IN";
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }

  function handleSend(text) {
    const msg = (text || input).trim();
    if (!msg) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: msg, time: new Date() }]);
    setInput("");

    // Parse and respond
    const params = parseQuery(msg);
    const response = generateResponse(params, t, language);

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", text: response, time: new Date() }]);
      speak(response);

      // Navigate if we found useful params
      const hasParams = Object.keys(params).length > 0;
      if (hasParams) {
        setTimeout(() => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, val]) => searchParams.set(key, val));
          navigate(`/search?${searchParams.toString()}`);
          
          const successMsg = language === "hi"
            ? "✅ आपकी खोज के परिणाम नीचे दिखाई दे रहे हैं!"
            : language === "hi-en"
            ? "✅ Aapke search ke results neeche dikh rahe hain!"
            : "✅ Your search results are shown below!";
          
          setMessages((prev) => [...prev, { type: "bot", text: successMsg, time: new Date() }]);
        }, 1200);
      }
    }, 600);
  }

  function handleQuickAction(text) {
    handleSend(text);
  }

  const quickActions = [
    t("ai_quick_boys"),
    t("ai_quick_girls"),
    t("ai_quick_budget"),
    t("ai_quick_single"),
  ];

  return (
    <>
      {/* Floating Mic Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-slate-800 text-white rotate-0"
            : "bg-gradient-to-br from-[#FD701E] to-[#E55A0A] text-white animate-bounce"
        }`}
        style={{ animationDuration: isOpen ? "0s" : "2s" }}
        aria-label="RoomBuddy AI Assistant"
      >
        {isOpen ? <X size={22} /> : <Mic size={22} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] max-h-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FD701E] to-[#E55A0A] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm">{t("ai_name")}</span>
                  <span className="bg-emerald-400 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Live</span>
                </div>
                <p className="text-white/80 text-[10px]">{t("ai_tagline")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Language quick toggle */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/20 text-white text-[10px] font-bold rounded-md px-1.5 py-1 border-none outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="text-slate-900">
                    {l.flag} {l.short}
                  </option>
                ))}
              </select>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 flex items-center gap-2 text-[11px] text-orange-700 dark:text-orange-300 font-semibold border-b border-orange-100 dark:border-orange-900">
              <Volume2 size={13} className="animate-pulse" />
              {language === "hi" ? "AI बोल रहा है..." : language === "hi-en" ? "AI bol raha hai..." : "AI is speaking..."}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[200px] max-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.type === "user"
                      ? "bg-[#FD701E] text-white rounded-br-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                  <div className={`text-[9px] mt-1 ${msg.type === "user" ? "text-white/60" : "text-slate-400"}`}>
                    {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="shrink-0 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-[#FD701E] px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2.5 flex items-center gap-2 bg-white dark:bg-slate-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? t("ai_listening") : t("ai_placeholder")}
              className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
            />
            
            {input.trim() ? (
              <button
                onClick={() => handleSend()}
                className="w-9 h-9 rounded-full bg-[#FD701E] text-white flex items-center justify-center hover:bg-[#E55A0A] transition-colors shrink-0"
              >
                <Send size={15} />
              </button>
            ) : (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white hover:scale-105"
                }`}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 pb-2 pt-0.5 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500">
            <span>🔒 {language === "hi" ? "सुरक्षित और निजी" : "Secure & Private"}</span>
            <span>{language === "hi" ? "RoomBuddy AI द्वारा संचालित" : "Powered by RoomBuddy AI"}</span>
          </div>
        </div>
      )}
    </>
  );
}
