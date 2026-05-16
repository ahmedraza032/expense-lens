import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Ensure 'receipts' bucket exists (using admin client if possible)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      )
      
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === 'receipts')
      
      if (!bucketExists) {
        const { error: createError } = await supabaseAdmin.storage.createBucket('receipts', {
          public: false,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          fileSizeLimit: 5242880 // 5MB
        })
        if (createError) {
          console.error('Failed to create bucket:', createError)
        }
      }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert File to ArrayBuffer for more reliable upload in Node.js
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload file to storage',
        details: uploadError.message
      }, { status: 500 })
    }

    // Get public URL (or signed URL depending on your setup)
    // Assuming 'receipts' is a private bucket, we will just store the path and use signed URLs later
    // or if it's public: supabase.storage.from('receipts').getPublicUrl(filePath).data.publicUrl
    // Let's store just the filePath in the DB to generate signed URLs later
    
    // Create receipt record
    const { data: receipt, error: dbError } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        file_url: filePath,
        file_name: file.name,
        status: 'processing'
      })
      .select()
      .single()

    if (dbError || !receipt) {
      console.error('DB error:', dbError)
      return NextResponse.json({ 
        error: 'Failed to create receipt record',
        details: dbError?.message || 'Database insert failed'
      }, { status: 500 })
    }

    // Trigger AI processing asynchronously (fire and forget)
    // We fetch our own /api/process endpoint without awaiting its completion
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    fetch(`${appUrl}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptId: receipt.id, filePath })
    }).catch(err => console.error('Failed to trigger process:', err))

    return NextResponse.json({ receiptId: receipt.id })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
