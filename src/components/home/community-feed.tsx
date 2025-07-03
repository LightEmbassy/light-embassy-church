import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share } from "lucide-react"

export function CommunityFeed() {
  const posts = [
    {
      id: 1,
      author: "Pastor Michael",
      avatar: "PM",
      time: "2 hours ago",
      content: "Grateful for our amazing worship team today! The presence of God was so powerful during service. 🙏",
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      author: "Sarah Johnson",
      avatar: "SJ", 
      time: "4 hours ago",
      content: "Thank you for all the prayers during my healing journey. God is faithful! Feeling so blessed by this community. ❤️",
      likes: 18,
      comments: 12
    },
    {
      id: 3,
      author: "Light Embassy Youth",
      avatar: "LY",
      time: "6 hours ago", 
      content: "Youth night was incredible! So many young hearts touched by God's love. Next Friday 7PM - see you there! 🔥",
      likes: 31,
      comments: 15
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-playfair text-2xl font-semibold text-foreground">
        Community
      </h2>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="border-0 shadow-gentle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {post.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-inter font-medium text-foreground">{post.author}</h4>
                  <p className="text-sm text-muted-foreground">{post.time}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed font-inter">
                {post.content}
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-divine">
                  <Heart className="mr-2 h-4 w-4" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-divine">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-divine">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}