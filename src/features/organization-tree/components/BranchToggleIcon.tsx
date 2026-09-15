import { ToggleIcon } from './BranchToggleIcon.style';

export function BranchToggleIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <ToggleIcon aria-hidden="true" viewBox="0 0 16 16">
      <path d="M3 8h10" />
      {!isExpanded && <path d="M8 3v10" />}
    </ToggleIcon>
  );
}
