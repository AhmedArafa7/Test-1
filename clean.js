const fs = require('fs');
const path = './src/app/features/properties/saved-properties/saved-properties.ts';
let content = fs.readFileSync(path, 'utf8');

// We want to find the index of "<!-- Floating Comparison Tray -->"
const startIdx = content.indexOf('<!-- Floating Comparison Tray -->');
// We want to find the index of "    </div>\r\n  `," or "    </div>\n  `," at the very end of template
let endIdx = content.indexOf('    </div>\r\n  `,');
if (endIdx === -1) {
  endIdx = content.indexOf('    </div>\n  `,');
}

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = '      <app-property-compare [selectedProperties]="selectedPropertiesForCompare()" (compareChange)="selectedPropertiesForCompare.set($event)" />\n';
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync(path, content, 'utf8');
  console.log("SUCCESS TEMPLATE");
} else {
  console.log("TEMPLATE NOT FOUND", startIdx, endIdx);
}
