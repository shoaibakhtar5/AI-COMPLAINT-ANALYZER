import Card, { CardBody, CardHeader } from './Card';
import { cn } from '../utils/cn';

export default function ChartCard({ title, eyebrow, action, children, className }) {
  return (
    <Card className={cn('min-w-0 overflow-hidden', className)}>
      <CardHeader title={title} eyebrow={eyebrow} action={action} />
      <CardBody className="min-w-0">{children}</CardBody>
    </Card>
  );
}
