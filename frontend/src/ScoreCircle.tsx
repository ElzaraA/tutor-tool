import React from 'react';

interface ScoreCircleProps {
    score: number;
    maxScore?: number;
    size?: number;
    }

const ScoreCircle: React.FC<ScoreCircleProps> = ({ 
    score, 
    maxScore = 5, 
    size = 60 
    }) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / maxScore) * circumference;
    const offset = circumference - progress;

    // Определяем цвет по баллу
const getColor = (score: number): string => {
    if (score < 4) return '#ff4444';      
    if (score <= 4.5) return '#ff9800';      
    return '#4caf50';                     
};

return (
    <div style={{ 
    position: 'relative', 
    width: size, 
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
}}>
    <svg width={size} height={size}>
    {/* Фоновый круг (серый) */}
            <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#333"
            strokeWidth={strokeWidth}
            />
            {/* Прогресс (цветной) */}
            <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
        </svg>
        {/* Текст по центру */}
        <span style={{
            position: 'absolute',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff'
        }}>
            {score}
        </span>
        </div>
    );
    };

export default ScoreCircle;