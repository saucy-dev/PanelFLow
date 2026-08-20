import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { Copy, Download, Printer, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, sessionName = 'Club Recruitment' }) => {
  const [copied, setCopied] = React.useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const joinUrl = `${window.location.origin}/interview/join`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast.success('Join link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `panelflow-queue-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code image downloaded!');
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgHtml = qrRef.current?.innerHTML || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PanelFlow Queue QR Code - ${sessionName}</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              text-align: center;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            h1 { font-size: 28px; margin-bottom: 8px; color: #0f172a; }
            p { font-size: 16px; color: #475569; margin-top: 0; margin-bottom: 24px; }
            .qr-container { padding: 24px; border: 2px solid #e2e8f0; border-radius: 16px; display: inline-block; }
            .url { font-family: monospace; font-size: 14px; color: #2563eb; margin-top: 20px; font-weight: bold; }
            .instructions { font-size: 14px; color: #64748b; margin-top: 12px; }
          </style>
        </head>
        <body>
          <h1>Scan to Join Interview Queue</h1>
          <p>${sessionName}</p>
          <div class="qr-container">
            ${svgHtml}
          </div>
          <div class="url">${joinUrl}</div>
          <div class="instructions">Scan this QR code on your mobile phone to enter the waiting queue.</div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Queue Entry QR Code"
      description="Display or print this QR code in the waiting hall for candidates to enter the queue."
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center py-2 space-y-5 text-center">
        {/* QR Code Container */}
        <div
          ref={qrRef}
          className="p-5 bg-white rounded-2xl border-2 border-[#FFDDB0] shadow-md flex items-center justify-center"
        >
          <QRCodeSVG
            value={joinUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* URL Pill */}
        <div className="w-full bg-slate-50 dark:bg-[#111726] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between text-left">
          <span className="text-xs font-mono text-slate-700 dark:text-slate-200 truncate select-all">{joinUrl}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 text-xs px-2 shrink-0 ml-2 dark:text-slate-300 dark:hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          <Button variant="outline" size="sm" onClick={handleDownload} className="w-full gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            Download PNG
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} className="w-full gap-2">
            <Printer className="w-4 h-4" />
            Print QR Sheet
          </Button>
        </div>

        <a
          href="/interview/join"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-900 dark:text-[#FFBE91] hover:underline font-semibold inline-flex items-center gap-1"
        >
          Open Candidate View in New Tab <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Dialog>
  );
};
