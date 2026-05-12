import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface LessonTypeResponse {
  id: number;
  name: string;
}

export function useLessonTypes() {
  const queryClient = useQueryClient();

  const { data: lessonTypes = [], isLoading } = useQuery<LessonTypeResponse[]>({
    queryKey: ["lesson-types"],
    queryFn: () => apiRequest<LessonTypeResponse[]>("/admin/lesson-types"),
  });

  const { mutateAsync: createLessonType } = useMutation({
    mutationFn: (name: string) => 
      apiRequest<LessonTypeResponse>("/admin/lesson-types", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-types"] });
    },
  });

  return { lessonTypes, isLoading, createLessonType };
}
