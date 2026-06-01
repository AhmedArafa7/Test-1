import { Injectable, signal, computed } from '@angular/core';
import { PropertyListItem, BookingListItem } from '../models';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdOnUtc: string;
  isRead: boolean;
  type?: string;
}

export interface CalendarSlot {
  id: string;
  dayName: string;
  dateStr: string;
  timeStr: string;
  available: boolean;
  date?: Date;
}

export interface AppConversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  agentUserId: string;
  agentName: string;
  buyerUserId: string;
  buyerName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateStore {
  // --- 1. Properties State ---
  private readonly _properties = signal<PropertyListItem[]>([]);
  readonly properties = this._properties.asReadonly();
  readonly totalPropertiesCount = computed(() => this._properties().length);
  readonly featuredProperties = computed(() => this._properties().filter(p => p.isFeatured));

  // --- 2. Bookings State ---
  private readonly _bookings = signal<BookingListItem[]>([]);
  readonly bookings = this._bookings.asReadonly();
  readonly totalBookingsCount = computed(() => this._bookings().length);
  readonly pendingBookings = computed(() => this._bookings().filter(b => b.status === 'Pending'));
  readonly confirmedBookings = computed(() => this._bookings().filter(b => b.status === 'Confirmed'));

  // --- 3. Booking Calendar Slots State ---
  private readonly _calendarSlots = signal<Record<string, CalendarSlot[]>>({});
  readonly calendarSlots = this._calendarSlots.asReadonly();

  // --- 4. Notifications State ---
  private readonly _notifications = signal<AppNotification[]>([]);
  private readonly _unreadNotificationsCount = signal<number>(0);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadNotificationsCount = this._unreadNotificationsCount.asReadonly();

  // --- 5. Conversations State ---
  private readonly _conversations = signal<AppConversation[]>([]);
  private readonly _activeConversationId = signal<string | null>(null);
  readonly conversations = this._conversations.asReadonly();
  readonly activeConversationId = this._activeConversationId.asReadonly();
  readonly totalUnreadMessagesCount = computed(() => 
    this._conversations().reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  );

  // ==========================================
  // --- ACTIONS (State Mutations) ---
  // ==========================================

  // Properties actions
  setProperties(list: PropertyListItem[]) {
    this._properties.set(list);
  }

  addProperty(property: PropertyListItem) {
    this._properties.update(prev => [property, ...prev]);
  }

  updateProperty(property: PropertyListItem) {
    this._properties.update(prev => prev.map(p => p.id === property.id ? property : p));
  }

  removeProperty(propertyId: string) {
    this._properties.update(prev => prev.filter(p => p.id !== propertyId));
  }

  // Bookings actions
  setBookings(list: BookingListItem[]) {
    this._bookings.set(list);
  }

  addBooking(booking: BookingListItem) {
    this._bookings.update(prev => [booking, ...prev]);
  }

  updateBookingStatus(bookingId: string, status: string) {
    this._bookings.update(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  }

  // Calendar Slots actions
  initializeCalendarSlots(agentId: string, slots: CalendarSlot[]) {
    this._calendarSlots.update(prev => ({
      ...prev,
      [agentId]: slots
    }));
  }

  bookCalendarSlot(agentId: string, slotId: string) {
    this._calendarSlots.update(prev => {
      const agentSlots = prev[agentId] || [];
      const updated = agentSlots.map(s => s.id === slotId ? { ...s, available: false } : s);
      return {
        ...prev,
        [agentId]: updated
      };
    });
  }

  // Notifications actions
  setNotifications(list: AppNotification[]) {
    this._notifications.set(list);
    this._unreadNotificationsCount.set(list.filter(n => !n.isRead).length);
  }

  addNotification(notification: AppNotification) {
    this._notifications.update(prev => [notification, ...prev]);
    if (!notification.isRead) {
      this._unreadNotificationsCount.update(count => count + 1);
    }
  }

  markNotificationAsRead(notificationId: string) {
    this._notifications.update(prev => {
      return prev.map(n => {
        if (n.id === notificationId && !n.isRead) {
          this._unreadNotificationsCount.update(count => Math.max(0, count - 1));
          return { ...n, isRead: true };
        }
        return n;
      });
    });
  }

  markAllNotificationsAsRead() {
    this._notifications.update(prev => prev.map(n => ({ ...n, isRead: true })));
    this._unreadNotificationsCount.set(0);
  }

  // Conversations actions
  setConversations(list: AppConversation[]) {
    this._conversations.set(list);
  }

  setActiveConversation(id: string | null) {
    this._activeConversationId.set(id);
    if (id) {
      // Reset unread count for this active conversation
      this._conversations.update(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    }
  }

  updateLastMessage(conversationId: string, message: string, time: string, isIncoming: boolean) {
    this._conversations.update(prev => prev.map(c => {
      if (c.id === conversationId) {
        const isCurrentActive = this._activeConversationId() === conversationId;
        return {
          ...c,
          lastMessage: message,
          lastMessageTime: time,
          unreadCount: (isIncoming && !isCurrentActive) ? (c.unreadCount || 0) + 1 : c.unreadCount
        };
      }
      return c;
    }));
  }
}
