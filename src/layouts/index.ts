/** App shell: layout, sidebar, header, and global search. */
export { DashboardLayout } from './DashboardLayout';
export { Sidebar, SidebarLayoutProvider, useSidebarLayout, AccountDropdown } from './sidebar';
export { Header, LanguageMenu } from './header';
export { GlobalSearchProvider, useGlobalSearch, GlobalSearchBar, GlobalSearchPalette } from './search';
export type { GlobalSearchContextValue } from './search';
