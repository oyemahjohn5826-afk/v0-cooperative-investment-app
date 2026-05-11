import Link from "next/link"
import { Metadata } from "next"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "Registration Successful | Epicenter Cooperative Society",
  description: "Your registration is complete. Please check your email to verify your account.",
}

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-epic-black flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        <Card className="card-gold bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-epic-black" />
            </div>

            <h1 className="text-2xl font-bold text-epic-black mb-4">
              Registration Successful!
            </h1>

            <p className="text-muted-foreground mb-6">
              Thank you for joining Epicenter Cooperative Society. 
              We have sent a verification email to your inbox.
            </p>

            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 justify-center text-sm">
                <Mail className="w-5 h-5 text-gold" />
                <span className="text-muted-foreground">
                  Please check your email and click the verification link
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">What happens next?</strong>
              </p>
              <ol className="text-left space-y-2 list-decimal list-inside">
                <li>Verify your email by clicking the link we sent</li>
                <li>Wait for admin approval of your membership</li>
                <li>Once approved, you can log in and start investing</li>
              </ol>
            </div>

            <div className="mt-8 space-y-3">
              <Button 
                asChild 
                className="w-full bg-gold hover:bg-gold-dark text-epic-black font-semibold"
              >
                <Link href="/auth/login">
                  Go to Login
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                asChild 
                className="w-full"
              >
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-white/50">
          &copy; {new Date().getFullYear()} Epicenter Cooperative Society
        </p>
      </div>
    </div>
  )
}
