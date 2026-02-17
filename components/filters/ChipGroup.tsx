'use client';

interface ChipOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ChipGroupProps {
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  label?: string;
}

export default function ChipGroup({
  options,
  selected,
  onChange,
  multiSelect = true,
  label,
}: ChipGroupProps) {
  const handleToggle = (value: string) => {
    if (multiSelect) {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange([value]);
    }
  };

  // Split label to handle asterisk styling
  const renderLabel = () => {
    if (!label) return null;
    if (label.includes('*')) {
      const parts = label.split('*');
      return (
        <h3 className="text-h2 text-darkSlate">
          {parts[0]}<span className="text-red-600">*</span>{parts[1] || ''}
        </h3>
      );
    }
    return <h3 className="text-h2 text-darkSlate">{label}</h3>;
  };

  return (
    <div className="space-y-2">
      {renderLabel()}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                  : 'bg-white border-gray-200 text-slateGray hover:border-gray-300'
              }`}
            >
              {option.icon && <span className="text-lg">{option.icon}</span>}
              <span className="text-body">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
