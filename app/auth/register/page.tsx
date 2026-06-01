"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, UserPlus } from "lucide-react"
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
  full_name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // 1) Create the auth user via Supabase
      // Using signUp (Supabase may auto sign-in or require email confirmation depending on settings)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (signUpError) {
        toast.error(signUpError.message)
        setIsLoading(false)
        return
      }

      // signUpData may contain user and possibly a session depending on project settings
      const session = signUpData?.session ?? null
      const user = signUpData?.user ?? null

      // 2) Create profile via server service route
      // Preferred: if we have a session.access_token, send it; otherwise send email for server to look up the auth user
      const registerPayload: any = {
        full_name: data.full_name,
        phone: data.phone ?? null,
      }

      if (session?.access_token) {
        registerPayload.access_token = session.access_token
      } else if (user?.email) {
        // Some Supabase settings do not return session immediately (email confirmation flow)
        registerPayload.email = user.email
      } else {
        // If nothing returned, fall back to sending email from form
        registerPayload.email = data.email
      }

      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload),
        cache: "no-store",
      })

      const registerJson = await registerRes.json().catch(() => null)

      if (!registerRes.ok) {
        console.error("register API error:", registerJson)
        toast.error("Failed to create member profile. Please contact support.")
        setIsLoading(false)
        return
      }

      // 3) If we have a session.access_token, call whoami to set SSR cookies (so pending page shows name)
      if (session?.access_token) {
        await fetch("/api/auth/whoami", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: session.access_token }),
          cache: "no-store",
        }).catch((e) => {
          // Non-fatal: still redirect to pending
          console.warn("whoami call failed:", e)
        })
      } else {
        // If no session (email confirmation flow) the whoami step can't run.
        // Server created the profile using email lookup; we still route to pending and instruct user to check email.
      }

      // 4) Redirect the user to the pending page
      toast.success("Registration received — your account is awaiting approval.")
      router.push("/auth/pending")
      router.refresh()
    } catch (err: any) {
      console.error("Registration error:", err)
      toast.error("Registration failed. Try again or contact support.")
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
            <CardTitle className="text-2xl font-bold">Become a Member</CardTitle>
            <CardDescription>Register to join Epicenter Cooperative Society</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" {...register("phone")} />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</> : <><UserPlus className="mr-2 h-4 w-4" />Register</>}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <p>Already a member? <a href="/auth/member-login" className="text-gold hover:underline">Sign in</a></p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">© {new Date().getFullYear()} Epicenter Cooperative Society</p>
      </div>
    </div>
  )
}