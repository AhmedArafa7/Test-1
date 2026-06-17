import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Conversation, Message, SendMessageRequest } from '../../../core/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private url = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) {}

  async getAll(): Promise<Conversation[]> {
    return firstValueFrom(this.http.get<Conversation[]>(this.url));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return firstValueFrom(this.http.get<Message[]>(`${this.url}/${conversationId}/messages`));
  }

  // Backend: PATCH /conversations/messages/{messageId}/read
  async markRead(messageId: string): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.url}/messages/${messageId}/read`, {}));
  }

  // Backend: PATCH /conversations/{conversationId}/read
  async markConversationAsRead(conversationId: string): Promise<number> {
    return firstValueFrom(this.http.patch<number>(`${this.url}/${conversationId}/read`, {}));
  }

  /**
   * Create a conversation for a property.
   * Handles 409 Conflict (conversation already exists) by finding the existing one.
   * Returns the conversationId in both cases.
   */
  async create(propertyId: string): Promise<{ conversationId: string }> {
    try {
      return await firstValueFrom(this.http.post<{ conversationId: string }>(this.url, { propertyId }));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        // Conversation already exists — find it from the list
        const conversations = await this.getAll();
        const existing = conversations.find(c => c.propertyId === propertyId);
        if (existing) {
          return { conversationId: existing.id };
        }
      }
      throw error;
    }
  }

  /**
   * Create a conversation as an agent with a specific buyer.
   * POST /api/v1/conversations with { propertyId, buyerUserId }
   */
  async createWithBuyer(propertyId: string, buyerUserId: string): Promise<{ conversationId: string }> {
    try {
      return await firstValueFrom(this.http.post<{ conversationId: string }>(this.url, { propertyId, buyerUserId }));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        // Conversation already exists — find it from the list
        const conversations = await this.getAll();
        const existing = conversations.find(c => c.propertyId === propertyId && c.buyerUserId === buyerUserId);
        if (existing) {
          return { conversationId: existing.id };
        }
      }
      throw error;
    }
  }

  async sendMessage(id: string, request: SendMessageRequest): Promise<{ messageId: string }> {
    return firstValueFrom(this.http.post<{ messageId: string }>(`${this.url}/${id}/messages`, request));
  }
}
