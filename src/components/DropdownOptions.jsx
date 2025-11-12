import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import { ucFirst } from "../utils/ucFirst";

const DropdownOptions = (endpoint, field, searchQuery, selectedProjectId) => {
  const formatLabel = (item, field) => {
    const labelMap = {
      project_id: ucFirst(`${item.project_name} - ${item.project_code}`),
      client_id: ucFirst(`${item.client_name} - ${item.client_code}`),
      sub_project_id: ucFirst(`${item.sub_project_name}`),
      location_id: ucFirst(`${item.district} - ${item.code}`),
      role_id: ucFirst(`${item.role}`),
      login_email_id: ucFirst(`${item.login_name} - ${item.login_email}`),
      employee_id: ucFirst(`${item.employee_id}`),
      emp_log_id: ucFirst(`${item.id}`),
      lead_name: ucFirst(`${item.lead_name}`),
      sme_id: ucFirst(`${item.name} - ${item.email}`),
    };
    return labelMap[field] || ucFirst(`${item?.name} - ${item?.email} `);
  };

  return useInfiniteQuery({
    queryKey: [
      endpoint || "",
      field || "",
      selectedProjectId || "",
      searchQuery || "",
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!endpoint) {
        return { data: [], next_page: null };
      }
      try {
        const response = await apiClient.get(
          `${endpoint}?page=${pageParam}&search=${searchQuery}`
        );

        const items = response.data?.data?.data || [];
        return {
          data: items.map((item) => ({
            label: formatLabel(item, field),
            value: item.id,
          })),
          next_page: response.data.data?.next_page_url ? pageParam + 1 : null,
        };
      } catch (error) {
        console.error(`Error fetching ${endpoint} data:`, error);
        return { data: [], next_page: null };
      }
    },
    getNextPageParam: (lastPage) => lastPage.next_page,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default DropdownOptions;
