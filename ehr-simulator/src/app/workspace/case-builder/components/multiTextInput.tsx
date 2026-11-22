import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";

export interface MultiTextInputHandle {
  focus: () => void,
  hasText: () => boolean
}

interface MultiTextInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  labelText: string;
  required?: boolean;
  titleCase?: boolean;
  emptyMessage: string;
}

const MultiTextInput = forwardRef<MultiTextInputHandle, MultiTextInputProps>(({
  value = [],
  onChange,
  placeholder = "Add item...",
  labelText,
  required = false,
  titleCase = false,
  emptyMessage
}, ref) => {

  const [currentInput, setCurrentInput] = useState('');
  // We can simplify the required check logic slightly
  const [isMissing, setIsMissing] = useState(required && value.length === 0);

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    hasText: () => currentInput.trim().length > 0
  }))

  const addInput = () => {
    let input = currentInput.trim();
    if (!input) return;

    if (titleCase) {
      input = input.split(' ')
        .map(word => word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : '')
        .join(' ');
    } else {
      input = input.charAt(0).toUpperCase() + input.slice(1);
    }

    // Avoid duplicates and empty strings
    if (!value.includes(input)) {
      const newValue = [...value, input];
      onChange(newValue);
      setCurrentInput('');
      if (required) setIsMissing(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInput();
    }
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    if (required && newValue.length === 0) setIsMissing(true);
  };

  return (
    <div className="w-full">
      {/* Header Label */}
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">
        {labelText} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Group */}
      <div className="flex gap-2">
        <Input
          className={`bg-white h-9 flex-1 max-w-xs ${isMissing ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
        />
        <Button
          type="button"
          onClick={(e) => { e.preventDefault(); addInput() }}
          variant={!currentInput.trim() ? "outline" : "secondary"}
          size="sm"
          disabled={!currentInput.trim()}
          className="h-9 px-3 cursor-pointer hover:bg-blue-700 not-disabled:bg-blue-600 disabled:text-slate-700 border-slate-200 text-white shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Badge Display Area */}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((item: string, index: number) => (
            <Badge
              key={index}
              variant="outline"
              className="pl-2.5 pr-1 py-1 h-7 text-sm font-normal bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1 hover:bg-slate-100 transition-colors"
            >
              {item}
              <button
                className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                type="button"
                onClick={() => removeItem(index)}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) :
        <p className="text-xs text-slate-400 italic pt-2 pl-1">{emptyMessage}</p>
      }
    </div>
  );
});

export default MultiTextInput;