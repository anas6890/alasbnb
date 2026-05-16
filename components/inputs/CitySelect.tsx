"use client";

import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";

export type CitySelectValue = {
  label: string;
  value: string;
  latlng: [number, number];
  region: string;
};

interface CitySelectProps {
  value?: CitySelectValue;
  onChange: (value: CitySelectValue) => void;
}

const CitySelect: React.FC<CitySelectProps> = ({ value, onChange }) => {
  const loadOptions = async (inputValue: string) => {
    if (inputValue.length < 3) return [];

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${inputValue}&addressdetails=1&limit=5`
      );

      return response.data.map((item: any) => {
        const address = item.address;
        const city = address?.city || address?.town || address?.village || address?.municipality || item.name;
        const country = address?.country || "";
        
        return {
          label: country ? `${city} - ${country}` : city,
          value: item.place_id,
          latlng: [parseFloat(item.lat), parseFloat(item.lon)],
          region: country,
        };
      });
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  };

  return (
    <AsyncSelect
      placeholder="Rechercher une ville..."
      cacheOptions
      loadOptions={loadOptions}
      value={value}
      onChange={(val) => onChange(val as CitySelectValue)}
      classNames={{
        control: () => "p-3 border-2",
        input: () => "text-lg",
        option: () => "text-lg",
      }}
    />
  );
};

export default CitySelect;
