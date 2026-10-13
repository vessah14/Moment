import { Bell, Mail, MessageCircle, Smartphone } from 'lucide-react'

export const CHANNELS = [
  { value: 'E-mail', icon: Mail },
  { value: 'SMS', icon: Smartphone },
  { value: 'WhatsApp', icon: MessageCircle },
  { value: 'Push', icon: Bell },
]

export const AUDIENCES = [
  'Tous les invités',
  'Non répondus',
  'Confirmés',
  'En attente',
  'Refus',
]
