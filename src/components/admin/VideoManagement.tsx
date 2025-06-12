
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { type Video as PrismaVideo } from '@/lib/dbUtils'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, Video as VideoIconLucide, Link as LinkIcon, Loader2 } from 'lucide-react'; // Renamed VideoIcon to VideoIconLucide
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { serverGetVideos, serverAddVideo, serverUpdateVideo, serverDeleteVideo } from '@/actions/adminDataActions'; // Use Server Actions
import { Label } from '../ui/label';

const VideoForm = ({
  video,
  onSubmit,
  onCancel,
  isSubmitting
}: {
  video?: PrismaVideo,
  onSubmit: (data: Omit<PrismaVideo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>,
  onCancel: () => void,
  isSubmitting: boolean
}) => {
  const [title, setTitle] = useState(video?.title || '');
  const [description, setDescription] = useState(video?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnailUrl || 'https://placehold.co/360x640.png');
  const [embedUrl, setEmbedUrl] = useState(video?.embedUrl || '');
  const [dataAiHint, setDataAiHint] = useState(video?.dataAiHint || 'video content');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const videoData: Omit<PrismaVideo, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      description,
      thumbnailUrl,
      embedUrl,
      dataAiHint,
    };
    await onSubmit(videoData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[60vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting}/>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required disabled={isSubmitting}/>
          </div>
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL (for fallback)</Label>
            <Input id="thumbnailUrl" value={thumbnailUrl || ''} onChange={e => setThumbnailUrl(e.target.value)} disabled={isSubmitting}/>
            {thumbnailUrl && (
              <div className="mt-2 relative w-32 aspect-[9/16] border rounded overflow-hidden">
                <Image src={thumbnailUrl} alt="Thumbnail preview" layout="fill" objectFit="cover" />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="embedUrl">Video Embed URL (YouTube or TikTok)</Label>
            <div className="relative">
                <Input 
                    id="embedUrl" 
                    value={embedUrl || ''} 
                    onChange={e => setEmbedUrl(e.target.value)} 
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                    className="pl-8"
                    disabled={isSubmitting}
                    required // Embed URL is now required
                />
                <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enter the standard watch URL for YouTube or video URL for TikTok.</p>
          </div>
          <div>
            <Label htmlFor="dataAiHint">Thumbnail AI Hint (keywords)</Label>
            <Input id="dataAiHint" value={dataAiHint || ''} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. tech tutorial" disabled={isSubmitting}/>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {video ? 'Save Changes' : 'Add Video'}
        </Button>
      </DialogFooter>
    </form>
  );
};


export default function VideoManagement() {
  const [videos, setVideos] = useState<PrismaVideo[]>([]);
  const [editingVideo, setEditingVideo] = useState<PrismaVideo | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadVideos = async () => {
      setIsLoadingData(true);
      try {
        const dbVideos = await serverGetVideos(); 
        setVideos(dbVideos);
      } catch (error) {
        console.error("Error loading videos: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load videos."});
      }
      setIsLoadingData(false);
    };
    loadVideos();
  }, [toast]);

  const handleAddVideo = async (data: Omit<PrismaVideo, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmittingForm(true);
    try {
      const newVideo = await serverAddVideo(data); 
      setVideos(prev => [newVideo, ...prev].sort((a, b) => (new Date(b.createdAt!) as any) - (new Date(a.createdAt!) as any) || 0));
      closeForm();
      toast({ title: "Video Added", description: `${data.title} has been successfully added.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Adding Video", description: (error as Error).message || "Could not add video. Please try again."});
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditVideo = async (data: Omit<PrismaVideo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingVideo || !editingVideo.id) return;
    setIsSubmittingForm(true);
    try {
      const updatedVideo = await serverUpdateVideo(editingVideo.id, data); 
      setVideos(prev => prev.map(v => v.id === editingVideo.id ? updatedVideo : v).sort((a,b) => (new Date(b.createdAt!) as any) - (new Date(a.createdAt!) as any) || 0));
      closeForm();
      toast({ title: "Video Updated", description: `${data.title} has been successfully updated.` });
    } catch (error) {
       toast({ variant: "destructive", title: "Error Updating Video", description: (error as Error).message || "Could not update video. Please try again."});
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    const videoToDelete = videos.find(v => v.id === videoId);
    try {
      await serverDeleteVideo(videoId); 
      setVideos(prev => prev.filter(v => v.id !== videoId));
      toast({ title: "Video Deleted", description: `${videoToDelete?.title} has been deleted.`, variant: "destructive" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Deleting Video", description: (error as Error).message || "Could not delete video. Please try again."});
    }
  };

  const openForm = (video?: PrismaVideo) => {
    setEditingVideo(video ? JSON.parse(JSON.stringify(video)) : undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingVideo(undefined);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <VideoIconLucide className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Video Management
        </CardTitle>
        <CardDescription>Add, edit, or delete videos for the Reels feed using your Neon/Postgres database via Prisma. Provide YouTube or TikTok URLs for embedding.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Video
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl md:text-2xl">{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
                <DialogDescription>
                  {editingVideo ? 'Modify the details and embed URL of the existing video.' : 'Fill in the details and embed URL for the new video.'}
                </DialogDescription>
              </DialogHeader>
              <VideoForm
                video={editingVideo}
                onSubmit={editingVideo ? handleEditVideo : handleAddVideo}
                onCancel={closeForm}
                isSubmitting={isSubmittingForm}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoadingData ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading videos...</p>
          </div>
        ) : videos.length > 0 ? (
          <ul className="space-y-4">
            {videos.map(video => (
              <li key={video.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col gap-3 sm:flex-row sm:items-center shadow-sm hover:shadow-md transition-shadow">
                {video.thumbnailUrl && (
                  <div className="relative w-20 aspect-[9/16] sm:w-24 border rounded overflow-hidden shrink-0 bg-muted">
                    <Image src={video.thumbnailUrl} alt={video.title} layout="fill" objectFit="cover" data-ai-hint={video.dataAiHint || 'video thumbnail'} />
                  </div>
                )}
                <div className="flex-grow sm:ml-4">
                  <h3 className="font-semibold font-headline text-md md:text-lg">{video.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  {video.embedUrl && <p className="text-xs text-accent truncate">Embed: {video.embedUrl}</p>}
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto sm:items-center mt-2 sm:mt-0 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openForm(video)} className="w-full sm:w-auto hover:border-primary hover:text-primary">
                    <Edit3 className="mr-1 h-4 w-4" /> Edit
                  </Button>
                   <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xs">
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete the video "{video.title}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="pt-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="destructive" onClick={() => handleDeleteVideo(video.id)}>Delete Video</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">No videos found in your database. Add some!</p>
        )}
      </CardContent>
    </Card>
  );
}
