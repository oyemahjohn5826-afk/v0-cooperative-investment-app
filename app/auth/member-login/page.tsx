"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      // Sync server cookies for SSR
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (session) {
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
          cache: "no-store",
        })
      }

      // Fetch profile and route
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("No user detected after sign-in")
        setIsLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single()

      const role = (profile?.role || "").toString().toLowerCase()
      const status = (profile?.status || "").toString().toLowerCase()

      if (role === "admin") {
        // If someone used the member login but the account is admin, send to admin
        toast.success("Welcome back, Admin")
        router.push("/admin")
        router.refresh()
        return
      }

      if (status === "approved") {
        toast.success("Welcome back")
        router.push("/dashboard")
        router.refresh()
        return
      }

      if (status === "suspended") {
        toast.error("Your account is suspended")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      // otherwise pending or other status
      router.push("/auth/pending")
      router.refresh()
    } catch (err: any) {
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