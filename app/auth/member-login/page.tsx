"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof schema>

export default function MemberLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      const session = signInData?.session

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      if (!session) {
        toast.error("No session returned after sign-in")
        setIsLoading(false)
        return
      }

      // Set SSR cookies via whoami, then route using its AUTHORITATIVE response.
      // We navigate only after the response is fully parsed so the ec_* cookies
      // are applied in the browser before the /dashboard (or /admin) guard reads them.
      const whoamiRes = await fetch("/api/auth/whoami", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: session.access_token }),
        cache: "no-store",
      })
      const whoamiJson = await whoamiRes.json().catch(() => ({ ok: false }))

      if (!whoamiJson?.ok || !whoamiJson?.profile) {
        toast.error("Login succeeded but profile lookup failed. Try again.")
        setIsLoading(false)
        return
      }

      const role = String(whoamiJson.profile.role || "").toLowerCase()
      const status = String(whoamiJson.profile.status || "").toLowerCase()

      if (role === "admin") {
        toast.success("Welcome back, Admin")
        window.location.href = "/admin"
        return
      }

      if (status === "approved") {
        toast.success("Welcome back")
        window.location.href = "/dashboard"
        return
      }

      if (status === "suspended") {
        toast.error("Your account is suspended")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      // otherwise pending or other status
      window.location.href = "/auth/pending"
    } catch (err: unknown) {
      console.error("Member login error:", err)
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6"><Logo /></div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Member Sign In</CardTitle>
            <CardDescription>Access your member dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <><LogIn className="mr-2 h-4 w-4" />Sign In</>}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <p>Not a member? <Link href="/auth/register" className="text-gold hover:underline">Become a member</Link></p>
              <p className="mt-2">Are you an admin? <Link href="/auth/admin-login" className="text-gold hover:underline">Admin sign in</Link></p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">© {new Date().getFullYear()} Epicenter</p>
      </div>
    </div>
  )
}