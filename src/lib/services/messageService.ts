import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date | Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageAt?: Date | Timestamp;
  unreadCount?: { [userId: string]: number };
}

export const messageService = {
  // Get or create conversation ID between two users
  async getConversationId(userId1: string, userId2: string): Promise<string> {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );
    
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(userId2) && data.participants.length === 2;
    });

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const newConv = await addDoc(conversationsRef, {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      unreadCount: { [userId1]: 0, [userId2]: 0 },
    });

    return newConv.id;
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string
  ): Promise<string> {
    const messageRef = await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId,
      receiverId,
      text,
      status: 'sent',
      createdAt: serverTimestamp(),
    });

    // Update conversation
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${receiverId}`]: (await getDoc(doc(db, 'conversations', conversationId))).data()?.unreadCount?.[receiverId] + 1 || 1,
    });

    return messageRef.id;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];
    } catch (error: any) {
      // If index error, try without orderBy and sort client-side
      if (error.code === 'failed-precondition') {
        console.warn('Index not found, using client-side sort. Create index for better performance.');
        const q2 = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversationId),
          limit(100)
        );
        const snapshot = await getDocs(q2);
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Message[];
        return messages.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any).toMillis();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any).toMillis();
          return aTime - bTime;
        });
      }
      throw error;
    }
  },

  // Subscribe to messages
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];
      callback(messages);
    }, (error) => {
      console.error('Error in messages subscription:', error);
      if (error.code === 'failed-precondition') {
        console.warn('⚠️ Firestore index required for messages. The app will work, but create the index for better performance.');
        // Fallback: query without orderBy
        const q2 = query(
          collection(db, 'messages'),
          where('conversationId', '==', conversationId),
          limit(100)
        );
        onSnapshot(q2, (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Message[];
          const sorted = messages.sort((a, b) => {
            const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any).toMillis();
            const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any).toMillis();
            return aTime - bTime;
          });
          callback(sorted);
        });
      } else {
        callback([]);
      }
    });
  },

  // Get user conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Query without orderBy to avoid index requirement, sort client-side
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessageAt: doc.data().lastMessageAt?.toDate(),
    })) as Conversation[];
    
    // Sort client-side by lastMessageAt
    return conversations.sort((a, b) => {
      const aTime = a.lastMessageAt ? (a.lastMessageAt instanceof Date ? a.lastMessageAt.getTime() : a.lastMessageAt.toMillis()) : 0;
      const bTime = b.lastMessageAt ? (b.lastMessageAt instanceof Date ? b.lastMessageAt.getTime() : b.lastMessageAt.toMillis()) : 0;
      return bTime - aTime; // Descending order
    });
  },

  // Subscribe to user conversations
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    // Query without orderBy to avoid index requirement, sort client-side
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate(),
      })) as Conversation[];
      
      // Sort client-side by lastMessageAt
      const sorted = conversations.sort((a, b) => {
        const aTime = a.lastMessageAt ? (a.lastMessageAt instanceof Date ? a.lastMessageAt.getTime() : a.lastMessageAt.toMillis()) : 0;
        const bTime = b.lastMessageAt ? (b.lastMessageAt instanceof Date ? b.lastMessageAt.getTime() : b.lastMessageAt.toMillis()) : 0;
        return bTime - aTime; // Descending order
      });
      
      callback(sorted);
    }, (error) => {
      console.error('Error in conversations subscription:', error);
      // If index error, show helpful message
      if (error.code === 'failed-precondition') {
        console.warn('⚠️ Firestore index required. Click the link in the error to create it, or the app will work with client-side sorting.');
      }
      callback([]);
    });
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`unreadCount.${userId}`]: 0,
    });

    // Update message statuses
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('status', '!=', 'read')
    );

    const snapshot = await getDocs(messagesQuery);
    const updates = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { status: 'read' })
    );
    await Promise.all(updates);
  },
};

