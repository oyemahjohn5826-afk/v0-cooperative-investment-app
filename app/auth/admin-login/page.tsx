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
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

async function clearAppCookies() {
  try {
    await fetch("/api/auth/logout", { method: "POST", cache: "no-store" })
  } catch {
    // ignore
  }
}

export default function MemberLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        toast.error(signInError.message)
        setIsLoading(false)
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session?.access_token) {
        toast.error("Unable to read session after sign in.")
        setIsLoading(false)
        return
      }

      const whoamiRes = await fetch("/api/auth/whoami", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: session.access_token,
        }),
        cache: "no-store",
      })

      const whoamiJson = await whoamiRes.json().catch(() => null)

      if (!whoamiRes.ok) {
        console.error("whoami error:", whoamiJson)
        toast.error("Could not verify your account.")
        await supabase.auth.signOut()
        await clearAppCookies()
        setIsLoading(false)
        return
      }

      const profile = whoamiJson?.profile
      const role = (profile?.role || "").toString().toLowerCase()
      const status = (profile?.status || "").toString().toLowerCase()

      if (role === "admin") {
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
        toast.error("Your account is suspended.")
        await supabase.auth.signOut()
        await clearAppCookies()
        setIsLoading(false)
        return
      }

      router.push("/auth/pending")
      router.refresh()
    } catch (err) {
      console.error("Member login error:", err)
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Member Sign In</CardTitle>
            <CardDescription>Access your member dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-epic-black"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Not a member?{" "}
                <Link
                  href="/auth/register"
                  className="text-gold hover:underline font-medium"
                >
                  Become a member
                </Link>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Are you an admin?{" "}
                <Link
                  href="/auth/admin-login"
                  className="text-gold hover:underline font-medium"
                >
                  Admin sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} Epicenter Cooperative Society
        </p>
      </div>
    </div>
  )
}