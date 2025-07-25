"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Eye,
  Share2,
  Users,
  TrendingUp,
  Calendar,
  ExternalLink,
  Heart,
  ArrowLeft,
  Lightbulb,
  BarChart3,
  X,
  Trash2,
  AlertTriangle,
  PauseCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useIdeasWithStats,
  type IdeaWithStats,
} from "@/hooks/use-ideas-with-stats";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getReferredIdeas } from "@/lib/db-handler";
import { supabase } from "@/lib/supabase";

export function Dashboard() {
  const { user } = useAuth();
  const {
    ideas: initialIdeas,
    loading,
    error,
    refresh: refreshIdeas,
  } = useIdeasWithStats(user?.id);
  const [ideas, setIdeas] = useState<IdeaWithStats[]>([]);
  const [referredIdeas, setReferredIdeas] = useState<IdeaWithStats[]>([]);
  const [loadingReferred, setLoadingReferred] = useState(true);
  const [loadingShared, setLoadingShared] = useState(true);
  const [sharedIdeas, setSharedIdeas] = useState<IdeaWithStats[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stopChainDialogOpen, setStopChainDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
  const [ideaToStopChain, setIdeaToStopChain] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState<
    Record<string, boolean>
  >({});

  // Calculate user stats from ideas
  const userStats = {
    // rank: "Idea Starter",
    totalReach: ideas.reduce((sum, idea) => sum + (idea.reach - 1 || 0), 0),
    totalReferrals: ideas.reduce((sum, idea) => sum + (idea.referrals || 0), 0),
    totalIdeas: ideas.length,
    activeChains: ideas.filter(
      (idea) => !idea.chain_stopped && idea.referrals > 0
    ).length,
  };

  const stats = [
    {
      title: "Total Reach",
      value: loading ? "..." : userStats.totalReach.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Ideas Started",
      value: loading ? "..." : ideas.length.toString(),
      icon: Share2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Referrals Made",
      value: loading ? "..." : sharedIdeas.length,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Active Chains",
      value: loading ? "..." : userStats.activeChains.toString(),
      icon: ExternalLink,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Ideas currently being shared",
    },
  ];

  // Update local state when initialIdeas changes
  useEffect(() => {
    setIdeas(initialIdeas);
  }, [initialIdeas]);

  // Toggle idea privacy
  const toggleIdeaPrivacy = async (ideaId: string, currentStatus: boolean) => {
    try {
      setUpdatingPrivacy((prev) => ({ ...prev, [ideaId]: true }));

      const { error } = await supabase
        .from("idea")
        .update({ is_public: !currentStatus })
        .eq("id", ideaId);

      if (error) throw error;

      // Update local state
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId ? { ...idea, is_public: !currentStatus } : idea
        )
      );

      toast.success(`Idea marked as ${currentStatus ? "private" : "public"}`);
    } catch (error) {
      console.error("Error updating idea privacy:", error);
      toast.error("Failed to update idea privacy");
    } finally {
      setUpdatingPrivacy((prev) => ({ ...prev, [ideaId]: false }));
    }
  };

  // Stop the spreading chain for an idea
  const confirmStopChain = (ideaId: string) => {
    setIdeaToStopChain(ideaId);
    setStopChainDialogOpen(true);
  };

  const stopChain = async () => {
    if (!ideaToStopChain) return;

    try {
      setIsStopping(true);
      const { error } = await supabase
        .from("idea")
        .update({ chain_stopped: true })
        .eq("id", ideaToStopChain);

      if (error) throw error;

      // Update local state
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaToStopChain ? { ...idea, chain_stopped: true } : idea
        )
      );

      toast.success("Chain stopped successfully");
    } catch (error) {
      console.error("Error stopping chain:", error);
      toast.error("Failed to stop chain");
    } finally {
      setIsStopping(false);
      setStopChainDialogOpen(false);
      setIdeaToStopChain(null);
    }
  };

  // Delete all chain records for an idea
  const deleteChainRecords = async (ideaId: string) => {
    try {
      const { error } = await supabase
        .from("spread_chain")
        .delete()
        .eq("idea_id", ideaId);

      if (error) throw error;

      toast.success("Chain records deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting chain records:", error);
      toast.error("Failed to delete chain records");
      return false;
    }
  };

  // Handle delete with chain cleanup
  const handleDeleteWithCleanup = async (ideaId: string) => {
    // First delete chain records
    const success = await deleteChainRecords(ideaId);
    if (success) {
      // Then delete the idea
      await handleDeleteIdea();
    }
  };

  // Handle delete confirmation
  const confirmDelete = (ideaId: string) => {
    setIdeaToDelete(ideaId);
    setDeleteDialogOpen(true);
  };

  // Handle actual deletion
  const handleDeleteIdea = async () => {
    if (!ideaToDelete) return;

    try {
      setIsDeleting(true);

      // First, check if we need to delete chain records
      const idea = ideas.find((i) => i.id === ideaToDelete);
      if (idea && !idea.chain_stopped) {
        // If chain is not stopped, delete chain records first
        await deleteChainRecords(ideaToDelete);
      }

      // Then delete the idea
      const { error } = await supabase
        .from("idea")
        .delete()
        .eq("id", ideaToDelete);

      if (error) throw error;

      // Update local state
      setIdeas((prev) => prev.filter((idea) => idea.id !== ideaToDelete));
      setDeleteDialogOpen(false);
      toast.success("Idea deleted successfully");

      // Refresh the ideas list
      refreshIdeas();
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete idea");
    } finally {
      setIsDeleting(false);
      setIdeaToDelete(null);
    }
  };

  useEffect(() => {
    const fetchReferredIdeas = async () => {
      if (!user?.email) {
        setLoadingReferred(false);
        return;
      }

      try {
        setLoadingReferred(true);

        // 1️⃣ Fetch referred ideas with status
        const referredIdeas = await getReferredIdeas(user.email);
        //("Referred Ideas:", referredIdeas);
        // [{ idea_id: "abc", status: "pending" }, { idea_id: "xyz", status: "shared" }]

        if (referredIdeas.length === 0) {
          setReferredIdeas([]);
          setSharedIdeas([]);
          return;
        }

        // 2️⃣ Split idea IDs by status
        const pendingIdeaIds = referredIdeas
          .filter((item) => item.status === "pending")
          .map((item) => item.idea_id);

        const sharedIdeaIds = referredIdeas
          .filter((item) => item.status === "shared")
          .map((item) => item.idea_id);

        // Combine all IDs to fetch full idea details in one query
        const allIdeaIds = Array.from(
          new Set([...pendingIdeaIds, ...sharedIdeaIds])
        );

        // 3️⃣ Fetch full idea details for all ideas
        const { data: ideas, error } = await supabase
          .from("idea")
          .select("*")
          .in("id", allIdeaIds);

        if (error) throw error;

        // 4️⃣ Create a Map to lookup status by idea_id
        const statusMap = new Map(
          referredIdeas.map((item) => [item.idea_id, item.status])
        );

        // 5️⃣ Add stats and status to each idea
        const ideasWithStats = await Promise.all(
          (ideas || []).map(async (idea) => {
            const { count: referralCount } = await supabase
              .from("spread_chain")
              .select("*", { count: "exact", head: true })
              .eq("idea_id", idea.id);

            const { count: reachCount } = await supabase
              .from("spread_chain")
              .select("*", { count: "exact", head: true })
              .eq("idea_id", idea.id);

            return {
              ...idea,
              referrals: referralCount || 0,
              reach: (reachCount || 0) + 1, // +1 for creator
              views: idea.views || 0,
              status: statusMap.get(idea.id), // 🟢 preserve original status
            };
          })
        );

        // 6️⃣ Separate pending and shared ideas
        const pendingIdeas = ideasWithStats.filter(
          (idea) => idea.status === "pending"
        );
        const sharedIdeas = ideasWithStats.filter(
          (idea) => idea.status === "shared"
        );

        // 7️⃣ Set state
        setReferredIdeas(pendingIdeas);
        setSharedIdeas(sharedIdeas);

        //("Pending Ideas:", pendingIdeas);
        //("Shared Ideas:", sharedIdeas);
      } catch (error) {
        console.error("Error fetching referred ideas:", error);
        toast.error("Failed to load referred ideas");
      } finally {
        setLoadingReferred(false);
      }
    };

    fetchReferredIdeas();
  }, [user?.email]);

  const fetchDataForTab = (value: string) => {
    //(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Back */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text hidden sm:inline">
                  SparkLoop
                </span>
              </Link>
            </div>

            {/* Center - Dashboard Title */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>

            {/* Right side - User and Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/create">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Idea</span>
                </Button>
              </Link>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userStats.rank}
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ready to spread some brilliant ideas today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs
          defaultValue="my-ideas"
          className="space-y-6"
          onValueChange={(value) => fetchDataForTab(value)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="referred-to-you">Referred to you</TabsTrigger>
            <TabsTrigger value="referred-by-you">Referred by You</TabsTrigger>
            {/* <TabsTrigger value="referrals">Referrals</TabsTrigger> */}
            <TabsTrigger value="my-ideas">My Ideas</TabsTrigger>
          </TabsList>

          {/* My Ideas Tab */}
          <TabsContent value="my-ideas" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : ideas.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => (
                  <Card
                    key={idea.id}
                    className="hover:shadow-lg transition-shadow relative group"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {idea.title}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2 h-10">
                            {idea.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {idea.category && (
                            <Badge variant="secondary" className="shrink-0">
                              {idea.category}
                            </Badge>
                          )}
                          {idea.chain_stopped && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIdeaToDelete(idea.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{idea.views}</span>
                          </div>
                          <span className="text-xs text-gray-400">Views</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
                            <Share2 className="h-4 w-4" />
                            <span className="text-sm">
                              {idea.referrals - 1 || 0}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            Referrals
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">
                              {idea.reach - 1 || 0}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">Reached</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          Created{" "}
                          {formatDistanceToNow(new Date(idea.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {idea.chain_stopped ? (
                              <Badge
                                variant="outline"
                                className="border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-400"
                              >
                                <PauseCircle className="h-3.5 w-3.5 mr-1.5" />
                                Chain Stopped
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                                Active
                              </Badge>
                            )}

                            {!idea.chain_stopped && (
                              <div className="flex items-center space-x-1.5">
                                <Switch
                                  checked={idea.is_public}
                                  onCheckedChange={() =>
                                    toggleIdeaPrivacy(idea.id, idea.is_public)
                                  }
                                  disabled={updatingPrivacy[idea.id]}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {idea.is_public ? "Public" : "Private"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {!idea.chain_stopped ? (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/30"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  confirmStopChain(idea.id);
                                }}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Chain
                              </Button>
                              <Link
                                href={`/idea/${idea.id}`}
                                className="flex-1"
                              >
                                <Button variant="outline" className="w-full">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <Link href={`/idea/${idea.id}`} className="w-full">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No ideas yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating your first idea.
                </p>
                <div className="mt-6">
                  <Link href="/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Idea
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referred-to-you" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referred To You</CardTitle>
                <CardDescription>
                  Ideas that asked you for referral
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingReferred ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referredIdeas.length > 0 ? (
                      referredIdeas.map((idea) => (
                        <Link
                          href={`/idea/${idea.id}`}
                          key={idea.id}
                          className="block"
                        >
                          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {idea.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                    {idea.description}
                                  </p>
                                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>
                                      Referred{" "}
                                      {formatDistanceToNow(
                                        new Date(idea.created_at),
                                        { addSuffix: true }
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <div className="text-center">
                                    <div className="text-sm font-medium">
                                      {idea.referrals - 1 || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Refs
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm font-medium">
                                      {idea.reach - 1 || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Reach
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No pending ideas to Reffer</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="referred-by-you" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ideas you refered</CardTitle>
                <CardDescription>Ideas that you shared</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sharedIdeas.length > 0 ? (
                      sharedIdeas.map((idea) => (
                        <Link
                          href={`/idea/${idea.id}`}
                          key={idea.id}
                          className="block"
                        >
                          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {idea.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                    {idea.description}
                                  </p>
                                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>
                                      Referred{" "}
                                      {formatDistanceToNow(
                                        new Date(idea.created_at),
                                        { addSuffix: true }
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <div className="text-center">
                                    <div className="text-sm font-medium">
                                      {idea.referrals || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Refs
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm font-medium">
                                      {idea.reach || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Reach
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No ideas have been referred to you yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Idea Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
                <CardDescription>
                  Track how your referrals are spreading ideas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {false ? (
                      // Placeholder for future referral implementation
                      <div>No referrals yet</div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>
                          No referrals yet. Share your ideas to get started!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              idea and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIdea}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Chain Confirmation Dialog */}
      <AlertDialog
        open={stopChainDialogOpen}
        onOpenChange={setStopChainDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to stop this chain?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Stopping the chain will prevent any further sharing of this idea.
              You can still view the idea and its statistics, but it won't be
              shareable anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStopping}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={stopChain}
              disabled={isStopping}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isStopping ? "Stopping..." : "Stop Chain"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
