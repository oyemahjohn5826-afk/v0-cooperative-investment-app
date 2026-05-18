import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { AdminLedger } from "@/components/admin/admin-ledger"

export const metadata: Metadata = {
  title: "Monthly Ledger | Admin - Epicenter Cooperative Society",
  description: "View and manage monthly member transaction ledger.",
}

export default async function AdminLedgerPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, status")
    .eq("role", "member")
    .order("full_name")

  return <AdminLedger members={members || []} />
}