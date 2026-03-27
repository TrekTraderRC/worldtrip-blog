import React, { useEffect, useMemo, useState } from 'react';

const COUNTRY_ALIASES = {
  中国: 'China',
  美国: 'United States',
  英国: 'United Kingdom',
  日本: 'Japan',
  泰国: 'Thailand',
  新加坡: 'Singapore',
  马来西亚: 'Malaysia',
  印度尼西亚: 'Indonesia',
  印尼: 'Indonesia',
  印度: 'India',
  越南: 'Vietnam',
  韩国: 'South Korea',
  加拿大: 'Canada',
  德国: 'Germany',
  法国: 'France',
  澳大利亚: 'Australia',
  吉尔吉斯斯坦: 'Kyrgyzstan',
  孟加拉: 'Bangladesh',
  孟加拉国: 'Bangladesh',
  俄罗斯: 'Russia',
  土耳其: 'Turkey',
  阿联酋: 'United Arab Emirates',
  阿拉伯联合酋长国: 'United Arab Emirates',
  沙特: 'Saudi Arabia',
  沙特阿拉伯: 'Saudi Arabia',
  菲律宾: 'Philippines',
  柬埔寨: 'Cambodia',
  老挝: 'Laos',
  缅甸: 'Myanmar',
  尼泊尔: 'Nepal',
  斯里兰卡: 'Sri Lanka',
  巴基斯坦: 'Pakistan',
};

const INITIAL_ROWS = [
  { id: 1, country: 'Japan', currency: '', rateToUSD: 0, amount: '', loading: false },
  { id: 2, country: 'Thailand', currency: '', rateToUSD: 0, amount: '', loading: false },
  { id: 3, country: 'United Kingdom', currency: '', rateToUSD: 0, amount: '', loading: false },
];

const countryCache = new Map();
const rateCache = new Map();

function normalizeCountryInput(value) {
  const raw = String(value || '').trim();
  return COUNTRY_ALIASES[raw] || raw;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

async function fetchCountryInfo(input) {
  const normalized = normalizeCountryInput(input);
  const cacheKey = normalized.toLowerCase();
  if (countryCache.has(cacheKey)) return countryCache.get(cacheKey);

  const endpoints = [
    `https://restcountries.com/v3.1/name/${encodeURIComponent(normalized)}?fields=name,currencies&fullText=true`,
    `https://restcountries.com/v3.1/name/${encodeURIComponent(normalized)}?fields=name,currencies`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      if (!Array.isArray(data) || !data.length) continue;

      const item = data[0];
      const currencies = item.currencies || {};
      const currencyCode = Object.keys(currencies)[0];
      if (!currencyCode) continue;

      const result = {
        country: item.name?.common || normalized,
        currency: currencyCode,
      };

      countryCache.set(cacheKey, result);
      return result;
    } catch {
      continue;
    }
  }

  throw new Error('Country not found');
}

async function fetchRateToUSD(currencyCode) {
  const code = String(currencyCode || '').toUpperCase().trim();
  if (!code) throw new Error('Missing currency code');
  if (code === 'USD') return 1;
  if (rateCache.has(code)) return rateCache.get(code);

  const response = await fetch(
    `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(code)}/USD`
  );
  if (!response.ok) throw new Error('Rate lookup failed');

  const data = await response.json();
  const rate = data?.rate;
  if (!Number.isFinite(rate)) throw new Error('Invalid rate');

  rateCache.set(code, rate);
  return rate;
}

async function resolveCountryAndRate(input) {
  const countryInfo = await fetchCountryInfo(input);
  const rateToUSD = await fetchRateToUSD(countryInfo.currency);

  return {
    country: countryInfo.country,
    currency: countryInfo.currency,
    rateToUSD,
  };
}

