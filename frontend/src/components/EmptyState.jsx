import { EmptyState as UiEmptyState } from "./ui/EmptyState";

export default function EmptyState({ icon, title, sub, action }) {
  return <UiEmptyState icon={icon} title={title} description={sub} action={action} />;
}