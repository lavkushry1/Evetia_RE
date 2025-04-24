import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  upiVPA: string;
  amount: number;
  eventTitle: string;
  transactionNote: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  upiVPA,
  amount,
  eventTitle,
  transactionNote
}) => {
  // Construct UPI payment link
  const constructUpiUrl = () => {
    const encodedName = encodeURIComponent(eventTitle);
    const encodedNote = encodeURIComponent(transactionNote);
    
    return `upi://pay?pa=${upiVPA}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
  };

  return (
    <div className="flex justify-center p-4 bg-white rounded-lg shadow-sm">
      <QRCodeSVG 
        value={constructUpiUrl()}
        size={180}
        includeMargin={true}
        level="H"
        imageSettings={{
          src: '/eventia-logo.png',
          x: undefined,
          y: undefined,
          height: 30,
          width: 30,
          excavate: true,
        }}
      />
    </div>
  );
};
