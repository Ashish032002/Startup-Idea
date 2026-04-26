"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Package, 
  AlertCircle, 
  RefreshCcw, 
  Plus, 
  ExternalLink,
  BrainCircuit,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
  Search,
  Activity,
  Zap
} from "lucide-react";

interface DashboardItem {
  id: number;
  name: string;
  brand: string;
  url: string;
  current_price: number;
  is_in_stock: boolean;
  sentiment: string;
  insight: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const [data, setData] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", url: "", brand: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/auth");
      return {};
    }
    return { "Authorization": `Bearer ${token}` };
  };

  const fetchData = async () => {
    const headers = getAuthHeader();
    if (!headers["Authorization"]) return;

    try {
      const res = await fetch("http://127.0.0.1:8001/dashboard", { headers });
      if (res.status === 401) {
        router.push("/auth");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    } else {
      fetchData();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = { 
      "Content-Type": "application/json",
      ...getAuthHeader() 
    };
    
    try {
      const res = await fetch("http://127.0.0.1:8001/products", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          name: newProduct.name, 
          url: newProduct.url, 
          competitor_brand: newProduct.brand 
        })
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewProduct({ name: "", url: "", brand: "" });
        fetchData();
        // Poll for updates every 3 seconds for the next 15 seconds to catch the background scrape
        const pollInterval = setInterval(fetchData, 3000);
        setTimeout(() => clearInterval(pollInterval), 15000);
      }
    } catch (err) {
      console.error("Failed to add product");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const headers = getAuthHeader();
    try {
      await fetch("http://127.0.0.1:8001/refresh", { 
        method: "POST",
        headers 
      });
      setTimeout(fetchData, 5000); 
    } finally {
      setTimeout(() => setRefreshing(false), 2000);
    }
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] -right-[10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight neon-text">
              MarketIntel <span className="text-white/90">AI</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-indigo-500/50 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search metrics..." 
                className="bg-transparent border-none outline-none text-sm px-3 w-48 focus:w-64 transition-all placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className={`p-2 glass rounded-full text-slate-300 hover:text-indigo-400 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCcw className="w-5 h-5" />
            </motion.button>

            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Competitor</span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-2"></div>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Intelligence <span className="text-indigo-400 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Dashboard</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Real-time tracking and AI-powered sentiment analysis for your market competitors. 
            Stay ahead with automated insights.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatCard 
            icon={<Package className="w-6 h-6" />} 
            label="Monitored" 
            value={data.length.toString()} 
            sub="Active links"
            color="indigo"
          />
          <StatCard 
            icon={<Zap className="w-6 h-6" />} 
            label="Average Price" 
            value={`₹${data.length > 0 ? (data.reduce((acc, curr) => acc + curr.current_price, 0) / data.length).toFixed(0) : 0}`} 
            sub="Market average"
            color="cyan"
          />
          <StatCard 
            icon={<Activity className="w-6 h-6" />} 
            label="In Stock" 
            value={data.filter(d => d.is_in_stock).length.toString()} 
            sub="Available now"
            color="emerald"
          />
          <StatCard 
            icon={<AlertCircle className="w-6 h-6" />} 
            label="Out of Stock" 
            value={data.filter(d => !d.is_in_stock).length.toString()} 
            sub="Urgent alerts"
            color="rose"
          />
        </motion.div>

        {/* Product Bento Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Live Competitor Data
            </h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Sorted by Recency
            </span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div key="loading" className="py-20 flex flex-col items-center justify-center text-slate-500 glass rounded-3xl">
                  <RefreshCcw className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                  <p className="font-medium">Syncing with neural network...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div key="empty" className="py-20 flex flex-col items-center justify-center text-slate-500 glass rounded-3xl border-dashed border-2">
                  <p className="font-medium text-lg">The arena is empty</p>
                  <p className="text-sm">Add your first competitor to start generating intelligence.</p>
                </div>
              ) : filteredData.map((item) => (
                <ProductRow key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass p-8 rounded-3xl shadow-2xl border border-white/20"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                Initialize Target
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Product Identity</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g. Nike Air Max v2"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Brand Origin</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g. Nike"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Source URL</label>
                  <input 
                    type="url" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                    placeholder="https://amazon.in/..."
                    value={newProduct.url}
                    onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 border border-white/10 rounded-2xl text-slate-400 font-bold hover:bg-white/5 transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl text-white font-bold hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all"
                  >
                    Deploy Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: any, label: string, value: string, sub: string, color: string }) {
  const colors: any = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20"
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className={`glass rounded-3xl p-6 border ${colors[color]} relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-2.5 glass rounded-xl ${colors[color]} border-none shadow-inner`}>
          {icon}
        </div>
        <span className="text-sm font-bold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{sub}</div>
    </motion.div>
  );
}

function ProductRow({ item }: { item: DashboardItem }) {
  const getSentimentStyle = (s: string) => {
    switch (s) {
      case 'Positive': return 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10';
      case 'Negative': return 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20 shadow-rose-500/10';
      default: return 'from-slate-500/20 to-slate-500/5 text-slate-400 border-white/10 shadow-white/5';
    }
  };

  const cleanInsight = (insight: string) => {
    let cleaned = insight.replace(/\*\*Sentiment:\*\*.*?\n/i, '');
    cleaned = cleaned.replace(/\*\*Insights:\*\*/i, '');
    cleaned = cleaned.replace(/\*\*/g, '');
    return cleaned.trim();
  };

  return (
    <motion.div 
      variants={itemVariants}
      layout
      className="glass p-5 rounded-3xl border border-white/5 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 hover:bg-white/10 transition-all group min-h-[100px]"
    >
      {/* Index & Name Section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center glass rounded-xl border-indigo-500/20 text-xs font-black text-indigo-400 shadow-inner">
          #{item.id.toString().padStart(2, '0')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-white truncate max-w-[250px]">{item.name}</h3>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-tighter">{item.brand}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span className={`flex items-center gap-1.5 ${item.is_in_stock ? 'text-emerald-400' : 'text-rose-400'}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${item.is_in_stock ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
              {item.is_in_stock ? 'Available' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="flex flex-wrap items-center gap-6 lg:gap-10">
        <div className="min-w-[100px]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Price</div>
          <div className="text-2xl font-black text-white">₹{item.current_price.toLocaleString()}</div>
        </div>

        <div className={`px-4 py-2 glass rounded-2xl border bg-gradient-to-br ${getSentimentStyle(item.sentiment)} min-w-[110px] text-center`}>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Sentiment</div>
          <div className="text-xs font-black">{item.sentiment}</div>
        </div>

        <div className="max-w-xs xl:max-w-md hidden md:block flex-1 min-w-[200px]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">AI Intelligence</div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
            "{cleanInsight(item.insight)}"
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.a 
            whileHover={{ scale: 1.1, rotate: 5 }}
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-3 glass rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border-white/5"
          >
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
