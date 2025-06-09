
import type { ReactNode } from 'react';
// This layout can be expanded with a common sidebar or navigation for all dashboard pages.
// For now, it ensures children are rendered within the main app structure.

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="py-2">
      {/* 
        Future enhancements could include a SidebarProvider here
        and a Sidebar component if using the complex shadcn sidebar.
        For now, individual dashboard pages will handle their own structure.
      */}
      {children}
    </div>
  );
}
