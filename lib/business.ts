import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';

export interface Business {
  id?: string;
  name: string;
  category: string;
  logo_url?: string;
  address?: string;
  target_omzet: number;
  owner_id: string;
  members: string[];
  roles?: Record<string, string>;
  role?: string;
  created_at?: any;
  updated_at?: any;
}

export const businessService = {
  // Create new business
  async createBusiness(businessData: Omit<Business, 'id' | 'owner_id' | 'members' | 'created_at' | 'updated_at'>) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const newBusiness: Omit<Business, 'id'> = {
        ...businessData,
        owner_id: user.uid,
        members: [user.uid],
        roles: { [user.uid]: 'owner' },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'businesses'), newBusiness);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating business:', error);
      return { success: false, error: error.message };
    }
  },

  // Get business by ID
  async getBusiness(businessId: string) {
    try {
      const docRef = doc(db, 'businesses', businessId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } as Business };
      } else {
        return { success: false, error: 'Business not found' };
      }
    } catch (error: any) {
      console.error('Error getting business:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all businesses for current user
  async getUserBusinesses() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const qOwner = query(collection(db, 'businesses'), where('owner_id', '==', user.uid));
      const qMember = query(collection(db, 'businesses'), where('members', 'array-contains', user.uid));
      
      const [snapOwner, snapMember] = await Promise.all([getDocs(qOwner), getDocs(qMember)]);
      
      const dataMap = new Map<string, Business>();

      const mapDocToBusiness = (docSnap: any): Business => {
        const data = docSnap.data();
        const role = data.roles?.[user.uid] || (data.owner_id === user.uid ? 'owner' : 'staff');
        return { id: docSnap.id, ...data, role } as Business;
      };
      
      snapOwner.docs.forEach(doc => {
        dataMap.set(doc.id, mapDocToBusiness(doc));
      });
      
      snapMember.docs.forEach(doc => {
        if (!dataMap.has(doc.id)) {
          dataMap.set(doc.id, mapDocToBusiness(doc));
        }
      });
      
      return { success: true, data: Array.from(dataMap.values()) };
    } catch (error: any) {
      console.error('Error getting businesses:', error);
      return { success: false, error: error.message };
    }
  },

  // Update business
  async updateBusiness(businessId: string, businessData: Partial<Business>) {
    try {
      const docRef = doc(db, 'businesses', businessId);
      await updateDoc(docRef, {
        ...businessData,
        updated_at: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating business:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete business
  async deleteBusiness(businessId: string) {
    try {
      await deleteDoc(doc(db, 'businesses', businessId));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting business:', error);
      return { success: false, error: error.message };
    }
  },

  // Add member to business
  async addMember(businessId: string, memberUid: string, role: string = 'staff') {
    try {
      const docRef = doc(db, 'businesses', businessId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Business not found' };
      }
      
      const currentMembers = docSnap.data().members || [];
      if (currentMembers.includes(memberUid)) {
        return { success: false, error: 'User already a member' };
      }
      
      await updateDoc(docRef, {
        members: [...currentMembers, memberUid],
        [`roles.${memberUid}`]: role,
        updated_at: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding member:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove member from business
  async removeMember(businessId: string, memberUid: string) {
    try {
      const docRef = doc(db, 'businesses', businessId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Business not found' };
      }
      
      const currentMembers = docSnap.data().members || [];
      const updatedMembers = currentMembers.filter((uid: string) => uid !== memberUid);
      
      await updateDoc(docRef, {
        members: updatedMembers,
        [`roles.${memberUid}`]: deleteField(),
        updated_at: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error removing member:', error);
      return { success: false, error: error.message };
    }
  },

  // Update member role
  async updateMemberRole(businessId: string, memberUid: string, newRole: string) {
    try {
      const docRef = doc(db, 'businesses', businessId);
      await updateDoc(docRef, {
        [`roles.${memberUid}`]: newRole,
        updated_at: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating member role:', error);
      return { success: false, error: error.message };
    }
  }
};
