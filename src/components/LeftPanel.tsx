interface LeftPanelProps {
    results: string[]
}

export default function LeftPanel({ results }: LeftPanelProps) {
    return (
        <div className="w-1/4 border-r p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">执行结果</h2>
            {results.map((result, index) => (
                <ResultCard key={index} content={result} />
            ))}
        </div>
    )
}

function ResultCard({ content }: { content: string }) {
    return (
        <div className="p-4 mb-2 border rounded shadow">
            {content}
        </div>
    )
} 