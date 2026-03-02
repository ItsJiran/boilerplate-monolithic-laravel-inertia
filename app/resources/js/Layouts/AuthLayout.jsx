export default function AuthLayout({ children, previewContent }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex">
            {/* Left Side - Form Area */}
            <div className="w-full bg-white lg:w-5/12 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>

            {/* Right Side - Preview Area */}
            <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-blue-50 to-purple-100 p-12 items-center justify-center">
                {previewContent}
            </div>
        </div>
    );
}