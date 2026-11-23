import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      const id = Math.random().toString(36).slice(2);
      setToasts((ts) => [...ts, { id, ...detail }]);
      setTimeout(() => {
        setToasts((ts) => ts.filter((t) => t.id !== id));
      }, detail.duration || 3500);
    };
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, []);

  const remove = (id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  };

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        top: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => {
        const isError = t.variant === 'error' || t.variant === 'danger';
        const isSuccess = t.variant === 'success';

        return (
          <div
            key={t.id}
            style={{
              background: '#ffffff',
              border: `1px solid ${isError ? 'var(--fe-danger-border)' : isSuccess ? 'var(--fe-success-border)' : 'var(--fe-border)'}`,
              borderRadius: 'var(--fe-radius-md)',
              padding: '10px 14px',
              boxShadow: 'var(--fe-shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.875rem',
              color: 'var(--fe-text-primary)',
            }}
          >
            {isError ? (
              <AlertCircle size={18} color="var(--fe-danger)" style={{ flexShrink: 0 }} />
            ) : isSuccess ? (
              <CheckCircle2 size={18} color="var(--fe-success)" style={{ flexShrink: 0 }} />
            ) : (
              <Info size={18} color="var(--fe-accent)" style={{ flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, lineHeight: 1.4 }}>{t.message || 'Notification'}</div>
            <button
              onClick={() => remove(t.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--fe-text-muted)',
                padding: 0,
                display: 'flex',
              }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export const toast = (message, variant = 'success', duration = 3500) => {
  const ev = new CustomEvent('toast', { detail: { message, variant, duration } });
  window.dispatchEvent(ev);
};