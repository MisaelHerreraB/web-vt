import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'formatDescription',
    standalone: true
})
export class FormatDescriptionPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string | null | undefined): SafeHtml {
        if (!value) return '';

        let formatted = value;

        // Convert **text** to <strong>text</strong> (bold)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert __text__ to <u>text</u> (underline)
        formatted = formatted.replace(/__(.*?)__/g, '<u>$1</u>');

        // Convert *text* to <em>text</em> (italic)
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Convert [link text](url) to <a href="url">link text</a>
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-terra underline hover:text-terra/80">$1</a>');

        // Preserve line breaks with white-space: pre-line is handled by CSS

        return this.sanitizer.bypassSecurityTrustHtml(formatted);
    }
}
