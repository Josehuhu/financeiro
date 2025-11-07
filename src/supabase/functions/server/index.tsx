import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Get all transactions
app.get('/make-server-4acf5479/transactions', async (c) => {
  try {
    const transactions = await kv.getByPrefix('transaction:');
    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.log('Error fetching transactions:', error);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

// Get all installments
app.get('/make-server-4acf5479/installments', async (c) => {
  try {
    const installments = await kv.getByPrefix('installment:');
    return c.json({ installments: installments || [] });
  } catch (error) {
    console.log('Error fetching installments:', error);
    return c.json({ error: 'Failed to fetch installments' }, 500);
  }
});

// Create transaction
app.post('/make-server-4acf5479/transactions', async (c) => {
  try {
    const body = await c.req.json();
    const { transaction, installments } = body;

    // Save transaction
    await kv.set(`transaction:${transaction.id}`, transaction);

    // Save installments
    if (installments && installments.length > 0) {
      const installmentPromises = installments.map((inst: any) =>
        kv.set(`installment:${inst.id}`, inst)
      );
      await Promise.all(installmentPromises);
    }

    return c.json({ success: true, transaction });
  } catch (error) {
    console.log('Error creating transaction:', error);
    return c.json({ error: 'Failed to create transaction' }, 500);
  }
});

// Update transaction
app.put('/make-server-4acf5479/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { transaction, installments } = body;

    // Update transaction
    await kv.set(`transaction:${id}`, transaction);

    // Delete old installments
    const oldInstallments = await kv.getByPrefix(`installment:`);
    const deletePromises = oldInstallments
      .filter((inst: any) => inst.transactionId === id)
      .map((inst: any) => kv.del(`installment:${inst.id}`));
    await Promise.all(deletePromises);

    // Save new installments
    if (installments && installments.length > 0) {
      const installmentPromises = installments.map((inst: any) =>
        kv.set(`installment:${inst.id}`, inst)
      );
      await Promise.all(installmentPromises);
    }

    return c.json({ success: true, transaction });
  } catch (error) {
    console.log('Error updating transaction:', error);
    return c.json({ error: 'Failed to update transaction' }, 500);
  }
});

// Delete transaction
app.delete('/make-server-4acf5479/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Delete transaction
    await kv.del(`transaction:${id}`);

    // Delete all installments
    const installments = await kv.getByPrefix('installment:');
    const deletePromises = installments
      .filter((inst: any) => inst.transactionId === id)
      .map((inst: any) => kv.del(`installment:${inst.id}`));
    await Promise.all(deletePromises);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting transaction:', error);
    return c.json({ error: 'Failed to delete transaction' }, 500);
  }
});

// Update installment (mark as paid/unpaid)
app.patch('/make-server-4acf5479/installments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const installment = await kv.get(`installment:${id}`);
    if (!installment) {
      return c.json({ error: 'Installment not found' }, 404);
    }

    const updated = { ...installment, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`installment:${id}`, updated);

    return c.json({ success: true, installment: updated });
  } catch (error) {
    console.log('Error updating installment:', error);
    return c.json({ error: 'Failed to update installment' }, 500);
  }
});

// Create installment (for next installment after payment)
app.post('/make-server-4acf5479/installments', async (c) => {
  try {
    const installment = await c.req.json();
    await kv.set(`installment:${installment.id}`, installment);
    return c.json({ success: true, installment });
  } catch (error) {
    console.log('Error creating installment:', error);
    return c.json({ error: 'Failed to create installment' }, 500);
  }
});

Deno.serve(app.fetch);
