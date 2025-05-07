
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Download, Info, Trash2, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import secureStorage from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { toast } = useToast();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [settings, setSettings] = useState({
    encryptionEnabled: true,
    autoBackup: false,
    dataRetention: 30,
    auditLogging: true,
  });

  // Toggle setting
  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    
    toast({
      title: "Settings Updated",
      description: "Your settings have been saved.",
    });
  };

  // Clear all data
  const handleClearAllData = async () => {
    try {
      await secureStorage.clearAllData();
      setConfirmDeleteOpen(false);
      toast({
        title: "Data Deleted",
        description: "All data has been permanently deleted",
      });
    } catch (error) {
      console.error("Error clearing data:", error);
      toast({
        title: "Operation Failed",
        description: "Failed to clear data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <Tabs defaultValue="general">
              <TabsList className="mb-6 grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure the general behavior of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="audit-logging">Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">
                          Log all data extraction operations
                        </p>
                      </div>
                      <Switch 
                        id="audit-logging"
                        checked={settings.auditLogging}
                        onCheckedChange={() => toggleSetting('auditLogging')}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-backup">Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">
                          Create periodic backups of extracted data
                        </p>
                      </div>
                      <Switch 
                        id="auto-backup"
                        checked={settings.autoBackup}
                        onCheckedChange={() => toggleSetting('autoBackup')}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Extension Information</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">FB Data Vault v1.0.0</p>
                    <p className="text-sm text-muted-foreground">
                      This extension extracts and securely stores Facebook data locally in your browser.
                      No data is sent to external servers.
                    </p>
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Configure security and encryption options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="encryption">Data Encryption</Label>
                        <p className="text-sm text-muted-foreground">
                          Encrypt all stored data with AES-256
                        </p>
                      </div>
                      <Switch 
                        id="encryption"
                        checked={settings.encryptionEnabled}
                        disabled={true}
                        onCheckedChange={() => toggleSetting('encryptionEnabled')}
                      />
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Encryption is required</AlertTitle>
                      <AlertDescription>
                        For security reasons, encryption cannot be disabled.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>
                      Review the privacy policy and data practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      This extension processes all data locally in your browser. No data is sent to external servers.
                      All extracted data is encrypted and stored on your device only.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The extension requires permission to access Facebook pages to extract data.
                      This permission is used only for local data extraction.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Data Management */}
              <TabsContent value="data" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Manage your extracted data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Button className="gap-2">
                        <Download size={18} />
                        Backup Data
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Upload size={18} />
                        Restore Backup
                      </Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Danger Zone</AlertTitle>
                      <AlertDescription>
                        These actions cannot be undone. Please proceed with caution.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setConfirmDeleteOpen(true)}
                    >
                      <Trash2 size={18} />
                      Clear All Data
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>
                  FB Data Vault Extension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  A privacy-focused browser extension for extracting and managing Facebook data locally.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Last Updated:</strong> May 7, 2025</p>
                  <p><strong>License:</strong> MIT</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Documentation</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Data Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all extracted data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAllData} className="gap-2">
              <Trash2 size={16} />
              Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Settings;
