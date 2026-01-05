import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ExchangeOffer {
  id?: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  userTrustScore: number;
  type: 'buy' | 'sell';
  amount: number;
  rate: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  completedTrades?: number;
}

export const exchangeService = {
  // Create a new exchange offer
  async createOffer(offer: Omit<ExchangeOffer, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'exchanges'), {
      ...offer,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get all active offers
  async getActiveOffers(filter?: { type?: 'buy' | 'sell' }): Promise<ExchangeOffer[]> {
    let q = query(
      collection(db, 'exchanges'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    if (filter?.type) {
      q = query(
        collection(db, 'exchanges'),
        where('status', '==', 'active'),
        where('type', '==', filter.type),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as ExchangeOffer[];
  },

  // Subscribe to real-time updates
  subscribeToOffers(
    callback: (offers: ExchangeOffer[]) => void,
    filter?: { type?: 'buy' | 'sell' }
  ): () => void {
    let q = query(
      collection(db, 'exchanges'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    if (filter?.type) {
      q = query(
        collection(db, 'exchanges'),
        where('status', '==', 'active'),
        where('type', '==', filter.type),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    return onSnapshot(q, (snapshot) => {
      const offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ExchangeOffer[];
      callback(offers);
    });
  },

  // Update offer status
  async updateOfferStatus(offerId: string, status: ExchangeOffer['status']): Promise<void> {
    await updateDoc(doc(db, 'exchanges', offerId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete an offer
  async deleteOffer(offerId: string): Promise<void> {
    await deleteDoc(doc(db, 'exchanges', offerId));
  },
};

