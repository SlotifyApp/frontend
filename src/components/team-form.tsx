"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Team } from "./team-list";
import fetchHelpers from "@/hooks/fetchHelpers";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

interface ProfileFormProps {
  teams: Team[];
  onSetYourTeamsAction: (teams: Team[]) => void;
}
export function ProfileForm({ teams, onSetYourTeamsAction }: ProfileFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const teamsRoute = "/api/teams";
    const teamPostData = await fetchHelpers.postAPIrouteData(teamsRoute, { body: { name: values.name } });
    // Type Guard to check if calendar Data is of interface type "CalendarEvent"
    function isValidData(data: unknown): data is { id : number, name : string } {
      if (typeof data != "object" || data == null) {
        return false;
      }
      const obj = data as Record<string, unknown>;
      return (
        "id" in obj && typeof obj.id === "number" &&
        "name" in obj && typeof obj.name == "string"
      );
    }
    if (isValidData(teamPostData)) {
      onSetYourTeamsAction([teamPostData, ...teams]);
    }
    console.log(values);
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          + Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] sm:h-[90vh] sm:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Team Form</DialogTitle>
          <DialogDescription>Create a new team.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="AWSome" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public team name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
