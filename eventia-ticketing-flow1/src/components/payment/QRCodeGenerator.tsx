
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';  // Changed import to use QRCodeSVG
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface QRCodeGeneratorProps {
  upiVPA: string;
  amount: number;
  payeeName?: string;
  transactionNote?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  upiVPA,
  amount,
  payeeName = 'Eventia',
  transactionNote = '',
}) => {
  const [qrValue, setQrValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (upiVPA && amount) {
      // Construct UPI payment URL
      const upiUrl = `upi://pay?pa=${upiVPA}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      setQrValue(upiUrl);
      setIsLoading(false);
    }
  }, [upiVPA, amount, payeeName, transactionNote]);

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center p-6 bg-gray-50 w-52 h-52 md:w-64 md:h-64 mx-auto">
        <Skeleton className="h-40 w-40 md:h-48 md:w-48" />
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-center p-6 bg-gray-50 w-52 h-52 md:w-64 md:h-64 mx-auto">
      <QRCodeSVG  // Changed from QRCode to QRCodeSVG
        value={qrValue}
        size={200}
        level="H"
        includeMargin={true}
      />
    </Card>
  );
};

export default QRCodeGenerator;
