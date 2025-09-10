// The directive tells the Next.js runtime that this code should only be executed on the server side.
'use server';

/**
 * @fileOverview Extracts invoice data from a PDF using AI.
 *
 * - extractInvoiceData - A function that handles the invoice data extraction process.
 * - ExtractInvoiceDataInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceDataOutput - The return type for the extractInvoiceData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInvoiceDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF invoice data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  modelName: z.enum(['gemini', 'groq']).default('gemini').describe('The AI model to use for extraction (Gemini or Groq).'),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const ExtractInvoiceDataOutputSchema = z.object({
  vendor: z.string().describe('The name of the vendor.'),
  invoiceNumber: z.string().describe('The invoice number.'),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe('Description of the item.'),
        quantity: z.number().describe('Quantity of the item.'),
        unitPrice: z.number().describe('Unit price of the item.'),
        amount: z.number().describe('Total amount for the line item.'),
      })
    )
    .describe('Array of line items in the invoice.'),
  totals: z.number().describe('The total amount due on the invoice.'),
});
export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;

export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}

const extractInvoiceDataPrompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: {schema: ExtractInvoiceDataInputSchema},
  output: {schema: ExtractInvoiceDataOutputSchema},
  prompt: `You are an expert in extracting data from invoices. Your task is to extract the following information from the invoice provided as a PDF: vendor, invoice number, line items (description, quantity, unit price, amount), and totals. The model to use is: {{{modelName}}}.

   Return the data in JSON format.

   Here is the invoice data:
   {{media url=pdfDataUri}}
  `,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async input => {
    const {output} = await extractInvoiceDataPrompt(input);
    return output!;
  }
);
