import type { NavGroupDef } from "@/config/navigation/nav-types";
import { icons } from "@/config/navigation/icons";

export function getHiringSidebarGroups(): NavGroupDef[] {
  return [
    {
      groupKey: "overview",
      items: [
        {
          id: "hiring-feed",
          itemKey: "hiringFeed",
          to: "/hiring",
          icon: icons.jobs,
          endMatch: true,
        },
      ],
    },
    {
      groupKey: "management",
      items: [
        {
          id: "hiring-candidates",
          itemKey: "candidates",
          to: "/hiring/candidates",
          icon: icons.candidates,
        },
        {
          id: "hiring-workers",
          itemKey: "workers",
          to: "/hiring/workers",
          icon: icons.workers,
        },
      ],
    },
  ];
}
