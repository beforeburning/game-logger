import { RouteObject } from 'react-router-dom';
import Home from '@/views/Home/index';

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Home />,
    },
];

export default routes;
