import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ApiKeyAlert() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Key Error</AlertTitle>
      <AlertDescription>
        Your RealDebrid API key has expired or is invalid. Playback of movies and tv will not work as intended.
      </AlertDescription>
    </Alert>
  )
}

