'use client';

import { EventSlot } from '@/lib/googleSheets';

interface Props {
  slots: EventSlot[];
  selected: string[];
  maxSelect: number;
  onChange: (selected: string[]) => void;
}

export default function SlotPicker({ slots, selected, maxSelect, onChange }: Props) {
  function toggle(startTime: string) {
    if (selected.includes(startTime)) {
      onChange(selected.filter((s) => s !== startTime));
    } else if (selected.length < maxSelect) {
      onChange([...selected, startTime]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">
        Valitse enintään {maxSelect} aikaslotti{maxSelect !== 1 ? 'a' : ''}.
      </p>
      <div className="flex flex-col gap-2">
        {slots.map((slot) => {
          const isSelected = selected.includes(slot.startTime);
          const isFull = slot.available === 0;
          const isDisabled = isFull || (!isSelected && selected.length >= maxSelect);
          const names = slot.bookedNames ?? [];

          return (
            <button
              key={slot.startTime}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(slot.startTime)}
              className={[
                'rounded-lg border px-4 py-3 text-sm text-left transition-colors w-full',
                isSelected
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                  : isFull
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-light)] cursor-pointer',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {slot.startTime}–{slot.endTime}
                </span>
                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {isFull ? 'Täynnä' : `${slot.available} vapaana`}
                </span>
              </div>
              {names.length > 0 && (
                <p className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                  {names.join(', ')}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
