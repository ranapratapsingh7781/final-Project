import React, { useEffect, useRef, useState } from 'react';

const QRScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const [scannedData, setScannedData] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText) => {
            setScannedData(decodedText);
            if (onScan) onScan(decodedText);
          },
          (error) => {
            // Ignore errors
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        setError('QR Scanner not available. Please ensure camera permission is granted.');
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [onScan]);

  return (
    <div className="stat-card">
      <h3>Scan QR Code</h3>
      {error && <div className="alert">{error}</div>}
      <div id="qr-reader" style={{ width: '100%', marginBottom: '1rem' }}></div>
      {scannedData && (
        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#475569' }}>Scanned QR Code:</p>
          <p style={{ margin: 0, fontWeight: '600', wordBreak: 'break-all' }}>{scannedData}</p>
        </div>
      )}
      <button type="button" className="secondary" onClick={onClose}>
        Close Scanner
      </button>
    </div>
  );
};

export default QRScanner;
