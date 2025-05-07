
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Download, Info, Trash2, Upload, Settings as SettingsIcon, User, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/contexts/AuthContext";
import { t, setLocale, getLocale } from "@/utils/i18n";

export function Settings() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const currentLocale = getLocale();
  const [settings, setSettings] = useState({
    encryptionEnabled: true,
    autoBackup: false,
    dataRetention: 30,
    auditLogging: true,
    storageLocation: "Nagport/{userId}/extracted_data/",
    autoSyncEnabled: true,
    extractionIcons: true,
    commentTracking: true,
  });

  // Toggle setting
  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    
    toast({
      title: t("settings.updated"),
      description: t("settings.saved"),
    });
  };

  // Update text setting
  const updateSetting = (key: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const saveSettings = () => {
    toast({
      title: t("settings.updated"),
      description: t("settings.saved"),
    });
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    
    toast({
      title: t("settings.language_changed"),
      description: newLocale === 'en' ? "Language set to English" : "تم تغيير اللغة إلى العربية",
    });
  };

  // Clear all data
  const handleClearAllData = async () => {
    try {
      await secureStorage.clearAllData();
      setConfirmDeleteOpen(false);
      toast({
        title: t("data.deleted"),
        description: t("data.deleted_all"),
      });
    } catch (error) {
      console.error("Error clearing data:", error);
      toast({
        title: t("operation.failed"),
        description: t("data.clear_failed"),
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
            <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <Tabs defaultValue="general">
              <TabsList className="mb-6 grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
                <TabsTrigger value="security">{t('settings.security')}</TabsTrigger>
                <TabsTrigger value="data">{t('settings.data')}</TabsTrigger>
                <TabsTrigger value="account">{t('settings.account')}</TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.general')}</CardTitle>
                    <CardDescription>
                      {t('settings.general_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="audit-logging">{t('settings.audit_logging')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.audit_logging_desc')}
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
                        <Label htmlFor="auto-backup">{t('settings.auto_backup')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.auto_backup_desc')}
                        </p>
                      </div>
                      <Switch 
                        id="auto-backup"
                        checked={settings.autoBackup}
                        onCheckedChange={() => toggleSetting('autoBackup')}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="language">{t('settings.language')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.language_desc')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleLanguage}
                      >
                        {currentLocale === 'en' ? 'العربية' : 'English'}
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-sync">{t('settings.auto_sync')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.auto_sync_desc')}
                        </p>
                      </div>
                      <Switch 
                        id="auto-sync"
                        checked={settings.autoSyncEnabled}
                        onCheckedChange={() => toggleSetting('autoSyncEnabled')}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>{t('extension.info')}</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">FB Data Vault v1.0.0</p>
                    <p className="text-sm text-muted-foreground">
                      {t('extension.info_desc')}
                    </p>
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.security')}</CardTitle>
                    <CardDescription>
                      {t('settings.security_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="encryption">{t('settings.encryption')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.encryption_desc')}
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
                      <AlertTitle>{t('settings.encryption_required')}</AlertTitle>
                      <AlertDescription>
                        {t('settings.encryption_required_desc')}
                      </AlertDescription>
                    </Alert>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="storage-path">{t('settings.storage_path')}</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('settings.storage_path_desc')}
                      </p>
                      <div className="flex space-x-2">
                        <Input 
                          id="storage-path" 
                          value={settings.storageLocation}
                          onChange={(e) => updateSetting('storageLocation', e.target.value)}
                        />
                        <Button variant="secondary" onClick={saveSettings}>
                          {t('action.save')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.privacy')}</CardTitle>
                    <CardDescription>
                      {t('settings.privacy_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('settings.privacy_info')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.permissions_info')}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Data Management */}
              <TabsContent value="data" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.data_management')}</CardTitle>
                    <CardDescription>
                      {t('settings.data_management_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('settings.extraction_features')}</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{t('settings.extraction_icons')}</p>
                            <Switch 
                              checked={settings.extractionIcons}
                              onCheckedChange={() => toggleSetting('extractionIcons')}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{t('settings.comment_tracking')}</p>
                            <Switch 
                              checked={settings.commentTracking}
                              onCheckedChange={() => toggleSetting('commentTracking')}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <Button className="gap-2">
                          <Download size={18} />
                          {t('action.backup')}
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Upload size={18} />
                          {t('action.restore')}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{t('settings.danger_zone')}</AlertTitle>
                      <AlertDescription>
                        {t('settings.danger_zone_desc')}
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setConfirmDeleteOpen(true)}
                    >
                      <Trash2 size={18} />
                      {t('action.clear_all')}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Account Settings */}
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('settings.account')}</CardTitle>
                    <CardDescription>
                      {t('settings.account_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex flex-col">
                        <h3 className="font-medium">{user?.name}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <Button variant="outline" onClick={logout}>{t('auth.logout')}</Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{t('subscription.status')}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`
                            subscription-badge 
                            ${user?.subscription.tier === 'basic' ? 'subscription-badge-basic' : ''}
                            ${user?.subscription.tier === 'premium' ? 'subscription-badge-premium' : ''}
                            ${user?.subscription.tier === 'enterprise' ? 'subscription-badge-enterprise' : ''}
                          `}>
                            {t(`subscription.${user?.subscription.tier}`)}
                          </span>
                        </div>
                      </div>
                      <Link to="/subscription">
                        <Button>{t('subscription.manage')}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('about.title')}</CardTitle>
                <CardDescription>
                  FB Data Vault Extension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('about.description')}
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>{t('about.version')}:</strong> 1.0.0</p>
                  <p><strong>{t('about.updated')}:</strong> May 7, 2025</p>
                  <p><strong>{t('about.license')}:</strong> MIT</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">{t('about.view_docs')}</Button>
              </CardFooter>
            </Card>
            
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{t('settings.quick_links')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <User size={16} />
                    {t('settings.account')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <CreditCard size={16} />
                    {t('subscription.management')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <SettingsIcon size={16} />
                    {t('settings.preferences')}
                  </Button>
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
            <DialogTitle>{t('data.confirm_deletion')}</DialogTitle>
            <DialogDescription>
              {t('data.confirm_deletion_desc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              {t('action.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleClearAllData} className="gap-2">
              <Trash2 size={16} />
              {t('action.delete_all')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Settings;
