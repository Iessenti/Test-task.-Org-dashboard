import { SortIcon } from './SortDirectionIcon.style';

export function SortDirectionIcon({ direction }: { direction: 'asc' | 'desc' | 'none' }) {
  return (
    <SortIcon aria-hidden="true">
      <svg viewBox="0 0 20 20" focusable="false">
        {(direction === 'asc' || direction === 'none') && <path d="m5 8 5-5 5 5" />}
        {(direction === 'desc' || direction === 'none') && <path d="m5 12 5 5 5-5" />}
      </svg>
    </SortIcon>
  );
}
