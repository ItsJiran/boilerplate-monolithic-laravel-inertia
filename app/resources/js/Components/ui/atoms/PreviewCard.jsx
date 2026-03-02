import Card from './Card';
import Paragraph from './Paragraph';

export default function PreviewCard({ name, slug, className = '' }) {
    const label = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <Card className={`mt-6 ${className}`}>
            <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview</h3>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 flex items-center justify-center rounded-2xl">
                        <span className="text-white font-semibold text-lg">
                            {label}
                        </span>
                    </div>
                    <div>
                        <Paragraph className="text-sm font-medium text-gray-900">
                            {name || 'Tenant Name'}
                        </Paragraph>
                        <Paragraph size="xs" className="font-mono text-gray-500">
                            {slug || 'tenant-slug'}
                        </Paragraph>
                    </div>
                </div>
            </div>
        </Card>
    );
}
