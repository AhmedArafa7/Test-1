import { Component, signal, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../services/profile.service';
import { PropertyService } from '../../properties/services/property.service';
import { ConversationService } from '../../conversations/services/conversation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AgentDetail, PropertyListItem } from '../../../core/models';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [RouterLink, PropertyCardComponent, LoadingSpinnerComponent, TranslateModule, LocalizedDatePipe],
  template: `
    @if (loading()) {
      <app-loading-spinner [message]="'PROFILE.LOADING' | translate" />
    } @else if (agent(); as a) {
      <div class="page-container animate-fade-in">
        <div class="glass-card p-8 max-w-3xl mx-auto mb-8">
          <div class="flex items-center gap-5">
            <div class="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden shadow-lg border-2 border-white/10">
              @if (a.avatarUrl) {
                <img [src]="a.avatarUrl" (error)="a.avatarUrl = ''" class="w-full h-full object-cover">
              } @else {
                <div class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                  <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              }
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-black text-white tracking-tight">{{ a.displayName || ('MESSAGES.AGENT' | translate) }}</h1>
                @if (a.isVerified) {
                  <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    {{ 'PROPERTY_DETAIL.VERIFIED' | translate }}
                  </span>
                }
              </div>
              
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                @if (a.agencyName) {
                  <p class="text-[#0a8f96] font-bold">{{ a.agencyName }}</p>
                }
                <div class="flex items-center gap-1.5">
                  <div class="flex text-yellow-400">
                    @for (star of [1,2,3,4,5]; track $index) {
                      <svg class="w-3.5 h-3.5" [class.text-gray-600]="a.rating < star" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    }
                  </div>
                  <span class="text-white font-black tabular-nums">{{ a.rating.toFixed(1) }}</span>
                  <span class="text-gray-500 font-bold">({{ a.reviewCount }} {{ 'PROFILE.EDIT.REVIEWS' | translate }})</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-white/5">
                @if (a.licenseNumber) {
                  <div class="flex flex-col">
                    <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ 'PROFILE.AGENT.LICENSE' | translate }}</span>
                    <span class="text-xs font-bold text-gray-300">{{ a.licenseNumber }}</span>
                  </div>
                }
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ 'PROFILE.AGENT.COMMISSION' | translate }}</span>
                  <span class="text-xs font-bold text-orange-400 tabular-nums">{{ (a.commissionRate * 100).toFixed(1) }}%</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ 'PROFILE.AGENT.JOINED_AT' | translate }}</span>
                  <span class="text-xs font-bold text-gray-300">{{ a.createdOnUtc | localizedDate:'MMMM yyyy' }}</span>
                </div>
              </div>
            </div>
          </div>
          @if (auth.isBuyer() && listings().length > 0) {
            <div class="mt-5">
              <button (click)="contactAgent()" [disabled]="contactingAgent()" class="btn-accent w-full sm:w-auto">
                {{ contactingAgent() ? ('PROFILE.AGENT.OPENING_CHAT' | translate) : ('PROFILE.AGENT.CONTACT_BTN' | translate) }}
              </button>
            </div>
          }
        </div>
        @if (listings().length > 0) {
          <h2 class="section-title mb-4">{{ 'PROFILE.AGENT.LISTINGS' | translate }}</h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (p of listings(); track p.id) {
              <app-property-card [property]="p" />
            }
          </div>
        } @else {
          <div class="glass-card p-6 text-center max-w-3xl mx-auto">
            <p class="text-gray-400">{{ 'SAVED_PROPERTIES.EMPTY_MSG' | translate }}</p>
            <a routerLink="/properties" class="btn-secondary inline-flex mt-4">{{ 'BOOKINGS.CREATE.BROWSE_PROPERTIES' | translate }}</a>
          </div>
        }
      </div>
    } @else {
      <div class="page-container text-center">
        <p class="text-gray-400 text-lg">{{ 'PROPERTY_DETAIL.NOT_FOUND' | translate }}</p>
        <a routerLink="/properties" class="btn-primary inline-flex mt-4">{{ 'BOOKINGS.CREATE.BROWSE_PROPERTIES' | translate }}</a>
      </div>
    }
  `,
})
export class AgentProfileComponent implements OnInit {
  agent = signal<AgentDetail | null>(null);
  listings = signal<PropertyListItem[]>([]);
  loading = signal(true);
  contactingAgent = signal(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private propertyService = inject(PropertyService);
  private conversationService = inject(ConversationService);
  public auth = inject(AuthService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    try {
      this.agent.set(await this.profileService.getAgentDetail(id));
      await this.loadAgentListings(id);
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAgentListings(agentUserId: string) {
    const firstPage = await this.propertyService.getAll({ agentUserId, pageNumber: 1, pageSize: 100 });
    const remainingPages = Array.from({ length: Math.max(firstPage.totalPages - 1, 0) }, (_, index) =>
      this.propertyService.getAll({ agentUserId, pageNumber: index + 2, pageSize: 100 })
    );
    const additionalPages = await Promise.all(remainingPages);
    this.listings.set([firstPage, ...additionalPages].flatMap(page => page.items));
  }

  async contactAgent() {
    const firstListing = this.listings()[0];
    if (!firstListing) return;

    this.contactingAgent.set(true);
    try {
      const response = await this.conversationService.create(firstListing.id);
      this.toast.success(this.translate.instant('PROFILE.AGENT.SUCCESS_CHAT'));
      this.router.navigate(['/conversations', response.conversationId]);
    } catch (error: any) {
      if (error?.status === 409) {
        this.toast.info(this.translate.instant('PROFILE.AGENT.ALREADY_CHAT'));
        const conversations = await this.conversationService.getAll().catch(() => []);
        const existing = conversations.find(c => c.agentUserId === this.agent()?.userId);
        this.router.navigate(existing ? ['/conversations', existing.id] : ['/conversations']);
      } else {
        this.toast.error(error?.error?.detail || this.translate.instant('PROFILE.AGENT.ERROR_CHAT'));
      }
    } finally {
      this.contactingAgent.set(false);
    }
  }
}
