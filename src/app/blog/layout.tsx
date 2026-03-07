import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | InterviewSense",
  description: "Tips, updates, and deep dives on landing your dream tech job.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
