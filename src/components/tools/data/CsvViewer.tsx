import React, { useState, useMemo, useRef } from 'react';
import { 
  Table, 
  Upload, 
  Download, 
  Search, 
  ArrowUpDown, 
  Trash2, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

const SAMPLE_CSV = `id,name,role,department,salary,rating,country
101,Vishal Kumar,Lead Architect,Core Platform,145000,4.9,IN
102,Elena Vance,Senior Systems Engineer,Infrastructure,132000,4.8,RO
103,Marcus Brody,Frontend Engineer,Design Systems,110000,4.6,UK
104,Sarah Connor,Security Specialist,CyberOps,140000,4.7,US
105,Chen Wei,Algorithm Researcher,AI Lab,155000,5.0,CN
106,Amira Hassan,Fullstack Developer,Growth & Social,118000,4.5,EG
107,Liam O'Connor,DevOps Engineer,Infrastructure,125000,4.6,IE
108,Sophia Martinez,Product Engineer,Core Platform,122000,4.7,ES`;

export const CsvViewer: React.FC = () => {
  const [rawCsv, setRawCsv] = useState<string>(SAMPLE_CSV);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV
  const { headers, rows, stats } = useMemo(() => {
    const lines = rawCsv.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return { headers: [], rows: [], stats: { rowsCount: 0, colsCount: 0, emptyCells: 0 } };
    }

    const parseLine = (line: string): string[] => {
      // Regex handling quotes commas
      const matches: string[] = [];
      let current = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          matches.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      matches.push(current.trim());
      return matches;
    };

    const headerRow = parseLine(lines[0]);
    let emptyCount = 0;

    const dataRows = lines.slice(1).map(l => {
      const parsed = parseLine(l);
      const rowObj: Record<string, string> = {};
      headerRow.forEach((h, idx) => {
        const val = parsed[idx] !== undefined ? parsed[idx] : '';
        if (val === '') emptyCount++;
        rowObj[h] = val;
      });
      return rowObj;
    });

    return {
      headers: headerRow,
      rows: dataRows,
      stats: {
        rowsCount: dataRows.length,
        colsCount: headerRow.length,
        emptyCells: emptyCount
      }
    };
  }, [rawCsv]);

  // Filtered & Sorted Rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        Object.values(r).some(v => String(v).toLowerCase().includes(lower))
      );
    }

    if (sortCol) {
      result.sort((a, b) => {
        const valA = a[sortCol] ?? '';
        const valB = b[sortCol] ?? '';
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [rows, searchTerm, sortCol, sortAsc]);

  const handleHeaderClick = (h: string) => {
    sound.click();
    if (sortCol === h) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(h);
      setSortAsc(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result as string;
        if (text) {
          setRawCsv(text);
          sound.success();
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportCsv = () => {
    sound.click();
    if (headers.length === 0) return;
    const csvContent = [
      headers.join(','),
      ...processedRows.map(r => headers.map(h => `"${r[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devarena_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    sound.click();
    setRawCsv(SAMPLE_CSV);
    setSearchTerm('');
    setSortCol(null);
  };

  const handleClear = () => {
    sound.click();
    setRawCsv('');
    setSearchTerm('');
    setSortCol(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                IN-MEMORY DATA PROCESSOR
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Tabular Analytics • Zero Uploads to Cloud
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">CSV Viewer & Processor</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inspect tabular data, perform instant multi-column search, sort by arbitrary keys, and export sanitized CSVs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,text/csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50"
            >
              <Upload className="w-3.5 h-3.5 text-[#00E5FF]" /> Upload File
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00E5FF] text-black hover:brightness-110 rounded-lg text-xs font-bold transition-all shadow-md shadow-[#00E5FF]/20"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>

            <button
              onClick={handleLoadSample}
              className="p-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700"
              title="Load Sample Dataset"
            >
              <Sparkles className="w-4 h-4 text-[#FFAD42]" />
            </button>

            <button
              onClick={handleClear}
              className="p-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700"
              title="Clear Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all fields..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#101314] text-xs font-mono text-white pl-9 pr-3 py-1.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <span>Rows: <strong className="text-white">{processedRows.length}</strong> / {stats.rowsCount}</span>
            <span>Columns: <strong className="text-[#00E5FF]">{stats.colsCount}</strong></span>
            <span>Empty Cells: <strong className="text-amber-400">{stats.emptyCells}</strong></span>
          </div>
        </div>
      </div>

      {/* CSV Table Render */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-xl">
        {headers.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 font-mono text-xs">
            No CSV loaded. Upload a .csv file or click "Load Sample" to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#252D30] bg-[#101314]/80 text-neutral-300">
                  <th className="py-2.5 px-3 w-12 text-neutral-500">#</th>
                  {headers.map((h, idx) => (
                    <th
                      key={idx}
                      onClick={() => handleHeaderClick(h)}
                      className="py-2.5 px-3 uppercase tracking-wider text-[11px] font-bold cursor-pointer hover:text-[#00E5FF] transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{h}</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortCol === h ? 'text-[#00E5FF]' : 'text-neutral-600'}`} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D30]/60">
                {processedRows.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="py-8 text-center text-neutral-500 italic">
                      No records match the active search filter.
                    </td>
                  </tr>
                ) : (
                  processedRows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#252D30]/30 transition-colors">
                      <td className="py-2 px-3 text-neutral-600">{rIdx + 1}</td>
                      {headers.map((h, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-neutral-200">
                          {r[h] !== '' ? r[h] : <span className="text-neutral-600 italic">empty</span>}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

