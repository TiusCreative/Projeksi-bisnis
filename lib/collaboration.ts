/**
 * Real-time Collaboration Service
 * Handles real-time updates and collaboration features using Firebase Realtime Database
 */

import { realtimeDb } from './firebase';
import { ref, onValue, update, push, remove } from 'firebase/database';

export interface CollaborationEvent {
  type: 'edit' | 'comment' | 'view';
  userId: string;
  userName: string;
  timestamp: number;
  data?: any;
}

export class CollaborationService {
  /**
   * Subscribe to real-time updates for a business
   */
  static subscribeToBusinessUpdates(
    businessId: string,
    callback: (event: CollaborationEvent) => void
  ) {
    const updatesRef = ref(realtimeDb, `businesses/${businessId}/updates`);
    return onValue(updatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const events = Object.values(data) as CollaborationEvent[];
        events.forEach(callback);
      }
    });
  }

  /**
   * Add a collaboration event
   */
  static async addEvent(businessId: string, event: CollaborationEvent) {
    const updatesRef = ref(realtimeDb, `businesses/${businessId}/updates`);
    const newEventRef = push(updatesRef);
    await update(newEventRef, {
      ...event,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user viewing a page
   */
  static async trackView(businessId: string, userId: string, userName: string, page: string) {
    const viewersRef = ref(realtimeDb, `businesses/${businessId}/viewers/${userId}`);
    await update(viewersRef, {
      userName,
      page,
      timestamp: Date.now(),
    });
  }

  /**
   * Remove user from viewers
   */
  static async removeViewer(businessId: string, userId: string) {
    const viewerRef = ref(realtimeDb, `businesses/${businessId}/viewers/${userId}`);
    await remove(viewerRef);
  }

  /**
   * Get current viewers of a business
   */
  static getCurrentViewers(businessId: string, callback: (viewers: any[]) => void) {
    const viewersRef = ref(realtimeDb, `businesses/${businessId}/viewers`);
    return onValue(viewersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const viewers = Object.values(data);
        callback(viewers);
      } else {
        callback([]);
      }
    });
  }

  /**
   * Add a comment to a business document
   */
  static async addComment(
    businessId: string,
    documentId: string,
    userId: string,
    userName: string,
    comment: string
  ) {
    const commentsRef = ref(realtimeDb, `businesses/${businessId}/documents/${documentId}/comments`);
    const newCommentRef = push(commentsRef);
    await update(newCommentRef, {
      userId,
      userName,
      comment,
      timestamp: Date.now(),
    });

    // Notify other users
    await this.addEvent(businessId, {
      type: 'comment',
      userId,
      userName,
      timestamp: Date.now(),
      data: { documentId, comment },
    });
  }

  /**
   * Subscribe to comments for a document
   */
  static subscribeToComments(
    businessId: string,
    documentId: string,
    callback: (comments: any[]) => void
  ) {
    const commentsRef = ref(realtimeDb, `businesses/${businessId}/documents/${documentId}/comments`);
    return onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const comments = Object.values(data);
        callback(comments);
      } else {
        callback([]);
      }
    });
  }

  /**
   * Track edit activity
   */
  static async trackEdit(
    businessId: string,
    documentId: string,
    userId: string,
    userName: string,
    field: string
  ) {
    await this.addEvent(businessId, {
      type: 'edit',
      userId,
      userName,
      timestamp: Date.now(),
      data: { documentId, field },
    });
  }
}
