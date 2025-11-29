import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
  createContext,
} from "react";
import {
  Snowflake,
  Wind,
  Thermometer,
  CheckCircle,
  Settings,
  DollarSign,
  Calculator,
  ShieldCheck,
  Zap,
  Save,
  X,
  Flame,
  Fan,
  Table,
  ArrowRightLeft,
  TrendingUp,
  Plus,
  Trash2,
  Package,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Percent,
  Printer,
  ArrowLeft,
  FileText,
  Send,
  PenTool,
  Eraser,
  Check,
  Copy,
  FileDown,
  Hash,
  Tag,
  Cpu,
  Box,
  Share2,
  History,
  Loader,
  Users,
  Database,
  Edit3,
  Cloud,
  Layout,
  ArrowLeftCircle,
  ArrowRightCircle,
  Lock,
  Unlock,
  List,
  ExternalLink,
} from "lucide-react";

// --- FIREBASE IMPORTS & SETUP ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWSz9xvuGDyrc7Z1NIpDq_dJMuqeWycs8",
  authDomain: "hvac-quoter-app.firebaseapp.com",
  projectId: "hvac-quoter-app",
  storageBucket: "hvac-quoter-app.firebasestorage.app",
  messagingSenderId: "273831144986",
  appId: "1:273831144986:web:8e647d469d16960b79aba3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.appId; // <--- THIS IS THE NEW LINE

// --- CONSTANTS ---

// --- CONSTANTS ---

