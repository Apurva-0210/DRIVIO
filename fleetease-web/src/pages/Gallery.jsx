import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { resolveMediaUrl, DEFAULT_GALLERY } from '../utils/mediaUrl';
import { Bus, Camera, ShieldCheck } from 'lucide-react';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">FleetEase Vehicle View</text></svg>'
  );

export default function Gallery() {
  const [files, setFiles] = useState(DEFAULT_GALLERY);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/gallery')
      .then((r) => {
        const arr = Array.isArray(r.data?.files) ? r.data.files : [];
        if (arr.length) {
          setFiles(
            arr.map((x) => ({
              name: x.name,
              title: x.title || x.name,
              url: x.url,
              source: x.source,
            }))
          );
        } else {
          setFiles(DEFAULT_GALLERY);
        }
      })
      .catch(() => {
        setFiles(DEFAULT_GALLERY);
      });
  }, []);

  return (
    <div className="container py-5 gallery-page">
      <div className="d-flex align-items-baseline justify-content-between mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--fe-border)' }}>
        <div>
          <h2 className="mb-1" style={{ fontSize: '1.375rem' }}>
            Fleet & Vehicle Gallery
          </h2>
          <div className="text-muted small">
            High-standard intercity multi-axle coaches, sleeper cabins, and terminal hubs
          </div>
        </div>
        <span className="badge badge-subtle-primary tabular-nums">
          {files.length} fleet records
        </span>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
        {files.map((item) => (
          <div className="col" key={item.name}>
            <div
              className="gallery-card h-100"
              style={{
                background: '#ffffff',
                border: '1px solid var(--fe-border)',
                borderRadius: 'var(--fe-radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--fe-shadow-xs)',
              }}
            >
              <div className="gallery-card-img" style={{ position: 'relative' }}>
                <img
                  src={resolveMediaUrl(item)}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER;
                  }}
                />
              </div>
              <div className="p-3">
                <div
                  className="fw-medium text-truncate"
                  style={{ fontSize: '0.8125rem', color: 'var(--fe-text-primary)' }}
                >
                  {item.title}
                </div>
                <div className="text-muted" style={{ fontSize: '0.6875rem' }}>
                  Verified cabin inspection standard
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}