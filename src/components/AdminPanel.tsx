import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Package, Ticket, ClipboardList, Settings, 
  Plus, Trash2, Edit3, Image as ImageIcon, 
  Upload, Search, CheckCircle2, AlertCircle, Save,
  LayoutDashboard, TrendingUp, Users, DollarSign,
  PlusCircle, MinusCircle, Eye, Download
} from 'lucide-react';
import { Product, PromoCode, Order } from '../types';
import { setStorage, getContrastColor } from '../lib/utils';
import { DEFAULT_SIZES } from '../constants';

interface AdminPanelProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  promoCodes: PromoCode[];
  setPromoCodes: (promos: PromoCode[]) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
  orders: Order[];
  onClose: () => void;
}

export default function AdminPanel({
  products, setProducts,
  promoCodes, setPromoCodes,
  accentColor, setAccentColor,
  whatsappNumber, setWhatsappNumber,
  orders, onClose
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'promos' | 'orders' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Product form states
  const [addMode, setAddMode] = useState<'none' | 'single' | 'bulk' | 'gallery'>('none');
  const [newProdName, setNewProdName] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("1000");
  const [bulkUrls, setBulkUrls] = useState("");
  const [galleryImages, setGalleryImages] = useState<{name: string, src: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Promo form states
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState("10");

  const [tempWhatsapp, setTempWhatsapp] = useState(whatsappNumber);

  function saveWhatsapp() {
    setWhatsappNumber(tempWhatsapp);
    setStorage("brandz_whatsapp", tempWhatsapp);
    alert("WhatsApp number updated!");
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  function exportToCSV() {
    if (orders.length === 0) return;
    
    const headers = ["Order ID", "Date", "Customer Name", "Total (EGP)", "Items Count"];
    const rows = orders.map(order => [
      order.id,
      `"${order.date}"`,
      `"${order.name}"`,
      order.total,
      order.items.reduce((sum, item) => sum + item.qty, 0)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `brandz_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TabButton = ({ tab, icon: Icon, label }: { tab: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${
        activeTab === tab ? 'border-white text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
      }`}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  function updateStock(id: number, delta: number) {
    const newList = products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, (p.stock ?? 10) + delta) } : p
    );
    setProducts(newList);
    setStorage("brandz_products", newList);
  }

  function deleteProduct(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const newList = products.filter(p => p.id !== id);
    setProducts(newList);
    setStorage("brandz_products", newList);
  }

  function toggleProductEdit(p: Product) {
    setEditingId(p.id);
    setNewProdName(p.name);
    setNewProdPrice(String(p.price));
  }

  function saveProduct(id: number) {
    const newList = products.map(p => 
      p.id === id ? { ...p, name: newProdName, price: Number(newProdPrice) || p.price } : p
    );
    setProducts(newList);
    setStorage("brandz_products", newList);
    setEditingId(null);
  }

  function handleAddProduct() {
    if (!newProdName || !newProdImage) return;
    const product: Product = {
      id: Date.now(),
      name: newProdName,
      image: newProdImage,
      price: Number(newProdPrice) || 1000,
      sizes: DEFAULT_SIZES,
      stock: 10
    };
    const newList = [...products, product];
    setProducts(newList);
    setStorage("brandz_products", newList);
    setNewProdName("");
    setNewProdImage("");
    setAddMode('none');
  }

  function handleBulkAdd() {
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (!urls.length) return;
    
    const newItems = urls.map((url, i) => ({
      id: Date.now() + i,
      name: `BRANDZ Style ${products.length + i + 1}`,
      image: url,
      price: 1000,
      sizes: DEFAULT_SIZES,
      stock: 10
    }));
    
    const newList = [...products, ...newItems];
    setProducts(newList);
    setStorage("brandz_products", newList);
    setBulkUrls("");
    setAddMode('none');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    setIsLoading(true);
    let processed = 0;
    const newGallery: {name: string, src: string}[] = [];
    
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newGallery.push({
          name: (file as any).name.replace(/\.[^.]+$/, ""),
          src: event.target?.result as string
        });
        processed++;
        if (processed === files.length) {
          setGalleryImages(prev => [...prev, ...newGallery]);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function saveGallery() {
    const newItems = galleryImages.map((img, i) => ({
      id: Date.now() + i,
      name: img.name || `BRANDZ Style ${products.length + i + 1}`,
      image: img.src,
      price: 1000,
      sizes: DEFAULT_SIZES,
      stock: 10
    }));
    
    const newList = [...products, ...newItems];
    setProducts(newList);
    setStorage("brandz_products", newList);
    setGalleryImages([]);
    setAddMode('none');
  }

  function addPromo() {
    if (!newPromoCode.trim()) return;
    const promo: PromoCode = {
      id: Date.now(),
      code: newPromoCode.trim().toUpperCase(),
      discount: Number(newPromoDiscount) || 10,
      active: true
    };
    const newList = [...promoCodes, promo];
    setPromoCodes(newList);
    setStorage("brandz_promos", newList);
    setNewPromoCode("");
  }

  function togglePromo(id: number) {
    const newList = promoCodes.map(p => p.id === id ? { ...p, active: !p.active } : p);
    setPromoCodes(newList);
    setStorage("brandz_promos", newList);
  }

  function deletePromo(id: number) {
    const newList = promoCodes.filter(p => p.id !== id);
    setPromoCodes(newList);
    setStorage("brandz_promos", newList);
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-950 w-full max-w-4xl h-[90vh] rounded-3xl border border-neutral-800 flex flex-col overflow-hidden relative shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black">Management Dashboard</h2>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">BRANDZ Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 bg-neutral-900/40 border-b border-neutral-800 overflow-x-auto no-scrollbar">
          <TabButton tab="dashboard" icon={LayoutDashboard} label="Pulse" />
          <TabButton tab="products" icon={Package} label="Inventory" />
          <TabButton tab="promos" icon={Ticket} label="Offers" />
          <TabButton tab="orders" icon={ClipboardList} label={`Orders (${orders.length})`} />
          <TabButton tab="settings" icon={Settings} label="Design" />
        </div>

        {/* Console Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/20">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Revenue', val: `${totalRevenue} EGP`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Orders', val: orders.length, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Avg Sale', val: `${avgOrderValue} EGP`, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'OOS Items', val: outOfStockCount, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl">
                      <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                        <stat.icon size={20} />
                      </div>
                      <div className="text-2xl font-black">{stat.val}</div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                    <TrendingUp size={16} className="text-neutral-500" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => setActiveTab('products')} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-neutral-800 hover:border-neutral-600 transition-all text-left">
                      <div>
                        <div className="text-xs font-black uppercase">Check Inventory</div>
                        <div className="text-[10px] text-neutral-500 font-bold mt-0.5">{products.length} products listed</div>
                      </div>
                      <Package size={18} className="text-neutral-600" />
                    </button>
                    <button onClick={() => setActiveTab('orders')} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-neutral-800 hover:border-neutral-600 transition-all text-left">
                      <div>
                        <div className="text-xs font-black uppercase">Recent Orders</div>
                        <div className="text-[10px] text-neutral-500 font-bold mt-0.5">{orders.length} orders total</div>
                      </div>
                      <ClipboardList size={18} className="text-neutral-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Product Management Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAddMode(addMode === 'single' ? 'none' : 'single')}
                      className="flex-1 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors group"
                    >
                      <Plus className="text-neutral-500 group-hover:text-white" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Add Single</span>
                    </button>
                    <button 
                      onClick={() => setAddMode(addMode === 'bulk' ? 'none' : 'bulk')}
                      className="flex-1 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors group"
                    >
                      <Upload className="text-neutral-500 group-hover:text-white" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Bulk Paste</span>
                    </button>
                    <button 
                      onClick={() => setAddMode(addMode === 'gallery' ? 'none' : 'gallery')}
                      className="flex-1 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors group"
                    >
                      <ImageIcon className="text-neutral-500 group-hover:text-white" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Upload Pics</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products..."
                      className="w-full h-full bg-neutral-900 border border-neutral-800 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                </div>

                {/* Sub-modes */}
                <AnimatePresence>
                  {addMode === 'single' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="Product Name" className="bg-black border border-neutral-800 p-3 rounded-xl text-sm outline-none" />
                        <input value={newProdImage} onChange={e => setNewProdImage(e.target.value)} placeholder="Image URL" className="bg-black border border-neutral-800 p-3 rounded-xl text-sm outline-none" />
                        <input value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} placeholder="Price (EGP)" type="number" className="bg-black border border-neutral-800 p-3 rounded-xl text-sm outline-none" />
                        <button onClick={handleAddProduct} className="bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors">Create Product</button>
                      </div>
                    </motion.div>
                  )}

                  {addMode === 'bulk' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-4">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Paste one image URL per line</p>
                      <textarea 
                        value={bulkUrls} 
                        onChange={e => setBulkUrls(e.target.value)}
                        placeholder="https://i.ibb.co/..." 
                        rows={5}
                        className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-xs font-mono outline-none"
                      />
                      <button onClick={handleBulkAdd} className="w-full py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl">Add All URLs</button>
                    </motion.div>
                  )}

                  {addMode === 'gallery' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-4">
                      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-700 h-32 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neutral-500 transition-colors"
                      >
                        <Upload size={24} className="text-neutral-500" />
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Click to pick photos</span>
                      </div>
                      
                      {galleryImages.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {galleryImages.map((img, i) => (
                            <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                              <img src={img.src} alt="" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button 
                        onClick={saveGallery} 
                        className="w-full py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl disabled:opacity-50"
                        disabled={!galleryImages.length}
                      >
                        Save {galleryImages.length} Products
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Product List */}
                <div className="space-y-3">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:bg-neutral-800/50">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative group">
                          <img src={product.image} alt="" className="w-16 h-16 object-cover rounded-2xl border border-neutral-700" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {editingId === product.id ? (
                            <div className="flex flex-col gap-2">
                              <input 
                                value={newProdName} 
                                onChange={e => setNewProdName(e.target.value)} 
                                className="bg-black border border-neutral-800 p-2 rounded-xl text-xs font-bold outline-none"
                              />
                              <input 
                                value={newProdPrice} 
                                onChange={e => setNewProdPrice(e.target.value)} 
                                className="bg-black border border-neutral-800 p-2 rounded-xl text-xs font-bold outline-none"
                                type="number"
                              />
                            </div>
                          ) : (
                            <>
                              <h4 className="font-black text-sm truncate uppercase tracking-tight">{product.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs font-black" style={{ color: accentColor }}>{product.price} EGP</p>
                                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                <p className={`text-[10px] font-bold uppercase ${product.stock === 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                                  {product.stock === 0 ? 'Out of Stock' : `Inventory: ${product.stock ?? 10}`}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                        <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-neutral-800">
                          <button onClick={() => updateStock(product.id, -1)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                            <MinusCircle size={18} />
                          </button>
                          <span className="w-8 text-center text-xs font-black">{product.stock ?? 10}</span>
                          <button onClick={() => updateStock(product.id, 1)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                            <PlusCircle size={18} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingId === product.id ? (
                            <button onClick={() => saveProduct(product.id)} className="p-2.5 text-green-500 bg-green-500/10 rounded-2xl hover:bg-green-500/20 transition-all">
                              <Save size={18} />
                            </button>
                          ) : (
                            <button onClick={() => toggleProductEdit(product)} className="p-2.5 text-neutral-400 bg-neutral-800 rounded-2xl hover:text-white transition-all">
                              <Edit3 size={18} />
                            </button>
                          )}
                          <button onClick={() => deleteProduct(product.id)} className="p-2.5 text-red-900 bg-red-900/10 rounded-2xl hover:text-red-500 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'promos' && (
              <motion.div 
                key="promos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest">Create Promo Code</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase px-1">CODE</label>
                      <input 
                        value={newPromoCode} 
                        onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                        placeholder="SUMMER20"
                        className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-sm font-black uppercase tracking-widest outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase px-1">DISCOUNT %</label>
                      <input 
                        value={newPromoDiscount} 
                        onChange={e => setNewPromoDiscount(e.target.value)}
                        placeholder="20"
                        type="number"
                        className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-sm font-black outline-none" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={addPromo}
                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200"
                  >
                    Add Promo Code
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-2">Active Promos ({promoCodes.length})</h3>
                  {promoCodes.map(promo => (
                    <div key={promo.id} className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="font-black text-lg tracking-widest leading-none">{promo.code}</div>
                        <div className="text-xs text-neutral-500 font-bold mt-1">{promo.discount}% OFF</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => togglePromo(promo.id)}
                          className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase transition-colors ${
                            promo.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {promo.active ? 'Active' : 'Disabled'}
                        </button>
                        <button onClick={() => deletePromo(promo.id)} className="p-2 text-neutral-600 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-neutral-600 gap-4">
                    <ClipboardList size={48} />
                    <p className="font-black uppercase text-sm tracking-widest">No orders yet</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                      >
                        <Download size={14} />
                        Export CSV
                      </button>
                    </div>
                    {[...orders].reverse().map(order => (
                      <div key={order.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-black text-white px-2 py-0.5 bg-neutral-800 rounded-md w-fit inline-block mb-1">#{order.id}</div>
                            <div className="text-[10px] font-bold text-neutral-500">{order.date}</div>
                          </div>
                          <div className="text-xl font-black">{order.total} EGP</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-black/40 p-3 rounded-2xl">
                            <div className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Customer</div>
                            <div className="text-xs font-bold leading-tight">{order.name}</div>
                            <div className="text-xs font-bold text-neutral-400 mt-0.5">{order.phone}</div>
                          </div>
                          <div className="bg-black/40 p-3 rounded-2xl">
                            <div className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Location</div>
                            <div className="text-xs font-bold leading-tight">{order.governorate}, {order.city}</div>
                            <div className="text-[10px] text-neutral-500 font-bold leading-tight mt-0.5">{order.address}</div>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-neutral-800 pt-4">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-xs items-center py-1 border-b border-white/[0.03] last:border-0">
                              <div>
                                <span className="font-bold">{it.name}</span>
                                <span className="text-[10px] text-neutral-500 ml-2">x{it.qty} (Sz {it.size}{it.color ? `, ${it.color}` : ""})</span>
                              </div>
                              <span className="font-black opacity-80">{it.price * it.qty} EGP</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                          <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            {order.promoCode && <span className="text-green-500">PROMO: {order.promoCode}</span>}
                          </div>
                          <div className="flex gap-4 text-xs font-bold text-neutral-500">
                            <span>Sub: {order.subtotal}</span>
                            {order.discount > 0 && <span className="text-green-500">Disc: -{order.discount}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl space-y-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-1">Brand Accent Color</h3>
                    <p className="text-xs text-neutral-500 font-bold mb-6">Choose the signature color for your storefront buttons and highlights.</p>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <input 
                        type="color" 
                        value={accentColor} 
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-20 h-20 rounded-2xl bg-black border-none cursor-pointer p-0"
                      />
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {["#ffffff", "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#f97316", "#06b6d4"].map(c => (
                            <button 
                              key={c}
                              onClick={() => setAccentColor(c)}
                              className={`aspect-square rounded-full transition-all ${accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-60 hover:opacity-100'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <input 
                          value={accentColor} 
                          onChange={e => setAccentColor(e.target.value)}
                          className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-center font-mono text-sm font-black uppercase tracking-widest outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-800">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-1">Store Contact</h3>
                    <p className="text-xs text-neutral-500 font-bold mb-4">Set the WhatsApp number where you'll receive orders (e.g. 2010...)</p>
                    <div className="flex gap-2">
                       <input 
                        value={tempWhatsapp} 
                        onChange={e => setTempWhatsapp(e.target.value)}
                        placeholder="WhatsApp Number (e.g. 201032834797)"
                        className="flex-1 bg-black border border-neutral-800 p-3 rounded-xl font-mono text-sm font-black outline-none"
                      />
                      <button 
                        onClick={saveWhatsapp}
                        className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-neutral-200"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-800">
                    <div className="p-10 rounded-2xl flex flex-col items-center gap-6 transition-all" style={{ backgroundColor: accentColor + '10' }}>
                      <div className="px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-transform hover:scale-105" 
                           style={{ backgroundColor: accentColor, color: getContrastColor(accentColor) }}>
                        PREVIEW BUTTON
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: accentColor }}>Currently selected brand color</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
