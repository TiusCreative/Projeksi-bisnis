import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  getRedirectResult
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const authService = {
  // Login with email and password
  async loginWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Save to localStorage for auto-connect (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', email);
      }
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.code === 'auth/invalid-credential' 
          ? 'Email atau password salah' 
          : error.message 
      };
    }
  },

  // Register with email and password
  async registerWithEmail(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save to localStorage for auto-connect (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', email);
      }
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.code === 'auth/email-already-in-use' 
          ? 'Email sudah terdaftar' 
          : error.code === 'auth/weak-password'
          ? 'Password terlalu lemah (minimal 6 karakter)'
          : error.message 
      };
    }
  },

  // Login with Google OAuth
  async loginWithGoogle() {
    try {
      await signInWithRedirect(auth, googleProvider);
      // The result will be handled by onAuthStateChanged
      return { success: true };
    } catch (error: any) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.code === 'auth/popup-closed-by-user'
          ? 'Login dibatalkan'
          : error.code === 'auth/popup-blocked'
          ? 'Popup diblokir oleh browser. Izinkan popup untuk login.'
          : error.message 
      };
    }
  },

  // Get redirect result (call this after redirect)
  async getRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (!result) {
        return { success: false };
      }
      if (result.user) {
        return { success: true, user: result.user };
      }
      return { success: false, error: 'No user returned from redirect' };
    } catch (error: any) {
      console.error('Redirect result error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      await firebaseSignOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userEmail');
      }
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Auto-connect from localStorage (client-side only)
  autoConnect() {
    if (typeof window === 'undefined') return null;
    const savedEmail = localStorage.getItem('userEmail');
    return savedEmail || null;
  }
};
