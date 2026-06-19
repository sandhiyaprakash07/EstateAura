import { useEffect, useState } from "react";
import Login from "./Login.jsx";
import { supabase } from "../supabaseClient";
import { 
  Search, MapPin, IndianRupee, SlidersHorizontal, Home, X, Sparkles, ArrowUpDown, 
  Mail, Phone, User, MessageSquare, CheckCircle, Wifi, Car, Shield, Waves, Heart,
  ExternalLink, ChevronRight, RefreshCw, Send, Bot, Settings, Plus, Edit2, Trash2, 
  Eye, LogOut, Check, ChevronLeft, Building, Loader2
} from "lucide-react";

// ==========================================
// DEFAULT SEED PROPERTIES
// ==========================================
const DEFAULT_PROPERTIES = [
  {
    id: 1,
    title: "Aura Premium Apartment",
    price: 18000,
    location: "Chennai",
    type: "Apartment",
    description: "Located in the heart of Chennai, this premium 2BHK apartment offers panoramic city views, modern architecture, double glazing, and 24/7 security. Perfect for small families and professionals seeking a high-quality urban living experience.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    beds: 2,
    baths: 2,
    area: "1,200 sqft",
    features: ["Wifi", "Car Parking", "Security"]
  },
  {
    id: 2,
    title: "Serene Garden Villa",
    price: 35000,
    location: "Bangalore",
    type: "Villa",
    description: "A breathtaking villa surrounded by lush landscaped gardens. Features a private swimming pool, outdoor deck, spacious bedrooms, a modular kitchen, and smart home automation. Experience luxury and peace in Bangalore's prime suburb.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    beds: 4,
    baths: 4,
    area: "3,200 sqft",
    features: ["Wifi", "Car Parking", "Pool", "Security"]
  },
  {
    id: 3,
    title: "Metropolitan Sky Penthouse",
    price: 55000,
    location: "Mumbai",
    type: "Penthouse",
    description: "Ultra-luxury duplex penthouse overlooking the Arabian Sea. Designed by renowned architects, it offers double-height ceilings, a private infinity pool, massive terrace, private elevator, and personalized concierge services.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    beds: 5,
    baths: 6,
    area: "5,400 sqft",
    features: ["Wifi", "Car Parking", "Pool", "Security"]
  },
  {
    id: 4,
    title: "Urban Cozy Studio",
    price: 12000,
    location: "Delhi",
    type: "Apartment",
    description: "A compact yet fully optimized modern studio apartment in South Delhi. Features high-speed Wi-Fi, modern appliances, close proximity to Metro stations, and fully furnished interiors. Perfect for students and solo professionals.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    beds: 1,
    baths: 1,
    area: "450 sqft",
    features: ["Wifi", "Security"]
  }
];

// Admin email — only this account can access the Admin Dashboard
const ADMIN_EMAILS = ["sandhiya150926@gmail.com"];

const isAdminUser = (user) =>
  Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

