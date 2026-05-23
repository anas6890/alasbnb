import useCurrency, { Currency } from "@/hook/useCurrency";
import { useMemo } from "react";

// Taux de change fixes pour la démo (En production, utiliser une API comme exchange rates)
export const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  MAD: 10.85,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  MAD: "DH",
};

export const usePrice = (basePrice: number, baseCurrency: Currency = "EUR") => {
  const { currency } = useCurrency();

  const convertedPrice = useMemo(() => {
    if (baseCurrency === currency) return basePrice;
    
    // Convert base to EUR first (if it's not EUR)
    const priceInEUR = basePrice / EXCHANGE_RATES[baseCurrency];
    
    // Convert EUR to target currency
    return Math.round(priceInEUR * EXCHANGE_RATES[currency]);
  }, [basePrice, baseCurrency, currency]);

  const formatPrice = (price: number) => {
    const symbol = CURRENCY_SYMBOLS[currency];
    if (currency === "MAD") {
        return `${price} ${symbol}`;
    }
    return `${symbol}${price}`;
  };

  return {
    convertedPrice,
    symbol: CURRENCY_SYMBOLS[currency],
    formattedPrice: formatPrice(convertedPrice),
    currency
  };
};

export const formatPriceServer = (basePrice: number, targetCurrency: Currency) => {
  let convertedPrice = basePrice;
  if (targetCurrency !== "EUR") {
    const priceInEUR = basePrice / EXCHANGE_RATES["EUR"];
    convertedPrice = Math.round(priceInEUR * EXCHANGE_RATES[targetCurrency]);
  }
  
  const symbol = CURRENCY_SYMBOLS[targetCurrency];
  if (targetCurrency === "MAD") {
    return `${convertedPrice} ${symbol}`;
  }
  return `${symbol}${convertedPrice}`;
};
