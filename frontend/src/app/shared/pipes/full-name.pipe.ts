import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullName',
  standalone: true,
})
export class FullNamePipe implements PipeTransform {
  transform(value: { firstName?: string; lastName?: string } | null | undefined): string {
    if (!value) return '';
    const f = value.firstName?.trim() ?? '';
    const l = value.lastName?.trim() ?? '';
    return `${f} ${l}`.trim() || '—';
  }
}
