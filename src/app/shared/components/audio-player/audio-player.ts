import { Component, input, signal, ElementRef, viewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../core/services/toast.service';
import { AiService } from '../../../features/ai/services/ai.service';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <!-- Set dir="ltr" to ensure media playback timeline always flows standardly from left to right -->
    <div dir="ltr" class="w-full max-w-[325px] py-3 px-4 rounded-2xl bg-gradient-to-br from-teal-50/70 to-white border border-[#0a8f96]/20 shadow-[0_4px_20px_rgba(10,143,150,0.03)] flex flex-col gap-2.5 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_25px_rgba(10,143,150,0.06)] hover:border-[#0a8f96]/30">
      
      <!-- Ambient light effect -->
      <div class="absolute -right-8 -top-8 w-16 h-16 bg-[#0a8f96]/5 rounded-full blur-xl pointer-events-none"></div>
      
      <div class="flex items-center gap-3">
        <!-- Play/Pause premium round button -->
        <button (click)="togglePlay()" 
                class="w-10 h-10 rounded-xl bg-[#0a8f96] hover:bg-[#076b70] text-white flex items-center justify-center shadow-md shadow-[#0a8f96]/15 transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer shrink-0">
          @if (isPlaying()) {
            <!-- Pause Icon -->
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          } @else {
            <!-- Play Icon (shifted right by 1px for visual balance) -->
            <svg class="w-4 h-4 fill-current translate-x-[1px]" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          }
        </button>

        <!-- Player controls and seek progress -->
        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <!-- Voice Msg Info + Time -->
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-[#0a8f96] uppercase tracking-wide">
              {{ 'MESSAGES.VOICE_MESSAGE' | translate }}
            </span>
            <span class="text-[9px] font-black text-slate-400 tabular-nums">
              {{ formatTime(currentTime()) }} / {{ formatTime(duration()) }}
            </span>
          </div>

          <!-- Seek range slider -->
          <div class="relative w-full flex items-center">
            <input type="range" 
                   #seekBar
                   [value]="currentTime()" 
                   [max]="duration() || 100" 
                   (input)="onSeek($event)"
                   class="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer outline-none focus:outline-none transition-all accent-[#0a8f96] hover:bg-slate-200"
                   style="background: linear-gradient(to right, #0a8f96 0%, #0a8f96 var(--seek-percent, 0%), #f1f5f9 var(--seek-percent, 0%), #f1f5f9 100%)">
          </div>
        </div>
      </div>

      <!-- Transcript & AI Actions (RTL layout for buttons) -->
      <div dir="rtl" class="pt-2 border-t border-slate-100/60 flex flex-col gap-2">
        <button (click)="transcribe()" 
                class="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-teal-50/50 to-[#0a8f96]/5 border border-[#0a8f96]/15 hover:border-[#0a8f96]/25 text-[#0a8f96] text-[10px] font-black tracking-wide flex items-center justify-center gap-1.5 transition-all hover:bg-[#0a8f96]/10 active:scale-99 cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l3.536-1.42 2.73-2.73m-2.58-2.324l6.02-6.02a2.83 2.83 0 10-4-4L8.7 10.51a2.83 2.83 0 00-.819 1.4l-1.1 4.4 4.01-1.002z"/>
          </svg>
          <span>{{ showTranscription() ? 'إخفاء النص المكتوب' : 'تحويل إلى نص بالذكاء الاصطناعي ✨' }}</span>
        </button>

        <!-- Dynamic transcription panel -->
        @if (showTranscription()) {
          <div class="p-2.5 rounded-xl bg-white/90 border border-slate-100 shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.01)] relative animate-in fade-in slide-in-from-top-1.5 duration-200">
            @if (isTranscribing()) {
              <!-- AI Waveform Pulsing state -->
              <div class="flex flex-col items-center justify-center py-2 gap-2">
                <div class="flex items-center gap-1">
                  <span class="w-1 h-3.5 bg-[#0a8f96] rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span class="w-1 h-5 bg-[#0a8f96] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-1 h-7 bg-[#0a8f96] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span class="w-1 h-4 bg-[#0a8f96] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span class="w-1 h-2.5 bg-[#0a8f96] rounded-full animate-bounce [animation-delay:0.5s]"></span>
                </div>
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                  جاري تحليل الصوت وتوليد النص بالذكاء الاصطناعي...
                </span>
              </div>
            } @else {
              <!-- Transcript Text + Copy button -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black text-[#0a8f96] uppercase tracking-wider">
                    نص التفريغ الصوتي (AI)
                  </span>
                  <button (click)="copyTranscript()" 
                          class="text-slate-400 hover:text-[#0a8f96] transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"/>
                    </svg>
                  </button>
                </div>
                <p class="text-xs font-semibold text-slate-700 leading-relaxed text-right dir-rtl" dir="rtl">
                  {{ transcriptText() }}
                </p>
              </div>
            }
          </div>
        }
      </div>

      <!-- Native Audio tag under the hood -->
      <audio #audioElement 
             [src]="audioUrl()" 
             (timeupdate)="onTimeUpdate()" 
             (loadedmetadata)="onLoadedMetadata()"
             (ended)="onEnded()"
             class="hidden"></audio>
    </div>
  `,
  styles: [`
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0a8f96;
      cursor: pointer;
      transition: transform 0.15s ease-in-out;
      box-shadow: 0 0 4px rgba(10, 143, 150, 0.4);
    }
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.35);
    }
    input[type="range"]::-moz-range-thumb {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0a8f96;
      cursor: pointer;
      border: none;
      transition: transform 0.15s ease-in-out;
      box-shadow: 0 0 4px rgba(10, 143, 150, 0.4);
    }
    input[type="range"]::-moz-range-thumb:hover {
      transform: scale(1.35);
    }
  `]
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  audioUrl = input.required<string>();
  transcript = input<string>(''); // Dynamic Speech-to-Text transcript from user's live speech
  
  audioElement = viewChild<ElementRef<HTMLAudioElement>>('audioElement');
  seekBar = viewChild<ElementRef<HTMLInputElement>>('seekBar');
  
  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  
  showTranscription = signal(false);
  isTranscribing = signal(false);
  hasTranscript = signal(false);
  transcriptText = signal('');
  
  private toast = inject(ToastService);
  private aiService = inject(AiService);

  ngOnInit() {
    // Initialize component
  }

  togglePlay() {
    const audio = this.audioElement()?.nativeElement;
    if (!audio) return;
    
    if (this.isPlaying()) {
      audio.pause();
      this.isPlaying.set(false);
    } else {
      audio.play().then(() => {
        this.isPlaying.set(true);
      }).catch(err => {
        console.error('Audio playback error:', err);
        this.toast.error('تعذر تشغيل الصوت');
      });
    }
  }

  onTimeUpdate() {
    const audio = this.audioElement()?.nativeElement;
    if (!audio) return;
    
    this.currentTime.set(audio.currentTime);
    this.updateSeekBarPercent();
  }

  onLoadedMetadata() {
    const audio = this.audioElement()?.nativeElement;
    if (!audio) return;
    
    this.duration.set(audio.duration);
    this.updateSeekBarPercent();
  }

  onEnded() {
    this.isPlaying.set(false);
    this.currentTime.set(0);
    this.updateSeekBarPercent();
  }

  onSeek(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    const value = parseFloat(inputEl.value);
    
    const audio = this.audioElement()?.nativeElement;
    if (audio) {
      audio.currentTime = value;
      this.currentTime.set(value);
      this.updateSeekBarPercent();
    }
  }

  updateSeekBarPercent() {
    const seek = this.seekBar()?.nativeElement;
    if (!seek) return;
    
    const percent = (this.currentTime() / (this.duration() || 1)) * 100;
    seek.style.setProperty('--seek-percent', `${percent}%`);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async transcribe() {
    if (this.showTranscription()) {
      this.showTranscription.set(false);
      return;
    }

    this.showTranscription.set(true);
    
    if (this.hasTranscript()) return;

    this.isTranscribing.set(true);

    try {
      // 1. If we already have a transcript passed from the message metadata, use it immediately!
      const customTranscript = this.transcript();
      if (customTranscript) {
        this.transcriptText.set(customTranscript);
        this.hasTranscript.set(true);
        return;
      }

      // 2. Otherwise, fetch the actual audio file from Cloudinary and transcribe it dynamically using the real backend AI model!
      const response = await fetch(this.audioUrl());
      const blob = await response.blob();
      const audioFile = new File([blob], 'audio.webm', { type: blob.type || 'audio/webm' });
      
      const aiResponse = await this.aiService.voiceChat(this.aiService.getSessionId(), audioFile);
      if (aiResponse && aiResponse.transcription) {
        this.transcriptText.set(aiResponse.transcription.trim());
        this.hasTranscript.set(true);
        this.toast.success('تم التفريغ الصوتي بالذكاء الاصطناعي بنجاح ✨');
      } else {
        throw new Error('No transcription returned');
      }
    } catch (err) {
      console.error('AI Speech-to-Text model transcription failed:', err);
      this.toast.error('تعذر الاتصال بخادم الذكاء الاصطناعي للتفريغ');
      this.showTranscription.set(false);
    } finally {
      this.isTranscribing.set(false);
    }
  }

  copyTranscript() {
    if (!this.transcriptText()) return;
    
    navigator.clipboard.writeText(this.transcriptText()).then(() => {
      this.toast.success('تم نسخ النص إلى الحافظة');
    }).catch(() => {
      this.toast.error('فشل نسخ النص');
    });
  }

  ngOnDestroy() {
    const audio = this.audioElement()?.nativeElement;
    if (audio) {
      audio.pause();
    }
  }
}