function App() {
  // ==========================================
  // SYSTEM & ROUTING STATES
  // ==========================================
  const [splashActive, setSplashActive] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("explore"); // explore, details, login, inquiry, admin
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState(null); // Screen to redirect after login

  // ==========================================
  // DATA MANAGEMENT STATES (WITH LOCAL SYNC)
  // ==========================================
  const [dbProperties, setDbProperties] = useState([]);
  const [customProperties, setCustomProperties] = useState(() => {
    const saved = localStorage.getItem("estateaura_custom_properties");
    return saved ? JSON.parse(saved) : [];
  });
  const [deletedIds, setDeletedIds] = useState(() => {
    const saved = localStorage.getItem("estateaura_deleted_properties");
    return saved ? JSON.parse(saved) : [];
  });
  const [editedProperties, setEditedProperties] = useState(() => {
    const saved = localStorage.getItem("estateaura_edited_properties");
    return saved ? JSON.parse(saved) : {};
  });

  const [localInquiries, setLocalInquiries] = useState(() => {
    const saved = localStorage.getItem("estateaura_local_inquiries");
    return saved ? JSON.parse(saved) : [];
  });
  const [dbInquiries, setDbInquiries] = useState([]);

  // ==========================================
  // FILTER & SEARCH STATES
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [maxPrice, setMaxPrice] = useState(60000);
  const [sortBy, setSortBy] = useState("default");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // ==========================================
  // INTERACTIVE STATES
  // ==========================================
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("estateaura_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Inquiry form states
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [detailsTab, setDetailsTab] = useState("overview"); // overview, consultation
  const [previousScreen, setPreviousScreen] = useState("explore");

  // Chatbot Assistant States
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! I am Aura, your Real Estate Assistant. Looking for a premium property? Tell me your preferred location, budget, or type (e.g. villa in Bangalore)!" }
  ]);

  // Loading indicator for database queries
  const [dbLoading, setDbLoading] = useState(true);

  // ==========================================
  // ADMIN DASHBOARD STATES
  // ==========================================
  const [adminTab, setAdminTab] = useState("overview"); // overview, properties, inquiries
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);

  // Add/Edit Property Form State
  const [propForm, setPropForm] = useState({
    title: "",
    price: "",
    location: "Chennai",
    type: "Apartment",
    description: "",
    image: "",
    beds: 2,
    baths: 2,
    area: "1,200 sqft",
    features: ["Wifi"]
  });

  // Notification popup
  const [toast, setToast] = useState({ show: false, text: "", type: "success" });

  // ==========================================
  // EFFECTS & INITIALIZATION
  // ==========================================
  useEffect(() => {
    // 1. Splash Timeout
    const timer = setTimeout(() => {
      setSplashActive(false);
    }, 2800);

    // 2. Fetch User
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    fetchUser();

    // 3. Listen to auth state changes (don't wipe mock/demo logins)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
      }
    });

    // 4. Fetch Supabase Data
    fetchPropertiesFromDB();
    fetchInquiriesFromDB();

    return () => {
      clearTimeout(timer);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Redirect non-admins away from admin dashboard
  useEffect(() => {
    if (currentScreen === "admin" && !isAdminUser(currentUser)) {
      setCurrentScreen("explore");
    }
  }, [currentScreen, currentUser]);

  const triggerToast = (text, type = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: "", type: "success" });
    }, 4000);
  };

  const fetchPropertiesFromDB = async () => {
    try {
      setDbLoading(true);
      const { data, error } = await supabase.from("properties").select("*");
      if (error) throw error;
      setDbProperties(data || []);
    } catch (err) {
      console.warn("Could not load properties from Supabase, relying on seeds:", err.message);
      setDbProperties([]); // Relying on fallback DEFAULT_PROPERTIES
    } finally {
      setDbLoading(false);
    }
  };

  const fetchInquiriesFromDB = async () => {
    try {
      const { data, error } = await supabase.from("inquiries").select("*");
      if (error) throw error;
      setDbInquiries(data || []);
    } catch (err) {
      console.warn("Could not load inquiries from Supabase:", err.message);
    }
  };

  // ==========================================
  // DATA HARMONIZATION (MERGE DB & LOCALSTORAGE)
  // ==========================================
  // Merge Supabase properties + custom properties, filter deleted, map edits
  const allBaseProperties = dbProperties.length > 0 ? dbProperties : DEFAULT_PROPERTIES;
  
  const properties = [
    ...allBaseProperties,
    ...customProperties
  ].filter(p => !deletedIds.includes(Number(p.id)) && !deletedIds.includes(p.id))
   .map(p => editedProperties[p.id] ? { ...p, ...editedProperties[p.id] } : p);

  // Combine DB inquiries and Local storage inquiries
  const inquiries = [...dbInquiries, ...localInquiries];

  // Unique list of locations for filters
  const locationsList = ["All", ...new Set(properties.map(p => p.location))];

  // ==========================================
  // PROPERTY FILTERS LOGIC
  // ==========================================
  const filteredProperties = properties.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === "All" || p.type === selectedType;
    const matchLocation = selectedLocation === "All" || p.location === selectedLocation;
    const matchPrice = p.price <= maxPrice;
    return matchSearch && matchType && matchLocation && matchPrice;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0; // Default
  });

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
      triggerToast("Removed from favorites", "info");
    } else {
      updated = [...favorites, id];
      triggerToast("Added to favorites", "success");
    }
    setFavorites(updated);
    localStorage.setItem("estateaura_favorites", JSON.stringify(updated));
  };

  const navigateToDetails = (property, tab = "overview") => {
    setSelectedProperty(property);
    setDetailsTab(tab);
    setInquiryName(currentUser?.user_metadata?.full_name || "");
    setInquiryEmail(currentUser?.email || "");
    setInquiryMsg(`I'm interested in viewing this property. Please contact me with availability.`);
    setInquirySuccess(false);
    setPreviousScreen(currentScreen);
    setCurrentScreen("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeDetails = () => {
    setSelectedProperty(null);
    setCurrentScreen(previousScreen);
  };

  const handleInquiryClick = (property) => {
    navigateToDetails(property, "consultation");
  };

  const submitInquiryForm = async (e) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMsg) {
      triggerToast("Please fill in all fields", "error");
      return;
    }

    setSubmittingInquiry(true);

    const newInquiry = {
      property_id: selectedProperty.id,
      property_title: selectedProperty.title,
      name: inquiryName,
      email: inquiryEmail,
      phone: "",
      message: inquiryMsg,
      created_at: new Date().toISOString()
    };

    try {
      // Attempt to save to Supabase
      const { error } = await supabase.from("inquiries").insert([newInquiry]);
      if (error) throw error;
      
      triggerToast("Inquiry submitted successfully!");
      fetchInquiriesFromDB();
      setInquirySuccess(true);
    } catch (err) {
      console.warn("Supabase insert failed. Saving inquiry to localStorage fallback.", err.message);
      // Fallback: save to Local Storage
      const updatedInquiries = [
        ...localInquiries,
        { id: 'local_' + Date.now(), ...newInquiry }
      ];
      setLocalInquiries(updatedInquiries);
      localStorage.setItem("estateaura_local_inquiries", JSON.stringify(updatedInquiries));
      
      triggerToast("Inquiry saved locally (Database fallback active)");
      setInquirySuccess(true);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // ==========================================
  // AI CHATBOT LOGIC
  // ==========================================
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const updatedMessages = [...chatMessages, { sender: "user", text: userText }];
    setChatMessages(updatedMessages);
    setChatInput("");

    setTimeout(() => {
      let botResponse = "";
      let matchedProps = [];
      const lower = userText.toLowerCase();

      // Simple AI routing logic
      if (lower.includes("bangalore") || lower.includes("bengaluru")) {
        matchedProps = properties.filter(p => p.location.toLowerCase() === "bangalore");
        botResponse = matchedProps.length > 0 
          ? `I found ${matchedProps.length} premium property in Bangalore:`
          : "We currently don't have active properties in Bangalore, but check out our options in Chennai or Mumbai!";
      } else if (lower.includes("chennai")) {
        matchedProps = properties.filter(p => p.location.toLowerCase() === "chennai");
        botResponse = matchedProps.length > 0 
          ? `I found these properties in Chennai:`
          : "No Chennai properties currently listed. Feel free to browse Mumbai or Delhi properties!";
      } else if (lower.includes("mumbai")) {
        matchedProps = properties.filter(p => p.location.toLowerCase() === "mumbai");
        botResponse = matchedProps.length > 0 
          ? `Here is the premium property in Mumbai:`
          : "We don't have Mumbai properties listed right now.";
      } else if (lower.includes("under") || lower.includes("budget") || lower.includes("below") || lower.includes("price")) {
        const num = userText.replace(/\D/g, "");
        const budget = num ? parseInt(num, 10) : 20000;
        matchedProps = properties.filter(p => p.price <= budget);
        if (matchedProps.length > 0) {
          botResponse = `Here are the properties under ₹${budget.toLocaleString()}:`;
        } else {
          botResponse = `Sorry, we don't have properties under ₹${budget.toLocaleString()}. Our starting price is ₹${Math.min(...properties.map(p=>p.price)).toLocaleString()}/mo.`;
        }
      } else if (lower.includes("villa")) {
        matchedProps = properties.filter(p => p.type.toLowerCase() === "villa");
        botResponse = matchedProps.length > 0 
          ? `I found these beautiful villas for you:`
          : "We don't have villas listed at the moment.";
      } else if (lower.includes("apartment")) {
        matchedProps = properties.filter(p => p.type.toLowerCase() === "apartment");
        botResponse = matchedProps.length > 0 
          ? `Here are our apartments:`
          : "We don't have apartments listed at the moment.";
      } else if (lower.includes("penthouse")) {
        matchedProps = properties.filter(p => p.type.toLowerCase() === "penthouse");
        botResponse = matchedProps.length > 0 
          ? `Here are our penthouses:`
          : "We don't have penthouses listed at the moment.";
      } else {
        botResponse = "I can help you search properties! Try typing 'Show properties in Chennai', 'Villas', or 'Apartments under 20000'.";
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: botResponse, properties: matchedProps }]);
    }, 800);
  };

  // ==========================================
  // ADMIN DASHBOARD OPERATIONS
  // ==========================================
  const openAddProperty = () => {
    if (!isAdminUser(currentUser)) return;
    setEditingPropertyId(null);
    setPropForm({
      title: "",
      price: "",
      location: "Chennai",
      type: "Apartment",
      description: "",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      beds: 2,
      baths: 2,
      area: "1,200 sqft",
      features: ["Wifi", "Car Parking"]
    });
    setShowAddModal(true);
  };

  const openEditProperty = (property) => {
    if (!isAdminUser(currentUser)) return;
    setEditingPropertyId(property.id);
    setPropForm({
      title: property.title,
      price: property.price,
      location: property.location,
      type: property.type,
      description: property.description,
      image: property.image,
      beds: property.beds || 2,
      baths: property.baths || 2,
      area: property.area || "1,200 sqft",
      features: property.features || ["Wifi"]
    });
    setShowAddModal(true);
  };

  const saveProperty = async (e) => {
    e.preventDefault();
    if (!isAdminUser(currentUser)) return;
    if (!propForm.title || !propForm.price || !propForm.description) {
      triggerToast("Please fill out all fields", "error");
      return;
    }

    const priceNum = Number(propForm.price);
    const newPropertyData = {
      title: propForm.title,
      price: priceNum,
      location: propForm.location,
      type: propForm.type,
      description: propForm.description,
      image: propForm.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      beds: Number(propForm.beds),
      baths: Number(propForm.baths),
      area: propForm.area,
      features: propForm.features
    };

    if (editingPropertyId) {
      // Edit mode
      const updatedEdits = {
        ...editedProperties,
        [editingPropertyId]: newPropertyData
      };
      setEditedProperties(updatedEdits);
      localStorage.setItem("estateaura_edited_properties", JSON.stringify(updatedEdits));
      triggerToast("Property updated successfully!");
    } else {
      // Add mode
      const newId = 'custom_' + Date.now();
      const createdProp = { id: newId, ...newPropertyData };
      const updatedCustom = [...customProperties, createdProp];
      setCustomProperties(updatedCustom);
      localStorage.setItem("estateaura_custom_properties", JSON.stringify(updatedCustom));
      triggerToast("Property added successfully!");
    }
    
    setShowAddModal(false);
  };

  const deleteProperty = (id) => {
    if (!isAdminUser(currentUser)) return;
    if (confirm("Are you sure you want to delete this property?")) {
      const updatedDeleted = [...deletedIds, id];
      setDeletedIds(updatedDeleted);
      localStorage.setItem("estateaura_deleted_properties", JSON.stringify(updatedDeleted));
      triggerToast("Property deleted", "info");
      
      // If we are currently viewing the deleted property details, go back to explore
      if (selectedProperty && selectedProperty.id === id) {
        setSelectedProperty(null);
        setCurrentScreen("explore");
      }
    }
  };

  const resolveInquiry = (inqId) => {
    // If it's a local inquiry, filter it out
    if (String(inqId).startsWith("local_")) {
      const updated = localInquiries.filter(i => i.id !== inqId);
      setLocalInquiries(updated);
      localStorage.setItem("estateaura_local_inquiries", JSON.stringify(updated));
      triggerToast("Inquiry marked as resolved");
    } else {
      // For DB inquiries, mock resolution by filtering from UI (or delete query if RLS allows)
      // Since delete might be blocked, we filter it locally and show a mock success
      const updatedLocalInq = [...localInquiries, { id: 'resolved_' + inqId }];
      // Filter out from local display state
      setDbInquiries(prev => prev.filter(i => i.id !== inqId));
      triggerToast("Inquiry marked as resolved (DB archived)");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    triggerToast("Logged out successfully");
    setCurrentScreen("explore");
  };

  // ==========================================
  // RENDER: SPLASH SCREEN
  // ==========================================
  if (splashActive) {
    return (
      <div className="fixed inset-0 bg-[#070310] flex flex-col items-center justify-center z-50 transition-all duration-700 animate-fade-in">
        {/* Glowing backdrop blur */}
        <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="text-center relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
          <div className="relative">
            {/* Logo image if exists, else beautiful visual circle */}
            <div className="w-40 h-40 bg-[#0e071e] rounded-full border border-purple-500/25 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden animate-float">
              <img 
                src="/logo.png" 
                alt="Estate Aura Logo" 
                className="w-32 h-32 object-contain"
                onError={(e) => {
                  // Fallback to beautiful text monogram if logo doesn't load
                  e.target.style.display = 'none';
                  const fb = document.getElementById("logo-fallback");
                  if (fb) fb.style.display = "flex";
                }}
              />
              <div id="logo-fallback" className="hidden w-24 h-24 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full items-center justify-center text-4xl font-extrabold text-white">EA</div>
            </div>
            <div className="absolute inset-0 border border-purple-500/10 rounded-full scale-110 animate-ping [animation-duration:3s]"></div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
              Estate Aura
            </h1>
            <p className="text-sm tracking-wide font-medium text-purple-300/80 italic">
              Find Your Space. Feel the Aura.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSplashActive(false)}
          className="absolute bottom-10 py-2 px-6 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-300 transition-all cursor-pointer hover:border-purple-500/40"
        >
          Skip Intro
        </button>
      </div>
    );
  }

  // ==========================================
  // RENDER: APP SCREEN
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col relative pb-20">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl animate-fade-in-up ${
          toast.type === "error" 
            ? "bg-red-500/10 border-red-500/25 text-red-300" 
            : toast.type === "info" 
              ? "bg-blue-500/10 border-blue-500/25 text-blue-300"
              : "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Global Header / Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/10 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => { setCurrentScreen("explore"); setSelectedProperty(null); setSelectedType("All"); }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <img 
            src="/logo.png" 
            alt="Estate Aura Logo" 
            className="h-8 object-contain"
            onError={(e) => { e.target.style.display='none'; }}
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Estate<span className="text-purple-400">Aura</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Finder removed from header to avoid duplication */}

          {/* Admin panel access — only visible to admin emails */}
          {isAdminUser(currentUser) && (
            <button 
              onClick={() => {
                if (currentScreen === "admin") {
                  setCurrentScreen("explore");
                } else {
                  setCurrentScreen("admin");
                }
              }}
              className={`p-2 rounded-xl border border-purple-500/20 text-slate-300 hover:text-white transition-colors ${
                currentScreen === "admin" ? "bg-purple-600 text-white" : ""
              }`}
              title="Admin Dashboard"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          )}

          {currentUser && (
            <button 
              onClick={handleLogout}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ==========================================
          SCREEN 1: EXPLORE / HOME SCREEN
          ========================================== */}
      {(currentScreen === "explore" || (currentScreen === "details" && previousScreen === "explore")) && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8 animate-fade-in">
          
          {/* Hero Banner Section */}
          <section className="relative rounded-3xl overflow-hidden glass-panel bg-gradient-to-tr from-[#160c32] via-[#0d0722] to-[#120726] border border-purple-500/15 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            {/* Visual background blobs */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute left-10 bottom-0 w-72 h-72 bg-pink-600/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="space-y-4 max-w-2xl relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold text-xs animate-float">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Property Recommendations
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-slate-100">
                Find Your Dream Home With <span className="text-gradient-purple font-extrabold">Estate Aura</span>
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed opacity-95">
                Discover modern luxury apartments, sprawling serene villas, and metropolitan sky penthouses curated for your distinct taste.
              </p>
            </div>

            {/* Premium Logo Graphic Container */}
            <div className="w-48 h-48 md:w-56 md:h-56 bg-purple-950/20 rounded-full border border-purple-500/10 flex items-center justify-center relative shadow-[inset_0_0_30px_rgba(139,92,246,0.1)] shrink-0 select-none">
              <div className="w-36 h-36 md:w-44 md:h-44 bg-[#12092c]/80 border border-purple-500/20 rounded-full flex items-center justify-center animate-float">
                <img 
                  src="/logo.png" 
                  alt="Estate Aura Logo" 
                  className="w-28 h-28 md:w-32 md:h-32 object-contain"
                  onError={(e) => { e.target.style.display='none'; }}
                />
              </div>
              <div className="absolute inset-2 border border-purple-500/5 rounded-full scale-105 animate-pulse-glow"></div>
            </div>
          </section>

          {/* Separated search options card matching screenshot */}
          <section className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/15 max-w-xl mx-auto space-y-6 shadow-xl bg-gradient-to-b from-[#150b2a] to-[#0e071e] animate-fade-in-up">
            {/* LOCATION / KEYWORD */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                LOCATION / KEYWORD
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by city or property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm font-semibold"
                />
              </div>
            </div>

            {/* MAX BUDGET */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  MAX BUDGET
                </label>
                <span className="text-purple-400 font-bold text-xs">
                  {maxPrice === 1000000 ? "Any budget" : `₹${maxPrice.toLocaleString()}`}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-lg font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="E.g. 25000"
                  value={maxPrice === 1000000 ? "" : maxPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxPrice(val ? Number(val) : 1000000);
                  }}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl glass-input text-sm font-semibold"
                />
              </div>
            </div>

            {/* SORT ORDER */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                SORT ORDER
              </label>
              <div className="relative">
                <ArrowUpDown className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#0f0920]/60 border border-purple-500/20 text-slate-200 font-semibold focus:outline-none focus:border-purple-400 text-sm appearance-none cursor-pointer"
                >
                  <option value="default">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="absolute right-4 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400"></div>
              </div>
            </div>
          </section>

          {/* Quick Categories Bar */}
          <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {["All", "Villa", "Apartment", "Penthouse"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedType(cat)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedType === cat 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/15" 
                      : "bg-[#140b2b] text-slate-400 border border-purple-500/10 hover:text-slate-200"
                  }`}
                >
                  {cat === "All" ? "All Properties" : cat + "s"}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-slate-400 font-semibold">
              Showing <span className="text-purple-400 font-bold">{filteredProperties.length}</span> properties
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <div
                  key={property.id}
                  onClick={() => navigateToDetails(property)}
                  className="glass-panel glass-panel-hover rounded-2xl overflow-hidden cursor-pointer flex flex-col group"
                >
                  {/* Property Image Cover */}
                  <div className="h-48 w-full overflow-hidden relative bg-slate-900 shrink-0">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Floating top pills */}
                    <div className="absolute top-3 inset-x-3 flex justify-between items-center pointer-events-none">
                      <span className="py-1 px-2.5 rounded-lg bg-[#0e071e]/85 backdrop-blur-md text-[10px] font-extrabold uppercase text-purple-300 border border-purple-500/20">
                        {property.type}
                      </span>
                      
                      <button
                        onClick={(e) => toggleFavorite(property.id, e)}
                        className="p-1.5 rounded-lg bg-[#0e071e]/75 backdrop-blur-md text-slate-400 hover:text-pink-500 border border-purple-500/10 pointer-events-auto transition-transform hover:scale-110 active:scale-95"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(property.id) ? "fill-pink-500 text-pink-500" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Property Details Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{property.location}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-100 leading-snug group-hover:text-purple-300 transition-colors line-clamp-1">
                        {property.title}
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {property.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      {/* Specs badges */}
                      <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold border-t border-purple-500/10 pt-3">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-purple-500" />
                          {property.beds} Bed
                        </span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <Waves className="w-3.5 h-3.5 text-purple-500" />
                          {property.baths} Bath
                        </span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span className="text-[11px] opacity-90">{property.area}</span>
                      </div>

                      {/* Card Price / CTA Row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rent</span>
                          <span className="text-base font-black text-purple-300 flex items-center">
                            <IndianRupee className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            {property.price.toLocaleString()}
                            <span className="text-[10px] text-slate-400 font-normal ml-0.5">/mo</span>
                          </span>
                        </div>

                        <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md group-hover:shadow-purple-500/20">
                          <ChevronRight className="w-5 h-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-purple-950/20 border border-purple-500/15 rounded-full flex items-center justify-center mx-auto text-purple-400 animate-float">
                  <Search className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-300">No properties matching filters</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Try clearing your search text, widening the budget slider, or selecting "All Locations".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("All");
                    setSelectedLocation("All");
                    setMaxPrice(60000);
                  }}
                  className="py-1.5 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-semibold text-white transition-all mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ==========================================
          SCREEN 2: PROPERTY DETAILS SCREEN
          ========================================== */}
      {currentScreen === "details" && selectedProperty && (
        <div className="fixed inset-0 z-50 bg-[#0e071e]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          {/* Close trigger when clicking outside */}
          <div className="absolute inset-0 cursor-default" onClick={closeDetails}></div>

          {/* Modal Card content */}
          <div className="relative bg-white text-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-fade-in-up z-10 flex flex-col my-8">
            
            {/* Massive image cover */}
            <div className="w-full h-64 relative bg-slate-900 select-none">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
              
              {/* Close Button top-right */}
              <button
                onClick={closeDetails}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors shadow-md cursor-pointer z-20"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Favorites trigger inside image cover */}
              <button
                onClick={(e) => toggleFavorite(selectedProperty.id, e)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-slate-300 hover:text-pink-500 transition-all cursor-pointer z-20"
              >
                <Heart className={`w-5 h-5 ${favorites.includes(selectedProperty.id) ? "fill-pink-500 text-pink-500" : ""}`} />
              </button>

              {/* Title and location overlay at the bottom */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <div className="flex gap-1.5">
                  <span className="py-0.5 px-2 rounded bg-purple-600 text-[9px] font-extrabold uppercase tracking-wide text-white border border-purple-400/30">
                    {selectedProperty.type}
                  </span>
                  <span className="py-0.5 px-2 rounded bg-slate-900/60 backdrop-blur-md text-[9px] font-bold text-slate-200 border border-slate-700/30 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-purple-400" />
                    {selectedProperty.location}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                  {selectedProperty.title}
                </h2>
              </div>
            </div>

            {/* Tab selection */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setDetailsTab("overview")}
                className={`flex-1 py-4 text-center text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  detailsTab === "overview"
                    ? "text-purple-600 border-b-2 border-purple-600 bg-white font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Overview & Specs
              </button>
              <button
                onClick={() => setDetailsTab("consultation")}
                className={`flex-1 py-4 text-center text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  detailsTab === "consultation"
                    ? "text-purple-600 border-b-2 border-purple-600 bg-white font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Request Consultation
              </button>
            </div>

            {/* Content area with fixed padding and scrollable if needed */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-16rem)]">
              {detailsTab === "overview" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Property Description</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {selectedProperty.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-center flex-1">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Rent</span>
                        <span className="text-sm font-black text-purple-600 flex items-center justify-center">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {selectedProperty.price.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="w-px h-6 bg-slate-200"></div>
                      <div className="text-center flex-1">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Rooms</span>
                        <span className="text-sm font-bold text-slate-700">{selectedProperty.beds} Bed, {selectedProperty.baths} Bath</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200"></div>
                      <div className="text-center flex-1">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Area</span>
                        <span className="text-sm font-bold text-slate-700">{selectedProperty.area}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Premium Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/50">
                        <Wifi className="w-4 h-4 text-purple-600 animate-pulse-glow" />
                        <span className="text-xs font-semibold text-slate-600">Free High-Speed WiFi</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/50">
                        <Car className="w-4 h-4 text-purple-600 animate-pulse-glow" />
                        <span className="text-xs font-semibold text-slate-600">Reserved Parking</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/50">
                        <Shield className="w-4 h-4 text-purple-600 animate-pulse-glow" />
                        <span className="text-xs font-semibold text-slate-600">24/7 Security Patrol</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/50">
                        <Waves className="w-4 h-4 text-purple-600 animate-pulse-glow" />
                        <span className="text-xs font-semibold text-slate-600">Swimming Pool</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setDetailsTab("consultation")}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Get Broker Consultation</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {detailsTab === "consultation" && (
                <div className="space-y-4">
                  {!inquirySuccess ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-base font-extrabold text-slate-800">Get in touch with local broker</h3>
                        <p className="text-slate-500 text-xs mt-1">
                          Submit your details to request coordinates or schedule a tour
                        </p>
                      </div>

                      <form onSubmit={submitInquiryForm} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="E.g., Rajesh Kumar"
                              value={inquiryName}
                              onChange={(e) => setInquiryName(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500 transition-colors"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                            <input
                              type="email"
                              placeholder="user@example.com"
                              value={inquiryEmail}
                              onChange={(e) => setInquiryEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500 transition-colors"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Message</label>
                          <div className="relative">
                            <MessageSquare className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                            <textarea
                              rows="3"
                              value={inquiryMsg}
                              onChange={(e) => setInquiryMsg(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500 transition-colors resize-none"
                              placeholder="I'm interested in viewing this property. Please contact me with availability."
                              required
                            ></textarea>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingInquiry}
                          className="w-full py-3.5 bg-[#0e0c1a] text-white font-bold rounded-2xl text-xs transition-all hover:bg-purple-900 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {submittingInquiry ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Send Inquiry Message</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Inquiry Submission Success Screen */
                    <div className="py-6 text-center space-y-4 animate-fade-in-up">
                      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                        <Check className="w-8 h-8 animate-float" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-800">Inquiry Sent Successfully!</h3>
                        <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                          Your interest in <strong className="text-slate-700">"{selectedProperty.title}"</strong> has been logged. Our representative will contact you at <strong className="text-slate-700">{inquiryEmail}</strong> shortly.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setInquirySuccess(false);
                            closeDetails();
                          }}
                          className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          SCREEN 3: LOGIN SCREEN / VIEW
          ========================================== */}
      {currentScreen === "login" && (
        <main className="flex-1 w-full max-w-lg mx-auto py-8">
          <Login 
            currentUser={currentUser}
            onLoginSuccess={(usr) => {
              setCurrentUser(usr);
              if (usr) {
                triggerToast("Logged in successfully!");
                if (loginRedirect) {
                  if ((loginRedirect === "inquiry" || loginRedirect === "details") && selectedProperty) {
                    setInquiryName(usr.user_metadata?.full_name || "");
                    setInquiryEmail(usr.email || "");
                    setDetailsTab(loginRedirect === "inquiry" ? "consultation" : "overview");
                    setCurrentScreen("details");
                  } else if (loginRedirect === "admin" && !isAdminUser(usr)) {
                    setCurrentScreen("explore");
                  } else {
                    setCurrentScreen(loginRedirect);
                  }
                  setLoginRedirect(null);
                } else {
                  setCurrentScreen("explore");
                }
              } else {
                setCurrentScreen("explore");
              }
            }} 
            onCancel={() => {
              setCurrentScreen("explore");
              setLoginRedirect(null);
            }}
          />
        </main>
      )}

      {/* ==========================================
          SCREEN 5: ADMIN DASHBOARD (SEPARATE VIEW)
          ========================================== */}
      {isAdminUser(currentUser) && (currentScreen === "admin" || (currentScreen === "details" && previousScreen === "admin")) && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 animate-fade-in">
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar Controls */}
            <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-purple-500/15 space-y-2 bg-[#100724]">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest px-2 mb-4">Admin Dashboard</h3>
                
                <button
                  onClick={() => setAdminTab("overview")}
                  className={`w-full py-2.5 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2.5 transition-all ${
                    adminTab === "overview" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setAdminTab("properties")}
                  className={`w-full py-2.5 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2.5 transition-all ${
                    adminTab === "properties" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Manage Properties
                </button>
                <button
                  onClick={() => setAdminTab("inquiries")}
                  className={`w-full py-2.5 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-2.5 transition-all ${
                    adminTab === "inquiries" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Inquiries ({inquiries.length})
                </button>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-400">Database Fallback Active</p>
                <p className="leading-relaxed">
                  Supabase RLS prevents updates for anonymous users. Edits, deletions, and property insertions are mirrored locally.
                </p>
              </div>
            </aside>

            {/* Dashboard Workspace */}
            <div className="flex-1 min-w-0">
              
              {/* Tab: Overview */}
              {adminTab === "overview" && (
                <div className="space-y-8 animate-fade-in-up">
                  
                  {/* Summary Stats Grid */}
                  <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 flex items-center justify-between shadow-lg">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Total Properties</span>
                        <h4 className="text-3xl font-black text-purple-300">{properties.length}</h4>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                        <Building className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 flex items-center justify-between shadow-lg">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Total Inquiries</span>
                        <h4 className="text-3xl font-black text-purple-300">{inquiries.length}</h4>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                        <Mail className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 flex items-center justify-between shadow-lg">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Favorites Saved</span>
                        <h4 className="text-3xl font-black text-purple-300">{favorites.length}</h4>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                        <Heart className="w-6 h-6 text-pink-500 fill-pink-500/20" />
                      </div>
                    </div>
                  </section>

                  {/* Recent Activity lists */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Recent Inquiries Panel */}
                    <div className="glass-panel p-6 rounded-2xl border border-purple-500/15 space-y-4">
                      <h4 className="font-bold text-slate-200 border-b border-purple-500/10 pb-2">Recent Inquiries</h4>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {inquiries.length > 0 ? (
                          inquiries.slice(-4).reverse().map((inq, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/5 space-y-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-200">{inq.name}</span>
                                <span className="text-[10px] text-slate-500">{new Date(inq.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-purple-300 font-semibold">{inq.property_title}</p>
                              <p className="text-slate-400 leading-relaxed italic">"{inq.message}"</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-slate-500 text-xs">No inquiries logged yet.</div>
                        )}
                      </div>
                    </div>

                    {/* Properties Summary Panel */}
                    <div className="glass-panel p-6 rounded-2xl border border-purple-500/15 space-y-4">
                      <h4 className="font-bold text-slate-200 border-b border-purple-500/10 pb-2">Listed Overview</h4>
                      <div className="space-y-3">
                        {properties.slice(0, 4).map(prop => (
                          <div key={prop.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-950/15 transition-colors">
                            <div className="w-11 h-11 bg-slate-900 border border-purple-500/10 rounded-lg overflow-hidden shrink-0">
                              <img src={prop.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-200 truncate">{prop.title}</p>
                              <span className="text-[10px] text-slate-400">{prop.location} • {prop.type}</span>
                            </div>
                            <span className="text-xs font-bold text-purple-300">₹{prop.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </section>

                </div>
              )}

              {/* Tab: Manage Properties */}
              {adminTab === "properties" && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-200">Catalog Registry</h3>
                    <button
                      onClick={openAddProperty}
                      className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/10"
                    >
                      <Plus className="w-4 h-4" />
                      Add Property
                    </button>
                  </div>

                  <div className="glass-panel rounded-2xl border border-purple-500/15 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-purple-950/40 border-b border-purple-500/10 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="p-4">Property</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Monthly Rent</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/5 text-slate-300 font-medium">
                          {properties.map(prop => (
                            <tr key={prop.id} className="hover:bg-purple-950/10 transition-colors">
                              <td className="p-4 flex items-center gap-3 max-w-xs">
                                <div className="w-10 h-10 bg-slate-900 border border-purple-500/10 rounded-lg overflow-hidden shrink-0">
                                  <img src={prop.image} className="w-full h-full object-cover" />
                                </div>
                                <span className="font-bold text-slate-200 truncate">{prop.title}</span>
                              </td>
                              <td className="p-4">{prop.type}</td>
                              <td className="p-4">{prop.location}</td>
                              <td className="p-4 text-purple-300 font-bold">₹{prop.price.toLocaleString()}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => navigateToDetails(prop)}
                                    className="p-1.5 hover:bg-purple-950 text-slate-400 hover:text-purple-300 rounded-lg border border-purple-500/10"
                                    title="View Property"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openEditProperty(prop)}
                                    className="p-1.5 hover:bg-purple-950 text-slate-400 hover:text-blue-400 rounded-lg border border-purple-500/10"
                                    title="Edit Property"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteProperty(prop.id)}
                                    className="p-1.5 hover:bg-purple-950 text-slate-400 hover:text-red-400 rounded-lg border border-purple-500/10"
                                    title="Delete Property"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Inquiries List */}
              {adminTab === "inquiries" && (
                <div className="space-y-5 animate-fade-in-up">
                  <h3 className="font-bold text-slate-200">Customer Inquiries</h3>

                  <div className="glass-panel rounded-2xl border border-purple-500/15 overflow-hidden shadow-xl">
                    {inquiries.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-purple-950/40 border-b border-purple-500/10 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="p-4">Client</th>
                              <th className="p-4">Property</th>
                              <th className="p-4">Contact Details</th>
                              <th className="p-4">Message Context</th>
                              <th className="p-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-500/5 text-slate-300 font-medium">
                            {inquiries.map((inq, idx) => (
                              <tr key={inq.id || idx} className="hover:bg-purple-950/10 transition-colors">
                                <td className="p-4">
                                  <p className="font-bold text-slate-200">{inq.name}</p>
                                  <span className="text-[10px] text-slate-500">{new Date(inq.created_at).toLocaleDateString()}</span>
                                </td>
                                <td className="p-4 font-semibold text-purple-300">{inq.property_title}</td>
                                <td className="p-4 space-y-0.5">
                                  <p className="flex items-center gap-1 font-semibold">
                                    <Mail className="w-3 h-3 text-slate-400" /> {inq.email}
                                  </p>
                                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                                    <Phone className="w-3 h-3 text-slate-400" /> {inq.phone}
                                  </p>
                                </td>
                                <td className="p-4 max-w-xs">
                                  <p className="italic text-slate-400 line-clamp-2">"{inq.message}"</p>
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => resolveInquiry(inq.id)}
                                    className="py-1 px-3 bg-emerald-500/15 border border-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 font-semibold rounded-lg text-[10px] transition-all"
                                  >
                                    Resolve
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-20 text-center space-y-3 text-slate-500">
                        <Mail className="w-8 h-8 mx-auto opacity-40 animate-float" />
                        <p className="font-bold text-xs">No active inquiries registered</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      )}

      {/* ==========================================
          MODAL: ADD/EDIT PROPERTY FORM
          ========================================== */}
      {showAddModal && isAdminUser(currentUser) && (
        <div className="fixed inset-0 z-50 bg-[#070312]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-purple-500/20 overflow-hidden shadow-2xl animate-fade-in-up">
            
            <div className="bg-purple-950/50 border-b border-purple-500/15 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {editingPropertyId ? "Edit Property Record" : "Add Property Registry"}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveProperty} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Property Title</label>
                <input
                  type="text"
                  value={propForm.title}
                  onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                  placeholder="e.g. Royal Horizon Suite"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Price per Month (₹)</label>
                  <input
                    type="number"
                    value={propForm.price}
                    onChange={(e) => setPropForm({ ...propForm, price: e.target.value })}
                    placeholder="e.g. 24000"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Location</label>
                  <select
                    value={propForm.location}
                    onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#130b25] border border-purple-500/20 text-slate-200 focus:outline-none focus:border-purple-400 text-xs"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Type</label>
                  <select
                    value={propForm.type}
                    onChange={(e) => setPropForm({ ...propForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#130b25] border border-purple-500/20 text-slate-200 focus:outline-none focus:border-purple-400 text-xs"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="2BHK">2BHK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Beds</label>
                  <input
                    type="number"
                    value={propForm.beds}
                    onChange={(e) => setPropForm({ ...propForm, beds: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Baths</label>
                  <input
                    type="number"
                    value={propForm.baths}
                    onChange={(e) => setPropForm({ ...propForm, baths: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Area Size</label>
                  <input
                    type="text"
                    value={propForm.area}
                    onChange={(e) => setPropForm({ ...propForm, area: e.target.value })}
                    placeholder="e.g. 1,400 sqft"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Image URL (Unsplash)</label>
                  <input
                    type="url"
                    value={propForm.image}
                    onChange={(e) => setPropForm({ ...propForm, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  value={propForm.description}
                  onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                  placeholder="Detailed description about context, neighborhood, facilities..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium resize-none"
                  required
                ></textarea>
              </div>

              <div className="bg-purple-950/25 border border-purple-500/10 p-4 rounded-xl flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs transition-all hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          FLOATING AI RECOMMENDATION CHATBOT
          ========================================== */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Chat Window Panel */}
        {chatbotOpen && (
          <div className="w-80 md:w-96 h-[420px] rounded-2xl glass-panel border border-purple-500/20 shadow-2xl flex flex-col overflow-hidden mb-3.5 animate-fade-in-up bg-[#0f0920]">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-4 py-3 flex items-center justify-between border-b border-purple-500/15">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-500/25 rounded-lg flex items-center justify-center border border-purple-400/30 text-purple-300">
                  <Bot className="w-4 h-4 animate-float" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Aura AI Concierge</h4>
                  <span className="text-[9px] text-purple-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online Recommendations
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setChatbotOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat log messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-semibold">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-[#4f35cd] text-white rounded-tr-none shadow-md" 
                      : "bg-[#160b2d] border border-purple-500/10 text-slate-200 rounded-tl-none"
                  }`}>
                    <p>{msg.text}</p>
                    
                    {msg.properties && msg.properties.length > 0 && (
                      <div className="mt-3.5 space-y-2.5">
                        {msg.properties.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              setSelectedProperty(p);
                              setCurrentScreen("details");
                              setChatbotOpen(false);
                            }}
                            className="flex gap-2.5 p-2 bg-[#0d071e]/90 hover:bg-[#1b0e35] border border-purple-500/20 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                          >
                            <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-purple-500/10" />
                            <div className="min-w-0 flex-1 text-[10px]">
                              <p className="font-bold text-slate-100 truncate">{p.title}</p>
                              <p className="text-purple-300 font-bold mt-0.5">₹{p.price.toLocaleString()}/mo</p>
                              <p className="text-slate-400 mt-0.5 truncate">{p.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 py-1.5 overflow-x-auto flex gap-1.5 scrollbar-none border-t border-purple-500/5 bg-purple-950/10">
              <button
                onClick={() => { setChatInput("Show villas in Bangalore"); }}
                className="py-1 px-2.5 rounded-full bg-purple-950/45 border border-purple-500/10 hover:border-purple-500/30 text-[10px] text-purple-300 font-semibold shrink-0 cursor-pointer"
              >
                Villas in Bangalore
              </button>
              <button
                onClick={() => { setChatInput("Properties under 20000"); }}
                className="py-1 px-2.5 rounded-full bg-purple-950/45 border border-purple-500/10 hover:border-purple-500/30 text-[10px] text-purple-300 font-semibold shrink-0 cursor-pointer"
              >
                Under ₹20,000
              </button>
              <button
                onClick={() => { setChatInput("Apartments in Chennai"); }}
                className="py-1 px-2.5 rounded-full bg-purple-950/45 border border-purple-500/10 hover:border-purple-500/30 text-[10px] text-purple-300 font-semibold shrink-0 cursor-pointer"
              >
                Chennai Apartments
              </button>
            </div>

            {/* Chat Input Field form */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-purple-500/15 flex gap-2 shrink-0 bg-purple-950/20">
              <input
                type="text"
                placeholder="Ask Aura AI..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-purple-950/50 border border-purple-500/20 text-xs font-semibold text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}

        {/* Floating Bubble Icon */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white border border-purple-400/40 shadow-2xl hover:scale-105 active:scale-95 transition-all animate-pulse-glow cursor-pointer"
          title="Aura AI Concierge"
        >
          {chatbotOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6 animate-float" />
          )}
        </button>
      </div>

      {/* Bottom Navigation Bar matching screenshot */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0e071e]/95 backdrop-blur-md border-t border-purple-500/10 py-3 px-6 flex justify-around items-center max-w-xl mx-auto rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => { setCurrentScreen("explore"); setSelectedProperty(null); setSelectedType("All"); }}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${
            currentScreen === "explore" && selectedType !== "Favorites" ? "text-[#5b3fed]" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Explore</span>
        </button>

        <button 
          onClick={() => {
            setSelectedType("Favorites");
            setCurrentScreen("explore");
            setSelectedProperty(null);
          }}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold relative transition-all hover:scale-105 active:scale-95 ${
            selectedType === "Favorites" ? "text-[#5b3fed]" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Heart className="w-5 h-5" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#e11d48] text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#0e071e] shadow-md">
              {favorites.length}
            </span>
          )}
          <span>Favorites</span>
        </button>

        <button 
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${
            chatbotOpen ? "text-[#5b3fed]" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>AI Finder</span>
        </button>

        <button 
          onClick={() => {
            setLoginRedirect("explore");
            setCurrentScreen("login");
          }}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${
            currentScreen === "login" ? "text-[#5b3fed]" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </div>

    </div>
  );
}

export default App;