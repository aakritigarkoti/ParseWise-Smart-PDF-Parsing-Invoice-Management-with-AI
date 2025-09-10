
import InvoiceListClient from '@/components/invoice-list-client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { List } from 'lucide-react';
import { Suspense } from 'react';

export default function InvoicesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="text-primary" />
            Saved Invoices
          </CardTitle>
          <CardDescription>
            Browse, search, and manage your saved invoices.
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<p className="p-6">Loading invoices...</p>}>
          <InvoiceListClient />
        </Suspense>
      </Card>
    </div>
  );
}
