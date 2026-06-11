import React, { useState } from 'react';
import './ShareAudit.css';

const ShareAudit = ({ auditId, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  // Use full window location host if available, otherwise fallback to "fairlens.app" as requested in prompt, or actual current URL
  const fullUrl = window.location.origin + shareUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="share-audit-card">
      <div className="share-audit-header">
        <div className="share-audit-title">
          <span className="share-audit-icon">🔗</span> Shareable Audit Link Generated
        </div>
        <div className="share-audit-badge">Expires in 24h</div>
      </div>

      <div className="share-audit-url-container">
        <div className="share-audit-url">{fullUrl}</div>
      </div>

      <div className="share-audit-actions">
        <button className="share-audit-btn outline" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button className="share-audit-btn outline" onClick={handleOpen}>
          Open in New Tab
        </button>
      </div>

      <div className="share-audit-hint">
        Share this link with regulators, investors, or your team. Anyone with this link can view the read-only audit report.
      </div>
    </div>
  );
};

export default ShareAudit;
