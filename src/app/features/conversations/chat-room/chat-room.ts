import { Component, signal, OnInit, OnDestroy, effect, ElementRef, viewChild, computed, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConversationService } from '../services/conversation.service';
import { ChatSignalRService } from '../../../core/services/chat-signalr.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { Message, Conversation, PropertyListItem } from '../../../core/models';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { PropertyService } from '../../properties/services/property.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { resolveBackendAssetUrl, getPropertyImageUrl, buildPropertyPlaceholder, compressImage } from '../../../core/utils/media';
import { LocalImageService } from '../../../core/services/local-image.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { AudioPlayerComponent } from '../../../shared/components/audio-player/audio-player';
import { AiService } from '../../ai/services/ai.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [FormsModule, RelativeTimePipe, LoadingSpinnerComponent, CurrencyEgpPipe, RouterLink, TranslateModule, ImageCropperComponent, AudioPlayerComponent],
  templateUrl: './chat-room.html',
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  public chatSignalR = inject(ChatSignalRService);
  private conversationService = inject(ConversationService);
  private propertyService = inject(PropertyService);
  private localImageService = inject(LocalImageService);
  private router = inject(Router);
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private cloudinaryService = inject(CloudinaryService);
  private destroyRef = inject(DestroyRef);
  private aiService = inject(AiService);

  croppedFile: File | Blob | string | null = null;

  conversationId = '';
  loading = signal(false);
  messages = signal<Message[]>([]);
  conversations = signal<Conversation[]>([]);
  activeConversation = signal<Conversation | null>(null);
  
  // Premium header actions and modals
  showMsgSearch = signal(false);
  msgSearchQuery = signal('');
  showContactModal = signal(false);
  isMuted = signal(false);
  mutedConversations = signal<string[]>([]);

  filteredMessages = computed(() => {
    const query = this.msgSearchQuery().toLowerCase().trim();
    const msgs = this.messages();
    if (!query) return msgs;
    return msgs.filter(m => {
      const contentMatch = m.content.toLowerCase().includes(query);
      const transcript = this.getTranscriptText(m.content).toLowerCase();
      const transcriptMatch = transcript.includes(query);
      return contentMatch || transcriptMatch;
    });
  });
  
  searchQuery = '';
  filterType = signal<'all' | 'unread' | 'clients'>('all');
  showProfileMenu = signal(false);
  showChatMenu = signal(false);
  showEmojiPicker = signal(false);
  activeEmojiCategory = signal<'all' | 'faces' | 'home' | 'nature' | 'objects'>('all');
  
  emojiCategories: { id: 'all' | 'faces' | 'home' | 'nature' | 'objects', name: string, icon: string }[] = [
    { id: 'all', name: 'الكل', icon: '✨' },
    { id: 'faces', name: 'تعبيرات', icon: '😊' },
    { id: 'home', name: 'عقارات', icon: '🏠' },
    { id: 'nature', name: 'طبيعة', icon: '🌴' },
    { id: 'objects', name: 'رموز', icon: '🔑' }
  ];

  categorizedEmojis = [
    // faces
    { char: '😊', category: 'faces' },
    { char: '😂', category: 'faces' },
    { char: '🤣', category: 'faces' },
    { char: '❤️', category: 'faces' },
    { char: '😍', category: 'faces' },
    { char: '🥰', category: 'faces' },
    { char: '😘', category: 'faces' },
    { char: '😜', category: 'faces' },
    { char: '🤪', category: 'faces' },
    { char: '😎', category: 'faces' },
    { char: '🤔', category: 'faces' },
    { char: '🤨', category: 'faces' },
    { char: '😐', category: 'faces' },
    { char: '😑', category: 'faces' },
    { char: '😒', category: 'faces' },
    { char: '🙄', category: 'faces' },
    { char: '😬', category: 'faces' },
    { char: '😌', category: 'faces' },
    { char: '😔', category: 'faces' },
    { char: '😪', category: 'faces' },
    { char: '😴', category: 'faces' },
    { char: '🥳', category: 'faces' },
    { char: '😭', category: 'faces' },
    { char: '😢', category: 'faces' },
    { char: '😱', category: 'faces' },
    { char: '😤', category: 'faces' },
    { char: '😡', category: 'faces' },
    { char: '🤬', category: 'faces' },
    { char: '👍', category: 'faces' },
    { char: '👎', category: 'faces' },
    { char: '👌', category: 'faces' },
    { char: '✌️', category: 'faces' },
    { char: '🤞', category: 'faces' },
    { char: '👏', category: 'faces' },
    { char: '🙌', category: 'faces' },
    { char: '🤝', category: 'faces' },
    { char: '🙏', category: 'faces' },
    { char: '💪', category: 'faces' },
    { char: '💖', category: 'faces' },
    { char: '🔥', category: 'faces' },
    { char: '✨', category: 'faces' },
    { char: '🎉', category: 'faces' },

    // home
    { char: '🏠', category: 'home' },
    { char: '🏡', category: 'home' },
    { char: '🏢', category: 'home' },
    { char: '🏣', category: 'home' },
    { char: '🏤', category: 'home' },
    { char: '🏬', category: 'home' },
    { char: '🏨', category: 'home' },
    { char: '🏥', category: 'home' },
    { char: '🏦', category: 'home' },
    { char: '🏪', category: 'home' },
    { char: '🏫', category: 'home' },
    { char: '🏭', category: 'home' },
    { char: '🏰', category: 'home' },
    { char: '🏗️', category: 'home' },
    { char: '🧱', category: 'home' },
    { char: '🏘️', category: 'home' },
    { char: '🛖', category: 'home' },
    { char: '⛲', category: 'home' },
    { char: '⛺', category: 'home' },
    { char: '🪙', category: 'home' },
    { char: '💰', category: 'home' },
    { char: '💳', category: 'home' },
    { char: '💵', category: 'home' },
    { char: '🔑', category: 'home' },
    { char: '🗝️', category: 'home' },
    { char: '🚪', category: 'home' },
    { char: '🛋️', category: 'home' },
    { char: '🛌', category: 'home' },
    { char: '🛀', category: 'home' },
    { char: '🚿', category: 'home' },
    { char: '🧹', category: 'home' },
    { char: '🪟', category: 'home' },
    { char: '🛎️', category: 'home' },

    // nature
    { char: '🌴', category: 'nature' },
    { char: '🌵', category: 'nature' },
    { char: '🌲', category: 'nature' },
    { char: '🌳', category: 'nature' },
    { char: '🍀', category: 'nature' },
    { char: '🍁', category: 'nature' },
    { char: '🍂', category: 'nature' },
    { char: '🍃', category: 'nature' },
    { char: '🌺', category: 'nature' },
    { char: '🌻', category: 'nature' },
    { char: '🌼', category: 'nature' },
    { char: '🌸', category: 'nature' },
    { char: '🍄', category: 'nature' },
    { char: '🪐', category: 'nature' },
    { char: '☀️', category: 'nature' },
    { char: '☁️', category: 'nature' },
    { char: '🌧️', category: 'nature' },
    { char: '⚡', category: 'nature' },
    { char: '❄️', category: 'nature' },
    { char: '💧', category: 'nature' },
    { char: '🌊', category: 'nature' },
    { char: '🌍', category: 'nature' },
    { char: '🚗', category: 'nature' },
    { char: '🚲', category: 'nature' },
    { char: '✈️', category: 'nature' },
    { char: '🚀', category: 'nature' },

    // objects
    { char: '📞', category: 'objects' },
    { char: '✉️', category: 'objects' },
    { char: '📅', category: 'objects' },
    { char: '🗓️', category: 'objects' },
    { char: '📈', category: 'objects' },
    { char: '📉', category: 'objects' },
    { char: '📊', category: 'objects' },
    { char: '📋', category: 'objects' },
    { char: '📌', category: 'objects' },
    { char: '📍', category: 'objects' },
    { char: '🗺️', category: 'objects' },
    { char: '✏️', category: 'objects' },
    { char: '✒️', category: 'objects' },
    { char: '📝', category: 'objects' },
    { char: '📁', category: 'objects' },
    { char: '💼', category: 'objects' },
    { char: '💻', category: 'objects' },
    { char: '📱', category: 'objects' },
    { char: '🔒', category: 'objects' },
    { char: '🔓', category: 'objects' },
    { char: '🔍', category: 'objects' },
    { char: '💡', category: 'objects' },
    { char: '🔦', category: 'objects' },
    { char: '⚙️', category: 'objects' },
    { char: '🔧', category: 'objects' },
    { char: '🔨', category: 'objects' },
    { char: '🛍️', category: 'objects' },
    { char: '🎁', category: 'objects' },
    { char: '🎈', category: 'objects' },
    { char: '☕', category: 'objects' },
    { char: '🍽️', category: 'objects' },
    { char: '🍕', category: 'objects' },
    { char: '🍔', category: 'objects' },
    { char: '🍿', category: 'objects' },
    { char: '🥤', category: 'objects' },
    { char: '⭐', category: 'objects' },
    { char: '🌟', category: 'objects' },
    { char: '✅', category: 'objects' },
    { char: '❌', category: 'objects' },
    { char: '❓', category: 'objects' },
    { char: '🔔', category: 'objects' },
    { char: '🔕', category: 'objects' }
  ];

  filteredEmojis = computed(() => {
    const category = this.activeEmojiCategory();
    if (category === 'all') {
      return this.categorizedEmojis.map(e => e.char);
    }
    return this.categorizedEmojis.filter(e => e.category === category).map(e => e.char);
  });
  showCropperModal = signal(false);
  imageFile: File | undefined = undefined;
  croppedImageTemp: string = '';
  localImagesMap = signal<Map<string, string>>(new Map());
  showSoundSettings = signal(false);
  soundEnabled = signal(true);
  soundType = signal<'premium' | 'pop' | 'classic'>('premium');
  
  fileInput = viewChild<ElementRef>('fileInput');

  isRecording = signal(false);
  recordingDuration = signal(0);
  isUploadingVoice = signal(false);
  private recordingTimer: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private speechRecognition: any = null;
  private currentTranscription = '';

  getTranscriptText(content: string): string {
    if (content && content.startsWith('[TRANSCRIPT:')) {
      const match = content.match(/\[TRANSCRIPT:(.*?)\]/);
      return match ? match[1].trim() : '';
    }
    return '';
  }


  filteredConversations = computed(() => {
    let list = this.conversations();
    
    // 1. Filter by Type
    if (this.filterType() === 'unread') {
      list = list.filter(c => (c.unreadCount ?? 0) > 0);
    } else if (this.filterType() === 'clients') {
      list = list.filter(c => c.agentUserId === this.auth.userId());
    }
    
    // 2. Filter by Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => 
        (c.agentDisplayName?.toLowerCase().includes(q) || 
         c.buyerDisplayName?.toLowerCase().includes(q) ||
         c.propertyTitle?.toLowerCase().includes(q) ||
         c.lastMessageContent?.toLowerCase().includes(q))
      );
    }
    return list;
  });

  unreadMessagesCount = computed(() => {
    const list = this.conversations();
    const count = list.filter(c => (c.unreadCount ?? 0) > 0).length;
    return count || 1;
  });

  getOtherName(c: Conversation): string {
    if (c.buyerUserId === this.auth.userId()) {
      return c.agentDisplayName || 'وكيل عقاري';
    }
    return c.buyerDisplayName || 'مشتري';
  }

  getOtherInitials(c: Conversation): string {
    const name = this.getOtherName(c);
    if (!name) return 'B';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  newMessage = '';
  recipientName = signal('');
  agentProperties = signal<PropertyListItem[]>([]);
  selectedProperties = signal<PropertyListItem[]>([]);
  showPropertyPreview = signal(false);
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor() {
    effect(() => {
      const msg = this.chatSignalR.incomingMessage();
      if (msg) {
        // Read unread counts from localStorage
        const unreadCountsRaw = localStorage.getItem('baytology_unread_counts') || '{}';
        const unreadCounts = JSON.parse(unreadCountsRaw);

        const isIncoming = msg.senderId !== this.auth.userId();
        if (isIncoming) {
          this.playNotificationSound();
        }

        // 1. Update the conversations list sidebar items reactively
        this.conversations.update(list => {
          return list.map(c => {
            if (c.id === msg.conversationId) {
              const isCurrentActive = c.id === this.conversationId;
              
              let newUnreadCount = 0;
              if (isIncoming && !isCurrentActive) {
                newUnreadCount = (unreadCounts[c.id] || 0) + 1;
                unreadCounts[c.id] = newUnreadCount;
              } else {
                unreadCounts[c.id] = 0;
              }
                
              return {
                ...c,
                lastMessageContent: msg.content,
                lastMessageAt: msg.sentAt,
                unreadCount: newUnreadCount
              };
            }
            return c;
          });
        });

        // Save updated unread counts to localStorage
        localStorage.setItem('baytology_unread_counts', JSON.stringify(unreadCounts));

        // 2. Append the message if it belongs to the active conversation room
        if (msg.conversationId === this.conversationId) {
          this.messages.update(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => this.scrollToBottom(), 50);
        }
      }
    });
  }

  async ngOnInit() {
    const initialMutedListRaw = localStorage.getItem('baytology_muted_conversations') || '[]';
    this.mutedConversations.set(JSON.parse(initialMutedListRaw));

    this.soundEnabled.set(localStorage.getItem('baytology_sound_enabled') !== 'false');
    this.soundType.set((localStorage.getItem('baytology_sound_type') as any) || 'premium');

    // Ensure we are connected to the Chat SignalR hub immediately when landing on Messages page!
    this.chatSignalR.connect().catch(err => console.error('Failed to connect to Chat SignalR:', err));

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async p => {
      this.conversationId = p['id'];
      if (this.conversationId) {
        this.loading.set(true);
        
        // Reset states
        this.showMsgSearch.set(false);
        this.msgSearchQuery.set('');
        this.showContactModal.set(false);
        
        // Load mute state
        const mutedListRaw = localStorage.getItem('baytology_muted_conversations') || '[]';
        const mutedList: string[] = JSON.parse(mutedListRaw);
        this.isMuted.set(mutedList.includes(this.conversationId));
        this.mutedConversations.set(mutedList);

        // Reset unread count locally and in localStorage when active chat is loaded
        const unreadCountsRaw = localStorage.getItem('baytology_unread_counts') || '{}';
        const unreadCounts = JSON.parse(unreadCountsRaw);
        unreadCounts[this.conversationId] = 0;
        localStorage.setItem('baytology_unread_counts', JSON.stringify(unreadCounts));

        // Save last viewed timestamp to synthesize unread status for historical messages
        const lastViewedRaw = localStorage.getItem('baytology_last_viewed') || '{}';
        const lastViewed = JSON.parse(lastViewedRaw);
        lastViewed[this.conversationId] = new Date().toISOString();
        localStorage.setItem('baytology_last_viewed', JSON.stringify(lastViewed));

        this.conversations.update(list => 
          list.map(c => c.id === this.conversationId ? { ...c, unreadCount: 0 } : c)
        );
        
        await this.loadData();
        this.loading.set(false);
      }
    });

    // Check for propertyId in query params to auto-attach
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async q => {
      const propId = q['propertyId'];
      if (propId) {
        try {
          const p = await this.propertyService.getById(propId);
          const listItem: PropertyListItem = {
            id: p.id,
            agentUserId: p.agentUserId,
            title: p.title,
            price: p.price,
            area: p.area,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            propertyType: p.propertyType,
            listingType: p.listingType,
            status: p.status,
            isFeatured: p.isFeatured,
            primaryImageUrl: p.images?.[0]?.url
          };
          
          this.selectedProperties.set([listItem]);
        } catch (err) {
          console.error('Failed to auto-attach property:', err);
        }
      }
    });

    this.loadConversations();
  }

  private mapConversationsWithUnread(list: Conversation[]): Conversation[] {
    const unreadCountsRaw = localStorage.getItem('baytology_unread_counts') || '{}';
    const unreadCounts = JSON.parse(unreadCountsRaw);

    const lastViewedRaw = localStorage.getItem('baytology_last_viewed') || '{}';
    const lastViewed = JSON.parse(lastViewedRaw);

    let changed = false;

    const mapped = list.map(c => {
      let count = unreadCounts[c.id] || 0;

      // Synthesize unread status from lastViewed timestamp if unreadCount is 0 in localStorage
      if (c.lastMessageAt && c.id !== this.conversationId) {
        const lastViewTime = lastViewed[c.id];
        if (lastViewTime) {
          const lastMsgMs = new Date(c.lastMessageAt).getTime();
          const viewMs = new Date(lastViewTime).getTime();
          // If the last message is newer than the last viewed time by more than 2 seconds
          if (lastMsgMs > viewMs + 2000) {
            if (count === 0) {
              count = 1;
              unreadCounts[c.id] = 1;
              changed = true;
            }
          }
        } else if (c.lastMessageContent) {
          // If never viewed before and has content, initialize as 1 unread message
          if (count === 0) {
            count = 1;
            unreadCounts[c.id] = 1;
            changed = true;
          }
        }
      }

      return {
        ...c,
        unreadCount: count
      };
    });

    if (changed) {
      localStorage.setItem('baytology_unread_counts', JSON.stringify(unreadCounts));
    }

    return mapped;
  }

  private async loadConversations() {
    try {
      const list = await this.conversationService.getAll();
      const mapped = this.mapConversationsWithUnread(list);
      this.conversations.set(mapped);
    } catch {}
  }

  private async loadData() {
    try {
      const [msgs, convs] = await Promise.all([
        this.conversationService.getMessages(this.conversationId),
        this.conversationService.getAll()
      ]);
      
      this.messages.set(msgs);
      const mappedConvs = this.mapConversationsWithUnread(convs);
      this.conversations.set(mappedConvs);
      
      // Mark all unread messages as read
      // [BACKEND_MISSING]: The backend doesn't support unread status for individual messages yet.
      /* msgs.filter(m => !m.isRead && m.senderId !== this.auth.userId()).forEach(m => {
        this.conversationService.markRead(m.id).catch(() => {});
      }); */

      const current = convs.find(c => c.id === this.conversationId);
      if (current) {
        this.activeConversation.set(current);
        this.recipientName.set(this.auth.userId() === current.buyerUserId 
          ? (current.agentDisplayName || 'MESSAGES.AGENT') 
          : (current.buyerDisplayName || 'MESSAGES.BUYER'));
        
        this.propertyService.getAll({ agentUserId: current.agentUserId, pageSize: 50 }).then(res => {
          this.agentProperties.set(res.items);
          
          // Local storage fetching removed as per user request
        });
      }
      
      await this.chatSignalR.connect();
      await this.chatSignalR.joinConversation(this.conversationId);
      setTimeout(() => this.scrollToBottom(), 50);
    } catch {}
  }

  togglePropertySelection(p: PropertyListItem) {
    this.selectedProperties.update(prev => {
      const exists = prev.find(item => item.id === p.id);
      if (exists) return prev.filter(item => item.id !== p.id);
      return [...prev, p];
    });
  }

  isPropertySelected(id: string): boolean {
    return !!this.selectedProperties().find(p => p.id === id);
  }

  removeSelectedProperty(id: string) {
    this.selectedProperties.update(prev => prev.filter(p => p.id !== id));
  }

  async send() {
    // If not connected, try to reconnect first
    if (this.chatSignalR.connectionState() === 'Disconnected') {
      try {
        await this.chatSignalR.connect();
        await this.chatSignalR.joinConversation(this.conversationId);
      } catch (e) {
        this.toast.error('MESSAGES.CONN_ERROR');
        return;
      }
    }

    const text = this.newMessage.trim();
    const props = this.selectedProperties();
    if (!text && props.length === 0 && !this.selectedFileUrl) return;

    let content = text;
    if (props.length > 0) {
      const propsData = props.map(p => {
        const url = `${window.location.origin}/properties/${p.id}`;
        return `${p.id}|${p.title}|${p.price.toLocaleString()} EGP|${p.primaryImageUrl || ''}|${url}`;
      }).join(';');
      content = `[PROPS:${propsData}]${text}`;
    }

    try {
      await this.chatSignalR.sendMessage(this.conversationId, content, this.selectedFileUrl);
      this.newMessage = '';
      this.selectedProperties.set([]);
      this.selectedFileUrl = '';
      this.showPropertyPreview.set(false);
      this.showEmojiPicker.set(false);
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      this.toast.error('MESSAGES.ERROR_SEND');
    }
  }

  selectedFileUrl = '';
  async onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image to show the cropper
    if (file.type.startsWith('image/')) {
      this.imageFile = file;
      this.showCropperModal.set(true);
      return;
    }

    // For non-image files, read directly
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      this.selectedFileUrl = e.target.result;
      this.toast.success('MESSAGES.ATTACH_SUCCESS');
    };
    reader.readAsDataURL(file);
  }


  imageCropped(event: ImageCroppedEvent) {
    this.croppedFile = event.blob || event.base64 || null;
    this.croppedImageTemp = event.objectUrl || event.base64 || '';
  }

  async confirmCrop() {
    if (!this.croppedImageTemp) return;
    
    try {
      this.loading.set(true);
      const fileToUpload = this.croppedFile || this.croppedImageTemp;
      
      if (!fileToUpload) {
        this.toast.error('MESSAGES.IMAGE_PROCESS_ERROR');
        this.loading.set(false);
        return;
      }

      // Upload to Cloudinary
      this.cloudinaryService.uploadImage(fileToUpload as any).subscribe({
        next: (url) => {
          this.selectedFileUrl = url;
          this.toast.success('MESSAGES.UPLOAD_SUCCESS');
          this.loading.set(false);
          this.showCropperModal.set(false);
          this.imageFile = undefined;
          this.croppedFile = null;
          this.croppedImageTemp = '';
          this.clearFileInput();
        },
        error: (err) => {
          this.toast.error('MESSAGES.UPLOAD_ERROR' + err.message);
          this.loading.set(false);
        }
      });
    } catch (err) {
      this.loading.set(false);
    }
  }

  cancelCrop() {
    this.showCropperModal.set(false);
    this.imageFile = undefined;
    this.croppedImageTemp = '';
    this.clearFileInput();
  }

  private clearFileInput() {
    if (this.fileInput()?.nativeElement) {
      this.fileInput()!.nativeElement.value = '';
    }
  }

  isPropertyMessage(content: string): boolean {
    return content.startsWith('[PROPS:') || content.startsWith('PROP:');
  }

  getMessageText(content: string): string {
    if (content.startsWith('[PROPS:')) {
      const match = content.match(/\[PROPS:(.*?)\](.*)/s);
      return match ? match[2].trim() : content;
    }
    if (content.startsWith('PROP:')) {
      const parts = content.split('||');
      const textPart = parts[0].replace(/^PROP:[a-f0-9-]+\|?/, '');
      return textPart.includes('|') ? '' : textPart;
    }
    return content;
  }

  getPropertiesData(content: string): any[] {
    if (content.startsWith('[PROPS:')) {
      const match = content.match(/\[PROPS:(.*?)\]/);
      if (!match) return [];
      const propsRaw = match[1].split(';');
      return propsRaw.map(p => {
        const parts = p.split('|');
        const id = parts[0];
        const title = parts[1];
        const price = parts[2];
        const rawImg = parts[3];
        const link = parts[4];
        
        return { 
          id, 
          title, 
          price, 
          imageUrl: rawImg, // We'll handle resolution in the template via a helper or onImageError
          link 
        };
      });
    }
    if (content.startsWith('PROP:')) {
      const parts = content.split('||');
      return parts.slice(1).map(p => {
        const [id, title, price, imageUrl] = p.split('|');
        return { 
          id, 
          title, 
          price, 
          imageUrl
        };
      });
    }
    return [];
  }

  getPropertyImage(p: any): string {
    const img = p.imageUrl || p.primaryImageUrl;
    if (img) return getPropertyImageUrl(img, p.title);
    return buildPropertyPlaceholder(p.title);
  }

  onImageError(event: any, propertyId: string) {
    const target = event.target as HTMLImageElement;
    // Try resolving relative URLs
    const currentSrc = target.src;
    if (currentSrc && !currentSrc.startsWith('data:') && !currentSrc.startsWith('http')) {
      const resolved = resolveBackendAssetUrl(currentSrc);
      if (resolved && resolved !== currentSrc) {
        target.src = resolved;
        return;
      }
    }
    // Fallback to placeholder or hide
    target.style.display = 'none';
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker.set(false);
  }

  togglePropertyPreview() {
    this.showPropertyPreview.update(v => !v);
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  onCalendarClick() {
    const conv = this.activeConversation();
    if (!conv) {
      this.toast.info('الرجاء اختيار محادثة أولاً');
      return;
    }

    let propId = conv.propertyId;

    if (!propId) {
      const propMsg = this.messages().find(m => this.isPropertyMessage(m.content));
      if (propMsg) {
        const propsData = this.getPropertiesData(propMsg.content);
        if (propsData && propsData.length > 0) {
          propId = propsData[0].id;
        }
      }
    }

    if (this.auth.isBuyer()) {
      if (propId) {
        this.router.navigate(['/bookings/new'], { queryParams: { propertyId: propId } });
      } else {
        this.router.navigate(['/bookings/new']);
      }
    } else if (this.auth.isAgent()) {
      this.router.navigate(['/bookings']);
    } else {
      this.toast.info('ميزة الحجوزات متاحة للمشترين والوكلاء فقط');
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (this.audioChunks.length === 0) return;

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        await this.uploadAndSendVoice(audioFile);
      };

      // Set up live browser speech recognition
      this.currentTranscription = '';
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = 'ar-EG'; // Set speech dialect to Egyptian Arabic

        this.speechRecognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              this.currentTranscription += event.results[i][0].transcript + ' ';
            }
          }
        };

        this.speechRecognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        this.speechRecognition.start();
      }

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingDuration.set(0);

      this.recordingTimer = setInterval(() => {
        this.recordingDuration.update(d => d + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      this.toast.error('MESSAGES.MIC_PERMISSION_ERROR');
    }
  }

  stopRecording() {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.isRecording.set(false);
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  cancelRecording() {
    this.isRecording.set(false);
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    if (this.speechRecognition) {
      try {
        this.speechRecognition.abort();
      } catch {}
      this.speechRecognition = null;
    }
    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = null; // Prevent sending
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    this.audioChunks = [];
    this.currentTranscription = '';
  }

  async uploadAndSendVoice(audioFile: File) {
    try {
      this.isUploadingVoice.set(true);
      
      // Dynamic transcription from real backend AI Model
      let transcriptText = '';
      try {
        const response = await this.aiService.voiceChat(this.aiService.getSessionId(), audioFile);
        if (response && response.transcription) {
          transcriptText = response.transcription.trim();
        }
      } catch (err) {
        console.error('Real STT backend transcription failed, falling back to local results:', err);
        // Fallback to local live Web Speech API recognition transcript if backend fails
        transcriptText = this.currentTranscription.trim();
      }

      this.cloudinaryService.uploadAudio(audioFile).subscribe({
        next: async (url) => {
          this.isUploadingVoice.set(false);
          // If not connected, try to reconnect first
          if (this.chatSignalR.connectionState() === 'Disconnected') {
            try {
              await this.chatSignalR.connect();
              await this.chatSignalR.joinConversation(this.conversationId);
            } catch (e) {
              this.toast.error('MESSAGES.CONN_ERROR');
              return;
            }
          }
          
          let content = '🎤 رسالة صوتية';
          if (transcriptText) {
            content = `[TRANSCRIPT:${transcriptText}]🎤 رسالة صوتية`;
          }
          
          await this.chatSignalR.sendMessage(this.conversationId, content, url);
          this.newMessage = '';
          this.currentTranscription = '';
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => {
          console.error('Error uploading voice message:', err);
          this.toast.error('MESSAGES.RECORDING_ERROR');
          this.isUploadingVoice.set(false);
        }
      });
    } catch (err) {
      console.error('Error uploading voice:', err);
      this.toast.error('MESSAGES.RECORDING_ERROR');
      this.isUploadingVoice.set(false);
    }
  }

  onMicOrSendClick() {
    if (this.newMessage.trim() || this.selectedProperties().length > 0 || this.selectedFileUrl) {
      this.send();
    } else if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  isAudio(url: string | null | undefined): boolean {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split('?')[0];
    return cleanUrl.endsWith('.mp3') || 
           cleanUrl.endsWith('.webm') || 
           cleanUrl.endsWith('.wav') || 
           cleanUrl.endsWith('.ogg') || 
           cleanUrl.endsWith('.m4a') || 
           cleanUrl.includes('/video/upload/');
  }

  toggleMsgSearch() {
    this.showMsgSearch.update(v => !v);
    if (!this.showMsgSearch()) {
      this.msgSearchQuery.set('');
    }
  }

  toggleMute() {
    this.isMuted.update(v => !v);
    const mutedListRaw = localStorage.getItem('baytology_muted_conversations') || '[]';
    let mutedList: string[] = JSON.parse(mutedListRaw);
    
    if (this.isMuted()) {
      if (!mutedList.includes(this.conversationId)) {
        mutedList.push(this.conversationId);
      }
      this.toast.success('تم كتم إشعارات هذه المحادثة بنجاح 🔕');
    } else {
      mutedList = mutedList.filter(id => id !== this.conversationId);
      this.toast.success('تم تفعيل إشعارات هذه المحادثة 🔔');
    }
    
    localStorage.setItem('baytology_muted_conversations', JSON.stringify(mutedList));
    this.mutedConversations.set(mutedList);
    this.showChatMenu.set(false);
  }

  showContactInfo() {
    this.showContactModal.set(true);
    this.showChatMenu.set(false);
  }

  closeChat() {
    this.showChatMenu.set(false);
    this.router.navigate(['/conversations']);
  }

  toggleSoundSettings() {
    this.showSoundSettings.update(v => !v);
  }

  toggleSoundEnabled() {
    this.soundEnabled.update(v => !v);
    localStorage.setItem('baytology_sound_enabled', this.soundEnabled() ? 'true' : 'false');
    if (this.soundEnabled()) {
      this.playNotificationSound();
    }
  }

  changeSoundType(type: 'premium' | 'pop' | 'classic') {
    this.soundType.set(type);
    localStorage.setItem('baytology_sound_type', type);
    this.playNotificationSound();
  }

  playNotificationSound() {
    const isSoundEnabled = localStorage.getItem('baytology_sound_enabled') !== 'false';
    if (!isSoundEnabled) return;

    const soundType = localStorage.getItem('baytology_sound_type') || 'premium';

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (soundType === 'premium') {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(880, ctx.currentTime, 0.4); 
        playTone(1320, ctx.currentTime + 0.08, 0.5); 
      } else if (soundType === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (soundType === 'classic') {
        const playBeep = (start: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2000, start);
          gain.gain.setValueAtTime(0.04, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.1);
        };
        playBeep(ctx.currentTime);
        playBeep(ctx.currentTime + 0.12);
      }
    } catch (err) {
      console.warn('Web Audio API chime failed:', err);
    }
  }

  ngOnDestroy() {
    if (this.conversationId) {
      this.chatSignalR.leaveConversation(this.conversationId).catch(() => {});
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = null;
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  private scrollToBottom() {
    const el = this.scrollContainer()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
