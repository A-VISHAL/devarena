import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  RotateCcw, 
  Table, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Copy, 
  Check, 
  Clock 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

interface ColumnDef {
  name: string;
  type: string;
}

interface TableSchema {
  name: string;
  columns: ColumnDef[];
  rows: Record<string, any>[];
}

const DEFAULT_DATABASE: Record<string, TableSchema> = {
  users: {
    name: 'users',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'username', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'elo_rating', type: 'INTEGER' },
      { name: 'problems_solved', type: 'INTEGER' },
      { name: 'country', type: 'VARCHAR(10)' }
    ],
    rows: [
      { id: 1, username: 'vishal_dev', email: 'vishal@devarena.io', elo_rating: 1980, problems_solved: 142, country: 'IN' },
      { id: 2, username: 'sarah_code', email: 'sarah@example.com', elo_rating: 2150, problems_solved: 310, country: 'US' },
      { id: 3, username: 'alex_algo', email: 'alex@domain.de', elo_rating: 1720, problems_solved: 88, country: 'DE' },
      { id: 4, username: 'chen_wei', email: 'chen@tech.cn', elo_rating: 2240, problems_solved: 420, country: 'CN' },
      { id: 5, username: 'elena_ro', email: 'elena@crypto.ro', elo_rating: 1890, problems_solved: 165, country: 'RO' },
      { id: 6, username: 'marcus_q', email: 'marcus@cloud.uk', elo_rating: 1640, problems_solved: 54, country: 'UK' }
    ]
  },
  problems: {
    name: 'problems',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'title', type: 'VARCHAR(100)' },
      { name: 'difficulty', type: 'VARCHAR(20)' },
      { name: 'category', type: 'VARCHAR(50)' },
      { name: 'acceptance_rate', type: 'FLOAT' }
    ],
    rows: [
      { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', acceptance_rate: 51.2 },
      { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked Lists', acceptance_rate: 42.8 },
      { id: 3, title: 'Longest Substring Without Repeating', difficulty: 'Medium', category: 'Sliding Window', acceptance_rate: 34.6 },
      { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Binary Search', acceptance_rate: 38.1 },
      { id: 5, title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointers', acceptance_rate: 59.4 },
      { id: 6, title: 'Merge k Sorted Lists', difficulty: 'Hard', category: 'Heaps', acceptance_rate: 48.9 },
      { id: 7, title: 'Course Schedule', difficulty: 'Medium', category: 'Graphs', acceptance_rate: 47.1 },
      { id: 8, title: 'Coin Change', difficulty: 'Medium', category: 'Dynamic Programming', acceptance_rate: 43.5 }
    ]
  },
  submissions: {
    name: 'submissions',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'problem_id', type: 'INTEGER' },
      { name: 'status', type: 'VARCHAR(20)' },
      { name: 'execution_time_ms', type: 'INTEGER' }
    ],
    rows: [
      { id: 101, user_id: 1, problem_id: 1, status: 'ACCEPTED', execution_time_ms: 12 },
      { id: 102, user_id: 1, problem_id: 3, status: 'ACCEPTED', execution_time_ms: 48 },
      { id: 103, user_id: 2, problem_id: 5, status: 'ACCEPTED', execution_time_ms: 18 },
      { id: 104, user_id: 3, problem_id: 1, status: 'WRONG_ANSWER', execution_time_ms: 22 },
      { id: 105, user_id: 4, problem_id: 4, status: 'ACCEPTED', execution_time_ms: 8 },
      { id: 106, user_id: 5, problem_id: 7, status: 'ACCEPTED', execution_time_ms: 36 },
      { id: 107, user_id: 2, problem_id: 8, status: 'ACCEPTED', execution_time_ms: 15 }
    ]
  }
};

