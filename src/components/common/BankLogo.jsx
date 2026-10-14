import React from 'react';

export default function BankLogo({ bankCode, bankName, size = 30 }) {
  const getBankStyle = (code) => {
    switch (code) {
      case 'SBI':
        return {
          bg: '#1a4480',
          text: 'SBI',
          shape: (
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" />
              <line x1="12" y1="12" x2="12" y2="22" stroke="#fff" strokeWidth="2.5" />
              <circle cx="12" cy="10" r="2.5" fill="#fff" />
            </svg>
          )
        };
      case 'CANARA':
        return {
          bg: '#0083c2',
          text: 'CB',
          shape: (
            <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,20 2,20" fill="#fdb813" />
              <polygon points="12,7 18,18 6,18" fill="#0083c2" />
            </svg>
          )
        };
      case 'UBI':
        return {
          bg: '#c91f28',
          text: 'UBI',
          shape: (
            <span style={{ fontWeight: 800, color: '#fff', fontSize: size * 0.38 }}>UBI</span>
          )
        };
      case 'BOB':
        return {
          bg: '#f37023',
          text: 'BOB',
          shape: (
            <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="7" fill="#fff" />
              <circle cx="12" cy="12" r="4" fill="#f37023" />
            </svg>
          )
        };
      case 'ICICI':
        return {
          bg: '#a61c1e',
          text: 'ICICI',
          shape: (
            <span style={{ fontWeight: 800, color: '#f37023', fontSize: size * 0.38 }}>I</span>
          )
        };
      case 'KTK':
        return {
          bg: '#7b1113',
          text: 'KTK',
          shape: (
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 12l8 10 8-10L12 2z" fill="#fdb813" />
            </svg>
          )
        };
      case 'AXIS':
        return {
          bg: '#97144d',
          text: 'AXIS',
          shape: (
            <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 21h7l3-6 3 6h7L12 3z" fill="#fff" />
            </svg>
          )
        };
      case 'INDIAN':
        return {
          bg: '#0c4da2',
          text: 'IN',
          shape: (
            <span style={{ fontWeight: 800, color: '#e31b23', fontSize: size * 0.38 }}>IB</span>
          )
        };
      case 'CBI':
        return {
          bg: '#00539f',
          text: 'CBI',
          shape: (
            <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="#f47920" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="4" fill="#fff" />
            </svg>
          )
        };
      case 'PNB':
        return {
          bg: '#a20037',
          text: 'PNB',
          shape: (
            <span style={{ fontWeight: 900, color: '#ffcc00', fontSize: size * 0.38 }}>PNB</span>
          )
        };
      case 'HDFC':
        return {
          bg: '#004c8f',
          text: 'HDFC',
          shape: (
            <span style={{ fontWeight: 800, color: '#ed1c24', fontSize: size * 0.36 }}>HDFC</span>
          )
        };
      default:
        return {
          bg: '#2563eb',
          text: (bankName || 'BK').substring(0, 2).toUpperCase(),
          shape: (
            <span style={{ fontWeight: 700, color: '#fff', fontSize: size * 0.36 }}>
              {(bankName || 'BK').substring(0, 2).toUpperCase()}
            </span>
          )
        };
    }
  };

  const style = getBankStyle(bankCode);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '7px',
        backgroundColor: style.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        flexShrink: 0,
        userSelect: 'none',
      }}
      title={bankName}
    >
      {style.shape}
    </div>
  );
}
