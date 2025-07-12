"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Share2,
  Users,
  Eye,
  Heart,
  Calendar,
  Send,
  Copy,
  CheckCircle,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  X,
  Maximize2,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSpreadChain } from "@/app/db-handle/route";

interface IdeaViewProps {}

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  views: number;
  referrals: number;
  reach: number;
  file_urls: string[];
  user_id?: string;
}

export function IdeaView({}: IdeaViewProps) {
  const router = useRouter();
  const params = useParams();
  const ideaId = params?.id as string;

  const { user } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralEmails, setReferralEmails] = useState<string[]>(["", "", ""]);
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [stats, setStats] = useState<{referrals: number; reach: number} | null>(null);

  // Helper function to get file URL
  const getFileUrl = (url: string) => {
    if (!url) return '';
    // If it's already a full URL, return as is
    if (url.startsWith('http')) return url;
    // Otherwise, construct the full URL
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/idea-files/${url}`;
  };

  // State for preview modal
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: 'image' | 'pdf' | 'other' } | null>(null);
  
  // Function to handle file preview
  const handleFilePreview = (fileUrl: string, fileName: string, fileType: 'image' | 'pdf' | 'other') => {
    setPreviewFile({
      url: fileUrl,
      name: fileName || 'file',
      type: fileType
    });
  };

  const fetchIdeaStats = async (ideaId: string) => {
    try {
      // Get direct referrals count
      const { count: referralCount } = await supabase
        .from('spread_chain')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', ideaId);
      
      // Get unique users reached
      const { data: reachData } = await supabase
        .from('spread_chain')
        .select('referred_email')
        .eq('idea_id', ideaId);
      
      const reachEmails = (reachData || []).map(item => item.referred_email).filter(Boolean);
      const uniqueEmails = new Set(reachEmails);
      
      setStats({
        referrals: referralCount || 0,
        reach: uniqueEmails.size + 1 // +1 for the creator
      });
    } catch (error) {
      console.error('Error fetching idea stats:', error);
    }
  };

  useEffect(() => {
    const fetchIdea = async () => {
      if (!ideaId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("idea")
          .select("*")
          .eq("id", ideaId)
          .single();

        if (error) throw error;

        if (data) {
          // Increment view count
          await supabase
            .from("idea")
            .update({ views: (data.views || 0) + 1 })
            .eq("id", ideaId);

          setIdea({
            ...data,
            views: (data.views || 0) + 1,
          });
          
          // Fetch stats after setting the idea
          fetchIdeaStats(ideaId);
        }
      } catch (error) {
        console.error("Error fetching idea:", error);
        toast.error("Failed to load idea");
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">Loading idea...</div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Idea Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              The idea you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...referralEmails];
    newEmails[index] = value;
    setReferralEmails(newEmails);
  };

  const handleShare = async (e: React.FormEvent) => {
    if (!user) {
      toast.warning("Login before Sharing");
      router.push("/login");
    }
    e.preventDefault();
    if (!idea) return;

    setIsSharing(true);

    // Validate emails
    const validEmails = referralEmails
      .map((email) => email.trim())
      .filter((email) => email && email.includes("@"));

    if (validEmails.length < 1) {
      toast.error("Please enter at least 1 valid email address");
      setIsSharing(false);
      return;
    }

    try {
      // Record the shares in the spread_chain table
      const { error } = await supabase.from("spread_chain").insert(
        validEmails.map((email) => ({
          idea_id: idea.id,
          referrer_id: user?.id || "anonymous",
          referred_email: email,
          status: "pending",
        }))
      );

      if (error) throw error;

      setHasShared(true);
      try {
        const { error: updateError } = await supabase
          .from("spread_chain")
          .update({ status: "shared" }) // 👈 set new values here
          .eq("idea_id", idea.id) // filter by idea
          .eq("referred_email", user?.email); // filter by referrer


        if(updateError){
          console.error(updateError)
        }
      } catch(error) {
        console.error()
      }
      toast.success(`Idea shared with ${validEmails.length} people!`);

      // Update the idea's reach and referral counts
      setIdea({
        ...idea,
        referrals: (idea.referrals || 0) + validEmails.length,
        reach: (idea.reach || 0) + validEmails.length,
      });
    } catch (error) {
      console.error("Error sharing idea:", error);
      toast.error("Failed to share idea. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      const shareLink = `${window.location.origin}/idea/${ideaId}`;
      navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard!");
    }
  };

  const reachProgress = idea ? Math.min((idea.reach / 50000) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Idea Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Link>
                </Button>
                <Badge variant="secondary">{idea.category}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {idea.title}
            </CardTitle>

            <div className="flex items-center space-x-4 mt-4">
              <Avatar>
                <AvatarFallback>
                  {idea.user_id?.substring(0, 2).toUpperCase() || "ID"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  User #{idea.user_id?.substring(0, 6) || "Anonymous"}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{idea.views?.toLocaleString() || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              {idea.description}
            </p>

            {/* Attached Files
            {idea.file_urls && idea.file_urls.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Attached Files</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {idea.file_urls?.map((fileUrl, index) => {
                    const isImage = /\.(jpg|jpeg|png|gif)$/.test(fileUrl);
                    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
                    const fileName = fileUrl.split('/').pop() || 'file';
                    const fileType = isImage ? 'image' : isPdf ? 'pdf' : 'other';
                    
                    return (
                      <div 
                        key={index} 
                        className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleFilePreview(fileUrl, fileName, fileType)}
                      >
                        <div className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              {isImage ? (
                                <ImageIcon className="h-5 w-5 text-blue-600" />
                              ) : isPdf ? (
                                <FileText className="h-5 w-5 text-red-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isImage ? 'Image' : isPdf ? 'PDF Document' : 'File'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-1">
                  <Share2 className="h-5 w-5" />
                  <span className="text-2xl font-bold">
                    {stats?.referrals ?? 0}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Referrals
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-1">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">{stats?.reach ?? 1}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  People Reached
                </span>
              </div>
              {/* <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-red-600 mb-1">
                  <Heart className="h-5 w-5" />
                  <span className="text-2xl font-bold">0</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Likes
                </span>
              </div> */}
            </div>

            {/* Reach Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Global Reach Progress</span>
                <span>{(stats?.reach ?? 0).toLocaleString()} / 50,000 people</span>
              </div>
              <Progress value={Math.min(((stats?.reach ?? 0) / 50000) * 100, 100)} className="h-3" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Help this idea reach 50,000 people worldwide!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referral Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {hasShared ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Thank You for Spreading This Idea! </span>
                </>
              ) : (
                <>
                  <Share2 className="h-6 w-6 text-purple-600" />
                  <span>Help Spread This Idea</span>
                </>
              )}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              {hasShared
                ? "Your referrals are now part of the chain! Watch as this idea spreads further."
                : "Share this idea with at least 3 people to join the spreading chain."}
            </p>
          </CardHeader>

          <CardContent>
            {!hasShared ? (
              <form onSubmit={handleShare} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email1"
                    className="text-sm font-medium leading-none"
                  >
                    Email 1
                  </label>
                  <Input
                    id="email1"
                    type="email"
                    placeholder="friend1@example.com"
                    value={referralEmails[0]}
                    onChange={(e) => handleEmailChange(0, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email2"
                    className="text-sm font-medium leading-none"
                  >
                    Email 2
                  </label>
                  <Input
                    id="email2"
                    type="email"
                    placeholder="friend2@example.com"
                    value={referralEmails[1]}
                    onChange={(e) => handleEmailChange(1, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email3"
                    className="text-sm font-medium leading-none"
                  >
                    Email 3
                  </label>
                  <Input
                    id="email3"
                    type="email"
                    placeholder="friend3@example.com"
                    value={referralEmails[2]}
                    onChange={(e) => handleEmailChange(2, e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isSharing}
                >
                  {isSharing ? (
                    "Sharing..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Share This Idea
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By sharing, you agree to our community guidelines and help
                  create positive change.
                </p>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Idea Successfully Shared!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You've joined the referral chain. Your friends will receive
                  this idea and can continue spreading it.
                </p>
                <Button variant="outline" onClick={copyShareLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Share Link with More People
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* File Preview Modal */}
      <Dialog 
        open={!!previewFile} 
        onOpenChange={(open: boolean) => !open && setPreviewFile(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>File Preview</span>
              <div className="flex items-center space-x-2">
                {previewFile?.url && (
                  <a 
                    href={previewFile.url} 
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewFile(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewFile?.type === 'image' ? (
              <img 
                src={getFileUrl(previewFile.url)} 
                alt="Preview" 
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            ) : previewFile?.type === 'pdf' ? (
              <div className="w-full h-[70vh] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500">PDF Preview</p>
                  <a 
                    href={getFileUrl(previewFile.url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                    download
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </div>
                <div className="flex-1 border rounded-lg overflow-hidden">
                  <iframe 
                    src={`${getFileUrl(previewFile.url)}#view=fitH`}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                  >
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                      <p className="mb-4">Unable to display PDF preview.</p>
                      <a 
                        href={getFileUrl(previewFile.url)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        download
                      >
                        Download PDF
                      </a>
                    </div>
                  </iframe>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
