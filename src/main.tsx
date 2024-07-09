import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Connect2ICProvider } from '@connect2ic/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './app.tsx';
import { createClient } from './components/connect/connect.ts';

const whitelist = ['bzsui-sqaaa-aaaah-qce2a-cai', 'jv55j-riaaa-aaaal-abvnq-cai'];

const connectClient = createClient(whitelist);
console.log(connectClient);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.Fragment>
        <BrowserRouter>
            <Connect2ICProvider client={connectClient}>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </Connect2ICProvider>
        </BrowserRouter>
    </React.Fragment>,
);
