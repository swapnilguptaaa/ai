"use client";

import { useState, useEffect } from 'react';
import { intervalToDuration, formatDuration } from 'date-fns';
import { Instagram, Linkedin } from 'lucide-react';

const CreatorInfo = () => {
    const [age, setAge] = useState('');
    const birthDate = new Date('2005-01-26T12:30:00');

    useEffect(() => {
        const calculateAge = () => {
            const now = new Date();
            const duration = intervalToDuration({ start: birthDate, end: now });
            const formattedDuration = formatDuration(duration, {
                format: ['years', 'months', 'days', 'hours', 'minutes', 'seconds'],
            });
            setAge(formattedDuration);
        };

        const timer = setInterval(calculateAge, 1000);
        calculateAge(); // Initial calculation

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="prose dark:prose-invert max-w-none">
            <h3>About the Creator</h3>
            <p>This platform was created by <strong>Swapnil Gupta</strong>, an enthusiastic budding entrepreneur.</p>
            
            <h4>Details:</h4>
            <ul>
                <li><strong>Born:</strong> January 26, 2005 at 12:30 PM</li>
                <li><strong>Gender:</strong> Male</li>
                <li><strong>Location:</strong> Dewas, Madhya Pradesh, India</li>
                <li>
                    <strong>Current Age:</strong>
                    <span className="font-mono ml-2 bg-muted p-1 rounded">
                        {age || 'Calculating...'}
                    </span>
                </li>
            </ul>

            <h4>Connect:</h4>
            <div className="flex gap-4 items-center">
                 <a
                    href="https://www.instagram.com/swapnilguptaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex items-center gap-2 no-underline text-foreground transition-colors hover:text-accent"
                >
                    <Instagram className="h-5 w-5" />
                    <span>@swapnilguptaaa</span>
                </a>
                <a
                    href="https://www.linkedin.com/in/swapnilguptaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex items-center gap-2 no-underline text-foreground transition-colors hover:text-accent"
                >
                    <Linkedin className="h-5 w-5" />
                    <span>@swapnilguptaaa</span>
                </a>
            </div>
        </div>
    );
};

export default CreatorInfo;
