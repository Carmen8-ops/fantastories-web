import EventClient from "./EventClient";

export default async function EventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <EventClient code={code.toUpperCase()} />;
}