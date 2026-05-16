import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-white font-sans py-20 px-6" dir="rtl">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="mb-4">
            <span class="bg-gradient-to-r from-[#0a8f96]/10 to-[#0a8f96]/5 text-[#0a8f96] text-[10px] font-black tracking-[0.3em] uppercase px-6 py-2.5 rounded-full border border-[#0a8f96]/10">
              المساعدة والدعم
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            الأسئلة <span class="text-[#0a8f96]">الشائعة</span>
          </h1>
          <p class="text-gray-500 text-sm font-medium">كل ما تحتاج معرفته عن استخدام منصة baytology</p>
        </div>

        <!-- FAQ Items -->
        <div class="space-y-4">
          @for (item of faqs; track $index) {
            <div class="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <button (click)="toggle($index)" 
                      class="w-full px-8 py-7 flex items-center justify-between text-right group">
                <span class="text-lg font-black text-gray-900 group-hover:text-[#0a8f96] transition-colors">{{ item.q }}</span>
                <div class="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center transition-all group-hover:bg-[#0a8f96]/10 group-hover:text-[#0a8f96]"
                     [class.rotate-180]="openIndex() === $index">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </button>
              
              @if (openIndex() === $index) {
                <div class="px-8 pb-8 animate-[fadeIn_0.3s_ease]">
                  <p class="text-gray-500 leading-loose font-medium text-base pt-4 border-t border-gray-50">
                    {{ item.a }}
                  </p>
                </div>
              }
            </div>
          }
        </div>

        <!-- Still Need Help? -->
        <div class="mt-16 bg-gradient-to-br from-[#0a8f96] via-[#0a8f96] to-[#076b70] rounded-[32px] p-10 md:p-12 text-center text-white relative overflow-hidden">
          <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 20px 20px;"></div>
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <h3 class="text-2xl font-black mb-4 relative z-10">ما زلت بحاجة للمساعدة؟</h3>
          <p class="text-white/70 font-medium mb-8 max-w-lg mx-auto relative z-10">
            فريق الدعم لدينا متاح دائماً للإجابة على استفساراتك المعقدة وتقديم المساعدة التقنية.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a routerLink="/ai/chatbot" class="w-full sm:w-auto bg-white text-[#0a8f96] font-black px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95">تحدث مع المساعد الذكي</a>
            <a href="mailto:support@baytology.com" class="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 font-black px-10 py-4 rounded-2xl hover:bg-white/20 transition-all">مراسلتنا بالبريد</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FaqComponent {
  openIndex = signal<number | null>(0);

  faqs = [
    {
      q: 'كيف يعمل محرك التوصيات بالذكاء الاصطناعي؟',
      a: 'يستخدم نظامنا خوارزميات متقدمة لتحليل سجل تصفحك، العقارات التي قضيت وقتاً أطول في مشاهدتها، وتفضيلاتك الجغرافية والمادية لتقديم قائمة دقيقة من العقارات التي تناسب ذوقك الشخصي.'
    },
    {
      q: 'هل يمكنني التواصل مع الوكلاء مباشرة؟',
      a: 'نعم، توفر المنصة نظام محادثة فورية مدمج يسمح لك بالتواصل المباشر مع الوكلاء، إرسال الصور، ومشاركة روابط العقارات لمناقشة التفاصيل قبل إجراء أي حجز.'
    },
    {
      q: 'كيف يتم تأكيد حجوزات معاينة العقارات؟',
      a: 'بمجرد اختيار موعد للمعاينة، يتلقى الوكيل إشعاراً فورياً. عند قبول الموعد، ستصلك رسالة تأكيد وإشعار على هاتفك لتذكيرك بالموعد المختار.'
    },
    {
      q: 'ما هي ميزة "البحث الذكي"؟',
      a: 'هي ميزة تسمح لك بالبحث باستخدام لغة طبيعية، حيث يمكنك كتابة "أريد شقة واسعة في القاهرة بإطلالة على النيل وسعر مناسب" وسيقوم محرك البحث بفهم متطلباتك بدقة وعرض النتائج المطابقة.'
    },
    {
      q: 'هل بياناتي الشخصية وصور ملفي آمنة؟',
      a: 'بالتأكيد، نحن نستخدم تقنيات تشفير SSL وخدمات Cloudinary السحابية لتأمين جميع الملفات والصور، ونتبع معايير صارمة في حماية الخصوصية.'
    }
  ];

  toggle(index: number) {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}
