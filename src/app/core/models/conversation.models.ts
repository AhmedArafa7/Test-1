// ─── Conversation ───
export interface Conversation {
  id: string;
  propertyId: string;
  buyerUserId: string;
  agentUserId: string;
  buyerDisplayName?: string;
  agentDisplayName?: string;
  propertyTitle?: string;
  createdOnUtc: string;
  lastMessageAt: string;
  lastMessageContent?: string;
  lastMessageSenderId?: string;
  unreadCount?: number;
}

// ─── Message ───
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

// ─── Send Message Request ───
export interface SendMessageRequest {
  content: string;
  attachmentUrl?: string;
}

// ─── Notification ───
export interface AppNotification {
  id: string;
  type: 'NewMessage' | 'PaymentUpdate' | 'PropertyMatch';
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: 'Property' | 'Booking' | 'Payment' | 'Message' | null;
  isRead: boolean;
  createdOnUtc: string;
}
