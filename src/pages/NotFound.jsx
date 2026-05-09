import { Link } from 'react-router-dom';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app p-4">
      <EmptyState
        title="Route not found"
        message="This workspace surface does not exist in the current Sentra AI build."
      />
      <Button as={Link} to="/" className="fixed bottom-8">
        Return Home
      </Button>
    </main>
  );
}
