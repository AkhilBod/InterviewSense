import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ChevronLeft, ArrowRight } from "lucide-react"
import JobRoleSelect from "./components/job-role-select"

export default function StartPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <Link href="/">
                        InterviewSense
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 py-12 md:py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full"
            >
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
              <CardHeader className="text-center relative z-10 pt-10">
                <CardTitle className="text-2xl md:text-3xl font-bold">Prepare for Your Interview</CardTitle>
                <CardDescription className="text-base mt-3 text-zinc-400">
                  Select the job role you're interviewing for to get started with a tailored mock interview experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 px-6 md:px-10">
                <JobRoleSelect />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pb-10 relative z-10 px-6 md:px-10">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6" size="lg" asChild>
                  <Link href="/interview" className="flex items-center justify-center">
                    Start Mock Interview
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-zinc-400 text-center">
                  We'll create a personalized interview based on the job role you selected.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-white">InterviewSense</span>
            </div>
            <p className="text-sm text-zinc-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
