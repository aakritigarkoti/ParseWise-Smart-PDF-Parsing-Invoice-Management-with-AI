'use server';

/**
 * @fileOverview An AI agent that suggests improvements to extracted invoice data by cross-referencing public data sources.
 *
 * - suggestInvoiceImprovements - A function that handles the suggestion of invoice data improvements.
 * - SuggestInvoiceImprovementsInput - The input type for the suggestInvoiceImprovements function.
 * - SuggestInvoiceImprovementsOutput - The return type for the suggestInvoiceImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInvoiceImprovementsInputSchema = z.object({
  vendor: z.string().describe('The name of the vendor.'),
  invoiceNumber: z.string().describe('The invoice number.'),
  invoiceDate: z.string().describe('The invoice date.'),
  lineItems: z.array(
    z.object({
      description: z.string().describe('The description of the line item.'),
      amount: z.number().describe('The amount of the line item.'),
    })
  ).describe('The line items of the invoice.'),
  totalAmount: z.number().describe('The total amount of the invoice.'),
});
export type SuggestInvoiceImprovementsInput = z.infer<typeof SuggestInvoiceImprovementsInputSchema>;

const SuggestInvoiceImprovementsOutputSchema = z.object({
  vendor: z.string().describe('The suggested improvement for the vendor name.'),
  invoiceNumber: z.string().describe('The suggested improvement for the invoice number.'),
  invoiceDate: z.string().describe('The suggested improvement for the invoice date.'),
  lineItems: z.array(
    z.object({
      description: z.string().describe('The suggested improvement for the description of the line item.'),
      amount: z.number().describe('The suggested improvement for the amount of the line item.'),
    })
  ).describe('The suggested improvements for the line items of the invoice.'),
  totalAmount: z.number().describe('The suggested improvement for the total amount of the invoice.'),
  confidence: z.number().describe('The confidence level (0-1) that the suggested improvements are correct.'),
});
export type SuggestInvoiceImprovementsOutput = z.infer<typeof SuggestInvoiceImprovementsOutputSchema>;

export async function suggestInvoiceImprovements(input: SuggestInvoiceImprovementsInput): Promise<SuggestInvoiceImprovementsOutput> {
  return suggestInvoiceImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInvoiceImprovementsPrompt',
  input: {schema: SuggestInvoiceImprovementsInputSchema},
  output: {schema: SuggestInvoiceImprovementsOutputSchema},
  prompt: `You are an expert in invoice data validation and improvement.

  You will receive extracted invoice data and cross-reference it with public data sources to identify potential errors or inconsistencies.
  You will suggest improvements to the data where necessary, and provide a confidence level (0-1) for each suggestion.

  Here is the extracted invoice data:

  Vendor: {{{vendor}}}
  Invoice Number: {{{invoiceNumber}}}
  Invoice Date: {{{invoiceDate}}}
  Line Items:
  {{#each lineItems}}
  - Description: {{{description}}}, Amount: {{{amount}}}
  {{/each}}
  Total Amount: {{{totalAmount}}}

  Provide the suggested improvements, if any, and the confidence level for each suggestion.
  If no improvements are needed, return the original value with a confidence of 1.
  `,
});

const suggestInvoiceImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestInvoiceImprovementsFlow',
    inputSchema: SuggestInvoiceImprovementsInputSchema,
    outputSchema: SuggestInvoiceImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
