'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Download, Trash2, User, Wallet, ShieldAlert, BadgeCheck, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'PKR', label: 'PKR (₨)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
]

type Profile = {
  id: string
  email: string
  currency: string
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [userMetadata, setUserMetadata] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setUserMetadata(user.user_metadata)

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileData) {
            setProfile(profileData)
            setCurrency(profileData.currency || 'USD')
          } else {
            setProfile({
              id: user.id,
              email: user.email || '',
              currency: 'USD',
              created_at: user.created_at || new Date().toISOString(),
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency)
    if (!profile) return

    setSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', profile.id)
    } catch (error) {
      console.error('Failed to update currency:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (!expenses || expenses.length === 0) {
        alert('No expenses to export')
        return
      }

      const csvHeaders = ['Date', 'Merchant', 'Amount', 'Currency', 'Category']
      const csvRows = expenses.map((exp) => [
        exp.date || '',
        exp.merchant || '',
        exp.amount || '',
        exp.currency || 'USD',
        exp.category || '',
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmEmail !== (profile?.email || userMetadata?.email)) return

    setDeleting(true)
    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' })
      if (response.ok) {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
      } else {
        alert('Failed to delete account. Please try again.')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center min-h-[400px]">
        <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.1 } }
      }}
      className="flex flex-col gap-8 max-w-2xl mx-auto w-full"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your account and preferences.</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pt-8 px-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Account Profile</CardTitle>
                        <CardDescription className="font-medium">Your personal details</CardDescription>
                    </div>
                    <div className="ml-auto px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <Mail className="h-3 w-3" />
                            Email Address
                        </Label>
                        <p className="text-slate-900 font-bold">{profile?.email || userMetadata?.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <Calendar className="h-3 w-3" />
                            Member Since
                        </Label>
                        <p className="text-slate-900 font-bold">
                        {profile?.created_at
                            ? format(new Date(profile.created_at), 'MMMM d, yyyy')
                            : 'N/A'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </motion.div>

      {/* Preferences Section */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pt-8 px-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Preferences</CardTitle>
                        <CardDescription className="font-medium">Customize your workspace</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Display Currency</Label>
                    <div className="flex items-center gap-4">
                        <Select value={currency} onValueChange={(v) => v && handleCurrencyChange(v)}>
                        <SelectTrigger className="w-48 h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-slate-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value} className="font-medium">
                                {c.label}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        {saving && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Saving...
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
      </motion.div>

      {/* Data Section */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pt-8 px-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                        <Download className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Data & Export</CardTitle>
                        <CardDescription className="font-medium">Manage your information</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-slate-900">Export History</p>
                        <p className="text-sm font-medium text-slate-400 mt-1">Download all your expenses as a CSV file</p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={handleExportCSV} 
                        disabled={exporting}
                        className="h-11 px-6 rounded-full font-bold border-slate-200 hover:bg-slate-50 gap-2 shadow-sm"
                    >
                        {exporting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export CSV
                    </Button>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div>
                        <p className="font-bold text-rose-600">Delete Account</p>
                        <p className="text-sm font-medium text-slate-400 mt-1">Permanently remove all your data</p>
                    </div>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-11 px-6 rounded-full font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[32px] border-none shadow-2xl p-0 overflow-hidden max-w-md">
                            <div className="bg-rose-50 p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 mb-6">
                                    <ShieldAlert className="h-8 w-8" />
                                </div>
                                <DialogTitle className="text-2xl font-bold text-slate-900">Wait, are you sure?</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium mt-2">
                                    This action is irreversible. All your scanned receipts and spending history will be permanently deleted.
                                </DialogDescription>
                            </div>
                            <div className="p-8 space-y-6 bg-white">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                        Type your email to confirm: <span className="text-slate-900 lowercase">{profile?.email || userMetadata?.email}</span>
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="Confirm email address"
                                        value={confirmEmail}
                                        onChange={(e) => setConfirmEmail(e.target.value)}
                                        className="h-11 rounded-2xl border-slate-200 focus:ring-rose-600 focus:border-rose-600 bg-slate-50/50"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1 h-12 rounded-full font-bold border-slate-200">
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={confirmEmail !== (profile?.email || userMetadata?.email) || deleting}
                                        className="flex-1 h-12 rounded-full font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 gap-2"
                                    >
                                        {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Delete Forever
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}