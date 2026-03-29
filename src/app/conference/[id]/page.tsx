import { getAllConferenceIds } from "@/lib/data";
import ConferenceDetail from "./ConferenceDetail";

export function generateStaticParams() {
    return getAllConferenceIds().map((id) => ({
        id: String(id),
    }));
}

export default function ConferenceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <ConferenceDetail params={params} />;
}
