// ==========================================
// src/components/NumberInput.jsx
// ==========================================
import React from "react";

export default function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  step = "any",
  suffix,
  prefix,
  help,
  id,
}) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {help && <em className="field__help">{help}</em>}
      </span>
      <div className="field__control">
        {prefix && <span className="affix affix--prefix">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
        {suffix && <span className="affix affix--suffix">{suffix}</span>}
      </div>
    </label>
  );
}
