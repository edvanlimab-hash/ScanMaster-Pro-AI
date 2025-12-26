
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, X } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string, decodedResult: any) => void;
  isPaused: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, isPaused }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    // Configuration optimized for speed and accuracy
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 15, // Increased FPS for faster scanning
        qrbox: { width: 300, height: 300 }, // Larger scanning area
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true, // Enable flashlight if available
        videoConstraints: {
          facingMode: "environment",
          focusMode: "continuous", // Attempt to force continuous focus
        },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.DATA_MATRIX
        ]
      },
      /* verbose= */ false
    );

    scanner.render(onScan, (err) => {
      // Ignore common scan failures for UX
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan, isPaused]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
      <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500/30">
        <div id="reader" className="w-full h-full"></div>
        {isPaused && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <p className="text-white font-medium flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
            </p>
          </div>
        )}
      </div>
      
      <div className="text-center px-4">
        <p className="text-sm text-slate-500 font-medium">Align the code within the frame to scan</p>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
               // Future implementation
               alert("Select an image from your gallery containing a code.");
            }}
          />
          <Camera className="w-4 h-4" /> Scan from File
        </label>
      </div>
    </div>
  );
};

export default Scanner;
