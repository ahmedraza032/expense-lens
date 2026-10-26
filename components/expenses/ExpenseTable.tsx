"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StructuredExpense } from "@/lib/ai/llm/interface";
import Link from "next/link";
import { format } from "date-fns";
import { Receipt, Eye, Sparkles, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ExpenseTableProps {
  expenses: (StructuredExpense & { id: string; created_at?: string | null })[];
  onDelete?: (id: string) => void;
}

export function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        alert("Failed to delete expense");
      } else {
        onDelete?.(id);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-8">
        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
          <Receipt className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No expenses found
        </h3>
        <p className="text-slate-500 mb-8 max-w-[300px] font-medium">
          Try adjusting your filters or upload a new receipt to get started.
        </p>
        <Link href="/upload">
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 h-11 px-8 font-bold shadow-lg shadow-blue-600/20">
            Upload Receipt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="hover:bg-transparent border-slate-100">
          <TableHead className="py-4 px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
            Added
          </TableHead>
          <TableHead className="py-4 px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
            Merchant
          </TableHead>
          <TableHead className="py-4 px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
            Category
          </TableHead>
          <TableHead className="py-4 px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">
            Amount
          </TableHead>
          <TableHead className="w-[100px] py-4 px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow
            key={expense.id}
            className="hover:bg-slate-50/50 border-slate-50 group transition-colors"
          >
            <TableCell className="py-5 px-8 font-semibold text-slate-500">
              {expense.created_at
                ? format(new Date(expense.created_at), "MMM d, yyyy")
                : "Unknown"}
            </TableCell>
            <TableCell className="py-5 px-8 font-bold text-slate-900">
              {expense.merchant || "Unknown Merchant"}
            </TableCell>
            <TableCell className="py-5 px-8">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter bg-blue-50 text-blue-600 border border-blue-100/50">
                {expense.category}
              </span>
            </TableCell>
            <TableCell className="py-5 px-8 text-right">
              <div className="flex flex-col items-end">
                <span className="font-black text-slate-900">
                  {expense.amount !== null
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: expense.currency || "USD",
                      }).format(expense.amount)
                    : "-"}
                </span>
                <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI Extracted
                </div>
              </div>
            </TableCell>
            <TableCell className="py-5 px-8">
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/expenses/${expense.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                >
                  {deletingId === expense.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
