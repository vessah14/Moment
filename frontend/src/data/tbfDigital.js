import { isEnglish } from '../i18n'
// TBF DIGITAL : impression des souvenirs (album photo, cadre NFC « page souvenir »,
// tasses…), commandés sur WhatsApp.
export const TBF_DIGITAL_WHATSAPP = '237680264060'

export function tbfDigitalOrderUrl(product, eventUrl) {
  const text = isEnglish
    ? `Hello TBF DIGITAL, I'd like to order: ${product}.${eventUrl ? ` My event: ${eventUrl}` : ''} Could you tell me the price and lead time?`
    : `Bonjour TBF DIGITAL, je souhaite commander : ${product}.${eventUrl ? ` Mon événement : ${eventUrl}` : ''} Pouvez-vous m'indiquer le prix et le délai ?`
  return `https://wa.me/${TBF_DIGITAL_WHATSAPP}?text=${encodeURIComponent(text)}`
}
