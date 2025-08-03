import { ArrowRight, ArrowUpRight, ArrowUp, ArrowDownRight, ArrowDown } from 'lucide-react';

interface TrendArrowProps {
    trend: string;
}

const TrendArrow: React.FC<TrendArrowProps> = ({ trend }) => {
    const color = '#a5adcb';
    const size = 20;

    switch (trend) {
        case 'doubleup':
            return (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <ArrowUp size={size} color={color} />
                    <ArrowUp size={size} color={color} />
                </div>
            );
        case 'singleup':
            return <ArrowUp size={size} color={color} />;
        case 'fortyfiveup':
            return <ArrowUpRight size={size} color={color} />;
        case 'flat':
            return <ArrowRight size={size} color={color} />;
        case 'fortyfivedown':
            return <ArrowDownRight size={size} color={color} />;
        case 'singledown':
            return <ArrowDown size={size} color={color} />;
        case 'doubledown':
            return (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <ArrowDown size={size} color={color} />
                    <ArrowDown size={size} color={color} />
                </div>
            );
        default:
            return null;
    }
}

export default TrendArrow;
