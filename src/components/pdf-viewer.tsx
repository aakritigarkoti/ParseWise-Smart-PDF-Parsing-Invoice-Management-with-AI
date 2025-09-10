
'use client';

import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PdfViewerProps {
  file: File | null;
}

// NOTE: This is a placeholder for a real PDF viewer like react-pdf or a simple iframe.
// The prompt mentions pdf.js, but a full integration is complex for this task.
// This component simulates the UI and interactivity.

export default function PdfViewer({ file }: PdfViewerProps) {
  if (!file) {
    return (
      <Card className="h-full min-h-[60vh] flex flex-col items-center justify-center bg-muted/30 border-dashed">
        <FileQuestion className="w-16 h-16 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Upload a PDF to view it here</p>
      </Card>
    );
  }

  return (
    <div className="h-full min-h-[60vh] flex flex-col">
      <div className="flex items-center justify-between p-2 border-b bg-card rounded-t-lg">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled><ChevronLeft /></Button>
          <span className="text-sm">Page 1 of 1</span>
          <Button variant="ghost" size="icon" disabled><ChevronRight /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled><ZoomOut /></Button>
          <span className="text-sm">100%</span>
          <Button variant="ghost" size="icon" disabled><ZoomIn /></Button>
        </div>
      </div>
      <div className="flex-grow p-4 bg-muted/30 flex items-center justify-center overflow-auto rounded-b-lg">
        <div className="text-center text-muted-foreground">
          <p className="font-semibold">PDF viewer placeholder</p>
          <p>Displaying: {file.name}</p>
          <p className="text-xs mt-2">(A real implementation would use pdf.js or an iframe)</p>
        </div>
      </div>
    </div>
  );
}
