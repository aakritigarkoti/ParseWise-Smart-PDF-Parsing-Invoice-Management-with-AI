
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceStore } from '@/hooks/use-invoice-store';
import { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { format } from 'date-fns';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});

const formSchema = z.object({
  vendor: z.string().min(1, 'Vendor name is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  lineItems: z.array(lineItemSchema),
  totalAmount: z.coerce.number().min(0, 'Total must be a positive number'),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  initialData: ExtractInvoiceDataOutput;
  pdfFileName: string;
  pdfDataUri: string;
  invoiceId?: string | null;
}

export default function InvoiceForm({ initialData, pdfFileName, pdfDataUri, invoiceId }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addInvoice, updateInvoice, getInvoiceById } = useInvoiceStore();
  
  const existingInvoice = invoiceId ? getInvoiceById(invoiceId) : null;

  const defaultValues: Partial<InvoiceFormValues> = {
    vendor: initialData.vendor,
    invoiceNumber: initialData.invoiceNumber,
    invoiceDate: existingInvoice?.invoiceDate ? format(new Date(existingInvoice.invoiceDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    lineItems: initialData.lineItems.map(item => ({...item, description: item.description || ''})),
    totalAmount: initialData.totals,
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const onSubmit = (data: InvoiceFormValues) => {
    const invoiceData = {
      ...data,
      pdfFileName,
      pdfDataUri,
    };

    try {
      if (invoiceId) {
        const currentInvoice = getInvoiceById(invoiceId);
        if (currentInvoice) {
          updateInvoice({ ...currentInvoice, ...invoiceData });
          toast({ title: 'Invoice Updated', description: 'Your invoice has been successfully updated.' });
        }
      } else {
        addInvoice(invoiceData);
        toast({ title: 'Invoice Saved', description: 'Your invoice has been successfully saved.' });
      }
      router.push('/invoices');
    } catch(e) {
      console.error(e);
      toast({ title: 'Save Failed', description: 'Could not save invoice. Data might be too large.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Review and edit the extracted data before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-lg font-medium mb-2">Line Items</h3>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start p-2 border rounded-lg bg-muted/20">
                    <div className="grid grid-cols-4 gap-2 flex-grow">
                        <FormField control={form.control} name={`lineItems.${index}.description`} render={({ field }) => (<FormItem className="col-span-4"><FormLabel className="text-xs">Description</FormLabel><FormControl><Input placeholder="Item description" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name={`lineItems.${index}.quantity`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Qty</FormLabel><FormControl><Input type="number" step="any" placeholder="1" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name={`lineItems.${index}.unitPrice`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Unit Price</FormLabel><FormControl><Input type="number" step="any" placeholder="0.00" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name={`lineItems.${index}.amount`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Amount</FormLabel><FormControl><Input type="number" step="any" placeholder="0.00" {...field} /></FormControl></FormItem>)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0, amount: 0 })} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? 'Saving...' : (invoiceId ? 'Update Invoice' : 'Save Invoice')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
