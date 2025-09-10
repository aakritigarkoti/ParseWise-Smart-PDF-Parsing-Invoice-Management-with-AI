
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice } from '@/lib/types';

const INVOICE_STORAGE_KEY = 'parsewise-invoices';

export function useInvoiceStore() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem(INVOICE_STORAGE_KEY);
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error("Failed to parse invoices from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
      } catch (error) {
        console.error("Failed to save invoices to localStorage", error);
      }
    }
  }, [invoices, isInitialized]);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  }, []);

  const getInvoiceById = useCallback((id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  }, [invoices]);

  const updateInvoice = useCallback((updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
    return updatedInvoice;
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  }, []);

  return {
    invoices,
    isInitialized,
    addInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
  };
}
