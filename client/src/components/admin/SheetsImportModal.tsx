import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { importService, ImportResult } from '../../services/import.service.js';
import { Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SheetsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SheetsImportModal: React.FC<SheetsImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [importType, setImportType] = useState<'students' | 'interviewers' | 'panels'>('students');
  const [csvContent, setCsvContent] = useState('');
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const sampleTemplates = {
    students: `Registration Number,Name,Email,Branch,Year,Preference 1,Preference 2,Preference 3
24BCE2001,Amit Kumar,amit.k@college.edu,CSE,1,ML,IoT,Web
24BCE2002,Divya Nair,divya.n@college.edu,ECE,1,Web,Android,Cybersecurity
24BCE2003,Sameer Varma,sameer.v@college.edu,IT,1,AR/VR,Game Development,Web
24BCE2004,Tanvi Shah,tanvi.s@college.edu,CSE,1,Cloud,Backend,Data Science`,
    interviewers: `Panel,Name,Email,Domain 1,Domain 2
P1,Dr. Rajesh,rajesh@college.edu,ML,Python
P2,Prof. Ananya,ananya@college.edu,Web,Frontend
P3,Er. Siddharth,siddharth@college.edu,Backend,Cloud`,
    panels: `Panel Code,Name,Room Location
P5,Panel 5 — Emerging Tech,Room 305 Lab Block
P6,Panel 6 — Core Systems,Room 306 Lab Block`,
  };

  const handleLoadSample = () => {
    setCsvContent(sampleTemplates[importType]);
    setPreviewResult(null);
  };

  const handleValidate = async () => {
    if (!csvContent.trim()) {
      toast.error('Please paste or upload CSV data first.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await importService.processCsv(importType, csvContent, false);
      setPreviewResult(result);
      toast.info(`Validation complete: ${result.validRows} valid, ${result.invalidRows} invalid.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse CSV data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!csvContent.trim()) return;

    setIsCommitting(true);
    try {
      const result = await importService.processCsv(importType, csvContent, true);
      toast.success(`Successfully imported ${result.importedCount} records into the database!`);
      setPreviewResult(null);
      setCsvContent('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Import commit failed.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
      setPreviewResult(null);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import Data (Google Sheets / CSV)"
      description="Batch import candidates, interviewers, or panels with pre-validation verification."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(
            [
              { key: 'students', label: '1. Students & Preferences' },
              { key: 'interviewers', label: '2. Interviewers & Domains' },
              { key: 'panels', label: '3. Panels' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setImportType(tab.key);
                setPreviewResult(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                importType === tab.key
                  ? 'bg-white dark:bg-[#111726] text-amber-950 dark:text-[#FFBE91] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-[#CFEBFF] hover:text-blue-700 bg-blue-50 dark:bg-sky-950/60 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-sky-800">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .csv File</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <Button size="sm" variant="ghost" onClick={handleLoadSample} className="text-xs h-8 dark:text-slate-300 dark:hover:text-white">
              Load Sample Template
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleValidate}
            isLoading={isLoading}
            disabled={!csvContent.trim()}
            className="text-xs h-8 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111726]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Validate CSV
          </Button>
        </div>

        {/* Text Area */}
        <div>
          <textarea
            value={csvContent}
            onChange={(e) => {
              setCsvContent(e.target.value);
              setPreviewResult(null);
            }}
            placeholder={`Paste CSV data here with column headers...`}
            rows={6}
            className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-[#111726] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-[#0F1626] focus:outline-none focus:border-[#FFBE91]"
          />
        </div>

        {/* Validation Preview Results */}
        {previewResult && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#0F1626] space-y-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Validation Summary</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {previewResult.validRows} Valid
                </span>
                {previewResult.invalidRows > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5" /> {previewResult.invalidRows} Errors
                  </span>
                )}
              </div>

              <Button
                size="sm"
                variant="success"
                onClick={handleCommit}
                isLoading={isCommitting}
                disabled={previewResult.validRows === 0}
                className="text-xs h-8 px-4 font-bold bg-emerald-600 hover:bg-emerald-700"
              >
                Commit Import ({previewResult.validRows} Rows)
              </Button>
            </div>

            {/* Preview Table */}
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {previewResult.preview.slice(0, 10).map((row, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 flex items-center justify-between gap-2 ${
                    row.isValid ? 'bg-white dark:bg-[#0F1626]' : 'bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-400">#{row.rowNumber}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {row.data.registrationNumber || row.data.panelCode || row.data.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 truncate">
                      {row.data.name} {row.data.branch && `(${row.data.branch})`}
                    </span>
                  </div>

                  {row.isValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold shrink-0">Ready</span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold shrink-0">
                      {row.errors.join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
