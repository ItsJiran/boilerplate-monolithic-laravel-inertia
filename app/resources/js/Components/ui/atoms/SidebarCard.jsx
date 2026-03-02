import Card from './Card';
import CardHeader from './CardHeader';
import CardBody from './CardBody';

export default function SidebarCard({ title, children, className = '' }) {
    return (
        <Card className={className}>
            <CardHeader className="bg-transparent border-b-gray-200 text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {title}
            </CardHeader>
            <CardBody className="space-y-3">
                {children}
            </CardBody>
        </Card>
    );
}
