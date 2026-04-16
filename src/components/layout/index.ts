/** App shell: sidebar, header, dashboard frame, global search. */
export { Sidebar } from './sidebar';
export { Header } from './header';
export { DashboardLayout } from './DashboardLayout';
export {
  GlobalSearchProvider,
  useGlobalSearch,
  type GlobalSearchContextValue,
} from './GlobalSearchContext';
export { GlobalSearchBar } from './GlobalSearchBar';
export { SidebarLayoutProvider, useSidebarLayout } from './SidebarLayoutContext';
export { AccountDropdown } from './AccountDropdown';
export { LanguageMenu } from './LanguageMenu';
