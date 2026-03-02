export default function IndexTableCard({ children }) {
    return (
        <div className="bg-white border border-gray-200">
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}
