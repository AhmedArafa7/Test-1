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

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [FormsModule, RelativeTimePipe, LoadingSpinnerComponent, CurrencyEgpPipe, RouterLink, TranslateModule, ImageCropperComponent],
  templateUrl: './chat-room.html',
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  public chatSignalR = inject(ChatSignalRService);
  private conversationService = inject(ConversationService);
  private propertyService = inject(PropertyService);
  private localImageService = inject(LocalImageService);
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private cloudinaryService = inject(CloudinaryService);
  private destroyRef = inject(DestroyRef);

  croppedFile: File | Blob | string | null = null;

  conversationId = '';
  loading = signal(false);
  messages = signal<Message[]>([]);
  conversations = signal<Conversation[]>([]);
  
  searchQuery = '';
  filterType = signal<'all' | 'unread' | 'clients'>('all');
  showProfileMenu = signal(false);
  showChatMenu = signal(false);
  showEmojiPicker = signal(false);
  showCropperModal = signal(false);
  imageFile: File | undefined = undefined;
  croppedImageTemp: string = '';
  localImagesMap = signal<Map<string, string>>(new Map());
  
  fileInput = viewChild<ElementRef>('fileInput');

  filteredConversations = computed(() => {
    let list = this.conversations();
    
    // 1. Filter by Type
    // [BACKEND_MISSING]: unreadCount is not returned by the backend yet.
    /* if (this.filterType() === 'unread') {
      list = list.filter(c => (c.unreadCount ?? 0) > 0);
    } else */ if (this.filterType() === 'clients') {
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

  newMessage = '';
  recipientName = signal('');
  agentProperties = signal<PropertyListItem[]>([]);
  selectedProperties = signal<PropertyListItem[]>([]);
  showPropertyPreview = signal(false);
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor() {
    effect(() => {
      const msg = this.chatSignalR.incomingMessage();
      if (msg && msg.conversationId === this.conversationId) {
        this.messages.update(prev => [...prev, msg]);
        /* if (msg.senderId !== this.auth.userId()) {
          this.conversationService.markRead(msg.id).catch(() => {});
        } */
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  async ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async p => {
      this.conversationId = p['id'];
      if (this.conversationId) {
        this.loading.set(true);
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

  private async loadConversations() {
    try {
      const list = await this.conversationService.getAll();
      this.conversations.set(list);
    } catch {}
  }

  private async loadData() {
    try {
      const [msgs, convs] = await Promise.all([
        this.conversationService.getMessages(this.conversationId),
        this.conversationService.getAll()
      ]);
      
      this.messages.set(msgs);
      this.conversations.set(convs);
      
      // Mark all unread messages as read
      // [BACKEND_MISSING]: The backend doesn't support unread status for individual messages yet.
      /* msgs.filter(m => !m.isRead && m.senderId !== this.auth.userId()).forEach(m => {
        this.conversationService.markRead(m.id).catch(() => {});
      }); */

      const current = convs.find(c => c.id === this.conversationId);
      if (current) {
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

  ngOnDestroy() {
    if (this.conversationId) {
      this.chatSignalR.leaveConversation(this.conversationId).catch(() => {});
    }
  }

  private scrollToBottom() {
    const el = this.scrollContainer()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
