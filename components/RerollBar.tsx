'use client';

import type { RerollState } from '@/lib/types';

interface Props {
  rerolls: RerollState;
  onTeamReroll: () => void;
  onEraReroll: () => void;
  isLoading: boolean;
}

export default function RerollBar({ rerolls, onTeamReroll, onEraReroll, isLoading }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="flex items-center gap-1.5 mr-2">
        <span className="text-xs text-gray-600 uppercase tracking-wider">Rerolls:</span>
      </div>

      <RerollButton
        icon="🔀"
        label="New Team"
        sublabel="same era"
        used={rerolls.teamUsed}
        disabled={isLoading}
        onClick={onTeamReroll}
        tooltip="Keep the era, get a different team"
      />

      <RerollButton
        icon="🎲"
        label="New Era"
        sublabel="& team"
        used={rerolls.eraUsed}
        disabled={isLoading}
        onClick={onEraReroll}
        tooltip="Get a completely new random era and team"
      />

      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-black/20 border border-white/5 text-gray-500">
        <span>🔄</span>
        <div>
          <div className={`font-medium ${rerolls.positionSwapUsed ? 'line-through' : 'text-gray-300'}`}>
            Position Swap
          </div>
          <div className="text-gray-600 text-[10px]">click roster slot</div>
        </div>
        {rerolls.positionSwapUsed && (
          <span className="ml-1 text-red-500 text-xs">✓ used</span>
        )}
      </div>
    </div>
  );
}

interface RerollButtonProps {
  icon: string;
  label: string;
  sublabel: string;
  used: boolean;
  disabled: boolean;
  onClick: () => void;
  tooltip: string;
}

function RerollButton({ icon, label, sublabel, used, disabled, onClick, tooltip }: RerollButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={used || disabled}
      title={tooltip}
      className={`
        flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-150
        ${used
          ? 'bg-black/20 text-gray-600 border border-white/5 cursor-not-allowed'
          : disabled
            ? 'bg-black/20 text-gray-600 border border-white/5 cursor-wait'
            : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer'
        }
      `}
    >
      <span>{icon}</span>
      <div>
        <div className={used ? 'line-through text-gray-600' : ''}>{label}</div>
        <div className="text-gray-600 text-[10px]">{sublabel}</div>
      </div>
      {used && <span className="ml-1 text-red-500">✓</span>}
    </button>
  );
}
