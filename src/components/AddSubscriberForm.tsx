
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionTier } from "@/contexts/AuthContext";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subscriptionTier: z.enum(["basic", "premium", "enterprise"], {
    required_error: "Please select a subscription tier.",
  }),
  duration: z.enum(["month", "year"], {
    required_error: "Please select a subscription duration.",
  }),
  isAdmin: z.boolean().default(false),
  sendWelcomeEmail: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function AddSubscriberForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subscriptionTier: "basic",
      duration: "month",
      isAdmin: false,
      sendWelcomeEmail: true,
    },
  });

  // Handle form submission
  function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    // In a real application, this would call an API to create the subscriber
    setTimeout(() => {
      console.log("Form submitted:", values);
      
      toast({
        title: "Subscriber Added",
        description: `${values.name} has been added as a ${values.subscriptionTier} subscriber.`,
      });
      
      form.reset();
      setIsSubmitting(false);
      
      if (onSuccess) {
        onSuccess();
      }
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Subscriber</CardTitle>
        <CardDescription>
          Create a new user account with subscription details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subscriptionTier"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Subscription Tier</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="basic" />
                        <FormLabel htmlFor="basic" className="font-normal cursor-pointer">Basic</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="premium" id="premium" />
                        <FormLabel htmlFor="premium" className="font-normal cursor-pointer">Premium</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enterprise" id="enterprise" />
                        <FormLabel htmlFor="enterprise" className="font-normal cursor-pointer">Enterprise</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="month" id="month" />
                        <FormLabel htmlFor="month" className="font-normal cursor-pointer">Monthly</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="year" id="year" />
                        <FormLabel htmlFor="year" className="font-normal cursor-pointer">Yearly (20% off)</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Admin Access</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Grant admin permissions to manage other subscribers.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sendWelcomeEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Send Welcome Email</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Send an email with login instructions to the new subscriber.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Subscriber"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
