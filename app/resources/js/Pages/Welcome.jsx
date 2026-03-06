import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome | AT-Monolith" />
            <div className="font-sans antialiased bg-white text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">

                {/* Header Navbar */}
                <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">AT-Monolith</h1>
                                    <p className="text-xs text-indigo-600 font-medium tracking-wide">Development Starter</p>
                                </div>
                            </div>
                            
                            <nav className="flex items-center gap-4 text-sm font-medium">
                                <Link
                                    href={route('test.db')}
                                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    Database Test
                                </Link>
                                
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
                                        <Link
                                            href={route('login')}
                                            className="text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex justify-center items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 transition-all shadow-sm"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="relative isolate pt-24 min-h-[calc(100vh-80px)]">
                    {/* Background decorations */}
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-purple-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
                    </div>

                    {/* Hero Section */}
                    <div className="py-24 sm:py-32 lg:pb-40">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center">
                                <div className="mb-8 flex justify-center">
                                    <span className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-indigo-700 ring-1 ring-indigo-600/20 hover:ring-indigo-600/30 bg-indigo-50/50 font-medium tracking-wide">
                                        Full-Stack App Boilerplate
                                    </span>
                                </div>
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                                    Build modern apps faster with AT-Monolith
                                </h1>
                                <p className="mt-6 text-lg leading-8 text-slate-600">
                                    A robust, production-ready foundation powered by Laravel 12 and React. Integrated with MinIO, Reverb, Redis, and a complete Docker developer experience.
                                </p>
                                <div className="mt-10 flex items-center justify-center gap-x-6">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                            Access Dashboard &rarr;
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('register')}
                                                className="rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            >
                                                Start Building
                                            </Link>
                                            <Link 
                                                href={route('login')} 
                                                className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors"
                                            >
                                                Log in <span aria-hidden="true">→</span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="mx-auto mt-24 max-w-7xl">
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* Feature 1 */}
                                    <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">FrankenPHP & Octane</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            High-performance Laravel application server delivering incredibly fast response times for your APIs and web pages.
                                        </p>
                                    </div>

                                    {/* Feature 2 */}
                                    <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Telemetry</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Integrated Prometheus, Loki, and Grafana monitoring stack alongside Laravel Reverb WebSockets for real-time reactivity.
                                        </p>
                                    </div>

                                    {/* Feature 3 */}
                                    <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50">
                                            <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Docker Infrastructure</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Fully containerized environment featuring MariaDB, Redis, MinIO S3 storage, and automated Step CA SSL certificates for local dev.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Center Aligned */}
                <footer className="bg-white border-t border-slate-100 py-10 mt-auto relative z-10 w-full">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2 mb-4 text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="font-bold tracking-tight text-slate-900">AT-Monolith</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                            A fully-featured Laravel and React boilerplate for building scalable web applications.
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-medium text-slate-400">
                            <span>Laravel v{laravelVersion}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>PHP v{phpVersion}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>© {new Date().getFullYear()} ItsJiran</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
