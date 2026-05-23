"use client";

import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";

export type CitySelectValue = {
  label: string;
  latlng: number[];
  value: string;
  cityName?: string;
};

interface Props {
  value?: CitySelectValue;
  onChange: (value: CitySelectValue) => void;
  countryValue?: string;
}

const CitySelect: React.FC<Props> = ({ value, onChange, countryValue }) => {
  const loadOptions = async (inputValue: string) => {
    if (inputValue.length < 3) return [];

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${inputValue}&addressdetails=1&limit=5`
      );

      return response.data.map((item: any) => {
        const address = item.address;
        const city = address?.city || address?.town || address?.village || address?.municipality || item.name;
        
        return {
          label: item.display_name,
          value: item.place_id,
          latlng: [parseFloat(item.lat), parseFloat(item.lon)],
          cityName: city,
        };
      });
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  };

  return (
    <AsyncSelect
      placeholder="Rechercher une destination..."
      cacheOptions
      loadOptions={loadOptions}
      value={value}
      onChange={(val: any) => onChange(val as CitySelectValue)}
      formatOptionLabel={(option: any) => {
        const parts = option.label.split(',');
        const main = parts[0];
        const sub = parts.slice(1).join(',');
        return (
          <div className="flex flex-col gap-0.5">
            <div className="font-bold text-neutral-800 text-[15px]">{main}</div>
            {sub && <div className="text-xs text-neutral-500 font-medium">{sub.trim()}</div>}
          </div>
        );
      }}
      classNames={{
        control: () => "p-3 border-2 rounded-xl",
        input: () => "text-lg",
        option: () => "text-lg",
      }}
      theme={(theme: any) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "black",
        },
      })}
    />
  );
};

export default CitySelect;
