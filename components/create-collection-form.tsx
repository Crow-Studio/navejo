"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Folder } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  color: z.string().optional(),
});

type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;

interface CreateCollectionFormProps {
  userId: string;
  workspaceId?: string;
}

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Gray", value: "#6b7280" },
];

export function CreateCollectionForm({ userId, workspaceId }: CreateCollectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      description: "",
      color: colorOptions[0].value,
    },
  });

  const onSubmit = async (data: CreateCollectionFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
          color: data.color,
          workspaceId: workspaceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create collection');
      }

      const result = await response.json();
      
      toast.success("Collection created successfully!", {
        description: `"${result.folder.name}" is ready for your bookmarks`,
      });

      // Redirect to the new collection
      router.push(`/collections/${result.folder.id}`);
      
    } catch (error) {
      console.error("Collection creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create collection";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Folder className="w-5 h-5" />
          Collection Details
        </CardTitle>
        <CardDescription className="text-gray-400">
          Create a new collection to organize your bookmarks
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
                  <FormLabel className="text-white">Collection Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Frontend Resources, Design Inspiration"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Choose a descriptive name for your collection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this collection is for..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Add a description to help you remember what this collection is for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color.value
                              ? 'border-white scale-110'
                              : 'border-gray-600 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => field.onChange(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Choose a color to help identify this collection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Folder className="w-4 h-4 mr-2" />
                    Create Collection
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}