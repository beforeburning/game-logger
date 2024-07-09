import { useEffect } from 'react';
import TailwindIndicator from './components/tailwind-indicator';

function PageLayout({ children }) {
    useEffect(() => {}, []);

    return (
        <div className="relative flex min-h-screen flex-col items-center">
            {children}
            <TailwindIndicator></TailwindIndicator>
        </div>
    );
}
export default PageLayout;
