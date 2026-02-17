'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  icon,
}: ToggleSwitchProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-minimal p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {icon && (
            <div className="bg-white rounded-lg p-2 border border-gray-100">
              {icon}
            </div>
          )}
          <div className="flex-1">
            {label && (
              <h3 className="text-h3 text-darkSlate">{label}</h3>
            )}
            {description && (
              <p className="text-small text-slateGray">{description}</p>
            )}
          </div>
        </div>

        {/* Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            checked ? 'bg-uclaBlue' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
