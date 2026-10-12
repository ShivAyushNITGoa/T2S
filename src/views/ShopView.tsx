import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { ExternalLink, Crown, Lock } from 'lucide-react';
import {
  db,
  handleFirestoreError,
  OperationType,
  isOfflineError,
} from '../config/firebase';
import { STORAGE_KEYS } from '../config/constants';
import { ShopProduct } from '../types';
import { isDemoShopItem } from '../utils/mediaUtils';
import {
  mergeContentById,
  fetchServerSync,
  subscribeContentBroadcast,
} from '../utils/contentSync';
import {
  LoadingScreen,
  NoContent,
  VipSectionLockedView,
} from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';

export const ShopView: React.FC = () => {
  const { isSectionVipGated, openAscensionModal, isUserVip, isCurrentUserAdmin } =
    useAppContext();

  const [products, setProducts] = useState<ShopProduct[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.SHOP_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => !isDemoShopItem(p));
        }
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncLocalAndServer = async () => {
      try {
        const serverData = await fetchServerSync();
        let cached: ShopProduct[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.SHOP_CACHE);
          if (raw) cached = JSON.parse(raw);
        } catch {}
        const serverShop = Array.isArray(serverData?.shop)
          ? serverData!.shop!
          : [];
        const merged = mergeContentById<ShopProduct>(
          serverShop,
          cached,
          (p) => !isDemoShopItem(p)
        );
        setProducts(merged);
        localStorage.setItem(STORAGE_KEYS.SHOP_CACHE, JSON.stringify(merged));
      } catch {}
    };

    syncLocalAndServer();
    const unsubBroadcast = subscribeContentBroadcast(() => {
      syncLocalAndServer();
    });

    const unsubSnap = onSnapshot(
      collection(db, 'shop'),
      (snap) => {
        const firestoreData = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as ShopProduct))
          .filter((p) => !isDemoShopItem(p));
        let cached: ShopProduct[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.SHOP_CACHE);
          if (raw) cached = JSON.parse(raw);
        } catch {}
        const merged = mergeContentById<ShopProduct>(
          firestoreData,
          cached,
          (p) => !isDemoShopItem(p)
        );
        setProducts(merged);
        localStorage.setItem(STORAGE_KEYS.SHOP_CACHE, JSON.stringify(merged));
        setLoading(false);
        if (isCurrentUserAdmin) {
          snap.docs.forEach((d) => {
            if (isDemoShopItem({ id: d.id, ...d.data() })) {
              deleteDoc(doc(db, 'shop', d.id)).catch(() => {});
            }
          });
        }
      },
      (error) => {
        if (!isOfflineError(error)) {
          handleFirestoreError(error, OperationType.LIST, 'shop');
        }
        setLoading(false);
      }
    );

    return () => {
      unsubBroadcast();
      unsubSnap();
    };
  }, [isCurrentUserAdmin]);

  if (isSectionVipGated('shop')) {
    return (
      <VipSectionLockedView
        sectionTitle="Strategic Store & Resources"
        hindiTitle="रणनीतिक संसाधन दुकान"
        description="The platform resources store and strategic recommendations catalog is currently reserved for Sovereign VIP members."
        onUnlock={openAscensionModal}
      />
    );
  }

  const handleProductClick = async (product: ShopProduct) => {
    try {
      if (product.id) {
        await updateDoc(doc(db, 'shop', product.id), {
          clicks: increment(1),
        });
      }
    } catch {}
  };

  const displayProducts = products;

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-16 pb-20">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight uppercase">
          Strategic <span className="text-gray-500">Shop</span>
        </h1>
        <p className="text-gray-400 text-base md:text-xl leading-relaxed font-medium">
          Curated resources for your personal growth. We recommend essential tools from trusted external platforms.
          (आपके विकास के लिए बेहतरीन संसाधन)
        </p>
        <div className="flex items-center gap-2 text-[10px] text-amber-500/60 font-bold uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 w-fit px-3 py-1 rounded-full">
          <ExternalLink size={10} />
          <span>Product links will redirect to respective stores</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {displayProducts.map((product) => {
          const isLocked = Boolean(product.isPremium && !isUserVip);

          return (
            <div
              key={product.id}
              className="group bg-[#0a0a0a] border border-white/5 rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col hover:border-white/20 transition-all duration-500 shadow-2xl"
            >
              <div className="aspect-[4/3] overflow-hidden bg-neutral-900 relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2">
                  <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                    {product.category}
                  </div>
                  {product.isPremium && (
                    <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-amber-500/90 backdrop-blur-md rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1 shadow-lg">
                      <Crown className="w-3 h-3 fill-black text-black" />
                      <span>VIP Exclusive</span>
                    </div>
                  )}
                  {product.platform && (
                    <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-zinc-800/90 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-300 border border-white/10">
                      On {product.platform}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 sm:p-8 md:p-10 flex-1 flex flex-col space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-tight">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-amber-500">
                      {product.price}
                    </span>
                    {product.clicks !== undefined && (
                      <span className="text-[10px] text-gray-500 font-bold uppercase">
                        {product.clicks} Clicks
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed flex-1 italic">
                  {product.description}
                </p>
                {isLocked ? (
                  <button
                    type="button"
                    onClick={openAscensionModal}
                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all flex flex-col items-center justify-center gap-1 shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Unlock VIP Access / अपग्रेड करें</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] normal-case tracking-normal opacity-75 font-bold">
                      Special Strategist Tier Required
                    </span>
                  </button>
                ) : (
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleProductClick(product)}
                    className="w-full py-4 sm:py-5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl hover:bg-neutral-200 transition-all flex flex-col items-center justify-center gap-1 shadow-xl group-hover:bg-amber-500 group-hover:text-black"
                  >
                    <div className="flex items-center gap-2">
                      <span>View on {product.platform || 'Store'}</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] normal-case tracking-normal opacity-60 font-bold">
                      Respective platform पर देखें
                    </span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayProducts.length === 0 && <NoContent label="Resources" />}
    </div>
  );
};
