import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface QRCodeGeneratorProps {
    upiVPA: string;
    amount: number;
    eventTitle?: string;
    transactionNote?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
    upiVPA,
    amount,
    eventTitle = 'Eventia Booking',
    transactionNote
}) => {
    const { t } = useTranslation();
    const upiLink = `upi://pay?pa=${upiVPA}&pn=Eventia&am=${amount}&tn=${transactionNote || eventTitle}`;

    return (
        <div className="qr-code-container">
            <QRCodeSVG
                value={upiLink}
                size={256}
                level="H"
                includeMargin={true}
            />
            <div className="qr-details mt-4">
                <p className="text-sm text-gray-600">
                    {t('payment.scanQRCode', 'Scan QR code to pay')}
                </p>
                <p className="text-sm font-medium">
                    {t('payment.upiVPA', 'UPI ID')}: {upiVPA}
                </p>
                <p className="text-sm font-medium">
                    {t('payment.amount', 'Amount')}: ₹{amount}
                </p>
                {transactionNote && (
                    <p className="text-sm text-gray-600">
                        {t('payment.note', 'Note')}: {transactionNote}
                    </p>
                )}
            </div>
        </div>
    );
};
