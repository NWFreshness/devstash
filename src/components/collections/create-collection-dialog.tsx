"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";

import { createCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateCollectionDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setName("");
    setDescription("");
  }

  const canCreate = !pending && name.trim() !== "";

  function save() {
    startTransition(async () => {
      const result = await createCollection({ name, description });

      if (result.success) {
        toast.success("Collection created.");
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="lg">
            <FolderPlus data-icon="inline-start" />
            New Collection
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              placeholder="e.g. React Patterns"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canCreate && save()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection-description">
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="collection-description"
              placeholder="What's this collection for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={!canCreate}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
