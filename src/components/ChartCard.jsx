import Card, { CardBody, CardHeader } from './Card';

export default function ChartCard({ title, eyebrow, action, children, className }) {
  return (
    <Card className={className}>
      <CardHeader title={title} eyebrow={eyebrow} action={action} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}
