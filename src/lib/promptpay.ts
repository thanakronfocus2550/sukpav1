// PromptPay EMVCo QR Code generator for Thailand
// Standard Bank QR format

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return ((crc & 0xffff) ^ 0x0000).toString(16).toUpperCase().padStart(4, '0');
}

export function generatePromptPayPayload(mobileNumber: string, amount?: number): string {
  // Format mobile to 66XXXXXXXXX
  const cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
  let formattedMobile = cleanNumber;
  if (formattedMobile.startsWith('0')) {
    formattedMobile = '66' + formattedMobile.substring(1);
  }
  formattedMobile = formattedMobile.padStart(13, '0');

  const targetTag = `01${String(formattedMobile.length).padStart(2, '0')}${formattedMobile}`;
  const aid = 'A000000677010111';
  const merchantTag = `00${String(aid.length).padStart(2, '0')}${aid}${targetTag}`;

  let payload = '';
  payload += '000201'; // Payload Format Indicator
  payload += amount ? '010212' : '010211'; // Point of Initiation (12 = dynamic with amount, 11 = static)
  payload += `29${String(merchantTag.length).padStart(2, '0')}${merchantTag}`; // Merchant Account Info
  payload += '5303764'; // Transaction Currency (764 = THB)

  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += `54${String(formattedAmount.length).padStart(2, '0')}${formattedAmount}`;
  }

  payload += '5802TH'; // Country Code (TH)
  payload += '6304'; // Checksum tag

  const checksum = crc16(payload);
  return payload + checksum;
}

export function getPromptPayQrUrl(mobile: string = '0661323388', amount?: number): string {
  const payload = generatePromptPayPayload(mobile, amount);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
}
