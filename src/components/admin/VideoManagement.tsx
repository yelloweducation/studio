
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import type { Video } from '@/lib/dbUtils'; // Using the localStorage-based Video type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, PlaySquare, Info, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
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
import { Label } from '../ui/label';
import { 
  serverGetVideos, 
  serverAddVideo, 
  serverUpdateVideo, 
  serverDeleteVideo 
} from '@/actions/adminDataActions';

const VideoForm = ({
  video,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  video?: Video,
  onSubmit: (data: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>,
  onCancel: () => void,
  isSubmitting: boolean,
}) => {
  const [title, setTitle] = useState(video?.title || '');
  const [description, setDescription] = useState(video?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnailUrl || 'https://placehold.co/360x640.png');
  const [embedUrl, setEmbedUrl] = useState(video?.embedUrl || '');
  const [dataAiHint, setDataAiHint] = useState(video?.dataAiHint || 'video content');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      description,
      thumbnailUrl: thumbnailUrl || null,
      embedUrl,
      dataAiHint: dataAiHint || null,
    };
    await onSubmit(videoData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="h-[60vh] sm:h-[70vh] pr-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-title">Video Title</Label>
            <Input id="video-title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="video-description">Description</Label>
            <Textarea id="video-description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} disabled={isSubmitting} />
          </div>
           <div>
            <Label htmlFor="video-embedUrl">Embed URL (YouTube, TikTok, Google Drive)</Label>
             <div className="relative">
                <Input id="video-embedUrl" value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." className="pl-8" disabled={isSubmitting}/>
                <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <Label htmlFor="video-thumbnailUrl">Thumbnail URL (Optional)</Label>
            <div className="relative">
                <Input id="video-thumbnailUrl" value={thumbnailUrl || ''} onChange={e => setThumbnailUrl(e.target.value)} className="pl-8" disabled={isSubmitting}/>
                <ImageIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {thumbnailUrl && (
              <div className="mt-2 relative w-32 aspect-[9/16] border rounded overflow-hidden bg-muted">
                <Image src={thumbnailUrl} alt="Thumbnail preview" layout="fill" objectFit="cover" key={thumbnailUrl}/>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="video-dataAiHint">Thumbnail AI Hint</Label>
             <div className="relative">
                <Input id="video-dataAiHint" value={dataAiHint || ''} onChange={e => setDataAiHint(e.target.value)} placeholder="e.g. coding tutorial" className="pl-8" disabled={isSubmitting}/>
                <Info className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {video ? 'Save Changes' : 'Add Video'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
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
        toast({ title: "Error Loading Videos", description: (error as Error).message || "Could not load videos.", variant: "destructive" });
      }
      setIsLoadingData(false);
    };
    loadVideos();
  }, [toast]);

  const handleAddVideo = async (data: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmittingForm(true);
    try {
      const newVideo = await serverAddVideo(data);
      setVideos(prev => [newVideo, ...prev].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      closeForm();
      toast({ title: "Video Added", description: `"${data.title}" has been successfully added.` });
    } catch (error) {
      toast({ title: "Error Adding Video", description: (error as Error).message || "Could not add video.", variant: "destructive" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditVideo = async (data: Partial<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!editingVideo || !editingVideo.id) return;
    setIsSubmittingForm(true);
    try {
      const updatedVideo = await serverUpdateVideo(editingVideo.id, data);
      setVideos(prev => prev.map(v => v.id === editingVideo.id ? updatedVideo : v).sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      closeForm();
      toast({ title: "Video Updated", description: `"${data.title}" has been successfully updated.` });
    } catch (error) {
      toast({ title: "Error Updating Video", description: (error as Error).message || "Could not update video.", variant: "destructive" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    const videoToDelete = videos.find(v => v.id === videoId);
    try {
      await serverDeleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      toast({ title: "Video Deleted", description: `"${videoToDelete?.title}" has been deleted.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Error Deleting Video", description: (error as Error).message || "Could not delete video.", variant: "destructive" });
    }
  };

  const openForm = (video?: Video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingVideo(undefined);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <PlaySquare className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Video Management
        </CardTitle>
        <CardDescription>Add, edit, or delete video reels. Videos are stored in localStorage.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-right">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) closeForm(); else setIsFormOpen(true);}}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Video
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="pb-4">
                <DialogTitle className="font-headline text-xl md:text-2xl">{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
                <DialogDescription>
                  {editingVideo ? 'Modify details for this video.' : 'Provide details for the new video.'}
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
              <li key={video.id} className="p-3 sm:p-4 border rounded-lg bg-card flex flex-col gap-3 sm:flex-row sm:items-start shadow-sm hover:shadow-md transition-shadow">
                {video.thumbnailUrl && (
                  <div className="relative w-full sm:w-24 h-32 sm:h-auto sm:aspect-[9/16] border rounded overflow-hidden shrink-0 bg-muted mb-2 sm:mb-0">
                    <Image src={video.thumbnailUrl} alt={video.title} layout="fill" objectFit="cover" data-ai-hint={video.dataAiHint || 'video thumbnail'}/>
                  </div>
                )}
                <div className="flex-grow sm:ml-3">
                  <h3 className="font-semibold font-headline text-md md:text-lg">{video.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  <a href={video.embedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block truncate mt-1">
                    {video.embedUrl}
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto sm:items-center mt-2 sm:mt-0 shrink-0 self-start sm:self-center">
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
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <DialogClose asChild><Button variant="destructive" onClick={() => handleDeleteVideo(video.id)}>Delete Video</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">No videos found. Add some!</p>
        )}
      </CardContent>
    </Card>
  );
}