const TONS = [1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
const SYSTEM_TYPES = [
  {
    id: "heat_pump",
    label: "Heat Pump",
    sub: "Electric Air Handler",
    icon: <Zap size={18} />,
  },
  {
    id: "ac_80",
    label: "AC + 80% Furnace",
    sub: "Standard Gas Heat",
    icon: <Flame size={18} />,
  },
  {
    id: "ac_90",
    label: "AC + 90% Furnace",
    sub: "High Eff. Gas Heat",
    icon: (
      <div className="flex">
        <Flame size={14} />
        <span className="text-[10px] font-bold">+</span>
      </div>
    ),
  },
  {
    id: "dual_80",
    label: "Dual Fuel + 80%",
    sub: "Heat Pump + Gas",
    icon: (
      <div className="flex">
        <Zap size={14} />
        <Flame size={14} />
      </div>
    ),
  },
  {
    id: "dual_90",
    label: "Dual Fuel + 90%",
    sub: "HP + High Eff. Gas",
    icon: (
      <div className="flex">
        <Zap size={14} />
        <Flame size={14} />
        <span className="text-[10px] font-bold">+</span>
      </div>
    ),
  },
];

const TIER_KEYS = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"];

const INITIAL_ADDONS = [
  {
    id: 1,
    name: "Media Cabinet (MERV 11)",
    price: 450,
    icon: "Wind",
    visible: true,
  },
  {
    id: 2,
    name: "UV Light Purification",
    price: 850,
    icon: "Zap",
    visible: true,
  },
  {
    id: 3,
    name: "Smart Thermostat",
    price: 350,
    icon: "Thermometer",
    visible: true,
  },
  {
    id: 4,
    name: "Surge Protector",
    price: 225,
    icon: "ShieldCheck",
    visible: true,
  },
  {
    id: 5,
    name: "10-Year Labor Warranty",
    price: 1200,
    icon: "CheckCircle",
    visible: true,
  },
  {
    id: 6,
    name: "Whole Home Humidifier",
    price: 750,
    icon: "Wind",
    visible: true,
  },
];

const INITIAL_FINANCING = [
  { id: 1, rate: 9.99, months: 60 },
  { id: 2, rate: 0, months: 12 },
  { id: 3, rate: 7.99, months: 120 },
];

const INITIAL_TIER_FEATURES = {
  slot1: [
    "18+ SEER2 Efficiency",
    "Variable Speed Inverter",
    "12 Year Parts Warranty",
    "Perfect Humidity Control",
    "Ultra Quiet",
  ],
  slot2: [
    "16 SEER2 Efficiency",
    "Two-Stage Compressor",
    "10 Year Parts Warranty",
    "Variable Speed Blower",
    "Quieter Operation",
  ],
  slot3: [
    "14.3 SEER2 Efficiency",
    "Two-Stage/Single Stage",
    "10 Year Parts Warranty",
    "Standard Blower Motor",
  ],
  slot4: [
    "14.3 SEER2 Efficiency",
    "Single Stage Compressor",
    "10 Year Parts Warranty",
    "Standard Blower Motor",
  ],
  slot5: ["High Efficiency", "Advanced Comfort", "10 Year Warranty"],
  slot6: ["Budget Friendly", "Reliable Performance", "10 Year Warranty"],
};

const DEFAULT_BASE_PRICES = {
  slot1: 12000,
  slot2: 11000,
  slot3: 9400,
  slot4: 7700,
  slot5: 13000,
  slot6: 6500,
};
const DEFAULT_STEP = 400;

const calculateInitialManualPrices = (basePrices, step) => {
  const manual = {};
  TONS.forEach((ton) => {
    manual[ton] = {};
    const baseIndex = TONS.indexOf(1.5);
    const selectedIndex = TONS.indexOf(ton);
    const sizeUpcharge = (selectedIndex - baseIndex) * step;
    TIER_KEYS.forEach((tier) => {
      manual[ton][tier] = basePrices[tier] + sizeUpcharge;
    });
  });
  return manual;
};

const DEFAULT_CONFIG = {
  pricingMode: "manual",
  basePrices: DEFAULT_BASE_PRICES,
  manualPrices: calculateInitialManualPrices(DEFAULT_BASE_PRICES, DEFAULT_STEP),
  manualAdjustments: {},
  tierOrder: ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"],
  discounts: {
    slot1: { type: "$", value: 0 },
    slot2: { type: "$", value: 0 },
    slot3: { type: "$", value: 0 },
    slot4: { type: "$", value: 0 },
    slot5: { type: "$", value: 0 },
    slot6: { type: "$", value: 0 },
  },
  tierConfig: {
    slot1: { systemType: "heat_pump", visible: true },
    slot2: { systemType: "heat_pump", visible: true },
    slot3: { systemType: "heat_pump", visible: true },
    slot4: { systemType: "heat_pump", visible: true },
    slot5: { systemType: "heat_pump", visible: false },
    slot6: { systemType: "heat_pump", visible: false },
  },
  tierFeatures: INITIAL_TIER_FEATURES,
  typeModifiers: {
    heat_pump: 0,
    ac_80: 0,
    ac_90: 1200,
    dual_80: 1500,
    dual_90: 2500,
  },
  addons: INITIAL_ADDONS,
  tierPackages: {
    slot1: [],
    slot2: [],
    slot3: [],
    slot4: [],
    slot5: [],
    slot6: [],
  },
  financingOptions: INITIAL_FINANCING,
  tierFinancing: {
    slot1: [-1, -1],
    slot2: [-1, -1],
    slot3: [-1, -1],
    slot4: [-1, -1],
    slot5: [-1, -1],
    slot6: [-1, -1],
  },
  pricePerTonStep: DEFAULT_STEP,
  companyName: "My Cool Guys Heating and Cooling",
  modelPrefixes: {
    slot1: {
      outHP: "4TV18",
      outAC: "4TTV8",
      in: "TAM9",
      coil: "4TXC",
      gas: "XC95",
    },
    slot2: {
      outHP: "4TXL17",
      outAC: "4TTR7",
      in: "TEM6",
      coil: "4TXC",
      gas: "S9X2",
    },
    slot3: {
      outHP: "4TXR14",
      outAC: "4TTR4",
      in: "TEM4",
      coil: "4TXC",
      gas: "S8X1",
    },
    slot4: {
      outHP: "GSZ14",
      outAC: "GSX14",
      in: "ARUF",
      coil: "CAPT",
      gas: "GM9S",
    },
    slot5: {
      outHP: "DX17",
      outAC: "DX16",
      in: "DFVE",
      coil: "CAPF",
      gas: "DM96",
    },
    slot6: {
      outHP: "4TWR4",
      outAC: "4TTR4",
      in: "TEM4",
      coil: "4TXC",
      gas: "S8X1",
    },
  },
  tierDefinitions: {
    slot1: {
      label: "Best Performance",
      short: "XV18 Trane",
      color: "blue",
      brand: "trane",
    },
    slot2: {
      label: "Better Performance",
      short: "XL17 Trane",
      color: "orange",
      brand: "trane",
    },
    slot3: {
      label: "Best Value",
      short: "XR14 Trane",
      color: "indigo",
      brand: "trane",
    },
    slot4: {
      label: "Best Price",
      short: "14.3 SEER Goodman",
      color: "slate",
      brand: "goodman",
    },
    slot5: {
      label: "High Efficiency",
      short: "Daikin Fit",
      color: "red",
      brand: "daikin",
    },
    slot6: {
      label: "Budget Option",
      short: "RunTru",
      color: "gray",
      brand: "runtru",
    },
  },
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0";
  return `$${Math.round(amount).toLocaleString()}`;
};

const DynamicIcon = ({ name, size = 18, className }) => {
  const icons = { Wind, Zap, Thermometer, ShieldCheck, CheckCircle, Plus };
  const IconComponent = icons[name] || Plus;
  return <IconComponent size={size} className={className} />;
};

// --- COMPONENTS ---

function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e.nativeEvent);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e.nativeEvent);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };
  const handleSave = () => {
    if (!hasSignature) return;
    const canvas = canvasRef.current;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 touch-none overflow-hidden">
        <canvas
          ref={canvasRef}
          width={500}
          height={150}
          className="w-full h-32 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex justify-between mt-2">
        <button
          onClick={clearCanvas}
          className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700"
        >
          <Eraser size={14} /> Clear
        </button>
        <button
          onClick={handleSave}
          disabled={!hasSignature}
          className={`text-xs font-bold px-3 py-1 rounded ${
            hasSignature
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Accept Signature
        </button>
      </div>
    </div>
  );
}

// --- NEW EMAIL PREVIEW MODAL ---
const EmailPreviewModal = ({ isOpen, onClose, content, toEmail }) => {
  if (!isOpen) return null;

  const handleOpenMail = () => {
    window.location.href = `mailto:${toEmail}?subject=${encodeURIComponent(
      content.subject
    )}&body=${encodeURIComponent(content.body)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content.body);
    alert("Email body copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Mail size={20} /> Email Preview
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-500">
              To:
            </label>
            <div className="p-2 bg-slate-50 rounded border border-slate-200 text-sm font-mono">
              {toEmail}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-slate-500">
              Subject:
            </label>
            <div className="p-2 bg-slate-50 rounded border border-slate-200 text-sm font-bold">
              {content.subject}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">
              Body:
            </label>
            <div className="p-4 bg-slate-50 rounded border border-slate-200 text-sm whitespace-pre-wrap font-mono h-64 overflow-y-auto">
              {content.body}
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 flex items-center gap-2"
          >
            <Copy size={16} /> Copy Text
          </button>
          <button
            onClick={handleOpenMail}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <ExternalLink size={16} /> Open Mail App
          </button>
        </div>
      </div>
    </div>
  );
};

const HeaderSection = ({
  number,
  title,
  hasData,
  collapsed,
  toggle,
  reset = null,
  resetProps = {},
}) => {
  const headerStyle = hasData
    ? "text-blue-700 font-bold"
    : "text-slate-400 font-bold";
  const iconStyle = hasData ? "text-blue-700" : "text-slate-400";
  return (
    <div
      onClick={toggle}
      className="flex justify-between items-center cursor-pointer mb-2 group select-none"
    >
      <h3
        className={`text-sm border-b pb-1 flex-grow transition-colors ${headerStyle}`}
      >
        {number}. {title}
      </h3>
      <div className="flex items-center gap-3">
        {reset && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            {...resetProps}
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
        <div className={iconStyle}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
    </div>
  );
};

// --- STATE MANAGEMENT ---

const ConfigContext = createContext();

const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    phone: "",
  });
  const [selectedTon, setSelectedTon] = useState(2.0);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [bulkFactor, setBulkFactor] = useState(1.05);
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });

  const [user, setUser] = useState(null);
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [equipmentDb, setEquipmentDb] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [currentView, setCurrentView] = useState("pricing");
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Auth & Data Fetching
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token)
        await signInWithCustomToken(auth, __initial_auth_token);
      else await signInAnonymously(auth);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const estUnsub = onSnapshot(
      collection(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "accepted_estimates"
      ),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort(
          (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
        );
        setSavedEstimates(data);
      }
    );
    const custUnsub = onSnapshot(
      collection(db, "artifacts", appId, "users", user.uid, "saved_customers"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => (a.lastName || "").localeCompare(b.lastName || ""));
        setSavedCustomers(data);
      }
    );
    const eqUnsub = onSnapshot(
      collection(db, "artifacts", appId, "users", user.uid, "equipment_db"),
      (snapshot) => {
        const dbData = {};
        snapshot.docs.forEach((doc) => {
          dbData[doc.id] = doc.data();
        });
        setEquipmentDb(dbData);
      }
    );
    const configRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "app_config",
      "settings"
    );
    const configUnsub = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig((prev) => ({
          ...prev,
          manualPrices: data.manualPrices || prev.manualPrices,
          tierDefinitions: data.tierDefinitions || prev.tierDefinitions,
          modelPrefixes: data.modelPrefixes || prev.modelPrefixes,
          tierOrder: data.tierOrder || prev.tierOrder,
          manualAdjustments: data.manualAdjustments || prev.manualAdjustments,
          tierConfig: data.tierConfig || prev.tierConfig,
          financingOptions: data.financingOptions || prev.financingOptions,
          tierFinancing: data.tierFinancing || prev.tierFinancing,
          addons: data.addons || prev.addons,
          tierPackages: data.tierPackages || prev.tierPackages,
          discounts: data.discounts || prev.discounts,
          typeModifiers: data.typeModifiers || prev.typeModifiers,
          tierFeatures: data.tierFeatures || prev.tierFeatures,
        }));
      }
    });

    return () => {
      estUnsub();
      custUnsub();
      eqUnsub();
      configUnsub();
    };
  }, [user]);

  const saveEstimate = async (quote, customerData, sigData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(
        collection(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "accepted_estimates"
        ),
        {
          quote,
          customer: customerData,
          signature: sigData,
          timestamp: serverTimestamp(),
          dateString: new Date().toLocaleDateString(),
          finalPrice: quote.priceDetails.finalPrice,
          tierName: quote.tierName,
          systemSummary: `${quote.systemSize} Ton ${quote.systemTypeLabel}`,
          proposalState: {
            selectedTon,
            selectedAddons,
            tierVisibility: config.tierConfig,
          },
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEstimate = async (id) => {
    if (user)
      await deleteDoc(
        doc(db, "artifacts", appId, "users", user.uid, "accepted_estimates", id)
      );
  };

  const saveCustomerProfile = async () => {
    if (!user || !customer.firstName || !customer.lastName) return;
    try {
      await addDoc(
        collection(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "saved_customers"
        ),
        { ...customer, timestamp: serverTimestamp() }
      );
      alert("Customer Profile Saved!");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCustomerProfile = async (id) => {
    if (user)
      await deleteDoc(
        doc(db, "artifacts", appId, "users", user.uid, "saved_customers", id)
      );
  };

  const saveEquipmentToDb = async (tierKey, typeId, data) => {
    if (!user) return;
    try {
      const docId = `${tierKey}_${typeId}`;
      await setDoc(
        doc(db, "artifacts", appId, "users", user.uid, "equipment_db", docId),
        data,
        { merge: true }
      );
      alert("Equipment Data Saved to Cloud!");
    } catch (e) {
      console.error(e);
    }
  };

  const saveGlobalSettings = async () => {
    if (!user) return;
    try {
      await setDoc(
        doc(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "app_config",
          "settings"
        ),
        {
          manualPrices: config.manualPrices,
          tierDefinitions: config.tierDefinitions,
          modelPrefixes: config.modelPrefixes,
          tierOrder: config.tierOrder,
          manualAdjustments: config.manualAdjustments,
          tierConfig: config.tierConfig,
          financingOptions: config.financingOptions,
          tierFinancing: config.tierFinancing,
          addons: config.addons,
          tierPackages: config.tierPackages,
          discounts: config.discounts,
          typeModifiers: config.typeModifiers,
          tierFeatures: config.tierFeatures,
        },
        { merge: true }
      );
      alert(
        "All Settings (Pricing, Slots, Financing, Addons, Features) Saved!"
      );
    } catch (e) {
      console.error("Error saving config", e);
      alert("Failed to save settings.");
    }
  };

  const loadProposalState = (proposalState) => {
    if (!proposalState) return;
    setSelectedTon(proposalState.selectedTon);
    setSelectedAddons(proposalState.selectedAddons || []);
    if (proposalState.tierVisibility) {
      setConfig((prev) => ({
        ...prev,
        tierConfig: proposalState.tierVisibility,
      }));
    }
    setCurrentView("pricing");
  };

  const updateConfig = useCallback((section, key, value, subKey = null) => {
    if (section === "manualPrices") {
      setConfig((prev) => ({
        ...prev,
        manualPrices: {
          ...prev.manualPrices,
          [key]: { ...prev.manualPrices[key], [subKey]: parseInt(value) },
        },
      }));
    } else if (section === "manualAdjustments") {
      setConfig((prev) => ({
        ...prev,
        manualAdjustments: {
          ...prev.manualAdjustments,
          [key]: parseInt(value),
        },
      }));
    } else if (section === "root") {
      setConfig((prev) => ({
        ...prev,
        [key]: key === "companyName" ? value : parseFloat(value) || 0,
      }));
    } else if (section === "tierFinancing") {
      setConfig((prev) => ({
        ...prev,
        tierFinancing: { ...prev.tierFinancing, [key]: value },
      }));
    } else if (section === "modelPrefixes") {
      setConfig((prev) => ({
        ...prev,
        modelPrefixes: {
          ...prev.modelPrefixes,
          [key]: { ...prev.modelPrefixes[key], [subKey]: value },
        },
      }));
    } else if (section === "tierDefinitions") {
      setConfig((prev) => ({
        ...prev,
        tierDefinitions: {
          ...prev.tierDefinitions,
          [key]: { ...prev.tierDefinitions[key], [subKey]: value },
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        [section]: { ...prev[section], [key]: parseInt(value) || 0 },
      }));
    }
  }, []);

  const addFinancingPlan = (rate, months) => {
    const newPlan = {
      id: Date.now(),
      rate: parseFloat(rate),
      months: parseInt(months),
    };
    setConfig((prev) => ({
      ...prev,
      financingOptions: [...prev.financingOptions, newPlan],
    }));
  };

  const removeFinancingPlan = (id) => {
    setConfig((prev) => ({
      ...prev,
      financingOptions: prev.financingOptions.filter((p) => p.id !== id),
    }));
  };

  const updateAddon = (id, field, value) => {
    setConfig((prev) => ({
      ...prev,
      addons: prev.addons.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  const updateTierFeature = (tier, index, text) => {
    setConfig((prev) => {
      const newFeatures = [...prev.tierFeatures[tier]];
      newFeatures[index] = text;
      return {
        ...prev,
        tierFeatures: { ...prev.tierFeatures, [tier]: newFeatures },
      };
    });
  };

  const addTierFeature = (tier) => {
    setConfig((prev) => {
      const newFeatures = [...prev.tierFeatures[tier], "New Feature"];
      return {
        ...prev,
        tierFeatures: { ...prev.tierFeatures, [tier]: newFeatures },
      };
    });
  };

  const removeTierFeature = (tier, index) => {
    setConfig((prev) => {
      const newFeatures = prev.tierFeatures[tier].filter((_, i) => i !== index);
      return {
        ...prev,
        tierFeatures: { ...prev.tierFeatures, [tier]: newFeatures },
      };
    });
  };

  const moveTier = useCallback((index, direction) => {
    setConfig((prev) => {
      const newOrder = [...(prev.tierOrder || TIER_KEYS)];
      if (direction === "up" && index > 0) {
        [newOrder[index], newOrder[index - 1]] = [
          newOrder[index - 1],
          newOrder[index],
        ];
      } else if (direction === "down" && index < newOrder.length - 1) {
        [newOrder[index], newOrder[index + 1]] = [
          newOrder[index + 1],
          newOrder[index],
        ];
      }
      return { ...prev, tierOrder: newOrder };
    });
  }, []);

  const updateCustomer = useCallback(
    (field, value) => setCustomer((prev) => ({ ...prev, [field]: value })),
    []
  );
  const resetCustomerInfo = useCallback(
    () =>
      setCustomer({
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        email: "",
        phone: "",
      }),
    []
  );
  const resetManualAdjustments = useCallback(
    () => setConfig((prev) => ({ ...prev, manualAdjustments: {} })),
    []
  );
  const resetTierPackages = useCallback(
    () =>
      setConfig((prev) => ({
        ...prev,
        tierPackages: {
          slot1: [],
          slot2: [],
          slot3: [],
          slot4: [],
          slot5: [],
          slot6: [],
        },
      })),
    []
  );
  const resetFinancingSelections = useCallback(
    () =>
      setConfig((prev) => ({
        ...prev,
        tierFinancing: {
          slot1: [-1, -1],
          slot2: [-1, -1],
          slot3: [-1, -1],
          slot4: [-1, -1],
          slot5: [-1, -1],
          slot6: [-1, -1],
        },
      })),
    []
  );
  const resetDiscounts = useCallback(
    () =>
      setConfig((prev) => ({
        ...prev,
        discounts: {
          slot1: { type: "$", value: 0 },
          slot2: { type: "$", value: 0 },
          slot3: { type: "$", value: 0 },
          slot4: { type: "$", value: 0 },
          slot5: { type: "$", value: 0 },
          slot6: { type: "$", value: 0 },
        },
      })),
    []
  );

  const toggleAddon = (id) =>
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  const updateTierConfig = (tier, field, value) =>
    setConfig((prev) => ({
      ...prev,
      tierConfig: {
        ...prev.tierConfig,
        [tier]: { ...prev.tierConfig[tier], [field]: value },
      },
    }));
  const addCustomAddon = () => {
    if (!newAddon.name || !newAddon.price) return;
    const nextId = Math.max(...config.addons.map((a) => a.id), 0) + 1;
    setConfig((prev) => ({
      ...prev,
      addons: [
        ...prev.addons,
        {
          id: nextId,
          name: newAddon.name,
          price: parseInt(newAddon.price),
          icon: "Plus",
          visible: true,
        },
      ],
    }));
    setNewAddon({ name: "", price: "" });
  };
  const deleteAddon = (id) => {
    setConfig((prev) => ({
      ...prev,
      addons: prev.addons.filter((a) => a.id !== id),
      tierPackages: {
        slot1: prev.tierPackages.slot1.filter((x) => x !== id),
        slot2: prev.tierPackages.slot2.filter((x) => x !== id),
        slot3: prev.tierPackages.slot3.filter((x) => x !== id),
        slot4: prev.tierPackages.slot4.filter((x) => x !== id),
        slot5: prev.tierPackages.slot5.filter((x) => x !== id),
        slot6: prev.tierPackages.slot6.filter((x) => x !== id),
      },
    }));
    setSelectedAddons((prev) => prev.filter((x) => x !== id));
  };
  const togglePackageItem = (tier, addonId) => {
    setConfig((prev) => {
      const currentList = prev.tierPackages[tier];
      return {
        ...prev,
        tierPackages: {
          ...prev.tierPackages,
          [tier]: currentList.includes(addonId)
            ? currentList.filter((id) => id !== addonId)
            : [...currentList, addonId],
        },
      };
    });
  };
  const updateDiscount = (tier, field, value) => {
    setConfig((prev) => ({
      ...prev,
      discounts: {
        ...prev.discounts,
        [tier]: {
          ...prev.discounts[tier],
          [field]: field === "value" ? parseFloat(value) || 0 : value,
        },
      },
    }));
  };

  const applyBulkFactor = () => {
    if (!config.manualPrices) return;
    const newManual = {};
    Object.keys(config.manualPrices).forEach((ton) => {
      newManual[ton] = {};
      TIER_KEYS.forEach((tier) => {
        const current = config.manualPrices[ton][tier] || 0;
        newManual[ton][tier] = Math.round(current * bulkFactor);
      });
    });
    setConfig((prev) => ({ ...prev, manualPrices: newManual }));
  };

  const getEquipmentDataHelper = useCallback(
    (tier, ton, typeId) => {
      const dbKey = `${tier}_${typeId}`;
      const tonKey = ton.toString();
      if (equipmentDb[dbKey] && equipmentDb[dbKey][tonKey]) {
        const entry = equipmentDb[dbKey][tonKey];
        if (entry.outdoorModel || entry.indoorModel || entry.furnaceModel) {
          return {
            outdoorModel: entry.outdoorModel || null,
            indoorModel: entry.indoorModel || null,
            coilModel: entry.coilModel || null,
            furnaceModel: entry.furnaceModel || null,
            ahriNumber: entry.ahriNumber || "N/A",
            seer: entry.seer || "N/A",
          };
        }
      }
      const brands = config.modelPrefixes || DEFAULT_CONFIG.modelPrefixes;
      const b = brands[tier] || brands.slot3;
      const tonStr = (ton * 12).toString().padStart(3, "0");
      let outdoor = "";
      let indoor = "N/A",
        coil = "N/A",
        furnace = "N/A";
      let ahri = Math.floor(Math.random() * 8999999 + 1000000).toString();
      if (typeId === "heat_pump" || typeId.includes("dual_")) {
        outdoor = `${b?.outHP || "M"}${tonStr}A1000A`;
      } else {
        outdoor = `${b?.outAC || "M"}${tonStr}A1000A`;
      }
      if (typeId === "heat_pump") {
        indoor = `${b?.in || "M"}A0B${tonStr}H21`;
      } else if (typeId.includes("ac_") || typeId.includes("dual_")) {
        coil = `${b?.coil || "M"}${tonStr}DS3H`;
        furnace = `${b?.gas || "M"}${tonStr}U4PS`;
      }
      return {
        outdoorModel: outdoor,
        indoorModel: indoor !== "N/A" ? indoor : null,
        coilModel: coil !== "N/A" ? coil : null,
        furnaceModel: furnace !== "N/A" ? furnace : null,
        ahriNumber: ahri,
        seer: tier === "best" ? "20.5" : tier === "better" ? "17.2" : "15.2",
      };
    },
    [config.modelPrefixes, equipmentDb]
  );

  const calculatePriceDetails = useCallback(
    (tierKey) => {
      let basePrice = 0;
      const currentTon = selectedTon;
      if (config.pricingMode === "manual" && config.manualPrices[currentTon]) {
        const raw = config.manualPrices[currentTon]?.[tierKey];
        basePrice = raw === "" || raw === undefined || raw === null ? 0 : raw;
      }
      const tierSystemType = config.tierConfig[tierKey]?.systemType;
      const typeUpcharge = config.typeModifiers[tierSystemType] || 0;
      const addonsTotal = selectedAddons.reduce((sum, id) => {
        const isIncludedInTier = config.tierPackages[tierKey].includes(id);
        if (isIncludedInTier) return sum;
        const item = config.addons.find((a) => a.id === id);
        return sum + (item ? item.price : 0);
      }, 0);
      const rawAdj = config.manualAdjustments?.[tierKey];
      const manualAdj =
        rawAdj === "" || rawAdj === undefined || rawAdj === null ? 0 : rawAdj;
      const subtotal = basePrice + manualAdj + typeUpcharge + addonsTotal;
      const discountConfig = config.discounts[tierKey];
      let discountAmount = 0;
      if (discountConfig && discountConfig.value > 0) {
        discountAmount =
          discountConfig.type === "%"
            ? subtotal * (discountConfig.value / 100)
            : discountConfig.value;
      }
      return {
        finalPrice: Math.round(Math.max(0, subtotal - discountAmount)),
        discountAmount: Math.round(discountAmount),
        discountType: discountConfig.type,
        discountValue: discountConfig.value,
        subtotal: Math.round(subtotal),
      };
    },
    [
      selectedTon,
      selectedAddons,
      config.manualPrices,
      config.tierConfig,
      config.typeModifiers,
      config.tierPackages,
      config.addons,
      config.manualAdjustments,
      config.discounts,
      config.pricingMode,
    ]
  );

  const getFinancingForTier = useCallback(
    (tier) => {
      const ids = config.tierFinancing[tier];
      if (!Array.isArray(ids)) return [];
      return ids
        .map((id) =>
          id === -1
            ? null
            : config.financingOptions.find((opt) => opt.id === id)
        )
        .filter(Boolean);
    },
    [config.tierFinancing, config.financingOptions]
  );

  const handleSelectQuote = (tierKey) => {
    const priceDetails = calculatePriceDetails(tierKey);
    const financing = getFinancingForTier(tierKey);
    const includedAddons = config.tierPackages[tierKey]
      .map((id) => config.addons.find((a) => a.id === id))
      .filter(Boolean);
    const userSelectedAddons = selectedAddons
      .map((id) => config.addons.find((a) => a.id === id))
      .filter(Boolean);
    const uniqueUserAddons = userSelectedAddons.filter(
      (uAddon) => !includedAddons.some((iAddon) => iAddon.id === uAddon.id)
    );
    const systemTypeId = config.tierConfig[tierKey].systemType;
    const systemType = SYSTEM_TYPES.find((s) => s.id === systemTypeId);
    const equipmentData = getEquipmentDataHelper(
      tierKey,
      selectedTon,
      systemTypeId
    );
    const tierDef = config.tierDefinitions[tierKey];
    const quoteData = {
      tierKey,
      tierName: tierDef.label,
      brandLabel: tierDef.brand.toUpperCase(),
      systemSize: selectedTon,
      systemTypeLabel: systemType?.label || "",
      priceDetails,
      financing,
      includedAddons,
      selectedAddons: uniqueUserAddons,
      features: config.tierFeatures[tierKey], // Use Dynamic Config
      equipmentData,
    };
    setSelectedQuote(quoteData);
    setCurrentView("quote_review");
    window.scrollTo(0, 0);
  };

  const value = {
    config,
    customer,
    selectedTon,
    selectedAddons,
    currentView,
    selectedQuote,
    showAdmin,
    bulkFactor,
    newAddon,
    savedEstimates,
    isSaving,
    savedCustomers,
    equipmentDb,
    saveEstimate,
    deleteEstimate,
    saveCustomerProfile,
    deleteCustomerProfile,
    loadProposalState,
    saveEquipmentToDb,
    saveGlobalSettings,
    addFinancingPlan,
    removeFinancingPlan,
    updateAddon,
    updateTierFeature,
    addTierFeature,
    removeTierFeature,
    setConfig,
    setCustomer,
    setSelectedTon,
    setSelectedAddons,
    setCurrentView,
    setSelectedQuote,
    setShowAdmin,
    setBulkFactor,
    setNewAddon,
    updateConfig,
    updateCustomer,
    resetCustomerInfo,
    resetManualAdjustments,
    resetTierPackages,
    resetFinancingSelections,
    resetDiscounts,
    toggleAddon,
    updateTierConfig,
    addCustomAddon,
    deleteAddon,
    togglePackageItem,
    updateDiscount,
    applyBulkFactor,
    handleSelectQuote,
    calculatePriceDetails,
    getFinancingForTier,
    moveTier,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};

const useConfig = () => useContext(ConfigContext);

// --- VIEW COMPONENTS ---

const AdminPanel = () => {
  // ... same admin code as before ...
  const {
    config,
    customer,
    showAdmin,
    setShowAdmin,
    updateConfig,
    updateCustomer,
    resetCustomerInfo,
    resetManualAdjustments,
    resetTierPackages,
    resetFinancingSelections,
    resetDiscounts,
    updateTierConfig,
    togglePackageItem,
    updateDiscount,
    applyBulkFactor,
    bulkFactor,
    setBulkFactor,
    newAddon,
    setNewAddon,
    addCustomAddon,
    deleteAddon,
    saveCustomerProfile,
    savedCustomers,
    deleteCustomerProfile,
    setCustomer,
    equipmentDb,
    saveEquipmentToDb,
    moveTier,
    selectedTon,
    setSelectedTon,
    saveGlobalSettings,
    addFinancingPlan,
    removeFinancingPlan,
    updateAddon,
    updateTierFeature,
    addTierFeature,
    removeTierFeature,
  } = useConfig();

  const [collapsed, setCollapsed] = useState({
    customerInfo: true,
    tierConfig: true,
    financing: true,
    packageAssignment: true,
    packageAdjustments: true,
    discounts: true,
    manualGrid: true,
    enhancementLibrary: true,
    systemTypes: true,
    modelPrefixes: true,
    customerDB: true,
    equipmentDb: true,
    slotConfig: true,
    quoteConfig: true,
    systemSize: true,
    tierFeatures: true,
  });
  const [newFinRate, setNewFinRate] = useState("");
  const [newFinMonths, setNewFinMonths] = useState("");
  const toggleSection = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  const [editingTier, setEditingTier] = useState(null);
  const [dbTier, setDbTier] = useState("slot1");
  const [dbType, setDbType] = useState("heat_pump");
  const [dbData, setDbData] = useState({});

  useEffect(() => {
    const key = `${dbTier}_${dbType}`;
    const existing = equipmentDb[key] || {};
    setDbData(existing);
  }, [dbTier, dbType, equipmentDb]);

  const handleDbChange = (ton, field, val) => {
    setDbData((prev) => ({ ...prev, [ton]: { ...prev[ton], [field]: val } }));
  };

  const hasCustomerInfo = Object.values(customer).some(
    (val) => val && val.trim() !== ""
  );
  const hasTierConfig = Object.values(config.tierConfig).some(
    (c) => c.systemType !== "heat_pump" || c.visible === false
  );
  const hasFinancing = Object.values(config.tierFinancing)
    .flat()
    .some((id) => id !== -1);
  const hasPackages = Object.values(config.tierPackages).some(
    (list) => list.length > 0
  );
  const hasAdjustments = Object.values(config.manualAdjustments).some(
    (val) => val > 0 || val < 0
  );
  const hasDiscounts = Object.values(config.discounts).some((d) => d.value > 0);
  const activeTierOrder = config.tierOrder || TIER_KEYS;

  if (!showAdmin) return null;

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 relative z-50 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-blue-900">
          <Calculator size={20} /> Price Book Settings
        </h2>
        <button onClick={() => setShowAdmin(false)}>
          <X className="text-slate-400" />
        </button>
      </div>
      <div className="space-y-8">
        {/* 1. CUSTOMER INFO */}
        <HeaderSection
          number={1}
          title="Customer Information"
          hasData={hasCustomerInfo}
          collapsed={collapsed.customerInfo}
          toggle={() => toggleSection("customerInfo")}
          reset={resetCustomerInfo}
        />
        {!collapsed.customerInfo && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white"
                  value={customer.firstName}
                  onChange={(e) => updateCustomer("firstName", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white"
                  value={customer.lastName}
                  onChange={(e) => updateCustomer("lastName", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Street Address
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white"
                  value={customer.street}
                  onChange={(e) => updateCustomer("street", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  City
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white"
                  value={customer.city}
                  onChange={(e) => updateCustomer("city", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">
                    State
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-white"
                    value={customer.state}
                    onChange={(e) => updateCustomer("state", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Zip
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-white"
                    value={customer.zip}
                    onChange={(e) => updateCustomer("zip", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border rounded bg-white"
                  value={customer.email}
                  onChange={(e) => updateCustomer("email", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded bg-white"
                  value={customer.phone}
                  onChange={(e) => updateCustomer("phone", e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={saveCustomerProfile}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 w-full justify-center"
            >
              <Save size={16} /> Save to Customer Database
            </button>
          </div>
        )}

        {/* 2. SYSTEM SIZE */}
        <HeaderSection
          number={2}
          title="System Size (Tonnage)"
          hasData={true}
          collapsed={collapsed.systemSize}
          toggle={() => toggleSection("systemSize")}
        />
        {!collapsed.systemSize && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap gap-2 justify-center">
              {TONS.map((ton) => (
                <button
                  key={ton}
                  onClick={() => setSelectedTon(ton)}
                  className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${
                    selectedTon === ton
                      ? "bg-blue-600 text-white ring-2 ring-blue-200"
                      : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-300"
                  }`}
                >
                  {ton} Ton
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. SLOT DESIGN & ORDER */}
        <HeaderSection
          number={3}
          title="Slot Design & Order"
          hasData={true}
          collapsed={collapsed.tierConfig}
          toggle={() => toggleSection("tierConfig")}
        />
        {!collapsed.tierConfig && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {activeTierOrder.map((tier, index) => {
                const { short, color, label } = config.tierDefinitions[tier];
                const isEditing = editingTier === tier;
                return (
                  <div
                    key={tier}
                    className="bg-white p-3 rounded border border-slate-200 relative group"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                      <span
                        className={`text-[10px] font-bold uppercase text-slate-400`}
                      >
                        Slot {index + 1}
                      </span>
                      <div className="flex gap-1 items-center">
                        <button
                          disabled={index === 0}
                          onClick={() => moveTier(index, "up")}
                          className="p-1 text-slate-300 hover:text-blue-600 disabled:opacity-30"
                        >
                          <ArrowLeftCircle size={14} />
                        </button>
                        <button
                          disabled={index === activeTierOrder.length - 1}
                          onClick={() => moveTier(index, "down")}
                          className="p-1 text-slate-300 hover:text-blue-600 disabled:opacity-30"
                        >
                          <ArrowRightCircle size={14} />
                        </button>
                        <div className="w-px h-3 bg-slate-200 mx-1"></div>
                        <button
                          onClick={() =>
                            setEditingTier(isEditing ? null : tier)
                          }
                          className={`p-1 rounded transition-colors ${
                            isEditing
                              ? "text-white bg-green-500"
                              : "text-slate-400 hover:text-blue-600"
                          }`}
                        >
                          {isEditing ? (
                            <Check size={14} />
                          ) : (
                            <Edit3 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Card Title
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className={`w-full p-1 text-sm font-bold border border-${color}-200 rounded bg-${color}-50 text-${color}-700`}
                            value={label}
                            onChange={(e) =>
                              updateConfig(
                                "tierDefinitions",
                                tier,
                                e.target.value,
                                "label"
                              )
                            }
                          />
                        ) : (
                          <div
                            className={`text-sm font-bold text-${color}-700 truncate`}
                          >
                            {label}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Badge Label
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className={`w-full p-1 text-sm font-medium border border-slate-300 rounded`}
                            value={short}
                            onChange={(e) =>
                              updateConfig(
                                "tierDefinitions",
                                tier,
                                e.target.value,
                                "short"
                              )
                            }
                          />
                        ) : (
                          <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded truncate">
                            {short}
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Theme
                          </label>
                          <select
                            className="w-full p-1 text-xs border rounded"
                            value={color}
                            onChange={(e) =>
                              updateConfig(
                                "tierDefinitions",
                                tier,
                                e.target.value,
                                "color"
                              )
                            }
                          >
                            <option value="blue">Blue</option>
                            <option value="orange">Orange</option>
                            <option value="indigo">Indigo</option>
                            <option value="slate">Slate</option>
                            <option value="red">Red</option>
                            <option value="green">Green</option>
                            <option value="gray">Gray</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={saveGlobalSettings}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
            >
              <Cloud size={16} /> Save Slot Configuration to Cloud
            </button>
          </div>
        )}

        {/* 4. QUOTE CONFIGURATION */}
        <HeaderSection
          number={4}
          title="Quote Configuration (Type & Visibility)"
          hasData={true}
          collapsed={collapsed.quoteConfig}
          toggle={() => toggleSection("quoteConfig")}
        />
        {!collapsed.quoteConfig && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {activeTierOrder.map((tier) => (
                <div
                  key={tier}
                  className="bg-white p-3 rounded border border-slate-200"
                >
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2 truncate">
                    {config.tierDefinitions[tier].short}
                  </div>
                  <div className="mb-3">
                    <select
                      value={config.tierConfig[tier]?.systemType || "heat_pump"}
                      onChange={(e) =>
                        updateTierConfig(tier, "systemType", e.target.value)
                      }
                      className="w-full p-1.5 text-sm border rounded bg-slate-50"
                    >
                      {SYSTEM_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-slate-100 p-2 rounded">
                    <span className="text-xs text-slate-600 font-bold">
                      Show?
                    </span>
                    <input
                      type="checkbox"
                      checked={config.tierConfig[tier]?.visible}
                      onChange={(e) =>
                        updateTierConfig(tier, "visible", e.target.checked)
                      }
                      className="w-5 h-5 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FINANCING */}
        <HeaderSection
          number={5}
          title="Financing Options"
          hasData={hasFinancing}
          collapsed={collapsed.financing}
          toggle={() => toggleSection("financing")}
          reset={resetFinancingSelections}
        />
        {!collapsed.financing && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {activeTierOrder.map((tier) => (
                <div
                  key={tier}
                  className="bg-white p-3 rounded border border-slate-200"
                >
                  <label
                    className={`block text-xs font-bold uppercase mb-2 text-slate-600`}
                  >
                    {config.tierDefinitions[tier].short}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[0, 1].map((index) => (
                      <select
                        key={index}
                        value={config.tierFinancing[tier][index] || -1}
                        onChange={(e) => {
                          const id = parseInt(e.target.value);
                          updateConfig("tierFinancing", tier, [
                            index === 0 ? id : config.tierFinancing[tier][0],
                            index === 1 ? id : config.tierFinancing[tier][1],
                          ]);
                        }}
                        className="w-full p-2 text-sm border rounded bg-slate-50"
                      >
                        <option value="-1">-- No Plan --</option>
                        {config.financingOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.months} Mo @ {opt.rate}%
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-4 rounded border border-slate-200 mb-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">
                Active Plans
              </h4>
              <div className="space-y-2">
                {config.financingOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100"
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {opt.months} Months @ {opt.rate}%
                    </span>
                    <button
                      onClick={() => removeFinancingPlan(opt.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-bold uppercase text-slate-500 mb-1">
                  Months
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 18"
                  value={newFinMonths}
                  onChange={(e) => setNewFinMonths(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold uppercase text-slate-500 mb-1">
                  Rate (%)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 0"
                  value={newFinRate}
                  onChange={(e) => setNewFinRate(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  if (newFinMonths && newFinRate !== "") {
                    addFinancingPlan(newFinRate, newFinMonths);
                    setNewFinMonths("");
                    setNewFinRate("");
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} /> Add Plan
              </button>
            </div>
            <button
              onClick={saveGlobalSettings}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
            >
              <Cloud size={16} /> Save Financing Settings to Cloud
            </button>
          </div>
        )}

        {/* 6. ADDONS */}
        <HeaderSection
          number={6}
          title="Assign Enhancement to Tier Packages"
          hasData={hasPackages}
          collapsed={collapsed.packageAssignment}
          toggle={() => toggleSection("packageAssignment")}
          reset={resetTierPackages}
        />
        {!collapsed.packageAssignment && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto">
            <p className="text-sm text-slate-500 mb-4">
              Select which enhancements are included in each tier. To add more
              rows, use Section 11.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200">
                  <th className="pb-2">Enhancement</th>
                  {activeTierOrder.map((tier) => (
                    <th key={tier} className={`pb-2 text-center`}>
                      {config.tierDefinitions[tier].short.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.addons.map((addon) => (
                  <tr key={addon.id} className="border-b border-slate-200">
                    <td className="py-3 pr-2 font-medium text-slate-700">
                      {addon.name}
                    </td>
                    {activeTierOrder.map((tier) => (
                      <td key={tier} className="text-center">
                        <input
                          type="checkbox"
                          checked={config.tierPackages[tier].includes(addon.id)}
                          onChange={() => togglePackageItem(tier, addon.id)}
                          className={`w-5 h-5 rounded`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={saveGlobalSettings}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
            >
              <Cloud size={16} /> Save Assignments to Cloud
            </button>
          </div>
        )}

        {/* 7. ADJUSTMENTS */}
        <div className="border-t pt-6">
          <HeaderSection
            number={7}
            title="Package Price Adjust"
            hasData={hasAdjustments}
            collapsed={collapsed.packageAdjustments}
            toggle={() => toggleSection("packageAdjustments")}
            reset={resetManualAdjustments}
          />
          {!collapsed.packageAdjustments && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeTierOrder.map((tier) => (
                <div key={tier}>
                  <label className="text-xs font-bold uppercase">
                    {config.tierDefinitions[tier].short}
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="0"
                    value={config.manualAdjustments?.[tier] ?? ""}
                    onChange={(e) =>
                      updateConfig("manualAdjustments", tier, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. DISCOUNTS */}
        <div className="border-t pt-6">
          <HeaderSection
            number={8}
            title="Discounts"
            hasData={hasDiscounts}
            collapsed={collapsed.discounts}
            toggle={() => toggleSection("discounts")}
            reset={resetDiscounts}
          />
          {!collapsed.discounts && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeTierOrder.map((tier) => (
                <div key={tier}>
                  <label className="text-xs font-bold uppercase">
                    {config.tierDefinitions[tier].short}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={config.discounts[tier].type}
                      onChange={(e) =>
                        updateDiscount(tier, "type", e.target.value)
                      }
                      className="w-16 p-2 border rounded"
                    >
                      <option value="$">$</option>
                      <option value="%">%</option>
                    </select>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      placeholder="0"
                      value={config.discounts[tier].value || ""}
                      onChange={(e) =>
                        updateDiscount(tier, "value", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 9. MANUAL GRID */}
        <div className="border-t pt-6">
          <HeaderSection
            number={9}
            title="Manual Base Pricing Grid"
            hasData={true}
            collapsed={collapsed.manualGrid}
            toggle={() => toggleSection("manualGrid")}
          />
          {!collapsed.manualGrid && (
            <div className="overflow-x-auto bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="mb-4 flex items-center gap-2">
                <label className="text-xs font-bold uppercase">
                  Bulk Multiplier:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bulkFactor}
                  onChange={(e) => setBulkFactor(parseFloat(e.target.value))}
                  className="p-2 border rounded w-24"
                />
                <button
                  onClick={applyBulkFactor}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  Apply
                </button>
              </div>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase">
                    <th className="px-4 py-2">Size</th>
                    {activeTierOrder.map((tier) => (
                      <th key={tier} className="px-4 py-2">
                        {config.tierDefinitions[tier].short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TONS.map((ton) => (
                    <tr key={ton} className="border-b">
                      <td className="px-4 py-2 font-bold">{ton} Ton</td>
                      {activeTierOrder.map((tier) => (
                        <td key={tier} className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full p-2 border rounded"
                            placeholder="Base"
                            value={config.manualPrices[ton]?.[tier] ?? ""}
                            onChange={(e) =>
                              updateConfig(
                                "manualPrices",
                                ton,
                                e.target.value,
                                tier
                              )
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={saveGlobalSettings}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
              >
                <Cloud size={16} /> Save Pricing to Cloud
              </button>
            </div>
          )}
        </div>

        {/* 10. UPCHARGES */}
        <div className="border-t pt-6">
          <HeaderSection
            number={10}
            title="System Type Upcharges"
            hasData={true}
            collapsed={collapsed.systemTypes}
            toggle={() => toggleSection("systemTypes")}
          />
          {!collapsed.systemTypes && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(config.typeModifiers).map((key) => (
                  <div key={key}>
                    <label className="text-xs font-bold uppercase truncate">
                      {SYSTEM_TYPES.find((s) => s.id === key)?.label || key}
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={config.typeModifiers[key]}
                      onChange={(e) =>
                        updateConfig("typeModifiers", key, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={saveGlobalSettings}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
              >
                <Cloud size={16} /> Save Upcharges to Cloud
              </button>
            </div>
          )}
        </div>

        {/* 11. ENHANCEMENT LIBRARY */}
        <div className="border-t pt-6">
          <HeaderSection
            number={11}
            title="Enhancement Library"
            hasData={config.addons.length > INITIAL_ADDONS.length}
            collapsed={collapsed.enhancementLibrary}
            toggle={() => toggleSection("enhancementLibrary")}
          />
          {!collapsed.enhancementLibrary && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {config.addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center gap-2 bg-white p-2 rounded border"
                  >
                    <input
                      className="flex-grow text-sm font-bold border-none focus:ring-0"
                      value={addon.name}
                      onChange={(e) =>
                        updateAddon(addon.id, "name", e.target.value)
                      }
                    />
                    <div className="flex items-center">
                      <span className="text-sm text-slate-400 mr-1">$</span>
                      <input
                        type="number"
                        className="w-16 text-sm text-right border rounded p-1"
                        value={addon.price}
                        onChange={(e) =>
                          updateAddon(
                            addon.id,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-1 ml-2 border-l pl-2">
                      <span className="text-[10px] text-slate-400 uppercase">
                        Show?
                      </span>
                      <input
                        type="checkbox"
                        checked={addon.visible !== false}
                        onChange={(e) =>
                          updateAddon(addon.id, "visible", e.target.checked)
                        }
                      />
                    </div>
                    <button
                      onClick={() => deleteAddon(addon.id)}
                      className="text-slate-400 hover:text-red-500 ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newAddon.name}
                  onChange={(e) =>
                    setNewAddon({ ...newAddon, name: e.target.value })
                  }
                  className="flex-grow p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newAddon.price}
                  onChange={(e) =>
                    setNewAddon({ ...newAddon, price: e.target.value })
                  }
                  className="w-24 p-2 border rounded"
                />
                <button
                  onClick={addCustomAddon}
                  className="bg-green-600 text-white p-2 rounded"
                >
                  <Plus size={20} />
                </button>
              </div>
              <button
                onClick={saveGlobalSettings}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
              >
                <Cloud size={16} /> Save Enhancements to Cloud
              </button>
            </div>
          )}
        </div>

        {/* 12. MODEL PREFIXES */}
        <div className="border-t pt-6">
          <HeaderSection
            number={12}
            title="Equipment Model Prefixes"
            hasData={true}
            collapsed={collapsed.modelPrefixes}
            toggle={() => toggleSection("modelPrefixes")}
          />
          {!collapsed.modelPrefixes && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTierOrder.map((tier) => (
                <div
                  key={tier}
                  className="bg-white p-3 rounded border border-slate-200"
                >
                  <h4
                    className={`text-xs font-bold uppercase mb-2 text-${config.tierDefinitions[tier].color}-600`}
                  >
                    {config.tierDefinitions[tier].label}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="w-20 text-xs font-bold text-slate-400">
                        Outdoor (HP):
                      </span>
                      <input
                        className="flex-grow p-1 border rounded text-sm font-mono"
                        value={config.modelPrefixes?.[tier]?.outHP || ""}
                        onChange={(e) =>
                          updateConfig(
                            "modelPrefixes",
                            tier,
                            e.target.value,
                            "outHP"
                          )
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-20 text-xs font-bold text-slate-400">
                        Outdoor (AC):
                      </span>
                      <input
                        className="flex-grow p-1 border rounded text-sm font-mono"
                        value={config.modelPrefixes?.[tier]?.outAC || ""}
                        onChange={(e) =>
                          updateConfig(
                            "modelPrefixes",
                            tier,
                            e.target.value,
                            "outAC"
                          )
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-20 text-xs font-bold text-slate-400">
                        Indoor:
                      </span>
                      <input
                        className="flex-grow p-1 border rounded text-sm font-mono"
                        value={config.modelPrefixes?.[tier]?.in || ""}
                        onChange={(e) =>
                          updateConfig(
                            "modelPrefixes",
                            tier,
                            e.target.value,
                            "in"
                          )
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-20 text-xs font-bold text-slate-400">
                        Furnace:
                      </span>
                      <input
                        className="flex-grow p-1 border rounded text-sm font-mono"
                        value={config.modelPrefixes?.[tier]?.gas || ""}
                        onChange={(e) =>
                          updateConfig(
                            "modelPrefixes",
                            tier,
                            e.target.value,
                            "gas"
                          )
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="w-20 text-xs font-bold text-slate-400">
                        Coil:
                      </span>
                      <input
                        className="flex-grow p-1 border rounded text-sm font-mono"
                        value={config.modelPrefixes?.[tier]?.coil || ""}
                        onChange={(e) =>
                          updateConfig(
                            "modelPrefixes",
                            tier,
                            e.target.value,
                            "coil"
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={saveGlobalSettings}
                className="col-span-1 md:col-span-2 mt-4 w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
              >
                <Cloud size={16} /> Save Prefixes to Cloud
              </button>
            </div>
          )}
        </div>

        {/* 13. CUSTOMER DATABASE */}
        <div className="border-t pt-6">
          <HeaderSection
            number={13}
            title="Customer Database"
            hasData={savedCustomers.length > 0}
            collapsed={collapsed.customerDB}
            toggle={() => toggleSection("customerDB")}
          />
          {!collapsed.customerDB && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              {savedCustomers.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  No saved customers yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      className="flex justify-between items-center bg-white p-3 rounded border border-slate-200"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-800">
                          {cust.firstName} {cust.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {cust.street}, {cust.city}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCustomer(cust)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteCustomerProfile(cust.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 14. EQUIPMENT DATABASE MANAGER */}
        <div className="border-t pt-6">
          <HeaderSection
            number={14}
            title="Equipment Database Manager"
            hasData={true}
            collapsed={collapsed.equipmentDb}
            toggle={() => toggleSection("equipmentDb")}
          />
          {!collapsed.equipmentDb && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Tier
                  </label>
                  <select
                    value={dbTier}
                    onChange={(e) => setDbTier(e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    {TIER_KEYS.map((t) => (
                      <option key={t} value={t}>
                        {config.tierDefinitions[t].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    System Type
                  </label>
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    {SYSTEM_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-200 text-slate-600 uppercase">
                      <th className="p-2">Ton</th>
                      <th className="p-2">Outdoor Model</th>
                      <th className="p-2">Indoor Model</th>
                      <th className="p-2">Furnace</th>
                      <th className="p-2">Coil</th>
                      <th className="p-2">AHRI #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TONS.map((ton) => (
                      <tr
                        key={ton}
                        className="border-b border-slate-100 bg-white"
                      >
                        <td className="p-2 font-bold">{ton}</td>
                        <td className="p-1">
                          <input
                            className="w-full border rounded p-1"
                            value={dbData[ton]?.outdoorModel || ""}
                            onChange={(e) =>
                              handleDbChange(
                                ton,
                                "outdoorModel",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            className="w-full border rounded p-1"
                            value={dbData[ton]?.indoorModel || ""}
                            onChange={(e) =>
                              handleDbChange(ton, "indoorModel", e.target.value)
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            className="w-full border rounded p-1"
                            value={dbData[ton]?.furnaceModel || ""}
                            onChange={(e) =>
                              handleDbChange(
                                ton,
                                "furnaceModel",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            className="w-full border rounded p-1"
                            value={dbData[ton]?.coilModel || ""}
                            onChange={(e) =>
                              handleDbChange(ton, "coilModel", e.target.value)
                            }
                          />
                        </td>
                        <td className="p-1">
                          <input
                            className="w-full border rounded p-1"
                            value={dbData[ton]?.ahriNumber || ""}
                            onChange={(e) =>
                              handleDbChange(ton, "ahriNumber", e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => saveEquipmentToDb(dbTier, dbType, dbData)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
              >
                <Cloud size={16} /> Save This Combination to Database
              </button>
            </div>
          )}
        </div>

        {/* 15. CORE FEATURES EDITOR */}
        <div className="border-t pt-6">
          <HeaderSection
            number={15}
            title="Core Features Editor"
            hasData={true}
            collapsed={collapsed.tierFeatures}
            toggle={() => toggleSection("tierFeatures")}
          />
          {!collapsed.tierFeatures && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTierOrder.map((tier) => (
                <div
                  key={tier}
                  className="bg-white p-3 rounded border border-slate-200"
                >
                  <h4
                    className={`text-xs font-bold uppercase mb-2 text-${config.tierDefinitions[tier].color}-600`}
                  >
                    {config.tierDefinitions[tier].label} Features
                  </h4>
                  <div className="space-y-2 mb-3">
                    {config.tierFeatures[tier].map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          className="flex-grow p-1 border rounded text-sm"
                          value={feature}
                          onChange={(e) =>
                            updateTierFeature(tier, idx, e.target.value)
                          }
                        />
                        <button
                          onClick={() => removeTierFeature(tier, idx)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addTierFeature(tier)}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800"
                  >
                    <Plus size={14} /> Add Feature
                  </button>
                </div>
              ))}
              <button
                onClick={saveGlobalSettings}
                className="col-span-1 md:col-span-2 mt-4 w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
              >
                <Cloud size={16} /> Save Features to Cloud
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowAdmin(false)}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-colors"
          >
            <Check size={16} /> Done (Close Settings)
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW HISTORY VIEW ---
const HistoryView = () => {
  const {
    savedEstimates,
    setCurrentView,
    setSelectedQuote,
    setCustomer,
    deleteEstimate,
    loadProposalState,
    config,
  } = useConfig();

  const handleOpen = (estimate) => {
    setSelectedQuote(estimate.quote);
    setCustomer(estimate.customer);
    setCurrentView("estimate");
  };

  // NEW: Reload Board Function
  const handleReload = (estimate) => {
    setCustomer(estimate.customer);
    if (estimate.proposalState) {
      loadProposalState(estimate.proposalState);
    } else {
      // Fallback for older records
      alert(
        "This older record does not have full proposal data saved. Loading customer info only."
      );
      setCurrentView("pricing");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-xl mt-6 border border-slate-200 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <button
          onClick={() => setCurrentView("pricing")}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Accepted Estimates History
          </h2>
        </div>
      </div>

      {savedEstimates.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <History size={48} className="mx-auto mb-4 opacity-50" />
          <p>No accepted estimates found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedEstimates.map((est) => (
            <div
              key={est.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors group"
            >
              <div
                onClick={() => handleOpen(est)}
                className="flex-grow cursor-pointer"
              >
                <h4 className="font-bold text-slate-800 group-hover:text-blue-700">
                  {est.customer?.firstName} {est.customer?.lastName}
                </h4>
                <p className="text-sm text-slate-500">
                  {est.dateString} • {est.tierName}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {est.systemSummary}
                </p>
              </div>
              <div className="mt-2 md:mt-0 flex items-center gap-4">
                <div
                  className="text-right cursor-pointer"
                  onClick={() => handleOpen(est)}
                >
                  <p className="font-black text-slate-800 text-lg group-hover:text-blue-700">
                    {formatCurrency(est.finalPrice)}
                  </p>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                    ACCEPTED
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReload(est);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all"
                    title="Reload Proposal Board"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEstimate(est.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Delete Estimate"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const QuoteReview = () => {
  const { selectedQuote: quote, setCurrentView, config } = useConfig();
  if (!quote) return null;
  const { label, short, color, brand } = config.tierDefinitions[quote.tierKey];
  const equipment = quote.equipmentData || {};
  // Use features from the quote data which captures the state at selection time
  const features = quote.features || [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-xl mt-6 border border-slate-200 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <button
          onClick={() => setCurrentView("pricing")}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            System Configuration Review
          </h2>
          <p className="text-slate-500 text-sm">
            Verify equipment details before generating proposal.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div
            className={`p-6 rounded-xl bg-gradient-to-br from-${color}-50 to-white border border-${color}-100`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider text-${color}-600 bg-white px-2 py-1 rounded border border-${color}-200`}
                >
                  {short}
                </span>
                <h3 className={`text-3xl font-black text-${color}-900 mt-2`}>
                  {label}
                </h3>
                <p className="text-slate-600 font-medium">
                  {brand.toUpperCase()} • {quote.systemSize} Ton •{" "}
                  {quote.systemTypeLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900">
                  {formatCurrency(quote.priceDetails.finalPrice)}
                </p>
                {quote.priceDetails.discountAmount > 0 && (
                  <p className="text-sm text-red-500 font-bold">
                    Includes Savings!
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Box size={18} /> Equipment Inventory
              </h4>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              {equipment.outdoorModel && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                    Outdoor Unit
                  </p>
                  <p className="font-mono font-bold text-slate-800 text-lg">
                    {equipment.outdoorModel}
                  </p>
                </div>
              )}
              {equipment.indoorModel && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                    Indoor Air Handler
                  </p>
                  <p className="font-mono font-bold text-slate-800 text-lg">
                    {equipment.indoorModel}
                  </p>
                </div>
              )}
              {equipment.furnaceModel && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                    Gas Furnace
                  </p>
                  <p className="font-mono font-bold text-slate-800 text-lg">
                    {equipment.furnaceModel}
                  </p>
                </div>
              )}
              {equipment.coilModel && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                    Evaporator Coil
                  </p>
                  <p className="font-mono font-bold text-slate-800 text-lg">
                    {equipment.coilModel}
                  </p>
                </div>
              )}
              <div className="col-span-1 sm:col-span-2 pt-4 border-t border-slate-200 flex gap-8">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                    AHRI Certificate #
                  </p>
                  <p className="font-mono font-bold text-blue-700">
                    {equipment.ahriNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                    SEER2 Rating
                  </p>
                  <p className="font-mono font-bold text-green-700">
                    {equipment.seer}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 mb-3">
              Included Features & Enhancements
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((f, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-600 flex items-center gap-2"
                >
                  <CheckCircle size={14} className={`text-${color}-500`} /> {f}
                </li>
              ))}
              {quote.includedAddons.map((addon, i) => (
                <li
                  key={`inc-${i}`}
                  className="text-sm text-green-700 font-medium flex items-center gap-2"
                >
                  <Package size={14} className="text-green-500" /> {addon.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 h-full flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-blue-900 mb-4">
                Ready to Finalize?
              </h4>
              <p className="text-sm text-blue-800 mb-6">
                Review the model numbers and pricing on the left. If everything
                looks correct, proceed to the signature page.
              </p>
            </div>
            <button
              onClick={() => setCurrentView("estimate")}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              Generate Proposal <ArrowRightLeft size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EstimateView = () => {
  const {
    selectedQuote: quote,
    customer,
    config,
    setCurrentView,
    saveEstimate,
    isSaving,
  } = useConfig();
  const [signatureData, setSignatureData] = useState(null);
  const [isInvoice, setIsInvoice] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const invoiceNumber = useMemo(
    () => `INV-${Math.floor(Math.random() * 900000) + 100000}`,
    []
  );
  const estimateNumber = useMemo(
    () => `EST-${Math.floor(Math.random() * 900000) + 100000}`,
    []
  );
  const todayDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  if (!quote) return null;
  const eq = quote.equipmentData || {};

  const calculatePayment = (total, rate, months) => {
    if (rate === 0) return (total / months).toFixed(0);
    const r = rate / 100 / 12;
    const payment =
      total * ((r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
    return payment.toFixed(0);
  };

  const handlePrint = () => window.print();
  const handleEmail = () => {
    const subject = `${isInvoice ? "INVOICE" : "ESTIMATE"} from ${
      config.companyName
    }`;
    const body = `--- ${
      isInvoice ? "INVOICE" : "ESTIMATE"
    } ---\nPrepared For: ${customer.firstName} ${
      customer.lastName
    }\nTotal: ${formatCurrency(quote.priceDetails.finalPrice)}`;
    window.location.href = `mailto:${
      customer.email
    }?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  const handleAccept = async () => {
    setIsInvoice(true);
    if (!hasSaved) {
      await saveEstimate(quote, customer, signatureData);
      setHasSaved(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-slate-50 shadow-2xl rounded-lg mt-6">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => setCurrentView("quote_review")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
        >
          <ArrowLeft size={20} /> Edit System
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={!signatureData || isSaving}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              signatureData
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <Loader className="animate-spin" size={16} />
            ) : isInvoice ? (
              "Saved & Converted"
            ) : (
              "Accept & Convert"
            )}{" "}
            <Check size={16} />
          </button>
          <button
            onClick={handleEmail}
            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <Send size={20} />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>
      <div
        className="border border-slate-300 p-6 md:p-10 bg-white"
        id="estimate-document"
      >
        <div className="flex justify-between items-start border-b-4 border-blue-600 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900">
              {config.companyName}
            </h1>
            <p className="text-sm text-slate-600 mt-1">571-454-5550</p>
          </div>
          <div className="text-right">
            <h2
              className={`text-4xl font-black ${
                isInvoice ? "text-red-600" : "text-green-600"
              }`}
            >
              {isInvoice ? "INVOICE" : "ESTIMATE"}
            </h2>
            <p className="text-sm text-slate-500 mt-2">Date: {todayDate}</p>
            <p className="text-sm text-slate-500">
              {isInvoice ? invoiceNumber : estimateNumber}
            </p>
          </div>
        </div>
        <div className="mb-8 border-b pb-4">
          <h3 className="text-sm font-bold uppercase text-slate-600 mb-2">
            Prepared For
          </h3>
          <p className="text-lg font-semibold">
            {customer.firstName} {customer.lastName}
          </p>
          <p className="text-sm text-slate-600">
            {customer.street} {customer.city}
          </p>
        </div>
        <h3 className="text-sm font-bold uppercase text-blue-600 mb-3">
          System Installation Details
        </h3>
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-sm font-bold uppercase">
              <th className="p-3 w-3/4">Description</th>
              <th className="p-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-3">
                <p className="text-base font-bold text-slate-800">
                  {quote.tierName} System ({quote.brandLabel})
                </p>
                <p className="text-sm font-medium text-slate-600">
                  {quote.systemSize} Ton | {quote.systemTypeLabel}
                </p>
              </td>
              <td className="p-3 text-right font-bold text-slate-800">
                {formatCurrency(
                  quote.priceDetails.subtotal -
                    quote.priceDetails.discountAmount
                )}
              </td>
            </tr>
            {eq.outdoorModel && (
              <tr className="border-b border-slate-100">
                <td className="p-1 pl-6 text-sm text-slate-600" colSpan="2">
                  • Outdoor Unit:{" "}
                  <span className="font-mono font-bold">{eq.outdoorModel}</span>
                </td>
              </tr>
            )}
            {eq.indoorModel && (
              <tr className="border-b border-slate-100">
                <td className="p-1 pl-6 text-sm text-slate-600" colSpan="2">
                  • Air Handler:{" "}
                  <span className="font-mono font-bold">{eq.indoorModel}</span>
                </td>
              </tr>
            )}
            {eq.furnaceModel && (
              <tr className="border-b border-slate-100">
                <td className="p-1 pl-6 text-sm text-slate-600" colSpan="2">
                  • Furnace:{" "}
                  <span className="font-mono font-bold">{eq.furnaceModel}</span>
                </td>
              </tr>
            )}
            {eq.coilModel && (
              <tr className="border-b border-slate-100">
                <td className="p-1 pl-6 text-sm text-slate-600" colSpan="2">
                  • Evap Coil:{" "}
                  <span className="font-mono font-bold">{eq.coilModel}</span>
                </td>
              </tr>
            )}
            <tr className="border-b border-slate-100">
              <td
                className="p-1 pl-6 text-sm text-slate-500 italic"
                colSpan="2"
              >
                AHRI: {eq.ahriNumber}
              </td>
            </tr>
            {quote.includedAddons.map((addon, index) => (
              <tr key={`inc-${index}`}>
                <td className="p-1 pl-6 text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle size={14} /> {addon.name} (Included)
                </td>
                <td className="p-1 text-right text-sm text-slate-500"></td>
              </tr>
            ))}
            {quote.selectedAddons.map((addon, index) => (
              <tr key={`opt-${index}`} className="border-t border-slate-100">
                <td className="p-1 pl-6 text-sm text-slate-700 font-medium">
                  {addon.name}
                </td>
                <td className="p-1 text-right text-sm text-slate-700">
                  {formatCurrency(addon.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-sm">
            <div className="flex justify-between py-1 text-sm text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(quote.priceDetails.subtotal)}</span>
            </div>
            {quote.priceDetails.discountAmount > 0 && (
              <div className="flex justify-between py-1 text-red-600 font-bold border-b border-dashed border-red-300">
                <span>Discount:</span>
                <span>
                  -{formatCurrency(quote.priceDetails.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-slate-400">
              <span className="text-xl font-bold uppercase text-blue-900">
                Total Price:
              </span>
              <span className="text-2xl font-black text-blue-900">
                {formatCurrency(quote.priceDetails.finalPrice)}
              </span>
            </div>
          </div>
        </div>
        {quote.financing.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-bold uppercase text-blue-800 mb-2 flex items-center gap-2">
              <CreditCard size={16} /> Financing Options
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {quote.financing.map((plan, index) => {
                const monthlyPayment = calculatePayment(
                  quote.priceDetails.finalPrice,
                  plan.rate,
                  plan.months
                );
                return (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-md shadow-sm border border-blue-100"
                  >
                    <p className="text-2xl font-black text-green-700">
                      {formatCurrency(monthlyPayment)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {plan.months} Months @ {plan.rate}% APR
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="p-4 border-2 border-slate-200 rounded-xl mb-6">
          <h3 className="text-sm font-bold uppercase text-slate-700 mb-3">
            Customer Acceptance
          </h3>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div className="flex-1 space-y-4">
              <p className="text-sm text-slate-600">
                {isInvoice ? "I acknowledge receipt." : "I agree to purchase."}
              </p>
              <SignaturePad onSave={setSignatureData} />
            </div>
            <div className="w-full md:w-64 space-y-6">
              <div className="border-b border-slate-500 pt-4 relative">
                {signatureData && (
                  <img
                    src={signatureData}
                    alt="Digital Signature"
                    className="absolute bottom-0 w-full h-12 object-contain"
                    style={{ objectPosition: "bottom" }}
                  />
                )}
              </div>
              <div className="border-b border-slate-500">
                <p className="text-sm text-slate-500 text-center uppercase">
                  Customer Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriceCard = React.memo(
  ({
    tier,
    priceDetails,
    addons,
    includedAddons,
    financing,
    onSelect,
    systemTypeLabel,
    systemSize,
  }) => {
    const { config } = useConfig();
    const [isFeaturesCollapsed, setIsFeaturesCollapsed] = useState(false);
    const { label, short, color, brand } = config.tierDefinitions[tier];

    const badgeClass = `bg-${color}-600`;
    const buttonClass = `bg-${color}-600 hover:bg-${color}-700`;
    const featureIconClass = `text-${color}-500`;

    // Tailwind hack to ensure classes exist (safelist equivalent)
    const getColors = (c) => {
      const map = {
        blue: {
          bg: "bg-blue-600",
          hover: "hover:bg-blue-700",
          text: "text-blue-500",
          border: "border-blue-200",
        },
        orange: {
          bg: "bg-orange-600",
          hover: "hover:bg-orange-700",
          text: "text-orange-500",
          border: "border-orange-200",
        },
        indigo: {
          bg: "bg-indigo-600",
          hover: "hover:bg-indigo-700",
          text: "text-indigo-500",
          border: "border-indigo-200",
        },
        slate: {
          bg: "bg-slate-600",
          hover: "hover:bg-slate-700",
          text: "text-slate-500",
          border: "border-slate-200",
        },
        red: {
          bg: "bg-red-600",
          hover: "hover:bg-red-700",
          text: "text-red-500",
          border: "border-red-200",
        },
        green: {
          bg: "bg-green-600",
          hover: "hover:bg-green-700",
          text: "text-green-500",
          border: "border-green-200",
        },
        gray: {
          bg: "bg-gray-600",
          hover: "hover:bg-gray-700",
          text: "text-gray-500",
          border: "border-gray-200",
        },
      };
      return map[c] || map.blue;
    };
    const colors = getColors(color);

    const finalPrice = formatCurrency(priceDetails.finalPrice);

    const calculatePayment = (total, rate, months) => {
      if (months <= 0) return 0;
      if (rate === 0) return total / months;
      const r = rate / 100 / 12;
      return (
        total * ((r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1))
      );
    };

    return (
      <div
        className={`relative bg-white rounded-2xl shadow-lg border-4 border-transparent p-6 flex flex-col transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
        style={{ minHeight: "650px" }}
        onDoubleClick={() => onSelect(tier)}
      >
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-md ${colors.bg}`}
        >
          {short}
        </div>
        <div
          className={`p-4 rounded-xl -mx-6 -mt-6 pt-14 text-white text-center ${colors.bg}`}
        >
          <h2 className="text-2xl font-extrabold uppercase">{label}</h2>
          <p className="text-sm font-semibold mt-1 opacity-90">
            {brand.toUpperCase()}
          </p>
        </div>
        <div className="text-center my-6 space-y-1">
          <p className="text-2xl font-extrabold text-blue-900 leading-none">
            {systemSize} Ton {systemTypeLabel}
          </p>
          <p className="text-5xl font-black text-slate-800 leading-none">
            {finalPrice}
          </p>
          {priceDetails.discountAmount > 0 && (
            <div className="text-red-500 font-bold text-sm pt-1">
              Save {formatCurrency(priceDetails.discountAmount)}
            </div>
          )}
        </div>
        {financing.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs font-bold uppercase text-slate-500 text-center flex items-center justify-center gap-1">
              <CreditCard size={14} /> Low Monthly Investment
            </p>
            {financing.map((plan, index) => {
              const monthlyPayment = Math.round(
                calculatePayment(
                  priceDetails.finalPrice,
                  plan.rate,
                  plan.months
                )
              );
              return (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg border border-slate-200 text-slate-700`}
                >
                  <span className="text-2xl font-black text-green-700 leading-none">
                    {formatCurrency(monthlyPayment)}
                  </span>
                  <span className="text-sm font-bold text-slate-600">/mo</span>
                  <p className="text-xs mt-0.5 text-slate-500">
                    {plan.months} Months @ {plan.rate}%
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex-grow space-y-2 mb-6 border-t pt-4">
          <button
            onClick={() => setIsFeaturesCollapsed(!isFeaturesCollapsed)}
            className="flex items-center justify-between w-full text-sm font-bold uppercase text-slate-500 hover:text-slate-700 transition-colors py-1"
          >
            <span>Core System Features</span>
            {isFeaturesCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isFeaturesCollapsed ? "max-h-0" : "max-h-96"
            }`}
          >
            {config.tierFeatures[tier].map((feature, index) => (
              <div
                key={index}
                className="flex items-start text-sm text-slate-700 py-0.5"
              >
                <CheckCircle
                  size={16}
                  className={`mr-2 mt-0.5 ${colors.text}`}
                />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          {includedAddons.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-dashed border-green-200 mt-2">
              <p className="text-xs font-bold uppercase text-green-700">
                BONUS PACKAGE INCLUSIONS
              </p>
              {includedAddons.map((addon, index) => (
                <div
                  key={`inc-addon-${index}`}
                  className="flex items-start text-sm text-green-700"
                >
                  <Package size={16} className={`mr-2 mt-0.5 text-green-500`} />
                  <span>
                    {addon.name} ({formatCurrency(addon.price)} Value Included)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onSelect(tier)}
          className={`w-full py-3 rounded-xl text-white font-black text-lg uppercase transition-colors shadow-lg mt-auto ${colors.bg} hover:opacity-90`}
        >
          Select Option
        </button>
      </div>
    );
  }
);

const PricingBoard = () => {
  const {
    config,
    customer,
    selectedTon,
    setSelectedTon,
    selectedAddons,
    toggleAddon,
    handleSelectQuote,
    calculatePriceDetails,
    getFinancingForTier,
  } = useConfig();
  const visibleTiers = (config.tierOrder || TIER_KEYS).filter(
    (key) => config.tierConfig[key]?.visible
  );
  const gridColsClass =
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";

  const handleEmailAllOptions = () => {
    const subject = `Pricing Options for ${customer.firstName || "Client"} - ${
      config.companyName
    }`;
    let body = `Hello ${
      customer.firstName || "Customer"
    },\n\nHere are the HVAC system options we discussed:\n\n`;
    visibleTiers.forEach((tier) => {
      const details = calculatePriceDetails(tier);
      const tierInfo = config.tierDefinitions[tier];
      body += `${tierInfo.label} (${tierInfo.short})\n`;
      body += `Price: ${formatCurrency(details.finalPrice)}\n`;
      if (details.discountAmount > 0)
        body += `(Includes savings of ${formatCurrency(
          details.discountAmount
        )})\n`;
      body += `System: ${selectedTon} Ton\n\n`;
    });
    body += `Please let us know which option you would like to proceed with!\n\nBest,\n${config.companyName}`;
    window.location.href = `mailto:${
      customer.email
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 gap-4">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-bold text-slate-500 uppercase mr-2">
            System Size:
          </span>
          <div className="flex flex-wrap gap-2">
            {TONS.map((ton) => (
              <button
                key={ton}
                onClick={() => setSelectedTon(ton)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  selectedTon === ton
                    ? "bg-blue-600 text-white ring-2 ring-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {ton}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleEmailAllOptions}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold transition-colors text-sm"
        >
          <Share2 size={18} /> Email Summary
        </button>
      </div>
      {/* Re-ordered: Price Cards First */}
      <div className={`grid ${gridColsClass} gap-6`}>
        {visibleTiers.map((tier) => {
          const priceDetails = calculatePriceDetails(tier);
          const financing = getFinancingForTier(tier);
          const systemTypeId = config.tierConfig[tier].systemType;
          const systemType = SYSTEM_TYPES.find((s) => s.id === systemTypeId);
          const includedAddonsResolved = config.tierPackages[tier]
            .map((id) => config.addons.find((a) => a.id === id))
            .filter(Boolean);
          return (
            <PriceCard
              key={tier}
              tier={tier}
              priceDetails={priceDetails}
              addons={config.addons}
              includedAddons={includedAddonsResolved}
              financing={financing}
              onSelect={handleSelectQuote}
              systemTypeLabel={systemType?.label || ""}
              systemSize={selectedTon}
              modelNumber={null}
            />
          );
        })}
      </div>
      {/* Re-ordered: Recommended Enhancements Below */}
      <div className="pt-8 pb-4 border-t border-slate-200 mt-8">
        <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-green-600" /> Recommended Enhancements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {config.addons
            .filter((addon) => addon.visible !== false) // Only show visible addons
            .map((addon) => (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`flex flex-col items-start p-3 rounded-xl border-2 transition-colors text-left ${
                  selectedAddons.includes(addon.id)
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div
                  className={`flex items-center gap-2 font-semibold ${
                    selectedAddons.includes(addon.id)
                      ? "text-green-700"
                      : "text-slate-700"
                  }`}
                >
                  <DynamicIcon
                    name={addon.icon}
                    size={18}
                    className={
                      selectedAddons.includes(addon.id)
                        ? "text-green-500"
                        : "text-slate-500"
                    }
                  />
                  {addon.name}
                </div>
                <p className="text-sm font-bold text-slate-500 mt-1">
                  {formatCurrency(addon.price)}
                </p>
              </button>
            ))}
        </div>
      </div>
    </>
  );
};

const MainLayout = () => {
  const { currentView, setCurrentView, showAdmin, setShowAdmin, config } =
    useConfig();
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Snowflake className="text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight">
              {config.companyName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView("history")}
              className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"
              title="Saved Estimates"
            >
              <History size={20} className="text-blue-200" />
            </button>
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Settings size={20} className="text-blue-200" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 space-y-8">
        <AdminPanel />
        {currentView === "pricing" && <PricingBoard />}
        {currentView === "quote_review" && <QuoteReview />}
        {currentView === "estimate" && <EstimateView />}
        {currentView === "history" && <HistoryView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ConfigProvider>
      <MainLayout />
    </ConfigProvider>
  );
}
