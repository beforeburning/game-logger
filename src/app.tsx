import { useRoutes } from 'react-router-dom';
import PageLayout from '@/components/layout/page';
import '@/assets/css/main.css';
import routes from '@/routes';

function App() {
    const views = useRoutes(routes);

    return (
        <>
            <PageLayout>{views}</PageLayout>
        </>
    );
}

export default App;
