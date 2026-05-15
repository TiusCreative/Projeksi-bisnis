'use client';

import { useState } from 'react';
import {
  shareToWhatsApp,
  shareToTelegram,
  shareToTwitter,
  shareToFacebook,
  shareToLinkedIn,
  copyToClipboard,
  shareViaWebShare,
  createReportMessage,
} from '@/lib/shareUtils';

interface ShareButtonsProps {
  title: string;
  text: string;
  url?: string;
  showLabels?: boolean;
  businessName?: string;
  metrics?: Record<string, any>;
  onShare?: (platform: string) => void;
}

export default function ShareButtons({
  title,
  text,
  url,
  showLabels = true,
  businessName,
  metrics,
  onShare,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(url || text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.('copy');
    }
  };

  const handleWhatsApp = () => {
    const message = businessName && metrics 
      ? createReportMessage(businessName, metrics)
      : text;
    shareToWhatsApp(message);
    onShare?.('whatsapp');
  };

  const handleWebShare = async () => {
    const success = await shareViaWebShare(title, text, url);
    if (success) onShare?.('share');
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
        title="Bagikan ke WhatsApp"
      >
        <span className="text-lg">💬</span>
        {showLabels && <span className="text-sm font-medium">WhatsApp</span>}
      </button>

      {/* Telegram */}
      <button
        onClick={() => {
          shareToTelegram(text, url);
          onShare?.('telegram');
        }}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
        title="Bagikan ke Telegram"
      >
        <span className="text-lg">📱</span>
        {showLabels && <span className="text-sm font-medium">Telegram</span>}
      </button>

      {/* Twitter */}
      <button
        onClick={() => {
          shareToTwitter(text, url);
          onShare?.('twitter');
        }}
        className="flex items-center gap-2 px-3 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm"
        title="Bagikan ke Twitter"
      >
        <span className="text-lg">𝕏</span>
        {showLabels && <span className="text-sm font-medium">Twitter</span>}
      </button>

      {/* Facebook */}
      <button
        onClick={() => {
          shareToFacebook(url || window.location.href, text);
          onShare?.('facebook');
        }}
        className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm"
        title="Bagikan ke Facebook"
      >
        <span className="text-lg">f</span>
        {showLabels && <span className="text-sm font-medium">Facebook</span>}
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => {
          shareToLinkedIn(url || window.location.href, title);
          onShare?.('linkedin');
        }}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
        title="Bagikan ke LinkedIn"
      >
        <span className="text-lg">in</span>
        {showLabels && <span className="text-sm font-medium">LinkedIn</span>}
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-sm ${
          copied
            ? 'bg-green-600 text-white'
            : 'bg-gray-600 hover:bg-gray-700 text-white'
        }`}
        title="Copy link"
      >
        <span className="text-lg">{copied ? '✓' : '🔗'}</span>
        {showLabels && <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>}
      </button>

      {/* Native Web Share (if available) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleWebShare}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
          title="Bagikan"
        >
          <span className="text-lg">↗️</span>
          {showLabels && <span className="text-sm font-medium">Share</span>}
        </button>
      )}
    </div>
  );
}
