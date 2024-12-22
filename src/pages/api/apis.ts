import request from "@/pages/api/config"

/**
 * @description agent 基础接口
 */
interface AgentBase {
    name: string
    description: string
    avatar: string
    kind: number
}

/**
 * @description 分析者 agent (kind = 0)
 */
interface AnalyseAgent extends AgentBase {
    identity_setting: string
    task: string
}

/**
 * @description 评判者 agent (kind = 1)
 */
interface JudgeAgent extends AgentBase {
    identity_setting: string
    task: string
    output: string[]
}

/**
 * @description 处理者 agent (kind = 2)
 */
interface HandleAgent extends AgentBase {
    deal: string
}

/**
 * @description 绘画者 agent (kind = 3)
 */
interface PainterAgent extends AgentBase {
    identity_setting: string
    style: string
}

/**
 * @description 创建 agent 的类型
 */
export type CreateAgentData = AnalyseAgent | JudgeAgent | HandleAgent | PainterAgent

/**
 * @description 更新 agent 的类型
 */
export type UpdateAgentData = { id: string } & CreateAgentData

/**
 * @description 创建agent
 */
export async function createAgent(data: CreateAgentData) {
    const res = await request.post<CreateRes>('/agent/create', data)
    return res.data
}

interface CreateRes {
    code: number
    msg: string
    payload: string
}

/**
 * @description update agent
 */
export async function updateAgent(data: UpdateAgentData) {
    const res = await request.post('/agent/update', data)
    return res
}

/**
 * @description 删除的接口
 */
interface deleteAgent {
    id: string
}

/**
 * @description delete agent
 */
export async function deleteAgent(id: string) {
    const res = await request.get(`/agent/delete?id=${id}`)
    return res
}

/**
 * @description get the list of agents
 */
export async function getAgentList(kind: number): Promise<AgentListRes> {
    const res = await request.get(`/agent/list?kind=${kind}`)
    return res.data
}

/**
 * @description agent list
 */
interface AgentListRes {
    code: number
    msg: string
    payload: Agent[]
}

export type Agent = AnalyseAgent | JudgeAgent | HandleAgent | PainterAgent

/**
 * @description call agent
 */
export async function callAgent(data: CallAgentData) {
    const res = await request.post('/call/one', data)
    return res
}

interface CallAgentData {
    id: string
    text: string
}
