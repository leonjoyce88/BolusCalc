import { ArrowRight, ArrowUpRight, ArrowUp, ArrowDownRight, ArrowDown } from 'lucide-react';

interface TrendArrowProps {
    trend: string;
}

const TrendArrow: React.FC<TrendArrowProps> = ({ trend }) => {
    const color = '#a5adcb';
    const size = 20;

    switch (trend) {
        case 'double-up':
            return (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <ArrowUp size={size} color={color} />
                    <ArrowUp size={size} color={color} />
                </div>
            );
        case 'single-up':
            return <ArrowUp size={size} color={color} />;
        case 'forty-five-up':
            return <ArrowUpRight size={size} color={color} />;
        case 'flat':
            return <ArrowRight size={size} color={color} />;
        case 'forty-five-down':
            return <ArrowDownRight size={size} color={color} />;
        case 'single-down':
            return <ArrowDown size={size} color={color} />;
        case 'double-down':
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
