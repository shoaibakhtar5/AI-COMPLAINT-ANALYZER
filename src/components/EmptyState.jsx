import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-8 text-center">
      <Inbox className="mx-auto mb-4 h-10 w-10 text-crimson-500" />
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{message}</p>
      {actionLabel ? (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
