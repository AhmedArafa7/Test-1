// Egypt Regions Reference Data
// NOTE: This is a static reference data file containing the canonical Arabic and
// English names of Egyptian governorates and cities. The data lives in
// core/constants/ because it represents geographic terminology, not user-facing
// UI labels.
//
// Runtime user-facing display is handled by consumers (e.g. home.ts,
// property-list.ts) which already select nameAr or nameEn dynamically based on
// translate.currentLang. Storing both languages in the data avoids depending on
// translation files for canonical region names that must remain stable across
// locales (e.g. when used as search queries or filter values).
export interface City {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  cities: City[];
}

export const EGYPT_REGIONS: Governorate[] = [
  {
    id: 'Cairo',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    cities: [
      { id: 'Cairo', nameAr: 'القاهرة (الكل)', nameEn: 'Cairo (All)' },
      { id: 'Zamalek', nameAr: 'الزمالك', nameEn: 'Zamalek' },
      { id: 'Maadi', nameAr: 'المعادي', nameEn: 'Maadi' },
      { id: 'NewCairo', nameAr: 'القاهرة الجديدة', nameEn: 'New Cairo' },
      { id: 'FifthSettlement', nameAr: 'التجمع الخامس', nameEn: 'Fifth Settlement' },
      { id: 'Heliopolis', nameAr: 'مصر الجديدة', nameEn: 'Heliopolis' },
      { id: 'NasrCity', nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
      { id: 'Madinaty', nameAr: 'مدينتي', nameEn: 'Madinaty' },
      { id: 'Rehab', nameAr: 'الرحاب', nameEn: 'Rehab' },
      { id: 'Shorouk', nameAr: 'الشروق', nameEn: 'Shorouk' }
    ]
  },
  {
    id: 'Alexandria',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    cities: [
      { id: 'Alexandria', nameAr: 'الإسكندرية (الكل)', nameEn: 'Alexandria (All)' },
      { id: 'Smouha', nameAr: 'سموحة', nameEn: 'Smouha' },
      { id: 'Miami', nameAr: 'ميامي', nameEn: 'Miami' },
      { id: 'SidiBishr', nameAr: 'سيدي بشر', nameEn: 'Sidi Bishr' },
      { id: 'Gleem', nameAr: 'جليم', nameEn: 'Gleem' },
      { id: 'Stanley', nameAr: 'ستانلي', nameEn: 'Stanley' },
      { id: 'SanStefano', nameAr: 'سان ستيفانو', nameEn: 'San Stefano' }
    ]
  },
  {
    id: 'Giza',
    nameAr: 'الجيزة',
    nameEn: 'Giza',
    cities: [
      { id: 'Giza', nameAr: 'الجيزة (الكل)', nameEn: 'Giza (All)' },
      { id: 'October', nameAr: '6 أكتوبر', nameEn: '6th of October' },
      { id: 'Zayed', nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed' },
      { id: 'Dokki', nameAr: 'الدقي', nameEn: 'Dokki' },
      { id: 'Mohandessin', nameAr: 'المهندسين', nameEn: 'Mohandessin' },
      { id: 'Haram', nameAr: 'الهرم', nameEn: 'Haram' },
      { id: 'Faisal', nameAr: 'فيصل', nameEn: 'Faisal' }
    ]
  },
  {
    id: 'Dakahlia',
    nameAr: 'الدقهلية',
    nameEn: 'Dakahlia',
    cities: [
      { id: 'Mansoura', nameAr: 'المنصورة', nameEn: 'Mansoura' },
      { id: 'Talkha', nameAr: 'طلخا', nameEn: 'Talkha' },
      { id: 'MitGhamr', nameAr: 'ميت غمر', nameEn: 'Mit Ghamr' },
      { id: 'Senbellawein', nameAr: 'السنبلاوين', nameEn: 'Senbellawein' }
    ]
  },
  {
    id: 'Gharbia',
    nameAr: 'الغربية',
    nameEn: 'Gharbia',
    cities: [
      { id: 'Tanta', nameAr: 'طنطا', nameEn: 'Tanta' },
      { id: 'Mahalla', nameAr: 'المحلة الكبرى', nameEn: 'Mahalla' },
      { id: 'KafrElZayat', nameAr: 'كفر الزيات', nameEn: 'Kafr El-Zayat' }
    ]
  },
  {
    id: 'Sharqia',
    nameAr: 'الشرقية',
    nameEn: 'Sharqia',
    cities: [
      { id: 'Zagazig', nameAr: 'الزقازيق', nameEn: 'Zagazig' },
      { id: 'Ramadan', nameAr: 'العاشر من رمضان', nameEn: '10th of Ramadan' },
      { id: 'Belbeis', nameAr: 'بلبيس', nameEn: 'Belbeis' }
    ]
  },
  {
    id: 'Monufia',
    nameAr: 'المنوفية',
    nameEn: 'Monufia',
    cities: [
      { id: 'ShibinElKom', nameAr: 'شبين الكوم', nameEn: 'Shibin El Kom' },
      { id: 'Sadat', nameAr: 'السادات', nameEn: 'Sadat' },
      { id: 'Menouf', nameAr: 'منوف', nameEn: 'Menouf' }
    ]
  },
  {
    id: 'Qalyubia',
    nameAr: 'القليوبية',
    nameEn: 'Qalyubia',
    cities: [
      { id: 'Banha', nameAr: 'بنها', nameEn: 'Banha' },
      { id: 'ShubraElKheima', nameAr: 'شبرا الخيمة', nameEn: 'Shubra El Kheima' },
      { id: 'Obour', nameAr: 'العبور', nameEn: 'Obour' }
    ]
  },
  {
    id: 'KafrElSheikh',
    nameAr: 'كفر الشيخ',
    nameEn: 'Kafr El Sheikh',
    cities: [
      { id: 'KafrElSheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
      { id: 'Desouk', nameAr: 'دسوق', nameEn: 'Desouk' },
      { id: 'Baltim', nameAr: 'بلطيم', nameEn: 'Baltim' }
    ]
  },
  {
    id: 'Beheira',
    nameAr: 'البحيرة',
    nameEn: 'Beheira',
    cities: [
      { id: 'Damanhour', nameAr: 'دمنهور', nameEn: 'Damanhour' },
      { id: 'KafrElDawar', nameAr: 'كفر الدوار', nameEn: 'Kafr El Dawar' },
      { id: 'Rashid', nameAr: 'رشيد', nameEn: 'Rashid' }
    ]
  },
  {
    id: 'Damietta',
    nameAr: 'دمياط',
    nameEn: 'Damietta',
    cities: [
      { id: 'Damietta', nameAr: 'دمياط', nameEn: 'Damietta' },
      { id: 'RasElBar', nameAr: 'رأس البر', nameEn: 'Ras El Bar' },
      { id: 'NewDamietta', nameAr: 'دمياط الجديدة', nameEn: 'New Damietta' }
    ]
  },
  {
    id: 'PortSaid',
    nameAr: 'بورسعيد',
    nameEn: 'Port Said',
    cities: [
      { id: 'PortSaid', nameAr: 'بورسعيد', nameEn: 'Port Said' },
      { id: 'PortFouad', nameAr: 'بورفؤاد', nameEn: 'Port Fouad' }
    ]
  },
  {
    id: 'Ismailia',
    nameAr: 'الإسماعيلية',
    nameEn: 'Ismailia',
    cities: [
      { id: 'Ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
      { id: 'Fayed', nameAr: 'فايد', nameEn: 'Fayed' }
    ]
  },
  {
    id: 'Suez',
    nameAr: 'السويس',
    nameEn: 'Suez',
    cities: [
      { id: 'Suez', nameAr: 'السويس', nameEn: 'Suez' },
      { id: 'AinSokhna', nameAr: 'العين السخنة', nameEn: 'Ain Sokhna' }
    ]
  },
  {
    id: 'Fayoum',
    nameAr: 'الفيوم',
    nameEn: 'Fayoum',
    cities: [
      { id: 'Fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum' },
      { id: 'Sinnuris', nameAr: 'سنورس', nameEn: 'Sinnuris' }
    ]
  },
  {
    id: 'BeniSuef',
    nameAr: 'بني سويف',
    nameEn: 'Beni Suef',
    cities: [
      { id: 'BeniSuef', nameAr: 'بني سويف', nameEn: 'Beni Suef' },
      { id: 'Nasser', nameAr: 'ناصر', nameEn: 'Nasser' }
    ]
  },
  {
    id: 'Minya',
    nameAr: 'المنيا',
    nameEn: 'Minya',
    cities: [
      { id: 'Minya', nameAr: 'المنيا', nameEn: 'Minya' },
      { id: 'Mallawi', nameAr: 'ملوي', nameEn: 'Mallawi' }
    ]
  },
  {
    id: 'Asyut',
    nameAr: 'أسيوط',
    nameEn: 'Asyut',
    cities: [
      { id: 'Asyut', nameAr: 'أسيوط', nameEn: 'Asyut' },
      { id: 'Dairut', nameAr: 'ديروط', nameEn: 'Dairut' }
    ]
  },
  {
    id: 'Sohag',
    nameAr: 'سوهاج',
    nameEn: 'Sohag',
    cities: [
      { id: 'Sohag', nameAr: 'سوهاج', nameEn: 'Sohag' },
      { id: 'Tahta', nameAr: 'طهطا', nameEn: 'Tahta' }
    ]
  },
  {
    id: 'Qena',
    nameAr: 'قنا',
    nameEn: 'Qena',
    cities: [
      { id: 'Qena', nameAr: 'قنا', nameEn: 'Qena' },
      { id: 'NagHammadi', nameAr: 'نجع حمادي', nameEn: 'Nag Hammadi' }
    ]
  },
  {
    id: 'Luxor',
    nameAr: 'الأقصر',
    nameEn: 'Luxor',
    cities: [
      { id: 'Luxor', nameAr: 'الأقصر', nameEn: 'Luxor' },
      { id: 'Esna', nameAr: 'إسنا', nameEn: 'Esna' }
    ]
  },
  {
    id: 'Aswan',
    nameAr: 'أسوان',
    nameEn: 'Aswan',
    cities: [
      { id: 'Aswan', nameAr: 'أسوان', nameEn: 'Aswan' },
      { id: 'KomOmbo', nameAr: 'كوم أمبو', nameEn: 'Kom Ombo' }
    ]
  },
  {
    id: 'RedSea',
    nameAr: 'البحر الأحمر',
    nameEn: 'Red Sea',
    cities: [
      { id: 'Hurghada', nameAr: 'الغردقة', nameEn: 'Hurghada' },
      { id: 'Gouna', nameAr: 'الجونة', nameEn: 'Gouna' },
      { id: 'MarsaAlam', nameAr: 'مرسى علم', nameEn: 'Marsa Alam' }
    ]
  },
  {
    id: 'SouthSinai',
    nameAr: 'جنوب سيناء',
    nameEn: 'South Sinai',
    cities: [
      { id: 'SharmElSheikh', nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh' },
      { id: 'Dahab', nameAr: 'دهب', nameEn: 'Dahab' }
    ]
  },
  {
    id: 'NorthSinai',
    nameAr: 'شمال سيناء',
    nameEn: 'North Sinai',
    cities: [
      { id: 'Arish', nameAr: 'العريش', nameEn: 'Arish' }
    ]
  },
  {
    id: 'Matrouh',
    nameAr: 'مطروح',
    nameEn: 'Matrouh',
    cities: [
      { id: 'MarsaMatrouh', nameAr: 'مرسى مطروح', nameEn: 'Marsa Matrouh' },
      { id: 'ElAlamein', nameAr: 'العلمين', nameEn: 'El Alamein' }
    ]
  },
  {
    id: 'NewValley',
    nameAr: 'الوادي الجديد',
    nameEn: 'New Valley',
    cities: [
      { id: 'Kharga', nameAr: 'الخارجة', nameEn: 'Kharga' }
    ]
  }
];
