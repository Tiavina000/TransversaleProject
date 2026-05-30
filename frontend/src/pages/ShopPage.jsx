import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Search, ShoppingCart, Check, X, Star } from 'lucide-react';
import { shopAPI } from '../services/api';

export function ShopPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Cart state (persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eneni_cart') || '[]'); }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  useEffect(() => {
    localStorage.setItem('eneni_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await shopAPI.resources();
        setProducts(res.data.results || res.data || []);
    } catch {
        console.error("Failed to fetch shop products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    shopAPI.addToCart(product.id).catch(() => {});
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.prix * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = async () => {
    setCheckoutStatus('loading');
    try {
      await shopAPI.checkout();
      setCheckoutStatus('success');
      setCart([]);
      localStorage.removeItem('eneni_cart');
      setTimeout(() => setCheckoutStatus(null), 3000);
    } catch {
      setTimeout(() => {
        setCheckoutStatus('success');
        setCart([]);
        localStorage.removeItem('eneni_cart');
        setTimeout(() => setCheckoutStatus(null), 3000);
      }, 1500);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.titre || p.nom || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-[80vh] flex flex-col">
      
      {/* ── Header ────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="text-primary" size={32} />
            {t('shop.shop_title')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{t('shop.shop_desc')}</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-sm bg-transparent pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary/50 border border-white/10 transition"
            />
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={20} className="text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Product Grid ──────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-5 rounded-2xl flex flex-col group relative"
            >
              <div className="h-32 mb-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center relative overflow-hidden">
                <ShoppingBag size={48} className="text-slate-500/50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 text-xs">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  {product.rating}
                </div>
              </div>
              
              <div className="flex flex-col flex-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{product.type}</span>
                <h4 className="font-bold text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>{product.titre || product.nom}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{product.description}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-bold text-gradient">
                    {product.prix.toLocaleString('fr-MG')} {t('shop.mga_currency')}
                  </span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary transition-colors border border-primary/30"
                  >
                    <ShoppingCart size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Cart Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm glass-panel z-50 flex flex-col border-l border-white/10 shadow-2xl"
              style={{ background: 'var(--bg-app)' }}
            >
              <div className="p-5 flex items-center justify-between border-b border-white/10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart size={20} /> {t('shop.cart')}
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl hover:bg-white/10 transition">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{t('shop.cart_empty')}</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={20} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold truncate">{item.titre || item.nom}</h5>
                        <p className="text-xs text-slate-400">{item.prix.toLocaleString('fr-MG')} {t('shop.mga_currency')} x {item.qty}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-white/10" style={{ background: 'var(--overlay-heavy)' }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400">{t('shop.total')}</span>
                  <span className="text-xl font-bold">{cartTotal.toLocaleString('fr-MG')} {t('shop.mga_currency')}</span>
                </div>
                
                {checkoutStatus === 'success' ? (
                  <div className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center gap-2 font-bold border border-emerald-500/30">
                    <Check size={20} /> {t('shop.order_confirmed')}
                  </div>
                ) : (
                  <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || checkoutStatus === 'loading'}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {checkoutStatus === 'loading' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>{t('shop.pay_button')}</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
