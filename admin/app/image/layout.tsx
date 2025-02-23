import { ReactNode } from "react";
import { Metadata } from "next";
import { AdminLayout } from "@/layouts/admin-layout";

interface ImageLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Images Settings - God Mode",
};

export default function ImageLayout({ children }: ImageLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
