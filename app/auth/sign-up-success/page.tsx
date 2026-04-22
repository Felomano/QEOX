import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-purple">
              <span className="text-sm font-bold text-foreground">Q</span>
            </div>
            <span className="text-xl font-bold text-foreground">QNEX</span>
          </Link>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">
                Thank you for signing up!
              </CardTitle>
              <CardDescription className="text-muted-foreground">Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-block text-sm text-neon underline underline-offset-4 hover:text-neon/80"
              >
                Back to login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
