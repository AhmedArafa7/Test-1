const fs = require('fs');

const arPath = 'c:/Users/LENOVO/OneDrive/سطح المكتب/Test-1/public/i18n/ar.json';
const enPath = 'c:/Users/LENOVO/OneDrive/سطح المكتب/Test-1/public/i18n/en.json';

const arKeysToMerge = {
  "PROPERTIES": {
    "BASIC_INFO": "المعلومات الأساسية",
    "PROPERTY_TYPE": "نوع العقار",
    "LISTING_TYPE": "نوع الإعلان",
    "DISTRICT": "المنطقة / الحي",
    "CITY": "المدينة",
    "PRICE": "السعر",
    "AREA_SQM": "المساحة (م²)",
    "BEDROOMS": "غرف النوم",
    "BATHROOMS": "الحمامات",
    "FEATURES_AMENITIES": "المميزات والمرافق",
    "VIEW_TYPE": "نوع الإطلالة",
    "FURNISHING": "حالة التأثيث",
    "AMENITIES": {
      "GYM": "صالة رياضية",
      "POOL": "مسبح",
      "PARKING": "موقف سيارات",
      "BALCONY": "شرفة",
      "SECURITY": "حراسة",
      "ELEVATOR": "مصعد",
      "CENTRAL_AC": "تكييف مركزي",
      "GARDEN": "حديقة"
    },
    "TYPES": {
      "Apartment": "شقة",
      "Villa": "فيلا",
      "Office": "مكتب",
      "Land": "أرض"
    }
  },
  "COMMON": {
    "ANY": "أي شيء",
    "MIN": "الحد الأدنى",
    "MAX": "الحد الأقصى"
  }
};

const enKeysToMerge = {
  "PROPERTIES": {
    "BASIC_INFO": "Basic Info",
    "PROPERTY_TYPE": "Property Type",
    "LISTING_TYPE": "Listing Type",
    "DISTRICT": "District",
    "CITY": "City",
    "PRICE": "Price",
    "AREA_SQM": "Area (sqm)",
    "BEDROOMS": "Bedrooms",
    "BATHROOMS": "Bathrooms",
    "FEATURES_AMENITIES": "Features & Amenities",
    "VIEW_TYPE": "View Type",
    "FURNISHING": "Furnishing",
    "AMENITIES": {
      "GYM": "Gym",
      "POOL": "Pool",
      "PARKING": "Parking",
      "BALCONY": "Balcony",
      "SECURITY": "Security",
      "ELEVATOR": "Elevator",
      "CENTRAL_AC": "Central AC",
      "GARDEN": "Garden"
    },
    "TYPES": {
      "Apartment": "Apartment",
      "Villa": "Villa",
      "Office": "Office",
      "Land": "Land"
    }
  },
  "COMMON": {
    "ANY": "Any",
    "MIN": "Min",
    "MAX": "Max"
  }
};

function mergeDeep(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  mergeDeep(arData, arKeysToMerge);
  fs.writeFileSync(arPath, JSON.stringify(arData, null, 4), 'utf8');
  console.log('ar.json updated successfully');
} catch(e) {
  console.error('Error updating ar.json', e);
}

try {
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  mergeDeep(enData, enKeysToMerge);
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 4), 'utf8');
  console.log('en.json updated successfully');
} catch(e) {
  console.error('Error updating en.json', e);
}
