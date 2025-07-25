"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { getPlatformStats } from '@/lib/stats';

// Get the Supabase URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle, Lock, Globe, X, FileIcon } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";
import { createIdea, createSpreadChain } from "@/lib/db-handler";
import { supabase } from "@/lib/supabase";

const categories = [
  "Education",
  "Environment",
  "Technology",
  "Health",
  "Community",
  "Business",
  "Social Impact",
  "Innovation",
  "Lifestyle",
  "Science",
];

const inspirationIdeas = [
  {
    title: "5-Minute Morning Meditation",
    category: "Health",
    description:
      "Start each day with a simple 5-minute meditation practice to improve focus and reduce stress.",
  },
  {
    title: "Local Business Friday",
    category: "Community",
    description:
      "Dedicate Fridays to supporting local businesses instead of chains to strengthen your community.",
  },
  {
    title: "Digital Detox Sunday",
    category: "Lifestyle",
    description:
      "Spend one day a week completely offline to reconnect with yourself and loved ones.",
  },
];

export function CreateIdea() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeSpreaders: 0,
    ideasShared: 0,
    livesReached: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    is_public: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState<Array<File & { preview?: string }>>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getPlatformStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format large numbers with K/M/B suffixes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  const uploadFiles = async (filesToUpload: File[], ideaId: string): Promise<string[]> => {
    const fileUrls: string[] = [];
    
    for (const file of filesToUpload) {
      try {
        // Validate file size (10MB max)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Generate a unique file name
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user?.id}/${ideaId}/${fileName}`;
        const bucketName = 'idea-files';

        try {
          // First, try to upload the file
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            });

          if (uploadError) {
            // If bucket not found, try to create it
            if (uploadError.message.includes('Bucket not found')) {
              toast.error('Storage bucket not found. Please create a bucket named "idea-files" in your Supabase dashboard.');
              console.error('Bucket not found. Please create a bucket named "idea-files" in your Supabase dashboard.');
              return [];
            }
            throw uploadError;
          }

          // Store the path in the database (not the full URL)
          // Store just the relative path without the bucket name to prevent duplication
          const fileUrl = `${filePath}`; // Just the path: userId/ideaId/filename.ext
          fileUrls.push(fileUrl);
          
          toast.success(`Uploaded ${file.name} successfully`);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}. ${error instanceof Error ? error.message : ''}`);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        toast.error(`Error processing ${file.name}. Please try again.`);
      }
    }

    return fileUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 1. First create the idea
      const newIdea = await createIdea(
        formData.title,
        formData.description,
        formData.category,
        formData.is_public
      );

      if (newIdea) {
        // 2. Handle file uploads if any
        let fileUrls: string[] = [];
        if (files.length > 0) {
          fileUrls = await uploadFiles(files, newIdea.id);
          if (fileUrls.length > 0) {
            // Update idea with file URLs
            await supabase
              .from('idea')
              .update({ file_urls: fileUrls })
              .eq('id', newIdea.id);
          }
        }

        // 3. Create the initial spread chain for the creator
        await createSpreadChain(newIdea.id, null, user?.email || '');
        
        setIsSubmitted(true);
        toast.success("Your idea has been created and is ready to spread!");
      }
    } catch (error) {
      console.error("Error creating idea:", error);
      toast.error("Failed to create idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectCategory = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => 
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        })
      );
      
      // Check total files don't exceed 5
      if (files.length + newFiles.length > 5) {
        toast.error('You can upload a maximum of 5 files');
        return;
      }
      
      // Validate file types
      const validFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/rtf'];
      
      const invalidFiles = newFiles.filter(file => !validFileTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        toast.error(`Unsupported file type: ${invalidFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setFiles(prev => [...prev, ...newFiles]);
      e.target.value = ''; // Reset the input to allow selecting the same file again if needed
    }
  };

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => file.preview && URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke the object URL to prevent memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center glass">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                🎉 Idea Created Successfully!
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Your brilliant idea "<strong>{formData.title}</strong>" is now
                live and ready to spread across the world!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Ready to Reach
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Thousands of people
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Viral Potential
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Exponential growth
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Impact Ready
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Change the world
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
                  >
                    View in Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ 
                      title: "", 
                      description: "", 
                      category: "",
                      is_public: false 
                    });
                  }}
                  className="px-8"
                >
                  Create Another Idea
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full border border-white/30 dark:border-gray-700/30 mb-6">
            <Lightbulb className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share your brilliant idea with the world
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Create an <span className="gradient-text">Idea</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Every great change starts with a single idea. Share yours and watch
            it spread across the world through the power of referrals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-6 w-6 text-purple-600" />
                  <span>Share Your Idea</span>
                </CardTitle>
                <CardDescription>
                  Fill in the details below to create an idea that could change
                  the world
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Idea Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter a compelling title for your idea"
                      value={formData.title}
                      onChange={handleChange}
                      className="text-lg"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Make it catchy and descriptive - this is what people will
                      see first
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((category) => (
                          <Button
                            key={category}
                            type="button"
                            variant={
                              formData.category === category
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => selectCategory(category)}
                            className={
                              formData.category === category
                                ? "bg-gradient-to-r from-purple-600 to-blue-600"
                                : ""
                            }
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Privacy</Label>
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {formData.is_public ? (
                              <Globe className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                {formData.is_public ? "Public" : "Private"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formData.is_public
                                  ? "Anyone can discover and view this idea"
                                  : "Only people with the link can view this idea"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              is_public: !formData.is_public,
                            })
                          }
                        >
                          {formData.is_public ? "Make Private" : "Make Public"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your idea in detail. What problem does it solve? How can it make a difference? Why should people care?"
                      rows={8}
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Be specific and inspiring - explain the impact your idea
                      could have
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="files">
                      Attach Supporting Files (optional)
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label 
                          htmlFor="file-upload" 
                          className="cursor-pointer border border-dashed rounded-md px-4 py-2 text-sm flex items-center gap-2 hover:bg-accent/50 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Files
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
                        />
                        <span className="text-sm text-muted-foreground">
                          {files.length} of 5 files selected
                        </span>
                      </div>
                      
                      {files.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {file.type.startsWith('image/') && file.preview ? (
                                  <img 
                                    src={file.preview} 
                                    alt={file.name}
                                    className="h-8 w-8 object-cover rounded"
                                    onLoad={() => URL.revokeObjectURL(file.preview!)}
                                  />
                                ) : (
                                  <div className="h-8 w-8 flex items-center justify-center bg-muted rounded">
                                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-3.5 w-3.5" />
                                <span className="sr-only">Remove file</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Supported formats: Images, PDF, Word, Excel, PowerPoint, Text, RTF. Max 10MB per file. Max 5 files.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      💡 Tips for a Great Idea
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Be specific about the problem you're solving</li>
                      <li>
                        • Explain how people can easily implement your idea
                      </li>
                      <li>• Include the potential positive impact</li>
                      <li>• Make it actionable and shareable</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Creating Your Idea..."
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create & Share Idea
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Platform Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {isLoading ? '...' : formatNumber(stats.activeSpreaders)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Active Spreaders
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? '...' : formatNumber(stats.ideasShared)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Ideas Shared
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {isLoading ? '...' : formatNumber(stats.livesReached)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Lives Reached
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspiration */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Need Inspiration?</CardTitle>
                <CardDescription>
                  Here are some popular idea formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inspirationIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{idea.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {idea.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {idea.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* User Info */}
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Idea Creator
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
