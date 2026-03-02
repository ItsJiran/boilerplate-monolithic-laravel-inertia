import Card from '@/Components/ui/atoms/Card';
import Heading from '@/Components/ui/atoms/Heading';
import Paragraph from '@/Components/ui/atoms/Paragraph';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function ChartVisualization({ title, description, data = [] }) {
    return (
        <Card className='pr-4 pt-4'> 
        <div className='px-4'>
            <Heading as="p" size="md" className="mb-1">
                {title}
            </Heading>
            <Paragraph className="text-sm">{description}</Paragraph>
            </div>
            <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#374151', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: '#374151', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            labelStyle={{ color: '#111827' }}
                            contentStyle={{
                                borderRadius: 8,
                                borderColor: '#E5E7EB',
                            }}
                            formatter={(value) =>
                                typeof value === 'number'
                                    ? value.toLocaleString()
                                    : value
                            }
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#7C3AED" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
