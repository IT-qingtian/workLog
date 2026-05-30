import { Listbox, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import React, { Fragment } from 'react';

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  icon,
  searchable = false,
  searchPlaceholder = '搜索...'
}) => {
  const [query, setQuery] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const uniqueOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const out: Option[] = [];
    for (const opt of options) {
      if (seen.has(opt.value)) continue;
      seen.add(opt.value);
      out.push(opt);
    }
    return out;
  }, [options]);

  const selectedOption = uniqueOptions.find(opt => opt.value === value);
  const hasIcon = Boolean(icon);

  return (
    <div className={clsx("relative", className)}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => {
          React.useEffect(() => {
            if (!open) {
              setQuery('');
              return;
            }
            if (!searchable) return;
            setTimeout(() => searchInputRef.current?.focus(), 0);
          }, [open]);

          const filteredOptions = !searchable
            ? uniqueOptions
            : uniqueOptions.filter((opt) => opt.label.toLowerCase().includes(query.trim().toLowerCase()));

          return (
            <div className="relative mt-1">
          <Listbox.Button
            className={clsx(
              "relative w-full cursor-pointer rounded-xl bg-white py-2.5 pr-10 text-left border border-slate-200 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm transition-all hover:border-indigo-300",
              hasIcon ? "pl-10" : "pl-4"
            )}
          >
            {hasIcon && (
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                {icon}
              </span>
            )}
            <span className={clsx("block truncate", !selectedOption && "text-slate-400")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 min-w-full w-max max-w-[min(28rem,calc(100vw-2rem))] overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 custom-scrollbar">
              {searchable && (
                <div className="sticky top-0 bg-white px-2 pt-1 pb-2 border-b border-slate-100">
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder={searchPlaceholder}
                  />
                </div>
              )}
              {filteredOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-50 text-indigo-900' : 'text-slate-900'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={clsx(
                          "block whitespace-normal break-words",
                          selected ? "font-medium" : "font-normal"
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400">
                  无匹配结果
                </div>
              )}
            </Listbox.Options>
          </Transition>
            </div>
          );
        }}
      </Listbox>
    </div>
  );
};
