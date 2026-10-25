import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../config/site';

export default function WhatsAppButton() {
  const href = whatsappLink();
  if (!href) return null; // hidden until VITE_WHATSAPP_NUMBER is set
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-charcoal px-4 py-3 text-sm font-medium text-ivory shadow-sm transition-colors hover:bg-olive"
    >
      <MessageCircle size={18} /> <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
