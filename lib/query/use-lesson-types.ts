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
        body: { name },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-types"] });
    },
  });

  const { mutateAsync: deleteLessonType } = useMutation({
    mutationFn: (id: number) => 
      apiRequest<void>(`/admin/lesson-types/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-types"] });
    },
  });

  return { lessonTypes, isLoading, createLessonType, deleteLessonType };
}