export default function CurrencyConverterTool() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [newCountry, setNewCountry] = useState('');
  const [baseRates, setBaseRates] = useState({ USD: 1, AUD: 0, CNY: 0 });
  const [topLoading, setTopLoading] = useState(false);
  const [message, setMessage] = useState('Loading live reference rates...');

  const activeRow = useMemo(() => {
    return rows.find((row) => row.amount !== '' && !Number.isNaN(Number(row.amount))) || null;
  }, [rows]);

  const converted = useMemo(() => {
    if (!activeRow || !activeRow.rateToUSD) {
      return { USD: '0.00', AUD: '0.00', CNY: '0.00' };
    }

    const amount = Number(activeRow.amount || 0);
    const usdValue = amount * Number(activeRow.rateToUSD || 0);

    return {
      USD: formatNumber(usdValue),
      AUD: baseRates.AUD ? formatNumber(usdValue / baseRates.AUD) : '—',
      CNY: baseRates.CNY ? formatNumber(usdValue / baseRates.CNY) : '—',
    };
  }, [activeRow, baseRates]);

  const updateRow = (id, updater) => {
    setRows((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  };

  const loadBaseRates = async () => {
    try {
      setTopLoading(true);
      const [aud, cny] = await Promise.all([
        fetchRateToUSD('AUD'),
        fetchRateToUSD('CNY'),
      ]);
      setBaseRates({ USD: 1, AUD: aud, CNY: cny });
      setMessage('Live reference rates loaded.');
    } catch {
      setMessage('Could not load base currency rates right now.');
    } finally {
      setTopLoading(false);
    }
  };

  const loadRowByCountry = async (id, countryInput) => {
    const cleanValue = String(countryInput || '').trim();
    if (!cleanValue) return;

    updateRow(id, (row) => ({ ...row, country: cleanValue, loading: true }));
    setMessage('Loading country and exchange rate...');

    try {
      const resolved = await resolveCountryAndRate(cleanValue);
      updateRow(id, (row) => ({
        ...row,
        country: resolved.country,
        currency: resolved.currency,
        rateToUSD: resolved.rateToUSD,
        loading: false,
      }));
      setMessage(`Loaded ${resolved.country} (${resolved.currency}).`);
    } catch {
      updateRow(id, (row) => ({
        ...row,
        loading: false,
        currency: '',
        rateToUSD: 0,
      }));
      setMessage(`Could not find a supported country or live rate for “${cleanValue}”.`);
    }
  };

  const handleAmountChange = (id, value) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        amount: row.id === id ? value : '',
      }))
    );
  };

  const handleRowCountryChange = (id, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, country: value }
          : row
      )
    );
  };

  const handleCountryBlur = async (id, value) => {
    await loadRowByCountry(id, value);
  };

  const handleCountryKeyDown = async (e, id, value) => {
    if (e.key === 'Enter') {
      await loadRowByCountry(id, value);
    }
  };

  const handleAddCountry = async () => {
    const raw = newCountry.trim();
    if (!raw) return;

    const newId = Date.now();
    setRows((prev) => [
      ...prev,
      { id: newId, country: raw, currency: '', rateToUSD: 0, amount: '', loading: true },
    ]);
    setNewCountry('');
    await loadRowByCountry(newId, raw);
  };

  const handleDelete = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  useEffect(() => {
    loadBaseRates();
  }, []);

  useEffect(() => {
    rows.forEach((row) => {
      if (row.loading) return;
      if (!row.country) return;
      if (row.rateToUSD && row.currency) return;
      loadRowByCountry(row.id, row.country);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tool-stack">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">汇率换算</h2>
            <p className="section-desc">
              输入当地金额后，自动换算为 USD / AUD / CNY。
              输入中文或英文国家名，可添加目的地国家。
            </p>
          </div>
        </div>

        <div className="converter-top-grid">
          {[
            { code: 'USD', label: 'US Dollar' },
            { code: 'AUD', label: 'Australian Dollar' },
            { code: 'CNY', label: 'Chinese Yuan' },
          ].map((base) => (
            <div className="converter-card" key={base.code}>
              <div className="converter-card-code">{base.code}</div>
              <div className="converter-card-label">{base.label}</div>
              <div className="converter-card-value">{converted[base.code]}</div>

              {base.code !== 'USD' && (
                <div className="converter-inline-note">
                  Live USD value for 1 {base.code}: {baseRates[base.code] || '—'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="converter-top-meta">
          <div className="converter-message">
            {activeRow
              ? `Current source: ${activeRow.country} (${activeRow.currency || 'No currency code'}) — amount entered in local currency`
              : 'No amount entered yet.'}
          </div>

          <button
            type="button"
            className="tool-refresh"
            onClick={loadBaseRates}
            disabled={topLoading}
          >
            {topLoading ? 'Refreshing...' : '刷新'}
          </button>
        </div>

        <div className="converter-api-note">{message}</div>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">国家货币列表</h2>
          </div>
        </div>

        <div className="converter-table">
          <div className="converter-table-head">
            <div>Country</div>
            <div>Currency</div>
            <div>Live Rate</div>
            <div>Local Amount</div>
            <div>Action</div>
          </div>

          <div className="converter-table-body">
            {rows.map((row) => (
              <div className="converter-row" key={row.id}>
                <input
                  className="tool-input"
                  value={row.country}
                  onChange={(e) => handleRowCountryChange(row.id, e.target.value)}
                  onBlur={(e) => handleCountryBlur(row.id, e.target.value)}
                  onKeyDown={(e) => handleCountryKeyDown(e, row.id, e.target.value)}
                />

                <input
                  className="tool-input tool-input-readonly"
                  value={row.currency}
                  readOnly
                />

                <input
                  className="tool-input tool-input-readonly"
                  value={
                    row.currency && row.rateToUSD
                      ? `1 ${row.currency} = ${row.rateToUSD} USD`
                      : row.loading
                        ? 'Loading live rate...'
                        : 'Rate not loaded'
                  }
                  readOnly
                />

                <input
                  className="tool-input"
                  type="number"
                  placeholder="Enter local amount"
                  value={row.amount}
                  onChange={(e) => handleAmountChange(row.id, e.target.value)}
                />

                <div className="converter-row-actions">
                  {row.loading && <span className="tool-loading">Loading...</span>}
                  <button
                    type="button"
                    className="tool-delete"
                    onClick={() => handleDelete(row.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">添加国家</h2>
            <p className="section-desc">
              支持输入英文或中文国家名，例如 Singapore / 新加坡、Thailand / 泰国、Bangladesh / 孟加拉。
            </p>
          </div>
        </div>

        <div className="tool-add-row">
          <input
            className="tool-input"
            placeholder="Type a country name in English or Chinese"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCountry();
            }}
          />
          <button type="button" className="button button-primary" onClick={handleAddCountry}>
            添加国家
          </button>
        </div>
      </section>
    </div>
  );
}