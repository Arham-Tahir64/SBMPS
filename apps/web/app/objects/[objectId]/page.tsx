import { ObjectDetailClient } from "./object-detail-client";

export const metadata = {
  title: "Object Detail | SDMPS",
  description: "Tracked object detail view for SDMPS."
};

export default function ObjectDetailPage({ params }: { params: { objectId: string } }) {
  return <ObjectDetailClient objectId={params.objectId} />;
}
