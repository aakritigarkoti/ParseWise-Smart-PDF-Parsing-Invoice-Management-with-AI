
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { extractInvoiceData, ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceStore } from '@/hooks/use-invoice-store';
import type { Invoice } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, FileText, Bot } from 'lucide-react';

import PdfViewer from '@/components/pdf-viewer';
import InvoiceForm from '@/components/invoice-form';

type AiModel = 'gemini' | 'groq';
type ExtractionStatus = 'idle' | 'extracting' | 'success' | 'error';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { getInvoiceById, isInitialized } = useInvoiceStore();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [selectedAiModel, setSelectedAiModel] = useState<AiModel>('gemini');
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>('idle');
  const [extractedData, setExtractedData] = useState<ExtractInvoiceDataOutput | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  const editId = searchParams.get('edit');

  useEffect(() => {
    if (isInitialized && editId) {
      const invoiceToEdit = getInvoiceById(editId);
      if (invoiceToEdit) {
        setCurrentInvoice(invoiceToEdit);
        setPdfFile(new File([], invoiceToEdit.pdfFileName, { type: 'application/pdf' }));
        setPdfDataUri(invoiceToEdit.pdfDataUri || null);
        setExtractedData({
          vendor: invoiceToEdit.vendor,
          invoiceNumber: invoiceToEdit.invoiceNumber,
          lineItems: invoiceToEdit.lineItems,
          totals: invoiceToEdit.totalAmount,
        });
        setExtractionStatus('success');
      } else {
        toast({
          title: 'Error',
          description: 'Invoice not found.',
          variant: 'destructive',
        });
        router.push('/');
      }
    }
  }, [editId, getInvoiceById, isInitialized, router, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a PDF smaller than 25MB.',
          variant: 'destructive',
        });
        return;
      }
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
        return;
      }

      router.push('/');
      setPdfFile(file);
      setCurrentInvoice(null);
      setExtractedData(null);
      setExtractionStatus('idle');

      const reader = new FileReader();
      reader.onload = (e) => setPdfDataUri(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!pdfDataUri) {
      toast({
        title: 'No PDF selected',
        description: 'Please upload a PDF to extract data.',
        variant: 'destructive',
      });
      return;
    }

    setExtractionStatus('extracting');
    try {
      const result = await extractInvoiceData({
        pdfDataUri: pdfDataUri,
        modelName: selectedAiModel,
      });
      setExtractedData(result);
      setExtractionStatus('success');
      toast({
        title: 'Extraction Successful',
        description: 'Invoice data has been extracted.',
      });
    } catch (error) {
      console.error(error);
      setExtractionStatus('error');
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract data from the PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const showExtractionUI = !editId;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col gap-4 lg:h-[80vh]">
          <Card className="flex-grow flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" />
                PDF Viewer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <PdfViewer file={pdfFile} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {showExtractionUI && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="text-primary" />
                  AI Extraction
                </CardTitle>
                <CardDescription>Upload an invoice to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          {pdfFile ? pdfFile.name : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF (MAX. 25MB)</p>
                      </div>
                      <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Choose AI Model</Label>
                  <RadioGroup defaultValue="gemini" value={selectedAiModel} onValueChange={(value: AiModel) => setSelectedAiModel(value)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gemini" id="gemini" />
                      <Label htmlFor="gemini">Gemini</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="groq" id="groq" />
                      <Label htmlFor="groq">Groq</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button onClick={handleExtract} disabled={!pdfFile || extractionStatus === 'extracting'} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {extractionStatus === 'extracting' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    'Extract with AI'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {extractionStatus === 'success' && extractedData && pdfFile && pdfDataUri && (
            <InvoiceForm
              initialData={extractedData}
              pdfFileName={pdfFile.name}
              pdfDataUri={pdfDataUri}
              invoiceId={currentInvoice?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
