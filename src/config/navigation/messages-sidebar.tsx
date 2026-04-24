import type { NavGroupDef } from "./nav-types";
import { icons } from "./icons";

export function getMessagesSidebarGroups(): NavGroupDef[] {
  return [
    {
      groupKey: "overview",
      items: [
        {
          id: "messages-inbox",
          itemKey: "inbox",
          to: "/messages",
          icon: icons.inbox,
          endMatch: true,
        },
      ],
    },
    {
      groupKey: "management",
      items: [
        {
          id: "messages-channels",
          itemKey: "channels",
          to: "/messages/channels",
          icon: icons.channels,
        },
        {
          id: "messages-dms",
          itemKey: "directMessages",
          to: "/messages/dms",
          icon: icons.dms,
        },
      ],
    },
  ];
}
