'use client';

import { Autocomplete, AutocompleteItem } from '@heroui/react';

interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

interface CountrySelectProps {
  value?: string;
  onChange: (_value: string) => void;
  label?: string;
  placeholder?: string;
  isDisabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select a country',
  isDisabled = false,
}: CountrySelectProps) {
  const selectedCountry = COUNTRIES.find((c) => c.code === value);

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      labelPlacement="outside"
      defaultSelectedKey={value}
      selectedKey={value ?? null}
      onSelectionChange={(key) => {
        if (key) onChange(key as string);
      }}
      isDisabled={isDisabled}
      startContent={
        selectedCountry ? <span className="text-lg">{selectedCountry.flag}</span> : undefined
      }
    >
      {COUNTRIES.map((country) => (
        <AutocompleteItem
          key={country.code}
          startContent={<span className="text-base">{country.flag}</span>}
        >
          {country.name}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
