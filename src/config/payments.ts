// 100% Free Payment Integration (Direct UPI, Dynamic QR Code & Direct Bank Transfer)
// No gateway fees, No monthly subscriptions, No intermediate platform cuts (0% fees).
// All payments settle 100% directly into your Indian bank account via NPCI Unified Payments Interface (UPI).
// Works seamlessly with Google Pay, PhonePe, Paytm, CRED, BHIM, and all mobile banking apps.

export interface FreePaymentConfig {
  upiId: string;
  merchantName: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  instructions: string;
}

export const FREE_PAYMENT_CONFIG: FreePaymentConfig = {
  // Edit this with your real UPI ID (from Google Pay, PhonePe, Paytm, or BHIM)
  upiId: "aejazrocks618@oksbi",
  merchantName: "Aejaz Memon",
  accountHolder: "Aejaz Memon",

  // Direct Bank Transfer details (0% fees via IMPS / NEFT / RTGS)
  bankName: "State Bank of India",
  accountNumber: "",
  ifscCode: "HDFC0000123",
  branch: "Ahmedabad Main Branch",

  instructions: "Scan the dynamic QR code with Google Pay, PhonePe, Paytm, or CRED to pay with 0% platform fee.",
};

/**
 * Builds the official NPCI UPI Deep Link / Intent URL
 * Supported by all Indian payment apps (GPay, PhonePe, Paytm, CRED, BHIM)
 */
export function buildUpiIntentUrl(params: {
  upiId: string;
  merchantName: string;
  amount: number;
  transactionNote: string;
}): string {
  const { upiId, merchantName, amount, transactionNote } = params;
  const cleanId = upiId.trim();
  const cleanName = encodeURIComponent(merchantName.trim());
  const cleanNote = encodeURIComponent(transactionNote.trim());
  const cleanAmount = amount.toFixed(2);

  // Standard NPCI UPI URI Scheme
  return `upi://pay?pa=${cleanId}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}`;
}

/**
 * Generates high-definition, scannable QR Code image URL using standard QR rendering API
 * Free, zero API key required, fast CDN delivery
 */
export function buildUpiQrCodeUrl(upiUrl: string, size = 260): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiUrl)}&color=09090b&bgcolor=ffffff&qzone=1&format=png`;
}
