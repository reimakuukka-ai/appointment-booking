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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((slot) => {
          const isSelected = selected.includes(slot.startTime);
          const isFull = slot.available === 0;
          const isDisabled = isFull || (!isSelected && selected.length >= maxSelect);

          return (
            <button
              key={slot.startTime}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(slot.startTime)}
              className={[
                'rounded-lg border px-3 py-3 text-sm text-left transition-colors',
                isSelected
                  ? 'border-brand bg-brand-light text-brand-dark'
                  : isFull
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-brand hover:bg-brand-light cursor-pointer',
              ].join(' ')}
            >
              <span className="font-medium block">
                {slot.startTime}–{slot.endTime}
              </span>
              <span className="text-xs mt-0.5 block">
                {isFull ? 'Täynnä' : `${slot.available} vapaana`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
