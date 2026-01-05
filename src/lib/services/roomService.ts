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

export interface RoomListing {
  id?: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  userTrustScore: number;
  area: string;
  rent: number;
  type: 'Single Room' | 'Double Room' | 'Studio' | 'Shared Room';
  gender: 'Any' | 'Male Only' | 'Female Only';
  foodPreference?: string;
  moveIn: string;
  tags: string[];
  description?: string;
  status: 'active' | 'rented' | 'cancelled';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  images?: string[];
}

export const roomService = {
  // Create a new room listing
  async createListing(listing: Omit<RoomListing, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'rooms'), {
      ...listing,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get all active listings
  async getActiveListings(filters?: {
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    gender?: string;
  }): Promise<RoomListing[]> {
    let q = query(
      collection(db, 'rooms'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    let listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as RoomListing[];

    // Apply client-side filters
    if (filters) {
      if (filters.area && filters.area !== 'All Areas') {
        listings = listings.filter(r => r.area === filters.area);
      }
      if (filters.minPrice) {
        listings = listings.filter(r => r.rent >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        listings = listings.filter(r => r.rent <= filters.maxPrice!);
      }
      if (filters.gender && filters.gender !== 'All') {
        listings = listings.filter(r => 
          r.gender === filters.gender || r.gender === 'Any'
        );
      }
    }

    return listings;
  },

  // Subscribe to real-time updates
  subscribeToListings(
    callback: (listings: RoomListing[]) => void,
    filters?: {
      area?: string;
      minPrice?: number;
      maxPrice?: number;
      gender?: string;
    }
  ): () => void {
    const q = query(
      collection(db, 'rooms'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      let listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as RoomListing[];

      // Apply client-side filters
      if (filters) {
        if (filters.area && filters.area !== 'All Areas') {
          listings = listings.filter(r => r.area === filters.area);
        }
        if (filters.minPrice) {
          listings = listings.filter(r => r.rent >= filters.minPrice!);
        }
        if (filters.maxPrice) {
          listings = listings.filter(r => r.rent <= filters.maxPrice!);
        }
        if (filters.gender && filters.gender !== 'All') {
          listings = listings.filter(r => 
            r.gender === filters.gender || r.gender === 'Any'
          );
        }
      }

      callback(listings);
    });
  },

  // Update listing status
  async updateListingStatus(listingId: string, status: RoomListing['status']): Promise<void> {
    await updateDoc(doc(db, 'rooms', listingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete a listing
  async deleteListing(listingId: string): Promise<void> {
    await deleteDoc(doc(db, 'rooms', listingId));
  },
};

