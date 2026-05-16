import { Component, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { LocalizedDatePipe } from '../../shared/pipes/localized-date.pipe';
import { AgentService } from './services/agent.service';
import { PropertyService } from '../properties/services/property.service';
import { AgentDetail, PropertyListItem, PaginatedList } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card';
import { ConversationService } from '../conversations/services/conversation.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, PropertyCardComponent, DecimalPipe, LocalizedDatePipe, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans pb-20">
      @if (loading()) {
        <div class="min-h-[70vh] flex items-center justify-center">
          <app-loading-spinner />
        </div>
      } @else if (agent()) {
      
      <!-- Top Profile Header -->
      <div class="bg-white border-b border-gray-100 pt-32 pb-16 px-6 relative overflow-hidden">
        <!-- Abstract Background Shape -->
        <div class="absolute top-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-[#0a8f96]/5 rounded-full ltr:-ml-48 rtl:-mr-48 -mt-48 blur-3xl"></div>
        
        <div class="max-w-6xl mx-auto relative z-10">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-10">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-40 h-40 rounded-[32px] bg-gray-50 border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                <img *ngIf="agent()?.avatarUrl" [src]="agent()?.avatarUrl" [alt]="agent()?.displayName" class="w-full h-full object-cover">
                <span *ngIf="!agent()?.avatarUrl" class="text-6xl font-black text-[#0a8f96]">{{ (agent()?.displayName || 'A')[0] }}</span>
              </div>
              <div *ngIf="agent()?.isVerified" class="absolute -bottom-2 ltr:-left-2 rtl:-right-2 w-12 h-12 bg-[#0a8f96] text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-[#0a8f96]/20" [title]="'AGENT_PROFILE.BADGE_VERIFIED' | translate">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              </div>
            </div>

            <!-- Basic Info -->
            <div class="text-center ltr:md:text-left rtl:md:text-right flex-1">
              <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 class="text-4xl font-black text-gray-900 tracking-tight">{{ agent()?.displayName }}</h1>
                <span class="inline-flex px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-xl border border-gray-100 uppercase tracking-widest self-center md:self-start">{{ 'AGENT_PROFILE.ROLE_LABEL' | translate }}</span>
              </div>
              
              <div class="flex flex-wrap justify-center ltr:md:justify-start rtl:md:justify-end items-center gap-6 text-sm font-bold text-gray-500 mb-8 ltr:flex-row rtl:flex-row-reverse">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <span class="text-gray-900 font-black text-lg">{{ agent()?.rating | number:'1.1-1' }}</span>
                  <span>({{ agent()?.reviewCount }} {{ 'AGENT_PROFILE.REVIEWS_COUNT' | translate }})</span>
                </div>
                <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  <span>{{ agent()?.agencyName || ('AGENT_PROFILE.INDEPENDENT' | translate) }}</span>
                </div>
                <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  <span>{{ 'AGENT_PROFILE.LICENSE_PREFIX' | translate }} {{ agent()?.licenseNumber || 'N/A' }}</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-center ltr:md:justify-start rtl:md:justify-end gap-4">
              @if (auth.userId() === agent()?.userId) {
                <a routerLink="/profile/edit" class="px-10 py-4 bg-[#0a8f96] text-white rounded-[20px] text-sm font-black shadow-lg shadow-[#0a8f96]/20 transition-all hover:scale-105 active:scale-95">
                  {{ 'AGENT_PROFILE.EDIT_MY_PROFILE' | translate }}
                </a>
              } @else {
                <button (click)="contactAgent()" [disabled]="contactingAgent()" class="px-10 py-4 bg-[#0a8f96] text-white rounded-[20px] text-sm font-black shadow-lg shadow-[#0a8f96]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100">
                  {{ contactingAgent() ? ('AGENT_PROFILE.CONTACTING' | translate) : ('AGENT_PROFILE.CONTACT_BTN' | translate) }}
                </button>
              }
              <button (click)="shareProfile()" class="px-10 py-4 bg-white border border-gray-100 text-gray-900 rounded-[20px] text-sm font-black transition-all hover:bg-gray-50 active:scale-95">
                {{ 'AGENT_PROFILE.SHARE_BTN' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Main Content Tabs -->
      <div class="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
          <!-- Real Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="bg-white p-8 rounded-[32px] border border-gray-100 text-center shadow-sm">
              <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">{{ 'AGENT_PROFILE.TOTAL_PROPERTIES' | translate }}</p>
              <p class="text-4xl font-black text-gray-900">{{ properties()?.totalCount || 0 }}</p>
            </div>
            <div class="bg-white p-8 rounded-[32px] border border-gray-100 text-center shadow-sm">
              <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">{{ 'AGENT_PROFILE.MEMBER_SINCE' | translate }}</p>
              <p class="text-2xl font-black text-gray-900">{{ (agent()?.createdOnUtc | localizedDate:'MMMM yyyy') || '---' }}</p>
            </div>
            <div class="bg-white p-8 rounded-[32px] border border-gray-100 text-center shadow-sm">
              <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">{{ 'AGENT_PROFILE.COMMISSION_RATE' | translate }}</p>
              <p class="text-4xl font-black text-[#0a8f96]">{{ ((agent()?.commissionRate || 0) * 100) | number:'1.0-1' }}%</p>
            </div>
          </div>

        <!-- Tabs Nav -->
        <div class="flex gap-4 mb-8 bg-white/50 p-2 rounded-[24px] border border-gray-100 w-fit">
          <button (click)="activeTab.set('properties')" [class.bg-white]="activeTab() === 'properties'" [class.shadow-sm]="activeTab() === 'properties'" [class.text-gray-900]="activeTab() === 'properties'" class="px-8 py-3 rounded-[18px] text-sm font-black text-gray-900 transition-all">
            {{ 'AGENT_PROFILE.PROPERTIES_TAB' | translate }}
          </button>
        </div>

        <!-- Properties Grid -->
        <div *ngIf="activeTab() === 'properties'" class="animate-fade-in">
          <div *ngIf="propertiesLoading()" class="flex justify-center py-20"><app-loading-spinner /></div>
          
          <div *ngIf="!propertiesLoading() && properties()?.items?.length === 0" class="bg-white rounded-[32px] p-20 text-center border border-gray-100">
            <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-2">{{ 'AGENT_PROFILE.EMPTY_PROPERTIES_TITLE' | translate }}</h3>
            <p class="text-gray-400 font-bold">{{ 'AGENT_PROFILE.EMPTY_PROPERTIES_DESC' | translate }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <app-property-card 
              *ngFor="let p of properties()?.items" 
              [property]="p" 
              [showSave]="true"
              [saved]="isPropertySaved(p.id)"
              (saveToggle)="onToggleSave($event)">
            </app-property-card>
          </div>
        </div>

      </div>
      } @else {
        <div class="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <h2 class="text-2xl font-black text-gray-900 mb-3">{{ 'AGENT_PROFILE.NOT_FOUND' | translate }}</h2>
          <a routerLink="/properties" class="px-8 py-3 bg-[#0a8f96] text-white rounded-2xl text-sm font-black">{{ 'AGENT_PROFILE.BROWSE_BTN' | translate }}</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AgentProfileComponent implements OnInit {
  agent = signal<AgentDetail | null>(null);
  properties = signal<PaginatedList<PropertyListItem> | null>(null);
  
  loading = signal(true);
  propertiesLoading = signal(false);
  activeTab = signal('properties');
  contactingAgent = signal(false);

  constructor(
    private route: ActivatedRoute,
    private agentService: AgentService,
    private propertyService: PropertyService,
    private conversationService: ConversationService,
    private toast: ToastService,
    private router: Router,
    public auth: AuthService,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    const userId = this.route.snapshot.params['id'];
    if (!userId) return;

    this.loading.set(true);
    try {
      // Load basic info
      const agentData = await this.agentService.getById(userId);
      this.agent.set(agentData);
      
      // Load properties
      this.loadProperties(userId);
      
    } catch (error) {
      console.error('Error loading agent profile:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadProperties(userId: string) {
    this.propertiesLoading.set(true);
    try {
      const props = await this.propertyService.getAll({
        agentUserId: userId,
        pageNumber: 1,
        pageSize: 12
      });
      this.properties.set(props);
    } finally {
      this.propertiesLoading.set(false);
    }
  }

  async contactAgent() {
    const agent = this.agent();
    if (!agent) return;

    if (!this.auth.isAuthenticated()) {
      this.toast.info(this.translate.instant('AGENT_PROFILE.LOGIN_REQUIRED_CONTACT'));
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.auth.isBuyer()) {
      this.toast.warning(this.translate.instant('AGENT_PROFILE.BUYER_ONLY_CONTACT'));
      return;
    }

    if (this.auth.userId() === agent.userId) {
      this.router.navigate(['/profile/edit']);
      return;
    }

    const props = this.properties();
    if (!props || props.items.length === 0) {
      this.toast.warning(this.translate.instant('AGENT_PROFILE.NO_PROPERTIES_CONTACT'));
      return;
    }

    this.contactingAgent.set(true);
    try {
      this.toast.info(this.translate.instant('AGENT_PROFILE.STARTING_CHAT'));
      const res = await this.conversationService.create(props.items[0].id);
      this.router.navigate(['/conversations', res.conversationId]);
    } catch (error: any) {
      this.toast.error(error?.error?.detail || this.translate.instant('AGENT_PROFILE.START_CHAT_FAILED'));
    } finally {
      this.contactingAgent.set(false);
    }
  }

  isPropertySaved(id: string): boolean {
    // This should ideally check a list of saved property IDs from a service
    return false; 
  }

  async onToggleSave(id: string) {
    if (!this.auth.isAuthenticated()) {
      this.toast.info(this.translate.instant('PROPERTIES.LIST.LOGIN_REQUIRED_SAVE'));
      this.router.navigate(['/auth/login']);
      return;
    }
    
    try {
      await this.propertyService.save(id);
      this.toast.success('تمت إضافة العقار للمفضلة');
    } catch {
      try {
        await this.propertyService.unsave(id);
        this.toast.success('تمت إزالة العقار من المفضلة');
      } catch {
        this.toast.error('فشل في تحديث المفضلات');
      }
    }
  }

  shareProfile() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.toast.success(this.translate.instant('AGENT_PROFILE.SHARE_SUCCESS'));
    });
  }
}
