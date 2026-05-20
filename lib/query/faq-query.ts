import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface FAQCategory {
  id: number;
  name: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: FAQCategory;
}

export const useFAQs = (lang: string = "AZ", page: number = 1, pageSize: number = 10, categoryId?: number | null) => {
  const queryClient = useQueryClient();

  // 1. Fetch FAQs
  const { data: faqsData, isLoading: isLoadingFaqs, refetch: refetchFaqs } = useQuery({
    queryKey: ["faqs", lang, page, pageSize, categoryId],
    queryFn: () => {
      const params: Record<string, any> = { page, size: pageSize };
      if (categoryId) {
        params.categoryId = categoryId;
      }
      return apiRequest<any>("/admin/faqs", {
        headers: {
          "Accept-Language": lang,
        },
        params,
      });
    },
  });

  // 2. Fetch FAQ Categories
  const { data: categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useQuery<FAQCategory[]>({
    queryKey: ["faq-categories", lang],
    queryFn: () => apiRequest<FAQCategory[]>("/admin/faq-categories", {
      headers: {
        "Accept-Language": lang,
      },
    }),
  });

  // 3. Create FAQ
  const createFaq = useMutation({
    mutationFn: async (data: { question: string; answer: string; categoryId: number }) => {
      return apiRequest<FAQ>("/admin/faqs", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });

  // 4. Update FAQ
  const updateFaq = useMutation({
    mutationFn: async (data: { id: number; question: string; answer: string; categoryId: number }) => {
      return apiRequest<FAQ>(`/admin/faqs/${data.id}`, {
        method: "PUT",
        body: {
          question: data.question,
          answer: data.answer,
          categoryId: data.categoryId,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });

  // 5. Delete FAQ
  const deleteFaq = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest<void>(`/admin/faqs/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });

  // 6. Create Category
  const createCategory = useMutation({
    mutationFn: async (data: { name: string }) => {
      return apiRequest<FAQCategory>("/admin/faq-categories", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
    },
  });

  // 7. Update Category
  const updateCategory = useMutation({
    mutationFn: async (data: { id: number; name: string }) => {
      return apiRequest<FAQCategory>(`/admin/faq-categories/${data.id}`, {
        method: "PUT",
        body: { name: data.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });

  // 8. Delete Category
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest<void>(`/admin/faq-categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });

  return {
    faqsData,
    categories,
    isLoading: isLoadingFaqs || isLoadingCategories,
    isLoadingFaqs,
    isLoadingCategories,
    refetchFaqs,
    refetchCategories,
    createFaq: createFaq.mutateAsync,
    updateFaq: updateFaq.mutateAsync,
    deleteFaq: deleteFaq.mutateAsync,
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
  };
};
