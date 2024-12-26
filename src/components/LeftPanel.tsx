import React from 'react';

interface LeftPanelProps {
    workflowAgents: any[];  // 工作流中的所有 agents
    currentOutput: string;  // 当前的输出
}

const LeftPanel = ({ workflowAgents, currentOutput }: LeftPanelProps) => {
    return (
        <div className="w-1/4 p-4 border-l">
            <h2 className="text-xl font-bold mb-4">每一步输出</h2>
            <div className="space-y-4">
                {workflowAgents.length > 1 ? (
                    workflowAgents.slice(0, -1).map((agent, index) => (
                        <div key={index} className="p-2 border rounded-md">
                            <h3 className="font-semibold">{`Step ${index + 1}: ${agent.name}`}</h3>
                            <p>{currentOutput}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">没有执行的步骤。</p>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;
