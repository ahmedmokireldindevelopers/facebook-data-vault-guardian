
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddSubscriberForm } from "@/components/AddSubscriberForm";
import { UserPlus } from "lucide-react";

interface AddSubscriberDialogProps {
  showAsButton?: boolean;
}

export function AddSubscriberDialog({ showAsButton = false }: AddSubscriberDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {showAsButton ? (
          <Button className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Subscriber
          </Button>
        ) : (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Subscriber
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subscriber</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new subscriber to the system.
          </DialogDescription>
        </DialogHeader>
        <AddSubscriberForm />
      </DialogContent>
    </Dialog>
  );
}