const EXERCISES = [
  {
    title: 'Top Rated Coders',
    query: `SELECT username, elo_rating, problems_solved, country 
FROM users 
WHERE elo_rating >= 1800 
ORDER BY problems_solved DESC;`
  },
  {
    title: 'Hard Problems Overview',
    query: `SELECT title, category, acceptance_rate 
FROM problems 
WHERE difficulty = 'Hard' 
ORDER BY acceptance_rate DESC;`
  },
  {
    title: 'User Submissions JOIN',
    query: `SELECT u.username, p.title, s.status, s.execution_time_ms 
FROM submissions s 
JOIN users u ON s.user_id = u.id 
JOIN problems p ON s.problem_id = p.id;`
  },
  {
    title: 'Insert New User',
    query: `INSERT INTO users (id, username, email, elo_rating, problems_solved, country) 
VALUES (7, 'new_challenger', 'pro@devarena.io', 1500, 10, 'SG');`
  }
];

export const SqlPlayground: React.FC = () => {
  const [db, setDb] = useState<Record<string, TableSchema>>(JSON.parse(JSON.stringify(DEFAULT_DATABASE)));
  const [query, setQuery] = useState<string>(EXERCISES[0].query);
  const [resultRows, setResultRows] = useState<Record<string, any>[] | null>(null);
  const [resultCols, setResultCols] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('users');

  // Relational query execution engine
  const executeQuery = () => {
    sound.click();
    setError(null);
    setMessage(null);
    setResultRows(null);
    setResultCols([]);

    const t0 = performance.now();
    const trimmed = query.trim().replace(/;$/, '');

    try {
      // 1. SELECT query
      if (/^SELECT\b/i.test(trimmed)) {
        handleSelectQuery(trimmed);
      } 
      // 2. INSERT INTO query
      else if (/^INSERT\s+INTO\b/i.test(trimmed)) {
        handleInsertQuery(trimmed);
      }
      // 3. UPDATE query
      else if (/^UPDATE\b/i.test(trimmed)) {
        handleUpdateQuery(trimmed);
      }
      // 4. DELETE FROM query
      else if (/^DELETE\s+FROM\b/i.test(trimmed)) {
        handleDeleteQuery(trimmed);
      }
      // 5. CREATE TABLE query
      else if (/^CREATE\s+TABLE\b/i.test(trimmed)) {
        handleCreateTableQuery(trimmed);
      } else {
        throw new Error('Unsupported SQL command. Supported: SELECT, INSERT INTO, UPDATE, DELETE, CREATE TABLE.');
      }

      const t1 = performance.now();
      setLatency(t1 - t0);
      sound.success();
    } catch (err: any) {
      const t1 = performance.now();
      setLatency(t1 - t0);
      setError(err.message || 'SQL execution failed.');
      sound.defeat();
    }
  };

  const handleSelectQuery = (sql: string) => {
    // Regex parsing for FROM [table] (optional JOINs) (optional WHERE) (optional ORDER BY) (optional LIMIT)
    const fromMatch = sql.match(/\bFROM\s+([a-zA-Z0-9_]+)(?:\s+([a-zA-Z0-9_]+))?/i);
    if (!fromMatch) throw new Error('SELECT statement missing FROM clause.');

    const primaryTableName = fromMatch[1].toLowerCase();
    const primaryAlias = fromMatch[2] || primaryTableName;

    if (!db[primaryTableName]) throw new Error(`Table '${primaryTableName}' does not exist.`);

    let workingRows: Record<string, any>[] = db[primaryTableName].rows.map(r => {
      const rowWithPrefix: Record<string, any> = { ...r };
      // Also add alias prefix for JOIN access
      for (const k of Object.keys(r)) {
        rowWithPrefix[`${primaryAlias}.${k}`] = r[k];
      }
      return rowWithPrefix;
    });

    // Check for JOINs
    const joinMatches = [...sql.matchAll(/\bJOIN\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)/gi)];
    for (const jm of joinMatches) {
      const joinTable = jm[1].toLowerCase();
      const joinAlias = jm[2];
      const leftCol = jm[3];
      const rightCol = jm[4];

      if (!db[joinTable]) throw new Error(`Joined table '${joinTable}' does not exist.`);

      const joinedRows: Record<string, any>[] = [];
      for (const leftRow of workingRows) {
        for (const rightRow of db[joinTable].rows) {
          const rightRowPrefixed: Record<string, any> = {};
          for (const k of Object.keys(rightRow)) {
            rightRowPrefixed[`${joinAlias}.${k}`] = rightRow[k];
          }

          // Evaluate ON condition
          const leftVal = leftRow[leftCol] ?? leftRow[leftCol.split('.').pop()!];
          const rightVal = rightRowPrefixed[rightCol] ?? rightRow[rightCol.split('.').pop()!];

          if (leftVal !== undefined && rightVal !== undefined && leftVal === rightVal) {
            joinedRows.push({
              ...leftRow,
              ...rightRow,
              ...rightRowPrefixed
            });
          }
        }
      }
      workingRows = joinedRows;
    }

    // Check WHERE clause
    const whereMatch = sql.match(/\bWHERE\s+([\s\S]+?)(?=\bORDER\s+BY|\bLIMIT|$)/i);
    if (whereMatch) {
      const whereCondition = whereMatch[1].trim();
      workingRows = workingRows.filter(row => evaluateCondition(row, whereCondition));
    }

    // Check ORDER BY clause
    const orderMatch = sql.match(/\bORDER\s+BY\s+([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const orderCol = orderMatch[1].trim();
      const isDesc = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC';

      workingRows.sort((a, b) => {
        const valA = a[orderCol] ?? a[orderCol.split('.').pop()!];
        const valB = b[orderCol] ?? b[orderCol.split('.').pop()!];
        if (valA === valB) return 0;
        if (valA > valB) return isDesc ? -1 : 1;
        return isDesc ? 1 : -1;
      });
    }

    // Check LIMIT clause
    const limitMatch = sql.match(/\bLIMIT\s+(\d+)/i);
    if (limitMatch) {
      const lim = parseInt(limitMatch[1], 10);
      workingRows = workingRows.slice(0, lim);
    }

    // Project SELECT columns
    const selectMatch = sql.match(/^SELECT\s+([\s\S]+?)\s+\bFROM\b/i);
    if (!selectMatch) throw new Error('Could not parse SELECT columns.');
    const colStr = selectMatch[1].trim();

    if (colStr === '*') {
      // Default to non-aliased keys of primary table
      const cols = db[primaryTableName].columns.map(c => c.name);
      setResultCols(cols);
      setResultRows(workingRows.map(r => {
        const clean: Record<string, any> = {};
        for (const c of cols) clean[c] = r[c];
        return clean;
      }));
    } else {
      const requestedCols = colStr.split(',').map(s => s.trim());
      const cleanCols = requestedCols.map(c => {
        const parts = c.split(/\s+as\s+/i);
        return (parts[1] || parts[0]).trim();
      });

      const projected = workingRows.map(r => {
        const res: Record<string, any> = {};
        requestedCols.forEach((rawCol, idx) => {
          const parts = rawCol.split(/\s+as\s+/i);
          const colExpr = parts[0].trim();
          const targetName = (parts[1] || parts[0]).trim();
          res[targetName] = r[colExpr] ?? r[colExpr.split('.').pop()!];
        });
        return res;
      });

      setResultCols(cleanCols);
      setResultRows(projected);
    }

    setMessage(`Query returned ${workingRows.length} row${workingRows.length === 1 ? '' : 's'}.`);
  };

  const handleInsertQuery = (sql: string) => {
    const match = sql.match(/\bINSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!match) throw new Error('Syntax error. Format: INSERT INTO <table> (cols) VALUES (vals);');

    const tblName = match[1].toLowerCase();
    if (!db[tblName]) throw new Error(`Table '${tblName}' does not exist.`);

    const cols = match[2].split(',').map(s => s.trim());
    const rawVals = match[3].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));

    if (cols.length !== rawVals.length) {
      throw new Error(`Columns count (${cols.length}) does not match values count (${rawVals.length}).`);
    }

    const newRecord: Record<string, any> = {};
    cols.forEach((col, i) => {
      const val = rawVals[i];
      newRecord[col] = !isNaN(Number(val)) && val !== '' ? Number(val) : val;
    });

    setDb(prev => ({
      ...prev,
      [tblName]: {
        ...prev[tblName],
        rows: [...prev[tblName].rows, newRecord]
      }
    }));

    setMessage(`Successfully inserted 1 row into '${tblName}'.`);
  };

  const handleUpdateQuery = (sql: string) => {
    const match = sql.match(/\bUPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+?)(?:\s+WHERE\s+([\s\S]+))?$/i);
    if (!match) throw new Error('Syntax error. Format: UPDATE <table> SET <col> = <val> [WHERE condition];');

    const tblName = match[1].toLowerCase();
    if (!db[tblName]) throw new Error(`Table '${tblName}' does not exist.`);

    const setCol = match[2].trim();
    const rawVal = match[3].trim().replace(/^['"]|['"]$/g, '');
    const newVal = !isNaN(Number(rawVal)) && rawVal !== '' ? Number(rawVal) : rawVal;
    const whereCond = match[4]?.trim();

    let count = 0;
    const updatedRows = db[tblName].rows.map(row => {
      if (!whereCond || evaluateCondition(row, whereCond)) {
        count++;
        return { ...row, [setCol]: newVal };
      }
      return row;
    });

    setDb(prev => ({
      ...prev,
      [tblName]: {
        ...prev[tblName],
        rows: updatedRows
      }
    }));

    setMessage(`Updated ${count} row${count === 1 ? '' : 's'} in '${tblName}'.`);
  };

  const handleDeleteQuery = (sql: string) => {
    const match = sql.match(/\bDELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+([\s\S]+))?$/i);
    if (!match) throw new Error('Syntax error. Format: DELETE FROM <table> [WHERE condition];');

    const tblName = match[1].toLowerCase();
    if (!db[tblName]) throw new Error(`Table '${tblName}' does not exist.`);

    const whereCond = match[2]?.trim();
    let initialCount = db[tblName].rows.length;
    const filteredRows = whereCond
      ? db[tblName].rows.filter(row => !evaluateCondition(row, whereCond))
      : [];

    const deletedCount = initialCount - filteredRows.length;
    setDb(prev => ({
      ...prev,
      [tblName]: {
        ...prev[tblName],
        rows: filteredRows
      }
    }));

    setMessage(`Deleted ${deletedCount} row${deletedCount === 1 ? '' : 's'} from '${tblName}'.`);
  };

  const handleCreateTableQuery = (sql: string) => {
    const match = sql.match(/\bCREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]+)\)/i);
    if (!match) throw new Error('Syntax error. Format: CREATE TABLE <table> (col1 TYPE, col2 TYPE);');

    const tblName = match[1].toLowerCase();
    if (db[tblName]) throw new Error(`Table '${tblName}' already exists.`);

    const colDefs = match[2].split(',').map(s => {
      const parts = s.trim().split(/\s+/);
      return { name: parts[0], type: parts[1] || 'TEXT' };
    });

    setDb(prev => ({
      ...prev,
      [tblName]: {
        name: tblName,
        columns: colDefs,
        rows: []
      }
    }));

    setSelectedTable(tblName);
    setMessage(`Created table '${tblName}' with ${colDefs.length} columns.`);
  };

  const evaluateCondition = (row: Record<string, any>, cond: string): boolean => {
    // Basic condition parser: col = val, col >= val, col <= val, col != val
    const match = cond.match(/([a-zA-Z0-9_.]+)\s*(=|!=|>=|<=|>|<|LIKE)\s*['"]?([^'"]+)['"]?/i);
    if (!match) return true;

    const rawCol = match[1].trim();
    const op = match[2].toUpperCase();
    const rawVal = match[3].trim();
    const cellVal = row[rawCol] ?? row[rawCol.split('.').pop()!];

    const targetVal = !isNaN(Number(rawVal)) ? Number(rawVal) : rawVal;

    switch (op) {
      case '=': return String(cellVal).toLowerCase() === String(targetVal).toLowerCase();
      case '!=': return String(cellVal).toLowerCase() !== String(targetVal).toLowerCase();
      case '>=': return Number(cellVal) >= Number(targetVal);
      case '<=': return Number(cellVal) <= Number(targetVal);
      case '>': return Number(cellVal) > Number(targetVal);
      case '<': return Number(cellVal) < Number(targetVal);
      case 'LIKE': return String(cellVal).toLowerCase().includes(String(targetVal).toLowerCase());
      default: return true;
    }
  };

  const handleResetDb = () => {
    sound.click();
    setDb(JSON.parse(JSON.stringify(DEFAULT_DATABASE)));
    setResultRows(null);
    setResultCols([]);
    setError(null);
    setMessage('Database reset to default seed records.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                IN-BROWSER RELATIONAL ENGINE
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                No Server Required • Zero Latency Execution
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">SQL Playground</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Execute real SQL queries against pre-seeded users, problems, and submissions tables. Run joins, filters, and schema mutations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={executeQuery}
              className="flex items-center gap-2 px-4 py-2 bg-[#00E5FF] text-black hover:brightness-110 font-bold rounded-lg text-xs transition-all shadow-md shadow-[#00E5FF]/20"
            >
              <Play className="w-4 h-4 fill-current" /> Run SQL
            </button>
            <button
              onClick={handleResetDb}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50"
              title="Reset Sample Tables"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset DB
            </button>
          </div>
        </div>

        {/* Exercises / Preset Queries */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-neutral-400 font-mono shrink-0 mr-1">Exercises:</span>
          {EXERCISES.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                sound.click();
                setQuery(ex.query);
              }}
              className="px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 hover:text-white rounded-lg text-xs font-mono border border-[#252D30] whitespace-nowrap transition-colors"
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Schema Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SQL Editor (8 cols) */}
        <div className="lg:col-span-8 bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              SQL Query Console
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Supports SELECT, JOIN, WHERE, ORDER BY, INSERT, UPDATE, DELETE
            </span>
          </div>

          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={7}
            placeholder="Write SQL query here..."
            className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-3.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
            spellCheck={false}
          />

          {error && (
            <div className="mt-3 bg-rose-950/40 border border-rose-500/40 rounded-lg p-2.5 flex items-center gap-2 text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && !error && (
            <div className="mt-3 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono text-[#00E5FF]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B5FF4A]" />
                {message}
              </span>
              {latency !== null && (
                <span className="text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {latency.toFixed(2)} ms
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Schema Explorer (4 cols) */}
        <div className="lg:col-span-4 bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#FFAD42]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Database Tables
            </span>
          </div>

          {/* Table Selector Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.keys(db).map(tName => (
              <button
                key={tName}
                onClick={() => {
                  sound.click();
                  setSelectedTable(tName);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                  selectedTable === tName
                    ? 'bg-[#FFAD42]/20 border-[#FFAD42] text-[#FFAD42] font-bold'
                    : 'bg-[#101314] border-[#252D30] text-neutral-400 hover:text-white'
                }`}
              >
                {tName} ({db[tName].rows.length})
              </button>
            ))}
          </div>

          {/* Active Table Schema Columns */}
          {db[selectedTable] && (
            <div className="bg-[#101314] rounded-lg border border-[#252D30] p-3 flex-1 overflow-y-auto max-h-[170px] space-y-1.5 font-mono text-xs">
              {db[selectedTable].columns.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-[#252D30]/60 last:border-none">
                  <span className="text-white font-medium">{c.name}</span>
                  <span className="text-[10px] text-neutral-500 uppercase">{c.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Query Results Data Table */}
      {resultRows && (
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-[#00E5FF]" />
              Query Results ({resultRows.length} rows)
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {resultCols.length} columns projected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#252D30] bg-[#101314]/80 text-neutral-300">
                  {resultCols.map((col, idx) => (
                    <th key={idx} className="py-2.5 px-3 uppercase tracking-wider text-[11px] font-bold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D30]/60">
                {resultRows.length === 0 ? (
                  <tr>
                    <td colSpan={resultCols.length || 1} className="py-8 text-center text-neutral-500 italic">
                      Empty result set. No matching records found.
                    </td>
                  </tr>
                ) : (
                  resultRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#252D30]/30 transition-colors">
                      {resultCols.map((col, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-neutral-200">
                          {row[col] !== undefined && row[col] !== null ? String(row[col]) : <span className="text-neutral-600">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

