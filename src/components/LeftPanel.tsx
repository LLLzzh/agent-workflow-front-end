import React, { useState, useEffect } from 'react';
import { Agent } from "@/pages/api/apis";

interface LeftPnelProps {
    workflowAgents: Agent[];  // 工作流中的所有 agents
    currentOutput: { id: string, content: string }[];  // 当前的输出
}

const LeftPanel = ({ workflowAgents, currentOutput }: LeftPnelProps) => {
    // 使用 useState 来存储 output 缓存
    const [outputCache, setOutputCache] = useState<{ [key: string]: string }>({});

    // 每次 currentOutput 更新时，更新缓存
    useEffect(() => {
        const newCache = { ...outputCache }; // 复制当前缓存
        currentOutput.forEach(output => {
            if (newCache[output.id] !== output.content) {
                newCache[output.id] = output.content;
            }
        });
        setOutputCache(newCache); // 更新缓存
    }, [currentOutput]);

    return (
        <div className="w-1/3 p-4 border-l">
            <h2 className="text-xl font-bold mb-4 pt-4">每一步输出</h2>
            <div className="space-y-4">
                {workflowAgents.length > 0 ? (
                    workflowAgents.map((agent, index) => (
                        <div key={agent.id} className="p-2 border rounded-md max-h-80 overflow-y-auto">
                            <h3 className="font-semibold">{`Step ${index + 1}: ${agent.name}`}</h3>
                            {
                                outputCache[agent.id] !== undefined ?
                                    <textarea className={"w-full p-2 border rounded h-60"} readOnly={true} value={outputCache[agent.id]}/> :
                                    <p>未执行</p>
                            }
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">没有待执行的步骤。</p>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;
