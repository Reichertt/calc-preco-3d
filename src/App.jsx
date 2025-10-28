// ==========================================
// src/App.jsx
// ==========================================
import React, { useEffect, useMemo, useState } from "react";
import NumberInput from "./components/NumberInput.jsx";
import {
  brl,
  calcEnergyCost,
  calcFilamentCost,
  calcLaborCost,
  computeKPIs,
  solveFinalPrice,
  sumCosts,
  toNumberSafe,
} from "./utils/calc.js";
import SimpleModal from "./components/SimpleModal.jsx";

const LS_KEY = "calc_preco_3d_v1";

export default function App() {
  const [state, setState] = useState(() => {
    // valores padrão pensados para Brasil e impressão FDM
    const saved = localStorage.getItem(LS_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          filamentPricePerKg: 70, // R$/kg
          gramsUsed: 200, // g
          wastePct: 10, // % de perda
          paintCost: 5,
          primerCost: 3,
          varnishCost: 2,
          otherMaterials: 0,
          packaging: 3.5,

          // energia
          watts: 150,
          printHours: 10,
          kwhTariff: 0.85,

          // mão de obra
          laborHours: 2,
          hourlyRate: 20,

          // marketplace
          marketPct: 12.5, // %
          marketFixed: 4, // R$
          clientDiscountPct: 0, // cupom concedido ao cliente (%)

          // objetivo
          profitFactor: 2, // 2x o custo = lucro igual a 200% do custo
        };
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const update = (k) => (v) => setState((s) => ({ ...s, [k]: v }));

  const filamentCost = useMemo(
    () =>
      calcFilamentCost(
        state.filamentPricePerKg,
        state.gramsUsed,
        state.wastePct
      ),
    [state.filamentPricePerKg, state.gramsUsed, state.wastePct]
  );
  const energyCost = useMemo(
    () => calcEnergyCost(state.watts, state.printHours, state.kwhTariff),
    [state.watts, state.printHours, state.kwhTariff]
  );
  const laborCost = useMemo(
    () => calcLaborCost(state.laborHours, state.hourlyRate),
    [state.laborHours, state.hourlyRate]
  );

  const totalCost = useMemo(
    () =>
      sumCosts([
        filamentCost,
        state.paintCost,
        state.primerCost,
        state.varnishCost,
        state.otherMaterials,
        state.packaging,
        energyCost,
        laborCost,
      ]),
    [
      filamentCost,
      state.paintCost,
      state.primerCost,
      state.varnishCost,
      state.otherMaterials,
      state.packaging,
      energyCost,
      laborCost,
    ]
  );

  const finalPrice = useMemo(
    () =>
      solveFinalPrice({
        totalCost,
        profitFactor: state.profitFactor,
        marketPct: state.marketPct,
        marketFixed: state.marketFixed,
        clientDiscountPct: state.clientDiscountPct,
      }),
    [
      totalCost,
      state.profitFactor,
      state.marketPct,
      state.marketFixed,
      state.clientDiscountPct,
    ]
  );

  const kpis = useMemo(
    () =>
      computeKPIs({
        finalPrice,
        totalCost,
        marketPct: state.marketPct,
        marketFixed: state.marketFixed,
        clientDiscountPct: state.clientDiscountPct,
      }),
    [
      finalPrice,
      totalCost,
      state.marketPct,
      state.marketFixed,
      state.clientDiscountPct,
    ]
  );

  const clearAll = () => {
    localStorage.removeItem(LS_KEY);
    location.reload();
  };

  const [showModal, setShowModal] = useState(false);

      // Abre o modal ~10s após entrar
  useEffect(() => {
    const id = setTimeout(() => setShowModal(true), 5_000);
    return () => clearTimeout(id); // limpeza se sair da página antes
  }, []);

  return (
    <>
      <SimpleModal open={showModal} onClose={() => setShowModal(false)}>
        <h3 style={{ marginTop: 0 }}>Já seguiu nosso Instagram?</h3>
        <p className="muted" style={{ margin: "8px 0 12px" }}>
          Acompanhe novidades em <strong>@dreamreich</strong>.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => setShowModal(false)}>Fechar</button>
          <a className="btn btn--primary" href="https://www.instagram.com/dreamreich/" target="_blank" rel="noreferrer">
            Abrir Instagram
          </a>
        </div>
      </SimpleModal>
      <div className="container">
        <header className="header">
          <div>
            <h1>Calculadora de Preço – Impressões 3D</h1>
            <p className="muted">
              Defina seus custos, taxas e o multiplicador de lucro desejado. O
              app calcula o preço sugerido já considerando as taxas e descontos.
            </p>
          </div>
          <button
            className="btn btn--ghost"
            onClick={clearAll}
            title="Limpar e voltar aos padrões"
          >
            Redefinir
          </button>
        </header>

        <main className="grid">
          {/* Coluna 1 */}
          <section className="card">
            <h2>Materiais</h2>
            <div className="grid grid--2">
              <NumberInput
                label="Filamento (R$/kg)"
                prefix="R$"
                value={state.filamentPricePerKg}
                onChange={update("filamentPricePerKg")}
              />
              <NumberInput
                label="Gramas usadas"
                suffix="g"
                value={state.gramsUsed}
                onChange={update("gramsUsed")}
              />
              <NumberInput
                label="Perda (suporte/erro)"
                suffix="%"
                value={state.wastePct}
                onChange={update("wastePct")}
              />
              <div className="summary-line">
                <span>Custo do filamento</span>
                <strong>{brl(filamentCost)}</strong>
              </div>
            </div>

            <div className="grid grid--3">
              <NumberInput
                label="Tinta"
                prefix="R$"
                value={state.paintCost}
                onChange={update("paintCost")}
              />
              <NumberInput
                label="Primer"
                prefix="R$"
                value={state.primerCost}
                onChange={update("primerCost")}
              />
              <NumberInput
                label="Verniz"
                prefix="R$"
                value={state.varnishCost}
                onChange={update("varnishCost")}
              />
            </div>

            <div className="grid grid--2">
              <NumberInput
                label="Outros materiais"
                help="cola, lixa, etc."
                prefix="R$"
                value={state.otherMaterials}
                onChange={update("otherMaterials")}
              />
              <NumberInput
                label="Embalagem"
                prefix="R$"
                value={state.packaging}
                onChange={update("packaging")}
              />
            </div>
          </section>

          {/* Coluna 2 */}
          <section className="card">
            <h2>Energia & Mão de Obra</h2>
            <div className="grid grid--3">
              <NumberInput
                label="Potência impressora"
                suffix="W"
                value={state.watts}
                onChange={update("watts")}
              />
              <NumberInput
                label="Horas de impressão"
                suffix="h"
                value={state.printHours}
                onChange={update("printHours")}
              />
              <NumberInput
                label="Tarifa kWh"
                prefix="R$"
                value={state.kwhTariff}
                onChange={update("kwhTariff")}
              />
            </div>
            <div className="summary-line">
              <span>Custo de energia</span>
              <strong>{brl(energyCost)}</strong>
            </div>

            <div className="grid grid--2">
              <NumberInput
                label="Horas de trabalho"
                suffix="h"
                value={state.laborHours}
                onChange={update("laborHours")}
              />
              <NumberInput
                label="Valor por hora"
                prefix="R$"
                value={state.hourlyRate}
                onChange={update("hourlyRate")}
              />
            </div>
            <div className="summary-line">
              <span>Custo de mão de obra</span>
              <strong>{brl(laborCost)}</strong>
            </div>
          </section>

          {/* Coluna 3 */}
          <section className="card">
            <h2>Marketplace / Descontos</h2>
            <div className="grid grid--2">
              <NumberInput
                label="Taxa da plataforma"
                suffix="%"
                value={state.marketPct}
                onChange={update("marketPct")}
                help="Ex.: 12,5%"
              />
              <NumberInput
                label="Tarifa fixa"
                prefix="R$"
                value={state.marketFixed}
                onChange={update("marketFixed")}
                help="Ex.: R$ 4,00"
              />
            </div>
            <NumberInput
              label="Desconto ao cliente"
              suffix="%"
              value={state.clientDiscountPct}
              onChange={update("clientDiscountPct")}
              help="Cupom/concessão que reduz sua receita"
            />

            <h2 style={{ marginTop: "1rem" }}>Objetivo (Lucro)</h2>
            <NumberInput
              label="Multiplicador de lucro"
              value={state.profitFactor}
              onChange={update("profitFactor")}
              help="0 = sem lucro; 1 = lucro igual ao custo (100%); 2 = lucro 200% do custo, etc."
            />
          </section>
        </main>

        <section className="card">
          <h2>Resumo</h2>
          <div className="grid grid--2">
            <div className="panel">
              <div className="row">
                <span>Total de custos</span>
                <strong>{brl(totalCost)}</strong>
              </div>
              <div className="row">
                <span>Receita líquida desejada</span>
                <strong>
                  {brl(
                    toNumberSafe(totalCost) *
                      (1 + toNumberSafe(state.profitFactor))
                  )}
                </strong>
              </div>
              <div className="row">
                <span>Preço sugerido (anunciar)</span>
                <strong className="price">
                  {Number.isFinite(finalPrice) ? brl(finalPrice) : "—"}
                </strong>
              </div>
            </div>

            <div className="panel">
              <div className="row small">
                <span>Taxas (% + descontos)</span>
                <strong>{brl(kpis.feesPctValue)}</strong>
              </div>
              <div className="row small">
                <span>Tarifa fixa</span>
                <strong>{brl(state.marketFixed)}</strong>
              </div>
              <div className="row">
                <span>Receita após taxas</span>
                <strong>{brl(kpis.revenueAfterFees)}</strong>
              </div>
              <div className="row">
                <span>Lucro estimado</span>
                <strong>{brl(kpis.profit)}</strong>
              </div>
              <div className="row small">
                <span>Margem sobre preço</span>
                <strong>{(kpis.margin * 100).toFixed(1)}%</strong>
              </div>
              <div className="row small">
                <span>ROI sobre custo</span>
                <strong>{(kpis.roi * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>
          <p className="muted">
            Fórmula: Preço = (Receita alvo + tarifa fixa) / (1 − taxa% −
            desconto%). Receita alvo = Custo × (1 + multiplicador).
          </p>
        </section>

        <footer className="footer">
          <small className="muted">
            Dica: considere adicionar custos de pós-processo (lixas, epóxi),
            embalagem reforçada e margem para refação.
          </small>
        </footer>
      </div>
    </>
  );
}
