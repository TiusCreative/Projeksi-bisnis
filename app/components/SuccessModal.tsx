'use client';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, title, message, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
      {/* Animasi zoom in */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl transform scale-100 transition-transform animate-[pulse_0.2s_ease-out]">
        
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          {/* Checkmark SVG */}
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">{message}</p>
        
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
        >
          Lanjutkan
        </button>
        
      </div>
    </div>
  );
}