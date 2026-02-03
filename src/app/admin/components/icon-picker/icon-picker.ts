import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export const FASHION_ICONS = [
    { name: 'shirt', path: 'M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z' }, // Shirt
    { name: 'tshirt', path: 'M9 22H5a1 1 0 0 1-1-1V9H2.8a1 1 0 0 1-.88-1.47l2.1-4A2 2 0 0 1 5.8 2h12.4a2 2 0 0 1 1.78 1.53l2.1 4A1 1 0 0 1 21.2 9H20v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1z' },
    { name: 'dress', path: 'M9 2v2a1 1 0 0 1-1 1H6a1 1 0 0 0-.96 1.27l1.37 5.48A9 9 0 0 0 9.8 17h4.4a9 9 0 0 0 3.39-5.25l1.37-5.48A1 1 0 0 0 18 5h-2a1 1 0 0 1-1-1V2h-6zM3 21h18l-1-7h-3v4h-2v-4h-2v4h-2v-4H6l-3 7z' },
    { name: 'tag', path: 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2zM7 7h.01' },
    { name: 'shopping-bag', path: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0' },
    { name: 'watch', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
    { name: 'glasses', path: 'M6 16.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0z M18 16.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0z M2 6l4 5 M22 6l-4 5 M10 16.5h4' },
    { name: 'star', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { name: 'footwear', path: 'M4 14l-2 5a2 2 0 0 0 2 2h14a2 2 0 0 0 1.8-1.2l2.2-5.8a2 2 0 0 0-1.2-2.6l-5-1.5a2 2 0 0 0-2 1.3l-.6 2.3-5-1.5L8 4 4 5l4 10z' },
    { name: 'hanger', path: 'M2 13h20M12 3a4 4 0 0 1 4 4v1H8V7a4 4 0 0 1 4-4z' },
    { name: 'scissors', path: 'M6 6L21 21M21 6L6 21M3 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM3 18a3 3 0 1 1 6 0 3 3 0 0 1-6 0z' },
    { name: 'heart', path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
    // New icons
    { name: 'diamond', path: 'M6 3h12l4 6-10 10L2 9z' },
    { name: 'crown', path: 'M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z' },
    { name: 'camera', path: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { name: 'gift', path: 'M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' },
    { name: 'headphones', path: 'M3 18v-6a9 9 0 0 1 18 0v6' },
    { name: 'smartphone', path: 'M5 16V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2 M12 18h.01' },
    { name: 'laptop', path: 'M20 16V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11 M2 20h20 M12 20v-4' },
    { name: 'home', path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { name: 'armchair', path: 'M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3 M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z M5 18v2 M19 18v2' },
    { name: 'baby', path: 'M9 12h.01 M15 12h.01 M10 16c.5.5 1.5.5 2 0 M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.8 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.8A9 9 0 0 1 12 3a8.8 8.8 0 0 1 7 3.3z' }, // Simplified baby/face
    { name: 'trophy', path: 'M8 21h8 M12 17v4 M7 4H4a2 2 0 0 0-2 2v3a4 4 0 0 0 4 4h2 M17 4h3a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4h-2 M9 4v1a5 5 0 0 0 10 0V4' },
    { name: 'leaf', path: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 .5 3.49-1.6 9.8a7 7 0 0 1-6.4 8.2z' },
    { name: 'percent', path: 'M19 5L5 19 M6.5 6.5a2 2 0 1 1-2.8 0 2 2 0 0 1 2.8 0z M19.5 19.5a2 2 0 1 1-2.8 0 2 2 0 0 1 2.8 0z' },
    { name: 'smile', path: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01' },
    { name: 'sun', path: 'M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
    { name: 'briefcase', path: 'M20 7h-4V5a3 3 0 0 0-6 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 5a1 1 0 0 1 1 1v1h-2V6a1 1 0 0 1 1-1z' },
    { name: 'book', path: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
    { name: 'coffee', path: 'M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3' },
    // General Retail & Service Icons
    { name: 'utensils', path: 'M3 2h18 M3 22h18 M12 2v20 M3 12h18' }, // Simplified
    { name: 'pizza', path: 'M12 2L2 22h20L12 2z M12 2v20' }, // Simple slice
    { name: 'apple', path: 'M12 20.94c1.5 0 2.75 1.06 4 1.06 1.25 0 2.5-1.06 4-1.06.6 0 1.15.11 1.63.3.48-1.55.77-3.19.77-4.94 0-4.64-3.56-9.1-8.4-9.1-2.5 0-4.69 1.44-5.8 1.44C7.09 8.64 5.1 7.2 2.6 7.2 1.3 7.2 0 8.36 0 9.8c0 5 4.3 11.14 8 11.14 1.25 0 2.5-1.06 4-1.06z M10 2c1 .5 2 1 2 2.5C12 5.5 11 6.5 10 7' }, // Rough apple
    { name: 'car', path: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2' }, // Simple Side car
    { name: 'wrench', path: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
    { name: 'bed', path: 'M2 4v16 M2 8h18a2 2 0 0 1 2 2v10 M2 17h20 M6 8v9' },
    { name: 'bath', path: 'M9 6L6.5 3.5a1.5 1.5 0 0 0-1-1.5V2h13v.5A1.5 1.5 0 0 0 17.5 3.5L15 6h-6zM3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z' },
    { name: 'tv', path: 'M2 7h20v14H2z M17 2l-5 5-5-5' },
    { name: 'printer', path: 'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z' },
    { name: 'pill', path: 'M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z M8.5 8.5l7 7' },
    { name: 'activity', path: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    { name: 'flower', path: 'M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V3M7.5 12H3M12 16.5V21M16.5 12H21' }, // Flower-ish
    { name: 'palette', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c0-3.31 2.69-6 6-6h2v-2c0-4.42-4.48-8-10-8zm-5 6h.01M9 6h.01M15 6h.01M5 11h.01' },
    { name: 'archive', path: 'M21 8v13H3V8 M1 3h22v5H1z M10 12h4' },
    { name: 'layers', path: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5' },
    { name: 'box', path: 'M21 16.5l-9 5.25-9-5.25 M12 3.25l9 5.25-9 5.25-9-5.25 9-5.25z M12 13.75V22' },
    { name: 'globe', path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }
];

@Component({
    selector: 'app-icon-picker',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
       @for (icon of icons; track icon.name) {
           <button type="button" 
                   (click)="selectIcon(icon.name)"
                   [class.bg-terra]="selectedIcon === icon.name"
                   [class.text-white]="selectedIcon === icon.name"
                   [class.text-gray-500]="selectedIcon !== icon.name"
                   [class.hover:bg-gray-50]="selectedIcon !== icon.name"
                   class="flex flex-col items-center justify-center p-2 rounded-md transition-colors border border-transparent group">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path [attr.d]="icon.path"/>
               </svg>
               <span class="text-[10px] mt-1 truncate w-full text-center opacity-0 group-hover:opacity-100 transition-opacity">{{icon.name}}</span>
           </button>
       }
    </div>
  `
})
export class IconPickerComponent {
    @Input() selectedIcon: string | null = null;
    @Output() iconSelected = new EventEmitter<string>();

    icons = FASHION_ICONS;

    selectIcon(name: string) {
        this.selectedIcon = name;
        this.iconSelected.emit(name);
    }
}
