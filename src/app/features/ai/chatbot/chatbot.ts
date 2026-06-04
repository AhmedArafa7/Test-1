import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

import { getPropertyImageUrl } from '../../../core/utils/media';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConversationService } from '../../conversations/services/conversation.service';
import { AiChatResponse, AiImageSearchResponse, AiService } from '../services/ai.service';

type AiProperty = Record<string, any>;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  properties?: AiProperty[];
  propertyCount?: number;
  imageSrc?: string;
  voiceUrl?: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, ImageCropperComponent],
  template: `
    <div class="bg-white font-sans flex justify-center">
      <div class="w-full max-w-6xl flex flex-col h-[calc(100vh-72px)] border-x border-gray-100 shadow-sm">
        <div class="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 bg-white ltr:flex-row rtl:flex-row-reverse">
          <button (click)="goBack()" class="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 group ltr:flex-row rtl:flex-row-reverse">
            <svg class="w-5 h-5 transition-transform ltr:group-hover:-translate-x-1 rtl:group-hover:translate-x-1 ltr:rotate-180 rtl:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <span class="text-xs font-black">{{ 'AI.CHATBOT.BACK_BTN' | translate }}</span>
          </button>

          <div class="flex items-center gap-3 ltr:flex-row rtl:flex-row-reverse">
            <button (click)="clearHistory()" class="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors px-4 py-2 border border-gray-100 rounded-full hover:bg-red-50">
              {{ 'AI.CHATBOT.CLEAR_BTN' | translate }}
            </button>
            <span class="text-xs font-black text-[#0a8f96] bg-[#0a8f96]/5 px-4 py-2 rounded-full uppercase tracking-widest">{{ 'AI.CHATBOT.TITLE' | translate }}</span>
          </div>
        </div>

        <div #chatContainer class="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6 bg-gray-50/40">
          @if (messages().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto py-12">
              <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0a8f96] to-[#076b70] flex items-center justify-center mb-8 shadow-2xl shadow-[#0a8f96]/25 border border-[#12b5bd]/20">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>

              <h2 class="text-3xl font-black text-gray-900 mb-3 tracking-tight">{{ 'AI.CHATBOT.WELCOME_TITLE' | translate }}</h2>
              <p class="text-gray-500 font-bold mb-10 leading-relaxed">{{ 'AI.CHATBOT.WELCOME_DESC' | translate }}</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button (click)="quickAction('AI.CHATBOT.ACTION_PORTFOLIO_TEXT')" class="p-5 bg-white border border-gray-100 rounded-2xl ltr:text-left rtl:text-right hover:shadow-lg hover:shadow-[#0a8f96]/5 transition-all group">
                  <div class="w-11 h-11 bg-gradient-to-br from-[#0a8f96]/10 to-[#0a8f96]/5 rounded-2xl flex items-center justify-center mb-4 group-hover:from-[#0a8f96]/15 group-hover:to-[#0a8f96]/10 transition-colors border border-[#0a8f96]/5">
                    <svg class="w-6 h-6 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h4 class="font-black text-gray-900 text-sm mb-2">{{ 'AI.CHATBOT.ACTION_PORTFOLIO_TITLE' | translate }}</h4>
                  <p class="text-[11px] text-gray-400 font-bold leading-relaxed">{{ 'AI.CHATBOT.ACTION_PORTFOLIO_DESC' | translate }}</p>
                </button>

                <button (click)="quickAction('AI.CHATBOT.ACTION_TRENDS_TEXT')" class="p-5 bg-white border border-gray-100 rounded-2xl ltr:text-left rtl:text-right hover:shadow-lg hover:shadow-[#0a8f96]/5 transition-all group">
                  <div class="w-11 h-11 bg-gradient-to-br from-[#0a8f96]/10 to-[#0a8f96]/5 rounded-2xl flex items-center justify-center mb-4 group-hover:from-[#0a8f96]/15 group-hover:to-[#0a8f96]/10 transition-colors border border-[#0a8f96]/5">
                    <svg class="w-6 h-6 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                  </div>
                  <h4 class="font-black text-gray-900 text-sm mb-2">{{ 'AI.CHATBOT.ACTION_TRENDS_TITLE' | translate }}</h4>
                  <p class="text-[11px] text-gray-400 font-bold leading-relaxed">{{ 'AI.CHATBOT.ACTION_TRENDS_DESC' | translate }}</p>
                </button>
              </div>
            </div>
          }

          @for (msg of messages(); track $index) {
            <div [class]="msg.role === 'user' ? 'flex ltr:justify-start rtl:justify-end mb-6' : 'flex ltr:justify-end rtl:justify-start mb-6'">
              <div [class]="msg.role === 'user' ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[26px] ltr:rounded-bl-md rtl:rounded-br-md max-w-[85%]' : 'bg-white text-gray-900 rounded-[26px] ltr:rounded-br-md rtl:rounded-bl-md max-w-[95%] border border-gray-100/80'" class="px-5 md:px-7 py-5 shadow-sm">
                @if (msg.imageSrc) {
                  <div [class.mb-3]="msg.content" class="max-w-xs rounded-2xl overflow-hidden border border-white/10 shadow-md bg-white">
                    <img [src]="msg.imageSrc" class="w-full h-auto object-cover max-h-60" [alt]="'AI.CHATBOT.IMAGE_ALT' | translate">
                  </div>
                }
                @if (msg.voiceUrl) {
                  <div [class.mb-2]="msg.content" class="min-w-[240px] py-1 flex items-center justify-center">
                    <audio [src]="msg.voiceUrl" controls class="w-full max-w-[260px] h-9 rounded-full"></audio>
                  </div>
                }
                @if (msg.content) {
                  <p class="text-sm font-bold whitespace-pre-wrap leading-loose ltr:text-left rtl:text-right">{{ msg.content }}</p>
                }

                @if (msg.role === 'assistant' && (msg.properties?.length || 0) > 0) {
                  <div class="mt-5 pt-5 border-t border-gray-100">
                    <div class="flex items-center justify-between gap-4 mb-4 ltr:flex-row rtl:flex-row-reverse">
                      <p class="text-[11px] font-black text-[#0a8f96] uppercase tracking-widest">
                        {{ 'AI.CHATBOT.FOUND_PROPERTIES' | translate:{ count: msg.propertyCount || msg.properties?.length || 0 } }}
                      </p>
                      <a routerLink="/properties" class="text-[11px] font-black text-gray-400 hover:text-[#0a8f96] transition-colors">{{ 'AI.CHATBOT.SEE_ALL' | translate }}</a>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      @for (property of msg.properties; track trackProperty($index, property)) {
                        <article class="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                          <div class="flex gap-3 p-3 ltr:flex-row rtl:flex-row-reverse">
                            <a [routerLink]="['/properties', getPropertyId(property)]" class="w-24 h-24 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                              <img [src]="getPropertyImage(property)" [alt]="getPropertyTitle(property)" class="w-full h-full object-cover">
                            </a>

                            <div class="min-w-0 flex-1 ltr:text-left rtl:text-right">
                              <a [routerLink]="['/properties', getPropertyId(property)]" class="block text-sm font-black text-gray-900 hover:text-[#0a8f96] transition-colors truncate">
                                {{ getPropertyTitle(property) }}
                              </a>
                              <p class="text-[11px] font-bold text-gray-500 mt-1 truncate">{{ getPropertyLocation(property) }}</p>
                              <p class="text-sm font-black text-[#0a8f96] mt-2">{{ formatPrice(getPropertyPrice(property)) }}</p>
                              <p class="text-[11px] font-bold text-gray-400 mt-1">{{ getPropertySpecs(property) }}</p>
                              @if (getSimilarityLabel(property)) {
                                <p class="text-[10px] font-black text-emerald-600 mt-1">{{ getSimilarityLabel(property) }}</p>
                              }
                            </div>
                          </div>

                          <div class="grid grid-cols-3 border-t border-gray-100">
                            <a [routerLink]="['/properties', getPropertyId(property)]" class="py-3 text-center text-[11px] font-black text-gray-700 hover:text-[#0a8f96] hover:bg-white transition-colors">{{ 'AI.CHATBOT.DETAILS' | translate }}</a>
                            <a [routerLink]="['/bookings/new']" [queryParams]="{ propertyId: getPropertyId(property) }" class="py-3 text-center text-[11px] font-black text-gray-700 hover:text-[#0a8f96] hover:bg-white transition-colors border-x border-gray-100">{{ 'AI.CHATBOT.BOOK' | translate }}</a>
                            <button (click)="contactAgent(property)" class="py-3 text-center text-[11px] font-black text-gray-700 hover:text-[#0a8f96] hover:bg-white transition-colors">{{ 'AI.CHATBOT.CONTACT_AGENT' | translate }}</button>
                          </div>
                        </article>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (thinking()) {
            <div class="flex ltr:justify-end rtl:justify-start mb-6">
              <div class="bg-white rounded-[22px] px-6 py-4 border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-[#0a8f96] rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-[#0a8f96] rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-[#0a8f96] rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="px-4 md:px-8 py-5 bg-white/80 backdrop-blur-lg border-t border-gray-100">
          @if (selectedFileUrl) {
            <div class="max-w-4xl mx-auto mb-3 px-4 py-2 bg-[#0a8f96]/5 rounded-2xl border border-[#0a8f96]/20 flex items-center justify-between animate-in slide-in-from-bottom-1 overflow-hidden shrink-0">
              <div class="flex items-center gap-3">
                <div (click)="reopenEditor()" class="w-10 h-10 rounded-xl overflow-hidden border border-[#0a8f96]/20 shrink-0 shadow-sm bg-white cursor-pointer hover:opacity-80 active:scale-95 transition-all" [title]="'AI.CHATBOT.EDIT_PREVIEW_TITLE' | translate">
                  <img [src]="selectedFileUrl" class="w-full h-full object-cover">
                </div>
                <span class="text-[11px] font-black text-[#0a8f96]">{{ 'MESSAGES.FILE_ATTACHED' | translate }}</span>
              </div>
              <button (click)="clearImage()" class="text-slate-400 hover:text-red-500 bg-white border border-slate-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm cursor-pointer transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          }

          <div class="max-w-4xl mx-auto flex items-center gap-3 md:gap-4 ltr:flex-row rtl:flex-row-reverse">
            <input #imageInput type="file" accept="image/*" class="hidden" (change)="onImageSelected($event)">
            <button (click)="imageInput.click()" [disabled]="thinking()" class="w-12 h-12 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 rounded-xl border border-gray-100 flex items-center justify-center transition-all" [title]="'AI.CHATBOT.UPLOAD_IMAGE_TITLE' | translate">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </button>
            <button (click)="toggleRecording()" [disabled]="thinking()" [class]="isRecording() ? 'w-12 h-12 bg-red-500 hover:bg-red-600 rounded-xl border border-red-300 flex items-center justify-center transition-all animate-pulse' : 'w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 flex items-center justify-center transition-all'" [title]="'AI.CHATBOT.VOICE_TITLE' | translate">
              <svg class="w-5 h-5" [class]="isRecording() ? 'text-white' : 'text-gray-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v11m0 0a3 3 0 003-3V7a3 3 0 10-6 0v2a3 3 0 003 3zm0 0v4m-4 0h8"/></svg>
            </button>

            <input [(ngModel)]="input" (keydown.enter)="send()" class="flex-1 bg-gray-50/80 border border-gray-200/60 rounded-[22px] px-5 md:px-7 py-4 ltr:pe-14 rtl:ps-14 text-sm font-bold focus:bg-white focus:border-[#0a8f96]/30 focus:ring-4 focus:ring-[#0a8f96]/5 transition-all outline-none ltr:text-left rtl:text-right" [placeholder]="'AI.CHATBOT.INPUT_PLACEHOLDER' | translate" autofocus>

            <button (click)="send()" [disabled]="(!input.trim() && !selectedFileUrl) || thinking()" class="w-13 h-13 min-w-13 min-h-13 ltr:rotate-0 rtl:rotate-180 bg-[#0a8f96] hover:bg-[#076b70] disabled:opacity-40 text-white rounded-[20px] flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-[#0a8f96]/20">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <p class="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">{{ 'AI.CHATBOT.DISCLAIMER' | translate }}</p>
        </div>
      </div>
    </div>

    <!-- Cropper & Draw Editor Modal -->
    @if (showCropperModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 ltr:flex-row rtl:flex-row-reverse">
            <h3 class="font-extrabold text-slate-900 text-lg ltr:text-left rtl:text-right">{{ 'AI.CHATBOT.EDIT_IMAGE_TITLE' | translate }}</h3>
            <button (click)="cancelCrop()" class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Mode Tabs -->
          <div class="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex justify-center">
            <div class="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
              <button (click)="activeEditorMode.set('crop')" 
                      [class.bg-white]="activeEditorMode() === 'crop'" 
                      [class.shadow-sm]="activeEditorMode() === 'crop'" 
                      [class.text-[#0a8f96]]="activeEditorMode() === 'crop'"
                      [class.text-slate-500]="activeEditorMode() !== 'crop'"
                      class="px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-none">
                {{ 'AI.CHATBOT.MODE_CROP' | translate }}
              </button>
              <button (click)="activeEditorMode.set('draw')" 
                      [class.bg-white]="activeEditorMode() === 'draw'" 
                      [class.shadow-sm]="activeEditorMode() === 'draw'" 
                      [class.text-[#0a8f96]]="activeEditorMode() === 'draw'"
                      [class.text-slate-500]="activeEditorMode() !== 'draw'"
                      class="px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-none">
                {{ 'AI.CHATBOT.MODE_DRAW' | translate }}
              </button>
            </div>
          </div>

          <!-- Editor Area -->
          <div class="flex-1 bg-slate-100 overflow-hidden relative flex flex-col items-center justify-center min-h-[350px] p-6">
            @if (activeEditorMode() === 'crop') {
              <image-cropper
                [imageFile]="imageFile"
                [maintainAspectRatio]="false"
                [imageQuality]="90"
                format="jpeg"
                (imageCropped)="imageCropped($event)"
                class="max-h-[50vh] w-full rounded-2xl overflow-hidden shadow-sm">
              </image-cropper>
            } @else {
              <!-- Draw Mode Controls & Canvas -->
              <div class="flex flex-col items-center gap-4 w-full">
                <!-- Color & Size Toolbar -->
                <div class="flex flex-wrap items-center justify-center gap-4 bg-white border border-slate-200/60 px-5 py-2.5 rounded-2xl shadow-sm">
                  <!-- Colors -->
                  <div class="flex items-center gap-2">
                    @for (color of ['#ff4d4d', '#2ecc71', '#3498db', '#f1c40f', '#2c3e50']; track color) {
                      <button (click)="changeColor(color)" 
                              [style.background]="color" 
                              [class.ring-4]="drawingColor === color"
                              [class.ring-[#0a8f96]/30]="drawingColor === color"
                              class="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border border-white shadow-sm"></button>
                    }
                  </div>
                  
                  <div class="h-6 w-px bg-slate-200"></div>
                  
                  <!-- Brush sizes -->
                  <div class="flex items-center gap-3">
                    <button (click)="changeWidth(2)" [class.bg-slate-200]="drawingLineWidth === 2" class="px-3 py-1 text-[10px] font-black rounded-lg border border-slate-100 cursor-pointer transition-colors">{{ 'AI.CHATBOT.BRUSH_THIN' | translate }}</button>
                    <button (click)="changeWidth(5)" [class.bg-slate-200]="drawingLineWidth === 5" class="px-3 py-1 text-[10px] font-black rounded-lg border border-slate-100 cursor-pointer transition-colors">{{ 'AI.CHATBOT.BRUSH_MEDIUM' | translate }}</button>
                    <button (click)="changeWidth(10)" [class.bg-slate-200]="drawingLineWidth === 10" class="px-3 py-1 text-[10px] font-black rounded-lg border border-slate-100 cursor-pointer transition-colors">{{ 'AI.CHATBOT.BRUSH_THICK' | translate }}</button>
                  </div>
                </div>

                <!-- Canvas Drawing Box -->
                <div class="bg-white border border-slate-200/60 rounded-3xl p-3 shadow-inner flex items-center justify-center w-full max-w-[620px] overflow-auto">
                  <canvas #drawingCanvas 
                          (mousedown)="startDrawing($event)" 
                          (mousemove)="draw($event)" 
                          (mouseup)="stopDrawing()" 
                          (mouseleave)="stopDrawing()" 
                          (touchstart)="startDrawingTouch($event)" 
                          (touchmove)="drawTouch($event)" 
                          (touchend)="stopDrawing()"
                          class="bg-slate-50 cursor-crosshair rounded-2xl shadow-sm border border-slate-100"></canvas>
                </div>
              </div>
            }
          </div>

          <!-- Footer / Actions -->
          <div class="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-3 ltr:flex-row rtl:flex-row-reverse">
            <!-- Reset Button on Left -->
            <button (click)="resetToOriginal()" class="px-5 py-2.5 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors cursor-pointer flex items-center gap-1.5">
              <span>↩️</span>
              <span>{{ 'AI.CHATBOT.RESET_BTN' | translate }}</span>
            </button>

            <!-- Action buttons on Right -->
            <div class="flex items-center gap-3">
              <button (click)="cancelCrop()" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">{{ 'AI.CHATBOT.CANCEL_BTN' | translate }}</button>
              <button (click)="confirmCrop()" class="px-8 py-2.5 rounded-xl font-bold text-white bg-[#0a8f96] hover:bg-[#076b70] transition-colors shadow-lg shadow-[#0a8f96]/20 flex items-center gap-2 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>{{ 'AI.CHATBOT.APPLY_BTN' | translate }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ChatbotComponent {
  messages = signal<ChatMessage[]>(this.loadHistory());
  input = '';
  thinking = signal(false);
  isRecording = signal(false);
  selectedImageName = signal('');
  chatContainer = viewChild<ElementRef>('chatContainer');
  imageInput = viewChild<ElementRef>('imageInput');

  showCropperModal = signal(false);
  imageFile: File | undefined = undefined;
  croppedImageTemp: string = '';
  croppedFile: File | Blob | string | null = null;
  selectedFileUrl = '';

  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('drawingCanvas');
  activeEditorMode = signal<'crop' | 'draw'>('crop');
  drawingColor = '#ff4d4d';
  drawingLineWidth = 5;
  canvasElement: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  isDrawingState = false;
  originalImageFile: File | null = null;

  private translate = inject(TranslateService);
  private confirmService = inject(ConfirmService);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private selectedImageFile: File | null = null;

  constructor(
    private aiService: AiService,
    public auth: AuthService,
    private conversationService: ConversationService,
    private router: Router,
    private toast: ToastService,
  ) {
    effect(() => {
      const ref = this.canvasRef();
      if (ref) {
        this.initCanvas(ref.nativeElement);
      }
    });
  }

  goBack() { history.back(); }

  quickAction(key: string) {
    this.input = this.translate.instant(key);
    this.send();
  }

  async clearHistory() {
    const ok = await this.confirmService.ask({
      title: this.translate.instant('COMMON.CONFIRM_CLEAR_TITLE'),
      message: this.translate.instant('COMMON.CONFIRM_CLEAR_DESC'),
      confirmText: this.translate.instant('COMMON.CONFIRM'),
      cancelText: this.translate.instant('COMMON.CANCEL'),
      variant: 'danger',
    });
    if (ok) {
      this.messages.set([]);
      localStorage.removeItem('baytology_chat_history');
      this.aiService.resetSession();
    }
  }

  async send() {
    if (this.selectedImageFile) {
      const file = this.selectedImageFile;
      const imageUrl = this.selectedFileUrl;
      this.clearImage();
      
      this.thinking.set(true);
      this.addMessage({ 
        role: 'user', 
        content: '',
        imageSrc: imageUrl
      });
      this.scroll();

      try {
        const res = await this.aiService.imageSearch(file, 10);
        this.addMessage(this.buildImageMessage(res));
      } catch (error: any) {
        const details = error?.error?.detail || error?.error?.title || this.translate.instant('AI.CHATBOT.IMAGE_ERROR');
        this.addMessage({ role: 'assistant', content: details });
      } finally {
        this.thinking.set(false);
        this.scroll();
      }
      return;
    }

    const q = this.input.trim();
    if (!q) return;

    this.input = '';
    this.addMessage({ role: 'user', content: q });
    this.thinking.set(true);
    this.scroll();

    try {
      const res = await this.sendChatWithRetry({ session_id: this.aiService.getSessionId(), message: q });
      this.addMessage(this.buildAssistantMessage(res));
    } catch (error: any) {
      this.addMessage({ role: 'assistant', content: this.formatChatError(error) });
    } finally {
      this.thinking.set(false);
      this.scroll();
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      this.originalImageFile = file;
      this.imageFile = file;
      this.selectedImageName.set(file.name);
      this.activeEditorMode.set('crop');
      this.showCropperModal.set(true);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedFile = event.blob || event.base64 || null;
    this.croppedImageTemp = event.objectUrl || event.base64 || '';
  }

  confirmCrop() {
    if (this.activeEditorMode() === 'draw' && this.canvasElement) {
      const base64 = this.canvasElement.toDataURL('image/jpeg', 0.9);
      this.croppedImageTemp = base64;
    }

    if (!this.croppedImageTemp) return;
    
    const fileToUpload = (this.croppedFile || this.croppedImageTemp) as any;
    if (!fileToUpload) {
      this.toast.error(this.translate.instant('MESSAGES.IMAGE_PROCESS_ERROR') || this.translate.instant('AI.CHATBOT.IMAGE_PROCESS_FALLBACK'));
      return;
    }

    this.selectedFileUrl = this.croppedImageTemp;
    
    if (fileToUpload instanceof Blob) {
      this.selectedImageFile = new File([fileToUpload], this.selectedImageName() || 'image.jpg', { type: fileToUpload.type || 'image/jpeg' });
    } else if (typeof fileToUpload === 'string' && fileToUpload.startsWith('data:image')) {
      const byteString = atob(fileToUpload.split(',')[1]);
      const mimeString = fileToUpload.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      this.selectedImageFile = new File([blob], this.selectedImageName() || 'image.jpg', { type: mimeString });
    } else if (fileToUpload instanceof File) {
      this.selectedImageFile = fileToUpload;
    } else {
      this.selectedImageFile = this.imageFile || null;
    }

    this.showCropperModal.set(false);
    this.imageFile = undefined;
    this.croppedFile = null;
    this.croppedImageTemp = '';
  }

  cancelCrop() {
    this.showCropperModal.set(false);
    this.imageFile = undefined;
    this.croppedImageTemp = '';
    if (!this.selectedFileUrl) {
      this.clearImage();
    }
  }

  clearImage() {
    this.selectedImageFile = null;
    this.originalImageFile = null;
    this.selectedImageName.set('');
    this.selectedFileUrl = '';
    if (this.imageInput()?.nativeElement) {
      this.imageInput()!.nativeElement.value = '';
    }
  }

  initCanvas(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas;
    this.ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.src = this.croppedImageTemp || this.selectedFileUrl;
    img.onload = () => {
      const containerWidth = Math.min(window.innerWidth - 64, 600);
      const containerHeight = 350;
      
      let width = img.width;
      let height = img.height;
      
      const ratio = Math.min(containerWidth / width, containerHeight / height);
      width = width * ratio;
      height = height * ratio;
      
      canvas.width = width;
      canvas.height = height;
      
      if (this.ctx) {
        this.ctx.drawImage(img, 0, 0, width, height);
      }
    };
  }

  startDrawing(event: MouseEvent) {
    this.isDrawingState = true;
    if (!this.ctx || !this.canvasElement) return;
    const rect = this.canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.strokeStyle = this.drawingColor;
    this.ctx.lineWidth = this.drawingLineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  draw(event: MouseEvent) {
    if (!this.isDrawingState || !this.ctx || !this.canvasElement) return;
    const rect = this.canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.isDrawingState = false;
  }

  startDrawingTouch(event: TouchEvent) {
    event.preventDefault();
    this.isDrawingState = true;
    if (!this.ctx || !this.canvasElement || event.touches.length === 0) return;
    const rect = this.canvasElement.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.strokeStyle = this.drawingColor;
    this.ctx.lineWidth = this.drawingLineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  drawTouch(event: TouchEvent) {
    event.preventDefault();
    if (!this.isDrawingState || !this.ctx || !this.canvasElement || event.touches.length === 0) return;
    const rect = this.canvasElement.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;
    
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  changeColor(color: string) {
    this.drawingColor = color;
  }

  changeWidth(width: number) {
    this.drawingLineWidth = width;
  }

  resetToOriginal() {
    if (this.originalImageFile) {
      this.imageFile = this.originalImageFile;
      this.croppedImageTemp = '';
      this.activeEditorMode.set('crop');
    }
  }

  reopenEditor() {
    const fileToLoad = this.selectedImageFile || this.originalImageFile;
    if (fileToLoad) {
      this.imageFile = fileToLoad;
      this.showCropperModal.set(true);
      this.activeEditorMode.set('crop');
    }
  }

  async toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (!this.audioChunks.length) return;
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        await this.sendVoice(audioFile);
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
    } catch {
      this.addMessage({ role: 'assistant', content: this.translate.instant('AI.CHATBOT.MIC_PERMISSION_ERROR') });
    }
  }

  async contactAgent(property: AiProperty) {
    const propertyId = this.getPropertyId(property);
    if (!propertyId) return;

    if (!this.auth.isAuthenticated()) {
      this.toast.info(this.translate.instant('AI.CHATBOT.LOGIN_REQUIRED'));
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/properties/${propertyId}` } });
      return;
    }

    try {
      const response = await this.conversationService.create(propertyId);
      this.toast.success(this.translate.instant('AI.CHATBOT.CONVERSATION_OPENED'));
      this.router.navigate(['/conversations', response.conversationId], { queryParams: { propertyId } });
    } catch {
      this.toast.error(this.translate.instant('AI.CHATBOT.CONVERSATION_FAILED'));
    }
  }

  trackProperty(index: number, property: AiProperty) {
    return this.getPropertyId(property) || index;
  }

  getPropertyId(property: AiProperty): string {
    return String(property['propertyId'] || property['property_id'] || property['id'] || '').trim();
  }

  getPropertyTitle(property: AiProperty): string {
    return String(property['title'] || property['compound'] || property['name'] || property['type'] || this.translate.instant('AI.CHATBOT.PROPERTY_FALLBACK_TITLE'));
  }

  getPropertyLocation(property: AiProperty): string {
    if (property['location']) return String(property['location']);

    const values = [property['district'], property['city'], property['governorate']]
      .filter(value => value !== null && value !== undefined && String(value).trim())
      .map(value => String(value).trim());

    return [...new Set(values)].join(', ') || this.translate.instant('AI.CHATBOT.LOCATION_UNKNOWN');
  }

  getPropertyPrice(property: AiProperty): unknown {
    return property['price'] ?? property['snapshotPrice'] ?? property['amount'] ?? property['cost'];
  }

  getPropertyImage(property: AiProperty): string {
    const image = property['image_url'] || property['imageUrl'] || property['image'] || property['primaryImageUrl'];
    return getPropertyImageUrl(image, this.getPropertyTitle(property));
  }

  getPropertySpecs(property: AiProperty): string {
    const parts = [
      this.formatCount(property['bedrooms'], this.translate.instant('AI.CHATBOT.ROOMS')),
      this.formatCount(property['bathrooms'], this.translate.instant('AI.CHATBOT.BATHROOMS')),
      this.formatArea(property['size_sqm'] ?? property['area']),
    ].filter(Boolean);

    return parts.join(' / ') || String(property['property_type'] || property['type'] || property['listing_type'] || '');
  }

  getSimilarityLabel(property: AiProperty): string {
    const score = property['visual_similarity_score'] ?? property['similarity_score'] ?? property['relevanceScore'];
    const formatted = this.formatScore(score);
    return formatted ? this.translate.instant('AI.CHATBOT.VISUAL_SIMILARITY', { score: formatted }) : '';
  }

  formatPrice(value: unknown): string {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return this.translate.instant('AI.CHATBOT.PRICE_UNAVAILABLE');

    const currency = this.translate.instant('PROPERTY.CURRENCY') || 'EGP';
    return `${amount.toLocaleString()} ${currency}`;
  }

  private stopRecording() {
    this.mediaRecorder?.stop();
    this.isRecording.set(false);
  }

  private async sendVoice(audioFile: File) {
    this.thinking.set(true);
    
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const base64Audio = e.target.result;
      
      this.addMessage({ 
        role: 'user', 
        content: '', 
        voiceUrl: base64Audio
      });
      this.scroll();

      try {
        const res = await this.aiService.voiceChat(this.aiService.getSessionId(), audioFile);
        const transcript = res.transcription ? this.translate.instant('AI.CHATBOT.VOICE_TRANSCRIPT', { text: res.transcription }) : undefined;
        this.addMessage(this.buildAssistantMessage(res, transcript));
      } catch (error: any) {
        const details = this.formatVoiceError(error);
        this.addMessage({ role: 'assistant', content: details });
      } finally {
        this.thinking.set(false);
        this.scroll();
      }
    };
    reader.readAsDataURL(audioFile);
  }

  private async sendImageSearch(imageFile: File) {
    this.thinking.set(true);
    this.addMessage({ role: 'user', content: this.translate.instant('AI.CHATBOT.IMAGE_USER_MESSAGE', { name: imageFile.name }) });
    this.scroll();

    try {
      const res = await this.aiService.imageSearch(imageFile, 10);
      this.addMessage(this.buildImageMessage(res));
    } catch (error: any) {
      const details = error?.error?.detail || error?.error?.title || this.translate.instant('AI.CHATBOT.IMAGE_ERROR');
      this.addMessage({ role: 'assistant', content: details });
    } finally {
      this.clearImage();
      this.thinking.set(false);
      this.scroll();
    }
  }

  private async sendChatWithRetry(request: { session_id: string; message: string }) {
    const maxAttempts = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.aiService.chat(request);
      } catch (error: any) {
        lastError = error;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 700));
        }
      }
    }

    throw lastError;
  }

  private buildAssistantMessage(res: Partial<AiChatResponse>, prefix?: string): ChatMessage {
    const parts: string[] = [];
    if (prefix) parts.push(prefix);
    if (res.message) parts.push(res.message);
    if (res.question) parts.push(res.question);

    return {
      role: 'assistant',
      content: parts.filter(Boolean).join('\n\n').trim() || this.translate.instant('AI.CHATBOT.NO_ANSWER'),
      properties: this.normalizeProperties(res.properties),
      propertyCount: Number(res.properties_count ?? res.properties?.length ?? 0),
    };
  }

  private buildImageMessage(res: AiImageSearchResponse): ChatMessage {
    return {
      role: 'assistant',
      content: res.message || this.translate.instant('AI.CHATBOT.NO_ANSWER'),
      properties: this.normalizeProperties(res.properties),
      propertyCount: Number(res.count || res.properties?.length || 0),
    };
  }

  private normalizeProperties(properties?: AiProperty[]): AiProperty[] {
    if (!Array.isArray(properties)) return [];
    return properties.filter(property => this.getPropertyId(property)).slice(0, 8);
  }

  private addMessage(message: ChatMessage) {
    this.messages.update(messages => [...messages, message]);
    this.saveHistory();
  }

  private loadHistory(): ChatMessage[] {
    try {
      const saved = localStorage.getItem('baytology_chat_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load chat history:', e);
      return [];
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem('baytology_chat_history', JSON.stringify(this.messages()));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }

  private formatChatError(error: any): string {
    const details = error?.error?.detail || error?.error?.title || error?.message;
    if (details) {
      return `${this.translate.instant('AI.CHATBOT.ERROR_GENERIC')}\n${details}`;
    }

    return this.translate.instant('AI.CHATBOT.ERROR_GENERIC');
  }

  private formatVoiceError(error: any): string {
    const details = error?.error?.detail || error?.error?.title || error?.message;
    const text = typeof details === 'string' ? details : JSON.stringify(details ?? '');
    if (text.includes('large-v3') || text.includes('still being prepared') || text.includes('still downloading')) {
      return this.translate.instant('AI.CHATBOT.VOICE_PREPARING');
    }

    return text || this.translate.instant('AI.CHATBOT.VOICE_ERROR');
  }

  private formatCount(value: unknown, label: string): string {
    const count = Number(value);
    if (!Number.isFinite(count) || count <= 0) return '';
    return `${count} ${label}`;
  }

  private formatArea(value: unknown): string {
    const area = Number(value);
    if (!Number.isFinite(area) || area <= 0) return '';
    return `${area.toLocaleString()} m²`;
  }

  private formatScore(value: unknown): string {
    const score = Number(value);
    if (!Number.isFinite(score) || score <= 0) return '';

    const normalized = score <= 1 ? score * 100 : score;
    return `${normalized.toFixed(0)}%`;
  }

  private scroll() {
    setTimeout(() => {
      const el = this.chatContainer()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
