
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoOff } from 'lucide-react';

export default function VideoManagement() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <VideoOff className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-muted-foreground" /> Video Management
        </CardTitle>
        <CardDescription>The video reels feature has been removed from the application. This management section is currently disabled.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-10">
        <p className="text-muted-foreground">Video management is not available as the video page has been removed.</p>
      </CardContent>
    </Card>
  );
}
