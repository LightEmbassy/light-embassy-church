import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuizManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-foreground">
            Quiz Management
          </h2>
          <p className="text-muted-foreground">
            Manage signup quiz questions and responses
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Quiz Management</h3>
          <p className="text-muted-foreground mb-4">
            Quiz functionality is in development. This will allow you to manage signup quiz questions and track user responses.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold">0%</p>
              <p className="text-sm text-muted-foreground">Users Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}