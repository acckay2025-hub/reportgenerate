import React, { useMemo, useState } from 'react';

export default function FinancialReportGenerator() {
  const [rows, setRows] = useState([]);
  const [reportTitle, setReportTitle] = useState('M1 EASYSOLUTION');
  const [month, setMonth] = useState('May 2026');
  const [error, setError] = useState('');

  const sampleRows = [
    {
      date: '05/01',
      deposit: '3442286',
      depTxn: '541',
      withdrawal: '2967584',
      wdTxn: '350',
      settlement: '2391071',
      ssp: '0',
      service: '0',
      closing: '14128740.80',
    },
    {
      date: '05/02',
      deposit: '1009348',
      depTxn: '159',
      withdrawal: '2812504',
      wdTxn: '116',
      settlement: '0',
      ssp: '747419.86',
      service: '0',
      closing: '11578164.94',
    },
  ];

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());

    return result.map((item) => item.replace(/^"|"$/g, ''));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError('No file selected.');
      return;
    }

    setError('');

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;

        if (typeof text !== 'string') {
          setError('Unable to read file content.');
          return;
        }

        const lines = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line !== '');

        if (lines.length < 2) {
          setError('CSV must contain headers and at least one row.');
          return;
        }

        const dataStartIndex = lines.findIndex((line) =>
          line.toLowerCase().includes('date,deposit')
        );

        if (dataStartIndex === -1) {
          setError('Invalid CSV format. Header row not found.');
          return;
        }

        const dataLines = lines.slice(dataStartIndex + 1);

        const parsedRows = dataLines
          .map((line) => {
            const values = parseCSVLine(line);

            const rawDate = values[0] || '';

            let formattedDate = rawDate;

            if (/^\d\{1,2\}\/\d\{1,2\}$/.test(rawDate)) {
              const [month, day] = rawDate.split('/');
              formattedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
            }

            return {
              date: formattedDate,
              deposit: values[1] || '0',
              depTxn: values[2] || '0',
              withdrawal: values[3] || '0',
              wdTxn: values[4] || '0',
              settlement: values[5] || '0',
              ssp: values[6] || '0',
              service: values[7] || '0',
              closing: values[8] || '0',
            };
          })
          .filter((row) => {
            return (
              row.date &&
              row.date !== 'Opening Balance' &&
              row.date !== 'Monthly Settlement'
            );
          });

        setRows(parsedRows);
      } catch (err) {
        setError('Failed to process CSV file.');
      }
    };

    reader.onerror = () => {
      setError('Error reading file.');
    };

    reader.readAsText(file);
  };

  const formatAmount = (value) => {
    const cleaned = String(value || '0').replace(/,/g, '');
    const num = Number(cleaned);

    if (Number.isNaN(num)) {
      return '0.00';
    }

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateTotal = (field) => {
    const total = rows.reduce((sum, row) => {
      const value = Number(String(row[field] || '0').replace(/,/g, ''));

      if (Number.isNaN(value)) {
        return sum;
      }

      return sum + value;
    }, 0);

    return formatAmount(total);
  };

  const latestClosingBalance = useMemo(() => {
    if (rows.length === 0) {
      return '0.00';
    }

    return formatAmount(rows[rows.length - 1].closing);
  }, [rows]);

  const exportHTML = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const loadSampleData = () => {
    setRows(sampleRows);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl p-8 shadow-2xl text-white">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
                  📊
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
                    Financial Report Generator
                  </h1>
                  <p className="text-slate-300 text-sm md:text-lg mt-1">
                    Upload CSV data and generate professional settlement reports.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={loadSampleData}
                className="bg-white/10 hover:bg-white/20 transition px-5 py-3 rounded-2xl font-semibold"
              >
                Load Sample
              </button>

              <button
                onClick={exportHTML}
                className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-100 transition"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Upload Report Data
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Report Title
              </label>

              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Report Month
              </label>

              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Upload CSV File
              </label>

              <label className="flex items-center gap-3 border-2 border-dashed border-slate-300 rounded-2xl px-4 py-4 cursor-pointer hover:border-slate-700 transition bg-slate-50">
                <span className="text-xl">📁</span>

                <div>
                  <div className="font-semibold text-slate-700">
                    Choose CSV File
                  </div>
                  <div className="text-xs text-slate-500">
                    Upload transaction report data
                  </div>
                </div>

                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div className="bg-slate-100 rounded-2xl p-5 text-sm text-slate-700 overflow-auto">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <span>🧾</span>
              Supported CSV Format
            </div>

            <code className="block whitespace-pre-wrap text-xs leading-6">
              Date,Deposit,DepositTxn,Withdrawal,WithdrawalTxn,Settlement,SSP,ServiceCharge,ClosingBalance
              {'\n'}
              M1 EASYSOLUTION - MAY 2026,,,,,,,,
              {'\n'}
              Date,Deposit,Txn Count,Withdrawal,Txn Count,Settlement,Settlement to SSP,Service Charge,Closing Balance
              {'\n'}
              05/01,\"3,442,286.00\",541,\"2,967,584.00\",350,\"2,391,071.00\",0,0,\"14,128,740.80\"
              {'\n'}
              05/02,\"1,009,348.00\",159,\"2,812,504.00\",116,0,\"747,419.86\",0,\"11,578,164.94\"
            </code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-lg border-l-4 border-blue-500">
            <p className="text-slate-500 text-sm">Total Deposit</p>
            <h3 className="text-2xl md:text-3xl font-bold text-blue-600 mt-2 break-all">
              {calculateTotal('deposit')}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border-l-4 border-red-500">
            <p className="text-slate-500 text-sm">Total Withdrawal</p>
            <h3 className="text-2xl md:text-3xl font-bold text-red-500 mt-2 break-all">
              {calculateTotal('withdrawal')}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border-l-4 border-amber-500">
            <p className="text-slate-500 text-sm">Settlement</p>
            <h3 className="text-2xl md:text-3xl font-bold text-amber-500 mt-2 break-all">
              {calculateTotal('settlement')}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border-l-4 border-emerald-500">
            <p className="text-slate-500 text-sm">Closing Balance</p>
            <h3 className="text-2xl md:text-3xl font-bold text-emerald-600 mt-2 break-all">
              {latestClosingBalance}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-slate-900 text-white px-6 md:px-8 py-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
              {reportTitle}
            </h2>

            <p className="text-slate-300 mt-2 text-base md:text-lg">
              Settlement Report • {month}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Date</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Deposit</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Txn</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Withdrawal</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Txn</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Settlement</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">SSP</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Service Charge</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-700">Closing Balance</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.date}-${index}`}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-700 whitespace-nowrap">
                      {row.date}
                    </td>

                    <td className="px-5 py-4 font-bold text-blue-600 whitespace-nowrap">
                      {formatAmount(row.deposit)}
                    </td>

                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {row.depTxn}
                    </td>

                    <td className="px-5 py-4 font-bold text-red-500 whitespace-nowrap">
                      {formatAmount(row.withdrawal)}
                    </td>

                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {row.wdTxn}
                    </td>

                    <td className="px-5 py-4 font-bold text-amber-600 whitespace-nowrap">
                      {formatAmount(row.settlement)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-orange-500 whitespace-nowrap">
                      {formatAmount(row.ssp)}
                    </td>

                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {formatAmount(row.service)}
                    </td>

                    <td className="px-5 py-4 font-bold text-emerald-600 text-base whitespace-nowrap">
                      {formatAmount(row.closing)}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-20 text-slate-400"
                    >
                      No data loaded yet. Upload a CSV file or click “Load Sample”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 py-3">
          Professional Financial Settlement Report Generator
        </div>
      </div>
    </div>
  );
}
