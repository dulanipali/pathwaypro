import { ClerkProvider } from '@clerk/nextjs';


function MyApp({ Component, pageProps }) {
    return (
        <ClerkProvider 
            frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
        >
            <Component {...pageProps} />
        </ClerkProvider>
    );
}

export default MyApp;
