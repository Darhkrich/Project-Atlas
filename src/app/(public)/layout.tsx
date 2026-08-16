import { AtlasHeader } from "@/components/atlas/atlas-header";
import { AtlasFooter } from "@/components/atlas/atlas-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AtlasHeader />
      <main className="flex-1">{children}</main>
      <AtlasFooter />
    </>
  );
}