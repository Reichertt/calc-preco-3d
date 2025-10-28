// ==========================================
// src/utils/calc.js
// ==========================================
export function toNumberSafe(v) {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(String(v).replace(/,/g, "."));
    return Number.isFinite(n) ? n : 0;
  }
  
  export function brl(n) {
    try {
      return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    } catch {
      return `R$ ${(+n).toFixed(2)}`;
    }
  }
  
  // Custo de filamento = (preço/kg / 1000) * gramas * (1 + perda%)
  export function calcFilamentCost(pricePerKg, grams, wastePct) {
    const kgPrice = toNumberSafe(pricePerKg);
    const g = toNumberSafe(grams);
    const waste = toNumberSafe(wastePct) / 100;
    return (kgPrice / 1000) * g * (1 + waste);
  }
  
  // Estimativa de energia = (W / 1000) * horas * tarifa
  export function calcEnergyCost(watts, hours, kwhTariff) {
    const w = toNumberSafe(watts);
    const h = toNumberSafe(hours);
    const t = toNumberSafe(kwhTariff);
    return (w / 1000) * h * t;
  }
  
  // Mão de obra = horas * valorHora
  export function calcLaborCost(hours, hourlyRate) {
    const h = toNumberSafe(hours);
    const r = toNumberSafe(hourlyRate);
    return h * r;
  }
  
  // Soma de custos diretos
  export function sumCosts(parts) {
    return parts.reduce((acc, v) => acc + toNumberSafe(v), 0);
  }
  
  // Calcula preço final a partir de:
  // - custoTotal
  // - multiplicador de lucro (profitFactor). Ex.: 0 => sem lucro; 1 => lucro = 100% do custo; 2 => lucro = 200% do custo
  // - taxas/porcentagens (marketPct, descontoClientePct)
  // - tarifa fixa (marketFixed)
  // Fórmula: queremos receita líquida (após taxas e descontos) = custoTotal * (1 + profitFactor)
  // Seja P o preço anunciado. Considerando percentuais aplicados sobre P:
  // Receita líquida = P * (1 - marketPct - descontoClientePct) - marketFixed
  // Logo: P = (receitaAlvo + marketFixed) / (1 - marketPct - descontoClientePct)
  export function solveFinalPrice({
    totalCost,
    profitFactor,
    marketPct,
    marketFixed,
    clientDiscountPct,
  }) {
    const C = toNumberSafe(totalCost);
    const f = toNumberSafe(profitFactor);
    const mPct = toNumberSafe(marketPct) / 100; // ex.: 12.5 => 0.125
    const dPct = toNumberSafe(clientDiscountPct) / 100;
    const mFix = toNumberSafe(marketFixed);
  
    const targetNetRevenue = C * (1 + f);
    const pctTotal = 1 - (mPct + dPct);
    if (pctTotal <= 0) return Infinity; // evita divisão por zero
    const finalPrice = (targetNetRevenue + mFix) / pctTotal;
    return finalPrice;
  }
  
  export function computeKPIs({ finalPrice, totalCost, marketPct, marketFixed, clientDiscountPct }) {
    const mPct = toNumberSafe(marketPct) / 100;
    const dPct = toNumberSafe(clientDiscountPct) / 100;
    const feesPctValue = finalPrice * (mPct + dPct);
    const revenueAfterFees = finalPrice - feesPctValue - toNumberSafe(marketFixed);
    const profit = revenueAfterFees - toNumberSafe(totalCost);
    const margin = finalPrice > 0 ? (profit / finalPrice) : 0; // % sobre preço
    const roi = toNumberSafe(totalCost) > 0 ? (profit / totalCost) : 0; // retorno sobre custo
    return { feesPctValue, revenueAfterFees, profit, margin, roi };
  }
  
  