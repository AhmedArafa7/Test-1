import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateSearchRequest, SearchRequestDetail, CreateRecommendationRequest, RecommendationRequestDetail } from '../../../core/models';
import { firstValueFrom } from 'rxjs';

// ─── AI Assistant Types ───
export interface AiChatRequest { session_id: string; message: string; }
export interface AiChatResponse {
  type: string; // 'chat' | 'question' | 'results' | 'fallback' | 'no_results'
  message: string;
  question?: string;
  attribute?: string;
  properties: any[];
  properties_count: number;
}
export interface AiVoiceChatResponse extends AiChatResponse { transcription: string; }
export interface AiParseRequest { text: string; session_id: string; }
export interface AiParseResponse { filters: Record<string, any>; message: string; }
export interface AiQuestionRequest {
  session_id: string;
  properties_count: number;
  current_filters: Record<string, any>;
  skipped_attributes: string[];
}
export interface AiQuestionResponse { question: string; attribute?: string; has_question: boolean; }
export interface AiSearchRequest { filters: Record<string, any>; }
export interface AiSearchResponse { count: number; properties: any[]; }
export interface AiRankRequest { properties: any[]; }
export interface AiRankResponse { ranked: any[]; }
export interface AiImageSearchResponse {
  count: number;
  properties: any[];
  message: string;
  engine: string;
  query_image: { content_type: string; size_bytes: number };
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ═══════════════════════════════════════════════════════
  // AI Assistant (Backend: AiAssistantController → /api/v1/aiassistant)
  // ═══════════════════════════════════════════════════════

  /* [FUTURE_USE]: These endpoints from AiAssistantController are not currently used by any frontend page.
  async checkHealth(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.url}/aiassistant/status`));
  }
  async parse(request: AiParseRequest): Promise<AiParseResponse> {
    return firstValueFrom(this.http.post<AiParseResponse>(`${this.url}/aiassistant/parse`, request));
  }
  async question(request: AiQuestionRequest): Promise<AiQuestionResponse> {
    return firstValueFrom(this.http.post<AiQuestionResponse>(`${this.url}/aiassistant/question`, request));
  }
  async searchAssistant(request: AiSearchRequest): Promise<AiSearchResponse> {
    return firstValueFrom(this.http.post<AiSearchResponse>(`${this.url}/aiassistant/search`, request));
  }
  async rank(request: AiRankRequest): Promise<AiRankResponse> {
    return firstValueFrom(this.http.post<AiRankResponse>(`${this.url}/aiassistant/rank`, request));
  } */

  /** Full conversational chat — the main chatbot endpoint */
  async chat(request: AiChatRequest): Promise<AiChatResponse> {
    return firstValueFrom(this.http.post<AiChatResponse>(`${this.url}/aiassistant/chat`, request));
  }

  // Sync AI Assistant endpoints used by chatbot and smart search.
  async voiceChat(sessionId: string, audioFile: File): Promise<AiVoiceChatResponse> {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('audio', audioFile);
    return firstValueFrom(this.http.post<AiVoiceChatResponse>(`${this.url}/aiassistant/voice-chat`, formData));
  }

  async imageSearch(imageFile: File, topN = 10): Promise<AiImageSearchResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('top_n', topN.toString());
    return firstValueFrom(this.http.post<AiImageSearchResponse>(`${this.url}/aiassistant/image-search`, formData));
  }

  async recommendByProperty(houseId: number, topN = 5): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.url}/aiassistant/recommend/${houseId}`, {
      params: { topN: topN.toString() }
    }));
  }

  // ═══════════════════════════════════════════════════════
  // Async AI Search (Backend: SearchController → /api/v1/search)
  // ═══════════════════════════════════════════════════════

  async createSearch(request: CreateSearchRequest): Promise<{ searchRequestId: string }> {
    return firstValueFrom(this.http.post<{ searchRequestId: string }>(`${this.url}/search`, request));
  }

  async getSearchStatus(id: string): Promise<SearchRequestDetail> {
    return firstValueFrom(this.http.get<SearchRequestDetail>(`${this.url}/search/${id}`));
  }

  // ═══════════════════════════════════════════════════════
  // Async Recommendations (Backend: RecommendationsController → /api/v1/recommendations)
  // ═══════════════════════════════════════════════════════

  async createRecommendation(request: CreateRecommendationRequest): Promise<{ requestId: string }> {
    return firstValueFrom(this.http.post<{ requestId: string }>(`${this.url}/recommendations`, request));
  }

  async getRecommendationStatus(id: string): Promise<RecommendationRequestDetail> {
    return firstValueFrom(this.http.get<RecommendationRequestDetail>(`${this.url}/recommendations/${id}`));
  }

  // ═══════════════════════════════════════════════════════
  // Polling Helper — for async Search & Recommendation requests
  // ═══════════════════════════════════════════════════════

  /**
   * Poll an async request until it reaches a terminal state.
   * @param fetchFn Function that returns the current status
   * @param intervalMs Polling interval in milliseconds (default 2000)
   * @param maxAttempts Maximum polling attempts (default 60 = 2 minutes)
   * @returns The final result when status is 'Completed' or 'Failed'
   */
  async pollUntilDone<T extends { status: string }>(
    fetchFn: () => Promise<T>,
    intervalMs = 2000,
    maxAttempts = 60,
  ): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await fetchFn();
      if (result.status === 'Completed' || result.status === 'Failed') {
        return result;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error('Polling timed out');
  }

  // ═══════════════════════════════════════════════════════
  // Session Management
  // ═══════════════════════════════════════════════════════

  private _sessionId: string | null = null;

  /** Get or create a stable session ID for the current chat session */
  getSessionId(): string {
    if (!this._sessionId) {
      const stored = sessionStorage.getItem('baytology_ai_session_id');
      if (stored) {
        this._sessionId = stored;
      } else {
        this._sessionId = crypto.randomUUID();
        sessionStorage.setItem('baytology_ai_session_id', this._sessionId);
      }
    }
    return this._sessionId;
  }

  /** Reset session (e.g., when user clears chat history) */
  resetSession(): void {
    this._sessionId = crypto.randomUUID();
    sessionStorage.setItem('baytology_ai_session_id', this._sessionId);
  }
}
