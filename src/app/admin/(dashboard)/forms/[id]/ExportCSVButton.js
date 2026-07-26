'use client';

import { Download } from 'lucide-react';

export default function ExportCSVButton({ submissions, columns, title }) {
  const handleExport = () => {
    // Escape string for CSV
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      let s = String(str);
      // Prevent CSV injection (Formula injection)
      if (s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')) {
        s = `'${s}`;
      }
      if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    // Header row
    let csvContent = "Date," + columns.map(escapeCSV).join(",") + "\n";

    // Data rows
    submissions.forEach(sub => {
      const row = [escapeCSV(new Date(sub.createdAt).toLocaleString())];
      columns.forEach(col => {
        const val = sub.data[col];
        if (val && typeof val === 'object' && val.url) {
           row.push(escapeCSV(val.url));
        } else {
           row.push(escapeCSV(val));
        }
      });
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-navy text-white rounded-md text-[12px] font-semibold hover:opacity-90">
      <Download size={14} /> Export CSV
    </button>
  );
}
