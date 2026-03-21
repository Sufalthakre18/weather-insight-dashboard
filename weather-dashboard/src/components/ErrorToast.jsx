import { useEffect, useState } from 'react';

export default function ErrorToast({ message, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); onDismiss?.(); }, 5000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message || !visible) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-xl max-w-sm"
      style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', backdropFilter: 'blur(12px)' }}
    >
      <span className="text-base shrink-0">⚠️</span>
      <p className="text-sm text-[#ff6b6b]" style={{ fontFamily: "'Exo 2', sans-serif" }}>{message}</p>
      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        className="ml-auto text-[#ff6b6b] hover:text-white text-lg leading-none shrink-0"
      >
        ×
      </button>
    </div>
  );
}