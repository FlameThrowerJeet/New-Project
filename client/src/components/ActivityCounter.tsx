import React, { useState, useEffect } from 'react';
import './ActivityCounter.css';

const questions = [
    "Did you complete your planned task for this session?",
    "Did you stick to your water fasting goal this hour?",
    "Was your last session productive?",
    "Have you reviewed your mission objectives recently?",
    "Are you prepared for the next tactical phase?",
];

const ActivityCounter: React.FC = () => {
    const [count, setCount] = useState<number>(0);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [isVisible, setIsVisible] = useState<boolean>(false);

    // Effect to cycle through questions and show the prompt
    useEffect(() => {
        const showPrompt = () => {
            const randomIndex = Math.floor(Math.random() * questions.length);
            setCurrentQuestion(questions[randomIndex]);
            setIsVisible(true);
        };
        
        // Initially show after a delay, then periodically
        const initialTimeout = setTimeout(showPrompt, 10000); // 10s
        const interval = setInterval(showPrompt, 60000); // 1 minute

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const handleResponse = (response: 'yes' | 'no') => {
        if (response === 'yes') {
            setCount(prev => prev + 1);
        } else {
            setCount(0);
        }
        setIsVisible(false);
    };

    return (
        <>
            <div className="activity-counter-container">
                <div className="counter-display">{count}</div>
                <div className="counter-label">SUCCESS STREAK</div>
            </div>

            {isVisible && (
                <div className="activity-prompt-overlay">
                    <div className="prompt-window">
                        <p className="prompt-question">{currentQuestion}</p>
                        <div className="prompt-buttons">
                            <button onClick={() => handleResponse('yes')} className="prompt-btn yes">YES</button>
                            <button onClick={() => handleResponse('no')} className="prompt-btn no">NO</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ActivityCounter; 