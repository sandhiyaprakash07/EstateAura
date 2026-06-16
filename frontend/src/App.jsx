import { useEffect, useState, useRef } from "react";
import { 
  Search, 
  MapPin, 
  IndianRupee, 
  SlidersHorizontal, 
  Home, 
  X, 
  Sparkles, 
  ArrowUpDown, 
  Mail, 
  Phone, 
  User, 
  MessageSquare, 
  CheckCircle,
  Wifi,
  Car,
  Shield,
  Waves,
  Heart,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Send,
  Bot,
  Settings,
  Bell,
  Calendar,
  Grid,
  Clock
} from "lucide-react";

function App() {
  // Navigation State: 'explore' | 'favorites' | 'ai' | 'profile'
  const [currentScreen, setCurrentScreen] = useState("explore");
  
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  const [loading, setLoading] = useState(true); // Splash control
  const [dataLoading, setDataLoading] = useState(true); // Backend fetch indicator
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("estateaura_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Inquiry history logs (stored in state & synchronized with localStorage)
  const [inquiries, setInquiries] = useState(() => {
    const saved = localStorage.getItem("estateaura_inquiries");
    return saved ? JSON.parse(saved) : [
      {
        id: 101,
        propertyName: "Premium 2BHK Apartment",
        propertyImage: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=400&q=80",
        location: "Chennai",
        price: 15000,
        timestamp: "6/16/2026, 3:15:00 PM",
        name: "Mock User",
        email: "user@estateaura.com",
        message: "Hi, I am interested in visiting this 2BHK flat. Let me know when is the best time.",
        status: "Responded"
      }
    ];
  });
  
  // Modal contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [modalTab, setModalTab] = useState("details");

  // AI Chat State
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your EstateAura Assistant. Ask me anything about properties, locations, or budgets. Try typing something like: *'I need a 2BHK under 30k near school'*.",
      properties: []
    }
  ]);

  // Profile Form states (mock options)
  const [settings, setSettings] = useState({
    notifications: true,
    smsAlerts: false,
    darkMode: false,
    currency: "INR"
  });

  const chatEndRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping, currentScreen]);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds splash
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    setDataLoading(true);
    fetch("http://localhost:5000/properties")
      .then((res) => {
        if (!res.ok) throw new Error("Server response not ok");
        return res.json();
      })
      .then((data) => {
        // Map database response to enriched descriptions to facilitate NLP matching
        const enriched = data.map(p => {
          let desc = p.description;
          if (p.type === "2BHK" && p.location === "Chennai") {
            desc += " Located in a prime residential hub near top public schools, parks, and bus terminals.";
          } else if (p.type === "Villa" && p.location === "Bangalore") {
            desc += " Premium luxury villa in Bangalore complete with private pool, adjacent gardens, and international school zones.";
          }
          return { ...p, description: desc };
        });
        setProperties(enriched);
        setDataLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        // Fallback mock data in case backend isn't running
        setProperties([
          {
            id: 1,
            title: "Premium 2BHK Apartment",
            price: 15000,
            location: "Chennai",
            type: "2BHK",
            description: "Spacious modern apartment in Chennai featuring a private balcony, dedicated parking space, and top-tier security access. Located near top public schools.",
            image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 2,
            title: "Royal Oak Villa",
            price: 30000,
            location: "Bangalore",
            type: "Villa",
            description: "Exquisite luxury villa in Bangalore complete with a lush private garden, custom swimming pool, and premium modular kitchen, near international schools.",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 3,
            title: "Cozy 1BHK Studio",
            price: 8500,
            location: "Chennai",
            type: "1BHK",
            description: "A compact, highly functional studio apartment in Chennai perfect for students and working professionals, near colleges and local schools.",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 4,
            title: "Skyline 3BHK Penthouse",
            price: 45000,
            location: "Mumbai",
            type: "3BHK",
            description: "Spectacular penthouse unit in Mumbai with panoramic city views, floor-to-ceiling windows, private terrace, and custom pool access.",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: 5,
            title: "Serene Lakeview Villa",
            price: 55000,
            location: "Bangalore",
            type: "Villa",
            description: "Nestled in Bangalore's quiet enclave, this villa offers tranquility with gorgeous lake views, private gym, and swimming pool access.",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
          }
        ]);
        setDataLoading(false);
      });
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("estateaura_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Save inquiries to localStorage
  useEffect(() => {
    localStorage.setItem("estateaura_inquiries", JSON.stringify(inquiries));
  }, [inquiries]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Extract unique property types for chips
  const propertyTypes = ["All", ...new Set(properties.map(p => p.type))];

  // Filtering & Sorting logic for Main Dashboard
  const filteredProperties = properties
    .filter((p) => {
      const matchesSearch = p.location.toLowerCase().includes(search.toLowerCase()) || 
                            p.title.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = maxPrice === "" || p.price <= parseFloat(maxPrice);
      const matchesType = selectedType === "All" || p.type === selectedType;
      return matchesSearch && matchesPrice && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "price-low-high") return a.price - b.price;
      if (sortBy === "price-high-low") return b.price - a.price;
      return 0; // default (unsorted / DB order)
    });

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setMaxPrice("");
    setSelectedType("All");
    setSortBy("default");
  };

  // Submission handler for Details Modal Contact Form
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);

      // Create new inquiry record
      const newInquiry = {
        id: Date.now(),
        propertyName: selectedProperty.title,
        propertyImage: selectedProperty.image,
        location: selectedProperty.location,
        price: selectedProperty.price,
        timestamp: new Date().toLocaleString(),
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message || "Consultation request regarding layout and site touring.",
        status: "Pending Review"
      };

      setInquiries(prev => [newInquiry, ...prev]);

      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setShowToast(false), 4000);
    }, 1200);
  };

  // Client-Side Natural Language Processing Parser
  const parseAIQuery = (query) => {
    const q = query.toLowerCase();

    const typeMatch = q.match(/\b(1bhk|2bhk|3bhk|4bhk|villa|apartment|studio)\b/i);
    const parsedType = typeMatch ? typeMatch[1].toUpperCase() : null;

    let parsedLocation = null;
    if (q.includes("chennai")) parsedLocation = "Chennai";
    else if (q.includes("bangalore") || q.includes("bengaluru")) parsedLocation = "Bangalore";
    else if (q.includes("mumbai") || q.includes("bombay")) parsedLocation = "Mumbai";

    let maxPriceLimit = null;
    const priceWithSuffix = q.match(/\b(\d+(\.\d+)?)\s*(k|l|lakh|lakhs|cr)\b/i);
    if (priceWithSuffix) {
      const val = parseFloat(priceWithSuffix[1]);
      const suffix = priceWithSuffix[3].toLowerCase();
      if (suffix === "k") maxPriceLimit = val * 1000;
      else if (suffix.startsWith("l")) maxPriceLimit = val * 100000;
      else if (suffix.startsWith("cr")) maxPriceLimit = val * 10000000;
    } else {
      const standaloneNum = q.match(/\b(\d{4,8})\b/);
      if (standaloneNum) {
        maxPriceLimit = parseInt(standaloneNum[1]);
      }
    }

    const keywords = [];
    if (q.includes("school") || q.includes("education")) keywords.push("school");
    if (q.includes("pool") || q.includes("swimming")) keywords.push("pool");
    if (q.includes("garden") || q.includes("lawn")) keywords.push("garden");
    if (q.includes("parking") || q.includes("garage") || q.includes("car")) keywords.push("parking");
    if (q.includes("balcony") || q.includes("terrace")) keywords.push("balcony");
    if (q.includes("wifi") || q.includes("internet")) keywords.push("wifi");
    if (q.includes("security") || q.includes("guard") || q.includes("cctv")) keywords.push("security");

    return { parsedType, parsedLocation, maxPriceLimit, keywords };
  };

  // Handle AI Inquiry Submissions
  const handleAISend = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text, properties: [] }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { parsedType, parsedLocation, maxPriceLimit, keywords } = parseAIQuery(text);

      const matched = properties.filter((p) => {
        if (parsedType && p.type.toUpperCase() !== parsedType) return false;
        if (parsedLocation && p.location !== parsedLocation) return false;
        if (maxPriceLimit && p.price > maxPriceLimit) return false;

        if (keywords.length > 0) {
          const content = (p.title + " " + p.description).toLowerCase();
          const hasKeywordMatch = keywords.some(k => content.includes(k));
          if (!hasKeywordMatch) return false;
        }
        return true;
      });

      let responseText = "";
      if (matched.length > 0) {
        responseText = `I found **${matched.length} property** matching your request. `;
        const filters = [];
        if (parsedType) filters.push(`layout **${parsedType}**`);
        if (parsedLocation) filters.push(`in **${parsedLocation}**`);
        if (maxPriceLimit) filters.push(`under **₹${maxPriceLimit.toLocaleString()}**`);
        if (keywords.length > 0) filters.push(`featuring **${keywords.join(", ")}**`);

        responseText += `Here are the matching options:`;
      } else {
        responseText = "I couldn't find any properties matching those exact terms. However, here are some suggested properties you might like:";
      }

      setChatMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: responseText, 
          properties: matched.length > 0 ? matched : properties.slice(0, 3) 
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  // Map dummy amenities based on property type to look rich
  const getAmenities = (type) => {
    const defaultAmenities = [
      { icon: <Wifi className="w-4 h-4" />, name: "High-Speed Wi-Fi" },
      { icon: <Car className="w-4 h-4" />, name: "Secure Parking" },
      { icon: <Shield className="w-4 h-4" />, name: "24/7 Security" }
    ];
    if (type === "Villa") {
      return [
        ...defaultAmenities,
        { icon: <Waves className="w-4 h-4" />, name: "Private Pool" },
        { icon: <Home className="w-4 h-4" />, name: "Private Garden" }
      ];
    }
    if (type === "3BHK" || type === "2BHK") {
      return [
        ...defaultAmenities,
        { icon: <Waves className="w-4 h-4" />, name: "Clubhouse Access" }
      ];
    }
    return defaultAmenities;
  };

  // Toggle user profile options
  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter properties in Favorites tab
  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  // ✅ SPLASH SCREEN UI
  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-slate-950 text-white relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="z-10 flex flex-col items-center animate-fade-in-up">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-ping duration-1000"></div>
            <img
              src="/logo.png"
              alt="EstateAura Logo"
              className="relative w-28 h-28 object-contain rounded-2xl bg-white p-2 border border-slate-100 shadow-2xl animate-pulse"
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent mb-2">
            ESTATEAURA
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-8">
            Premium Property Finder
          </p>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[loading_2.2s_ease-in-out_infinite]" style={{ width: "80%" }}></div>
          </div>
        </div>

        {/* CSS for custom anims */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(20%); }
            100% { transform: translateX(100%); }
          }
        `}} />
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col transition-colors duration-300 pb-16 sm:pb-0">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-slate-200 text-xs py-2 px-6 flex justify-between items-center border-b border-indigo-950">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
          Discover modern spaces with the estate recommendation engine
        </span>
        <div className="hidden sm:flex gap-4">
          <a href="#" className="hover:text-white transition">List Your Property</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition">Agent Services</a>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => setCurrentScreen("explore")} className="flex items-center gap-2.5 text-left focus:outline-none">
            <img
              src="/logo.png"
              alt="EstateAura Logo"
              className="w-10 h-10 object-contain rounded-lg border border-slate-100 shadow-sm bg-white p-0.5"
            />
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              Estate<span className="text-indigo-600">Aura</span>
            </span>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-2 font-semibold text-sm">
            <button 
              onClick={() => setCurrentScreen("explore")}
              className={`px-4 py-2 rounded-xl transition ${
                currentScreen === "explore" 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              Explore Catalog
            </button>
            <button 
              onClick={() => setCurrentScreen("favorites")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentScreen === "favorites" 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <Heart className="w-4 h-4" /> Favorites
            </button>
            <button 
              onClick={() => setCurrentScreen("ai")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentScreen === "ai" 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> AI recommendation
            </button>
            <button 
              onClick={() => setCurrentScreen("profile")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                currentScreen === "profile" 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Quick Favorites count indicator for desktop */}
            <button 
              onClick={() => setCurrentScreen("favorites")}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition hidden sm:inline-block"
              title="View Favorites"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setCurrentScreen("ai")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-100"
            >
              <Bot className="w-4 h-4" /> AI Finder
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-3 z-40 sm:hidden shadow-lg">
        <button 
          onClick={() => setCurrentScreen("explore")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentScreen === "explore" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <Home className="w-5 h-5" />
          Explore
        </button>
        <button 
          onClick={() => setCurrentScreen("favorites")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold relative ${
            currentScreen === "favorites" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <Heart className="w-5 h-5" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {favorites.length}
            </span>
          )}
          Favorites
        </button>
        <button 
          onClick={() => setCurrentScreen("ai")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentScreen === "ai" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Finder
        </button>
        <button 
          onClick={() => setCurrentScreen("profile")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentScreen === "profile" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </button>
      </nav>

      {/* SCREEN CONTENT CONDITIONAL RENDERING */}
      <div className="flex-1 flex flex-col">
        
        {/* ============================================================== */}
        {/* 1. EXPLORE SCREEN & SEARCH / FILTER                            */}
        {/* ============================================================== */}
        {currentScreen === "explore" && (
          <div className="animate-fade-in-up flex-1 flex flex-col">
            
            {/* HERO HERO SECTION */}
            <section className="bg-gradient-to-b from-indigo-50/70 to-transparent pt-12 pb-8 px-6 relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-10 left-1/3 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-4xl mx-auto text-center relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4 animate-bounce">
                  <Sparkles className="w-3 h-3" /> Exclusive Housing Catalog
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] mb-4">
                  Find Your Next <br className="sm:hidden" />
                  <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                    Dream Living Space
                  </span>
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg mb-8 font-light">
                  Search top-tier residential listings in premier cities. Seamlessly filter properties by price, layout type, and exact location.
                </p>
              </div>
            </section>

            {/* DASHBOARD: SEARCH & FILTER CONTROLS */}
            <section className="px-6 mb-10 relative z-20">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/80 border border-slate-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
                    {/* Location Input */}
                    <div className="md:col-span-5 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Location / Keyword</label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search by city or property name..."
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition text-sm font-medium"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                          <button 
                            onClick={() => setSearch("")} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Price Range Slider / Input */}
                    <div className="md:col-span-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Max Budget</label>
                        <span className="text-sm font-semibold text-indigo-600">
                          {maxPrice ? `₹${Number(maxPrice).toLocaleString()}` : "Any budget"}
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <IndianRupee className="absolute left-3.5 text-slate-400 w-4.5 h-4.5" />
                        <input
                          type="number"
                          placeholder="E.g., 25000"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition text-sm font-medium"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Sort selector */}
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                      <div className="relative">
                        <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                        <select
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition text-sm font-medium appearance-none cursor-pointer"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="default">Featured</option>
                          <option value="price-low-high">Price: Low to High</option>
                          <option value="price-high-low">Price: High to Low</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Quick Property Type Chips */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filters:</span>
                      {propertyTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                            selectedType === type
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {(search || maxPrice || selectedType !== "All" || sortBy !== "default") && (
                      <button
                        onClick={handleResetFilters}
                        className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition"
                      >
                        <RefreshCw className="w-3 h-3" /> Clear Active Filters
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </section>

            {/* PROPERTIES LISTINGS GRID */}
            <main className="flex-1 px-6 pb-20">
              <div className="max-w-6xl mx-auto">
                
                {/* Header section of results */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Recommended Properties
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Showing {filteredProperties.length} results matching your criteria
                    </p>
                  </div>
                </div>

                {/* SKELETON LOADER */}
                {dataLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse">
                        <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3.5 bg-slate-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                        <div className="pt-2 flex justify-between">
                          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProperties.length === 0 ? (
                  /* EMPTY STATE */
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-lg mx-auto mt-6">
                    <div className="inline-flex p-4 bg-indigo-50 rounded-full text-indigo-600 mb-4">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                      We couldn't find any listings matching your current filter set. Try removing your search filter, increasing your budget limit, or selecting "All" categories.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition"
                    >
                      Reset Search Filters
                    </button>
                  </div>
                ) : (
                  /* PROPERTIES GRID */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProperties.map((p) => {
                      const isFavorite = favorites.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProperty(p)}
                          className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                        >
                          {/* IMAGE CONTAINER */}
                          <div className="relative h-52 overflow-hidden bg-slate-100">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-80"></div>
                            
                            {/* Category Badge */}
                            <div className="absolute top-3.5 left-3.5">
                              <span className="inline-flex px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-900 text-xs font-bold rounded-lg shadow-sm uppercase tracking-wider">
                                {p.type}
                              </span>
                            </div>

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => toggleFavorite(p.id, e)}
                              className="absolute top-3.5 right-3.5 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-slate-600 hover:text-red-500 hover:scale-105 transition shadow-sm"
                            >
                              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                            </button>

                            {/* Price on Image */}
                            <div className="absolute bottom-3.5 left-3.5 text-white">
                              <p className="text-xl font-extrabold flex items-center">
                                ₹{p.price.toLocaleString()}
                                <span className="text-xs font-medium text-slate-200 ml-1">/ month</span>
                              </p>
                            </div>
                          </div>

                          {/* CONTENT BODY */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition duration-300">
                                {p.title}
                              </h3>
                              <p className="text-slate-500 text-xs flex items-center gap-1 mt-1.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {p.location}
                              </p>
                              <p className="text-slate-600 text-xs leading-relaxed mt-3.5 line-clamp-2">
                                {p.description}
                              </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                              <div className="flex gap-3 text-[11px] text-slate-500 font-semibold">
                                <span>• Layout: {p.type}</span>
                              </div>
                              <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                View details <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </main>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. FAVORITES / SAVED SCREEN                                    */}
        {/* ============================================================== */}
        {currentScreen === "favorites" && (
          <div className="animate-fade-in-up flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
            <div className="mb-8">
              <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Bookmarked Homes
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Your Saved Properties
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Access layouts and properties you have favorited for easy consulting.
              </p>
            </div>

            {favoriteProperties.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md mx-auto">
                <div className="inline-flex p-4 bg-red-50 rounded-full text-red-500 mb-4">
                  <Heart className="w-8 h-8 fill-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No favorites saved yet</h3>
                <p className="text-slate-500 text-sm mt-2">
                  Browse catalog properties, select the Heart icon on top of any listing card, and access them here anytime.
                </p>
                <button
                  onClick={() => setCurrentScreen("explore")}
                  className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition"
                >
                  Explore Properties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {favoriteProperties.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProperty(p)}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-80"></div>
                      
                      <div className="absolute top-3.5 left-3.5">
                        <span className="inline-flex px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-900 text-xs font-bold rounded-lg shadow-sm uppercase tracking-wider">
                          {p.type}
                        </span>
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className="absolute top-3.5 right-3.5 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 hover:scale-105 transition shadow-sm"
                      >
                        <Heart className="w-4 h-4 fill-red-500" />
                      </button>

                      <div className="absolute bottom-3.5 left-3.5 text-white">
                        <p className="text-xl font-extrabold flex items-center">
                          ₹{p.price.toLocaleString()}
                          <span className="text-xs font-medium text-slate-200 ml-1">/ month</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition duration-300">
                          {p.title}
                        </h3>
                        <p className="text-slate-500 text-xs flex items-center gap-1 mt-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {p.location}
                        </p>
                        <p className="text-slate-600 text-xs leading-relaxed mt-3.5 line-clamp-2">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-semibold">• Layout: {p.type}</span>
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          View details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. AI RECOMMENDATION SCREEN (FULL PAGE CHAT)                   */}
        {/* ============================================================== */}
        {currentScreen === "ai" && (
          <div className="animate-fade-in-up flex-1 flex flex-col bg-slate-900 text-slate-100 relative max-w-5xl mx-auto w-full border-x border-slate-800">
            
            {/* Header info */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/10">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">AI Recommendation Assistant</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Describe layout specifications, budgets, or keywords. E.g. school, pool, balcony.</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/20 px-3 py-1 rounded-full font-bold border border-emerald-950/30">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                NLP ENGINE ONLINE
              </div>
            </div>

            {/* Chat message display area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[400px] bg-slate-950/15">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  
                  {/* Sender title */}
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 px-1 tracking-wider">
                    {msg.sender === "user" ? "You" : "EstateAura Agent"}
                  </span>

                  {/* Chat bubble */}
                  <div 
                    className={`text-sm px-5 py-3.5 rounded-3xl max-w-[80%] leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Card rendering in feed */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="w-full mt-4 flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar">
                      {msg.properties.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedProperty(p)}
                          className="flex-shrink-0 w-72 bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/50 shadow-lg cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
                        >
                          <div className="h-36 relative bg-slate-800">
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                            
                            <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-indigo-600/90 text-[10px] font-bold rounded-lg text-white uppercase tracking-wider">
                              {p.type}
                            </span>
                            
                            <span className="absolute bottom-3 left-3 text-white text-base font-extrabold">
                              ₹{p.price.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <h4 className="text-sm font-bold text-slate-100 line-clamp-1">
                              {p.title}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {p.location}
                            </p>
                            <p className="text-slate-400 text-xs line-clamp-2 pt-1 font-light leading-relaxed">
                              {p.description}
                            </p>
                            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">{p.type} Layout</span>
                              <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                                View Details <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 px-1">EstateAura Agent</span>
                  <div className="bg-slate-900 text-slate-300 rounded-3xl rounded-tl-none px-5 py-3.5 border border-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions grid */}
            <div className="px-6 py-4 bg-slate-950/30 border-t border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
                Suggested Search Prompts:
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => handleAISend("I need 2BHK under 50L near school")}
                  className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl transition font-medium"
                >
                  🏫 2BHK under 50L near school
                </button>
                <button
                  onClick={() => handleAISend("show me villas in Bangalore with pool")}
                  className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl transition font-medium"
                >
                  🏊 Villa with pool in Bangalore
                </button>
                <button
                  onClick={() => handleAISend("1BHK studio under 15000 in Chennai")}
                  className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl transition font-medium"
                >
                  🏠 Studio under 15k in Chennai
                </button>
              </div>
            </div>

            {/* Chat Input Container */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAISend();
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  placeholder="E.g., I need a 2BHK under 20000 near school in Chennai..."
                  className="flex-1 px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-xs font-medium"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 font-bold text-xs"
                >
                  <Send className="w-4 h-4" /> Send Request
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 4. PROFILE SCREEN (MISSING SCREEN)                             */}
        {/* ============================================================== */}
        {currentScreen === "profile" && (
          <div className="animate-fade-in-up flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
            
            {/* Screen Header */}
            <div className="mb-8">
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                User Dashboard
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Your Profile Portal
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Manage inquiries, preferences, and consult your transaction logs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT PROFILE CARD */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Core User Details */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-md mx-auto relative">
                    EA
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" title="Active"></span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">EstateAura Client</h3>
                    <p className="text-xs text-slate-400">client@estateaura.com</p>
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full mt-2 uppercase tracking-wide">
                      Premium account
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xl font-extrabold text-indigo-600 block">{favorites.length}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Favorites</span>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-indigo-600 block">{inquiries.length}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Inquiries</span>
                    </div>
                  </div>
                </div>

                {/* Account Preferences (Mock Settings) */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Settings className="w-4.5 h-4.5 text-slate-500" /> Account Preferences
                  </h4>

                  <div className="space-y-3 pt-2">
                    
                    {/* Toggle Notifications */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">Email Alerts</span>
                        <span className="text-slate-400 text-[10px]">Notify on new listings</span>
                      </div>
                      <button 
                        onClick={() => toggleSetting("notifications")}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${
                          settings.notifications ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          settings.notifications ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    {/* Toggle SMS Alerts */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">SMS Tour Updates</span>
                        <span className="text-slate-400 text-[10px]">Instant tour schedules</span>
                      </div>
                      <button 
                        onClick={() => toggleSetting("smsAlerts")}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${
                          settings.smsAlerts ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          settings.smsAlerts ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    {/* Default Currency */}
                    <div className="flex justify-between items-center text-xs pt-1.5">
                      <div>
                        <span className="font-bold text-slate-700 block">Preferred Currency</span>
                        <span className="text-slate-400 text-[10px]">Pricing display token</span>
                      </div>
                      <select
                        className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      >
                        <option value="INR">Rupee (₹)</option>
                        <option value="USD">Dollar ($)</option>
                      </select>
                    </div>

                  </div>
                </div>

              </div>

              {/* RIGHT SIDE: INQUIRIES HISTORY LOG */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Inquiry log header */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" /> Consultations & Tour History
                    </h3>
                    <span className="text-xs bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-bold">
                      {inquiries.length} inquiries sent
                    </span>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Mail className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-900">No inquiries found</h4>
                      <p className="text-slate-400 text-xs max-w-xs mx-auto">
                        Your submitted broker inquiries from property pages will appear here in chronological logs.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inquiries.map((inq) => (
                        <div 
                          key={inq.id}
                          className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition duration-300 flex flex-col md:flex-row gap-4"
                        >
                          {/* Property Mini Image */}
                          <div className="w-full md:w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            <img src={inq.propertyImage} alt={inq.propertyName} className="w-full h-full object-cover" />
                          </div>

                          {/* Details Content */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{inq.propertyName}</h4>
                                <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-3 h-3 text-indigo-500" /> {inq.location} • ₹{inq.price.toLocaleString()}/mo
                                </p>
                              </div>
                              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                                {inq.timestamp}
                              </span>
                            </div>

                            {/* Message text */}
                            <div className="bg-white rounded-xl p-3 border border-slate-100/50 text-[11px] text-slate-600 italic">
                              "{inq.message}"
                            </div>

                            {/* Status and logs info */}
                            <div className="flex justify-between items-center text-[10px] pt-1">
                              <span className="text-slate-400 font-medium">Logged client email: {inq.email}</span>
                              <span className={`inline-flex items-center gap-1 font-bold ${
                                inq.status === "Responded" 
                                  ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                                  : "text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  inq.status === "Responded" ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
                                }`}></span>
                                {inq.status}
                              </span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      {/* FOOTER - Hide on mobile if currentScreen is AI chat to keep it clean */}
      {!(currentScreen === "ai") && (
        <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900 mt-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between text-center md:text-left">
            
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-white">
                <img
                  src="/logo.png"
                  alt="EstateAura Logo"
                  className="w-8 h-8 object-contain bg-white rounded-lg p-0.5"
                />
                <span className="text-lg font-extrabold tracking-tight">EstateAura</span>
              </div>
              <p className="text-xs max-w-sm text-slate-500">
                The premier property listing and recommendation platform. Find luxury homes, apartments, and villas tailored with custom layout filters.
              </p>
            </div>

            <div className="md:col-span-4 flex justify-center gap-8 text-xs font-medium">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Broker Portal</a>
            </div>

            <div className="md:col-span-3 text-xs text-slate-500 md:text-right">
              © {new Date().getFullYear()} EstateAura Inc. All rights reserved.
            </div>

          </div>
        </footer>
      )}

      {/* ✅ PROPERTY DETAIL MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          
          {/* Modal Container */}
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl border border-slate-100 shadow-2xl relative overflow-hidden my-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedProperty(null);
                setModalTab("details");
              }}
              className="absolute top-4 right-4 z-10 p-2.5 bg-slate-950/70 text-white hover:bg-slate-950 rounded-full transition shadow-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Banner Image */}
            <div className="h-64 sm:h-72 w-full relative">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
              
              <div className="absolute bottom-4 left-6 text-white">
                <span className="px-2.5 py-1 bg-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider mb-2 inline-block">
                  {selectedProperty.type}
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">{selectedProperty.title}</h2>
                <p className="text-slate-200 text-xs flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {selectedProperty.location}
                </p>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="border-b border-slate-100 flex px-6 py-1 bg-slate-50">
              <button
                onClick={() => setModalTab("details")}
                className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
                  modalTab === "details"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Overview & Specs
              </button>
              <button
                onClick={() => setModalTab("contact")}
                className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
                  modalTab === "contact"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Request Consultation
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-6 max-h-[calc(100vh-24rem)] overflow-y-auto">
              {modalTab === "details" ? (
                <div className="space-y-6">
                  {/* Price Banner */}
                  <div className="bg-indigo-50 border border-indigo-100/40 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Monthly Rental</span>
                      <span className="text-2xl font-extrabold text-indigo-900">₹{selectedProperty.price.toLocaleString()}</span>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 text-xs font-bold text-slate-700">
                      Immediate occupancy
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900">Property Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {selectedProperty.description} That's a luxury space situated in premium sectors offering world-class neighborhood access. Fully optimized design offering spacious bedrooms, modern fittings, and ample ventilation. Perfect fit for professional lifestyles.
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Premium Amenities</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {getAmenities(selectedProperty.type).map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs font-medium">
                          <span className="text-indigo-600">{amenity.icon}</span>
                          {amenity.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setModalTab("contact")}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" /> Book a Site Tour
                    </button>
                  </div>
                </div>
              ) : (
                /* CONTACT FORM TAB */
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="text-center pb-2">
                    <h4 className="text-base font-bold text-slate-900">Get in touch with local broker</h4>
                    <p className="text-xs text-slate-500 mt-1">Submit your details to request coordinates or schedule a tour</p>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="E.g., Rajesh Kumar"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition text-sm font-medium"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition text-sm font-medium"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Message</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                      <textarea
                        rows="3"
                        placeholder="I'm interested in viewing this property. Please contact me with availability."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition text-sm font-medium resize-none"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>Send Inquiry Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ✅ SUCCESS TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-fade-in-up">
          <div className="bg-emerald-500 p-1 rounded-full text-white">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-slate-100">Inquiry Sent Successfully!</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">EstateAura broker will contact you via email shortly.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}

export default App;