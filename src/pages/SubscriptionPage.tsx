
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Info } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/hooks/use-toast";
import { useAuth, SubscriptionTier } from "@/contexts/AuthContext";
import { t } from "@/utils/i18n";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubscriptionPermissions } from "@/components/SubscriptionPermissions";

interface PlanFeature {
  name: string;
  basic: boolean;
  premium: boolean;
  enterprise: boolean;
  tooltip?: string;
}

export function SubscriptionPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "permissions">("plans");

  const planFeatures: PlanFeature[] = [
    { name: "Standard Data Extraction", basic: true, premium: true, enterprise: true },
    { name: "Export to CSV", basic: true, premium: true, enterprise: true },
    { name: "Facebook Friend List", basic: true, premium: true, enterprise: true },
    { name: "Pages & Groups Lists", basic: false, premium: true, enterprise: true },
    { name: "Bulk Extraction", basic: false, premium: true, enterprise: true },
    { name: "Advanced Filters", basic: false, premium: true, enterprise: true },
    { name: "Background Extraction", basic: false, premium: false, enterprise: true },
    { name: "Real-time Synchronization", basic: false, premium: false, enterprise: true },
    { name: "Rate Limit (per hour)", basic: true, premium: true, enterprise: true, tooltip: "Basic: 50, Premium: 200, Enterprise: Unlimited" },
    { name: "API Access", basic: false, premium: false, enterprise: true },
  ];

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    
    toast({
      title: "Subscription Updated",
      description: `You've subscribed to the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan`,
    });
  };

  // Get days remaining in subscription
  const getDaysRemaining = (): number => {
    if (!user) return 0;
    const expiresAt = new Date(user.subscription.expiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const currentPlanEndsIn = getDaysRemaining();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="outline" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{t('subscription.management')}</h1>
          </div>
        </div>
        
        {/* Current Subscription Status */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.status')}</CardTitle>
              <CardDescription>
                {t('subscription.current_details')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <p className="text-lg font-medium">
                    {t('subscription.current')}:{' '}
                    <span className={`
                      subscription-badge 
                      ${user?.subscription.tier === 'basic' ? 'subscription-badge-basic' : ''}
                      ${user?.subscription.tier === 'premium' ? 'subscription-badge-premium' : ''}
                      ${user?.subscription.tier === 'enterprise' ? 'subscription-badge-enterprise' : ''}
                    `}>
                      {t(`subscription.${user?.subscription.tier}`)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('subscription.expires')}: {currentPlanEndsIn} {t('subscription.days')}
                  </p>
                </div>
                <ProgressBar 
                  value={30 - currentPlanEndsIn}
                  max={30}
                  showPercentage={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for Plans and Permissions */}
        <Tabs 
          defaultValue="plans" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "plans" | "permissions")}
          className="mb-8"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="permissions">Feature Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-4">
            {/* Subscription Plans */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Basic Plan */}
              <Card className={`border-2 ${selectedPlan === 'basic' ? 'border-primary' : 'border-transparent'}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{t('subscription.basic')}</CardTitle>
                      <CardDescription>{t('subscription.basic_desc')}</CardDescription>
                    </div>
                    <p className="text-3xl font-bold">$9<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {planFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.basic ? (
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 border-2 rounded-full border-muted mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm">
                          {feature.name}
                          {feature.tooltip && feature.basic && (
                            <span className="tooltip">
                              <Info className="h-3 w-3 inline-block ml-1 text-muted-foreground" />
                              <span className="tooltip-text">50 per hour</span>
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => setSelectedPlan('basic')} 
                    variant={selectedPlan === 'basic' ? 'default' : 'outline'} 
                    className="w-full"
                  >
                    {selectedPlan === 'basic' ? 'Selected' : 'Select Basic'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className={`border-2 ${selectedPlan === 'premium' ? 'border-primary' : user?.subscription.tier === 'premium' ? 'border-primary/50' : 'border-transparent'}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{t('subscription.premium')}</CardTitle>
                      <CardDescription>{t('subscription.premium_desc')}</CardDescription>
                    </div>
                    <p className="text-3xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {planFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.premium ? (
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 border-2 rounded-full border-muted mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm">
                          {feature.name}
                          {feature.tooltip && feature.premium && (
                            <span className="tooltip">
                              <Info className="h-3 w-3 inline-block ml-1 text-muted-foreground" />
                              <span className="tooltip-text">200 per hour</span>
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => setSelectedPlan('premium')} 
                    variant={selectedPlan === 'premium' ? 'default' : user?.subscription.tier === 'premium' ? 'outline' : 'outline'} 
                    className="w-full"
                  >
                    {selectedPlan === 'premium' 
                      ? 'Selected' 
                      : user?.subscription.tier === 'premium' 
                        ? 'Current Plan' 
                        : 'Select Premium'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise Plan */}
              <Card className={`border-2 ${selectedPlan === 'enterprise' ? 'border-primary' : 'border-transparent'}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{t('subscription.enterprise')}</CardTitle>
                      <CardDescription>{t('subscription.enterprise_desc')}</CardDescription>
                    </div>
                    <p className="text-3xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {planFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.enterprise ? (
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 border-2 rounded-full border-muted mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm">
                          {feature.name}
                          {feature.tooltip && feature.enterprise && (
                            <span className="tooltip">
                              <Info className="h-3 w-3 inline-block ml-1 text-muted-foreground" />
                              <span className="tooltip-text">Unlimited</span>
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => setSelectedPlan('enterprise')} 
                    variant={selectedPlan === 'enterprise' ? 'default' : 'outline'} 
                    className="w-full"
                  >
                    {selectedPlan === 'enterprise' ? 'Selected' : 'Select Enterprise'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Action Buttons */}
            {selectedPlan && (
              <div className="mt-8 flex justify-center">
                <Button size="lg" onClick={handleSubscribe}>
                  {t('subscription.subscribe')}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="permissions">
            <SubscriptionPermissions 
              currentTier={user?.subscription.tier}
              showCurrentTierOnly={false}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default SubscriptionPage;
