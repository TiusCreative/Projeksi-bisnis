'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { CollaborationService } from '@/lib/collaboration';
import { auth } from '@/lib/firebase';

export default function TeamPage() {
  const { selectedBusiness } = useBusiness();
  const [viewers, setViewers] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!selectedBusiness) return;

    const user = auth.currentUser;
    if (!user) return;

    // Track current page view
    CollaborationService.trackView(
      selectedBusiness.id,
      user.uid,
      user.email || 'Unknown',
      'team'
    );

    // Subscribe to viewers
    const unsubscribeViewers = CollaborationService.getCurrentViewers(
      selectedBusiness.id,
      (currentViewers) => {
        setViewers(currentViewers);
      }
    );

    // Subscribe to activity
    const unsubscribeActivity = CollaborationService.subscribeToBusinessUpdates(
      selectedBusiness.id,
      (event) => {
        setActivityLog((prev) => [event, ...prev].slice(0, 20));
      }
    );

    // Cleanup on unmount
    return () => {
      CollaborationService.removeViewer(selectedBusiness.id, user.uid);
      unsubscribeViewers();
      unsubscribeActivity();
    };
  }, [selectedBusiness]);

  const handleAddComment = async () => {
    if (!selectedBusiness || !comment.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    await CollaborationService.addComment(
      selectedBusiness.id,
      'team',
      user.uid,
      user.email || 'Unknown',
      comment
    );

    setComment('');
  };

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Pilih bisnis terlebih dahulu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Tim & Kolaborasi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Viewers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sedang Aktif</h2>
          {viewers.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Tidak ada anggota tim yang sedang aktif</p>
          ) : (
            <div className="space-y-3">
              {viewers.map((viewer, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {viewer.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{viewer.userName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{viewer.page}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Aktivitas Terbaru</h2>
          {activityLog.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLog.map((activity, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{activity.userName}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {activity.type === 'edit' && 'mengedit dokumen'}
                      {activity.type === 'comment' && 'menambahkan komentar'}
                      {activity.type === 'view' && 'melihat halaman'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Comments */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Komentar Tim</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis komentar..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleAddComment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Kirim
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fitur kolaborasi real-time memungkinkan tim Anda bekerja bersama secara sinkron.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
