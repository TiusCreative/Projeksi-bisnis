import { db } from './firebase';
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
  serverTimestamp 
} from 'firebase/firestore';

export interface CashflowTransaction {
  id?: string;
  business_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: any;
  description?: string;
  created_at?: any;
  updated_at?: any;
}

export const cashflowService = {
  // Add transaction
  async addTransaction(transactionData: Omit<CashflowTransaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const newTransaction: Omit<CashflowTransaction, 'id'> = {
        ...transactionData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'cashflows'), newTransaction);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Get transaction by ID
  async getTransaction(transactionId: string) {
    try {
      const docRef = doc(db, 'cashflows', transactionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } as CashflowTransaction };
      } else {
        return { success: false, error: 'Transaction not found' };
      }
    } catch (error: any) {
      console.error('Error getting transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all transactions for a business
  async getBusinessTransactions(businessId: string, type?: 'income' | 'expense') {
    try {
      let q = query(collection(db, 'cashflows'), where('business_id', '==', businessId));
      
      if (type) {
        q = query(collection(db, 'cashflows'), where('business_id', '==', businessId), where('type', '==', type));
      }
      
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CashflowTransaction[];
      
      // Sort by date descending
      data.sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date);
        const dateB = b.date?.toDate?.() || new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting transactions:', error);
      return { success: false, error: error.message };
    }
  },

  // Update transaction
  async updateTransaction(transactionId: string, transactionData: Partial<CashflowTransaction>) {
    try {
      const docRef = doc(db, 'cashflows', transactionId);
      await updateDoc(docRef, {
        ...transactionData,
        updated_at: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete transaction
  async deleteTransaction(transactionId: string) {
    try {
      await deleteDoc(doc(db, 'cashflows', transactionId));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate cashflow summary
  async calculateCashflowSummary(businessId: string) {
    try {
      const result = await this.getBusinessTransactions(businessId);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      let totalIncome = 0;
      let totalExpense = 0;
      
      result.data.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpense += transaction.amount;
        }
      });
      
      const balance = totalIncome - totalExpense;
      
      return {
        success: true,
        data: {
          totalIncome,
          totalExpense,
          balance,
          transactionCount: result.data.length,
        },
      };
    } catch (error: any) {
      console.error('Error calculating cashflow summary:', error);
      return { success: false, error: error.message };
    }
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  },
};
