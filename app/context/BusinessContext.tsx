'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

interface Business {
  id: string;
  name: string;
  role?: string;
  category?: string;
  target_omzet?: number;
  address?: string;
  logo_url?: string;
  subscription?: string;
}

interface BusinessContextType {
  selectedBusiness: Business | null;
  setSelectedBusiness: (business: Business | null) => void;
  businesses: Business[];
  refreshBusinesses: () => void;
  isPremium: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const fetchBusinesses = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const qOwner = query(collection(db, 'businesses'), where('owner_id', '==', user.uid));
      const qMember = query(collection(db, 'businesses'), where('members', 'array-contains', user.uid));

      const [snapOwner, snapMember] = await Promise.all([getDocs(qOwner), getDocs(qMember)]);

      const dataMap = new Map<string, Business>();
      snapOwner.docs.forEach(doc => {
        const data = doc.data();
        dataMap.set(doc.id, {
          id: doc.id,
          name: data.name,
          role: 'Owner',
          category: data.category,
          target_omzet: data.target_omzet,
          address: data.address,
          logo_url: data.logo_url,
          subscription: data.subscription
        });
      });
      snapMember.docs.forEach(doc => {
        if (!dataMap.has(doc.id)) {
          const data = doc.data();
          const role = data.roles?.[user.uid] || 'Staff';
          dataMap.set(doc.id, {
            id: doc.id,
            name: data.name,
            role,
            category: data.category,
            target_omzet: data.target_omzet,
            address: data.address,
            logo_url: data.logo_url,
            subscription: data.subscription
          });
        }
      });

      const dataList = Array.from(dataMap.values());
      setBusinesses(dataList);

      // Otomatis pilih bisnis jika hanya ada 1. Jika > 1, biarkan user memilih (tetap null)
      if (dataList.length === 1 && (!selectedBusiness || !dataMap.has(selectedBusiness.id))) {
        setSelectedBusiness(dataList[0]);
      } else if (dataList.length > 1 && (!selectedBusiness || !dataMap.has(selectedBusiness.id))) {
        // Biarkan kosong agar sistem bisa mengarahkan user ke halaman pilih bisnis
        setSelectedBusiness(null);
      } else if (dataList.length === 0) {
        setSelectedBusiness(null);
      }

      // Cek Status Subscription
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsPremium(userSnap.data().subscription === 'Premium');
      } else {
        await setDoc(userRef, { subscription: 'Free' }, { merge: true });
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      setBusinesses([]);
      setSelectedBusiness(null);
      setIsPremium(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        void fetchBusinesses();
      } else {
        setBusinesses([]);
        setSelectedBusiness(null);
        setIsPremium(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BusinessContext.Provider value={{ selectedBusiness, setSelectedBusiness, businesses, refreshBusinesses: fetchBusinesses, isPremium }}>
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) throw new Error('useBusiness must be used within a BusinessProvider');
  return context;
};
