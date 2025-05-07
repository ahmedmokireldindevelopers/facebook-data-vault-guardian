
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { DataStatCard } from "@/components/DataStatCard";
import { ExtractButton } from "@/components/ExtractButton";
import { ExportMenu } from "@/components/ExportMenu";
import { StatusCard } from "@/components/StatusCard";
import { DataTable, DataItem } from "@/components/DataTable";
import { Users, MessageCircle, FileText, Group, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createExtractor } from "@/utils/extractors";
import { DataExporter } from "@/utils/exporters";
import secureStorage from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [extractorStatus, setExtractorStatus] = useState({
    status: 'idle',
    message: 'Ready to extract',
    progress: { current: 0, total: 0 }
  });
  const [stats, setStats] = useState({
    friends: 0,
    messages: 0,
    posts: 0,
    groups: 0
  });
  const [activeTab, setActiveTab] = useState("all");
  const [data, setData] = useState<DataItem[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Initialize storage
  useEffect(() => {
    const initialize = async () => {
      try {
        await secureStorage.init();
        setIsInitialized(true);
        loadData();
      } catch (error) {
        console.error("Failed to initialize storage:", error);
        toast({
          title: "Error",
          description: "Failed to initialize data storage",
          variant: "destructive",
        });
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data and update stats
  const loadData = async () => {
    try {
      const allData = await secureStorage.getAllData();
      
      // Update data for table
      const tableData: DataItem[] = allData.map(item => ({
        id: item.id,
        name: item.name,
        source: item.source,
        type: item.type,
        extractedAt: item.extractedAt
      }));
      
      setData(tableData);
      
      // Update stats
      setStats({
        friends: allData.filter(item => item.type === 'friend').length,
        messages: allData.filter(item => item.type === 'message').length,
        posts: allData.filter(item => item.type === 'post').length,
        groups: allData.filter(item => item.type === 'group').length
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Filter data based on active tab
  const filteredData = activeTab === "all" 
    ? data 
    : data.filter(item => item.type === activeTab.slice(0, -1)); // Remove 's' from tab name

  // Handle extraction
  const handleExtract = async (type: 'friends' | 'messages' | 'posts' | 'groups') => {
    try {
      const extractor = createExtractor(type);
      
      // Add status listener
      extractor.onStatusChange((status) => {
        setExtractorStatus(extractor.getStatus());
        
        // If extraction completed, reload data
        if (status === 'complete' || status === 'error') {
          loadData();
        }
      });
      
      // Add progress listener
      extractor.onProgressChange((progress) => {
        setExtractorStatus(prevStatus => ({
          ...prevStatus,
          progress
        }));
      });
      
      // Start extraction
      await extractor.extract();
    } catch (error) {
      console.error(`Error extracting ${type}:`, error);
      toast({
        title: "Extraction Failed",
        description: `Failed to extract ${type} data.`,
        variant: "destructive",
      });
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'json' | 'text') => {
    try {
      const type = activeTab as 'all' | 'friends' | 'messages' | 'posts' | 'groups';
      await DataExporter.exportData({ type, format });
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    setSelectedItemId(id);
    setConfirmDeleteOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedItemId) return;
    
    try {
      await secureStorage.deleteData(selectedItemId);
      toast({
        title: "Data Deleted",
        description: "Record was successfully deleted",
      });
      loadData();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete data record",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteOpen(false);
      setSelectedItemId(null);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-lg">Initializing secure storage...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="grid gap-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DataStatCard 
              title="Friends" 
              count={stats.friends} 
              icon={<Users size={18} />} 
              bgColor="bg-blue-100 dark:bg-blue-900/30"
            />
            <DataStatCard 
              title="Messages" 
              count={stats.messages} 
              icon={<MessageCircle size={18} />} 
              bgColor="bg-green-100 dark:bg-green-900/30"
            />
            <DataStatCard 
              title="Posts" 
              count={stats.posts} 
              icon={<FileText size={18} />} 
              bgColor="bg-amber-100 dark:bg-amber-900/30"
            />
            <DataStatCard 
              title="Groups" 
              count={stats.groups} 
              icon={<Group size={18} />} 
              bgColor="bg-purple-100 dark:bg-purple-900/30"
            />
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Status Card */}
              <StatusCard 
                status={extractorStatus.status as any}
                message={extractorStatus.message}
                progress={extractorStatus.progress}
              />
              
              {/* Extract Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Extract Data</CardTitle>
                  <CardDescription>
                    Select data type to extract from Facebook
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ExtractButton
                    type="friends"
                    label="Extract Friends"
                    icon={<Users size={18} />}
                    onExtract={() => handleExtract('friends')}
                  />
                  <ExtractButton
                    type="messages"
                    label="Extract Messages"
                    icon={<MessageCircle size={18} />}
                    onExtract={() => handleExtract('messages')}
                  />
                  <ExtractButton
                    type="posts"
                    label="Extract Posts"
                    icon={<FileText size={18} />}
                    onExtract={() => handleExtract('posts')}
                  />
                  <ExtractButton
                    type="groups"
                    label="Extract Groups"
                    icon={<Group size={18} />}
                    onExtract={() => handleExtract('groups')}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Data Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Extracted Data</CardTitle>
                      <CardDescription>
                        All data is stored locally and encrypted
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="gap-2">
                        <Search size={16} />
                        Search
                      </Button>
                      <ExportMenu 
                        onExport={handleExport} 
                        disabled={filteredData.length === 0}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="friends">Friends</TabsTrigger>
                      <TabsTrigger value="messages">Messages</TabsTrigger>
                      <TabsTrigger value="posts">Posts</TabsTrigger>
                      <TabsTrigger value="groups">Groups</TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab} className="m-0">
                      <DataTable data={filteredData} onDelete={handleDelete} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="gap-2">
              <Trash2 size={16} />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
