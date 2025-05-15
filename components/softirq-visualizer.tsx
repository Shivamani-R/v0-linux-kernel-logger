"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Zap, Play, Pause, RotateCcw, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

// Softirq types with colors
const softirqTypes = [
  { id: "HI", name: "HI_SOFTIRQ", color: "bg-red-500", description: "High priority tasks" },
  { id: "TIMER", name: "TIMER_SOFTIRQ", color: "bg-yellow-500", description: "Timer processing" },
  { id: "NET_TX", name: "NET_TX_SOFTIRQ", color: "bg-green-500", description: "Network transmission" },
  { id: "NET_RX", name: "NET_RX_SOFTIRQ", color: "bg-blue-500", description: "Network reception" },
  { id: "BLOCK", name: "BLOCK_SOFTIRQ", color: "bg-purple-500", description: "Block device I/O" },
  { id: "TASKLET", name: "TASKLET_SOFTIRQ", color: "bg-pink-500", description: "Tasklet processing" },
]

// Generate a random softirq event
const generateSoftirqEvent = () => {
  const type = softirqTypes[Math.floor(Math.random() * softirqTypes.length)]
  return {
    id: Math.random().toString(36).substring(2, 9),
    type,
    timestamp: Date.now(),
    duration: Math.floor(Math.random() * 5) + 1, // 1-5ms
    status: "pending",
    cpu: Math.floor(Math.random() * 4), // 0-3 (4 CPUs)
  }
}

export default function SoftirqVisualizer() {
  const [cpuCount] = useState(4)
  const [running, setRunning] = useState(false)
  const [pendingSoftirqs, setPendingSoftirqs] = useState([])
  const [activeSoftirqs, setActiveSoftirqs] = useState(Array(cpuCount).fill(null))
  const [completedSoftirqs, setCompletedSoftirqs] = useState([])
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalCompleted: 0,
    avgLatency: 0,
    typeDistribution: Object.fromEntries(softirqTypes.map((type) => [type.id, 0])),
  })

  const animationRef = useRef(null)
  const lastTickRef = useRef(Date.now())
  const simulationSpeedRef = useRef(1) // 1x speed

  // Add a new softirq to the pending queue
  const raiseSoftirq = (type = null) => {
    const newSoftirq = type ? { ...generateSoftirqEvent(), type } : generateSoftirqEvent()
    setPendingSoftirqs((prev) => [...prev, newSoftirq])
    setStats((prev) => ({
      ...prev,
      totalRaised: prev.totalRaised + 1,
      typeDistribution: {
        ...prev.typeDistribution,
        [newSoftirq.type.id]: prev.typeDistribution[newSoftirq.type.id] + 1,
      },
    }))
  }

  // Reset the simulation
  const resetSimulation = () => {
    setRunning(false)
    setPendingSoftirqs([])
    setActiveSoftirqs(Array(cpuCount).fill(null))
    setCompletedSoftirqs([])
    setStats({
      totalRaised: 0,
      totalCompleted: 0,
      avgLatency: 0,
      typeDistribution: Object.fromEntries(softirqTypes.map((type) => [type.id, 0])),
    })
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // Animation loop
  const tick = () => {
    const now = Date.now()
    const deltaTime = (now - lastTickRef.current) * simulationSpeedRef.current
    lastTickRef.current = now

    // Process active softirqs
    let newActiveSoftirqs = [...activeSoftirqs]
    let newCompletedSoftirqs = [...completedSoftirqs]

    // Update active softirqs
    newActiveSoftirqs = newActiveSoftirqs.map((softirq) => {
      if (!softirq) return null

      const elapsedTime = now - softirq.startTime
      if (elapsedTime >= softirq.duration * 100) {
        // Softirq completed
        const completedSoftirq = {
          ...softirq,
          status: "completed",
          completionTime: now,
        }
        newCompletedSoftirqs = [completedSoftirq, ...newCompletedSoftirqs].slice(0, 100) // Keep last 100
        setStats((prev) => ({
          ...prev,
          totalCompleted: prev.totalCompleted + 1,
          avgLatency: (prev.avgLatency * (prev.totalCompleted - 1) + (now - softirq.timestamp)) / prev.totalCompleted,
        }))
        return null
      }
      return softirq
    })

    // Try to schedule pending softirqs on available CPUs
    const newPendingSoftirqs = [...pendingSoftirqs]
    for (let i = 0; i < cpuCount; i++) {
      if (!newActiveSoftirqs[i] && newPendingSoftirqs.length > 0) {
        const nextSoftirq = newPendingSoftirqs.shift()
        newActiveSoftirqs[i] = {
          ...nextSoftirq,
          status: "active",
          startTime: now,
          cpu: i,
        }
      }
    }

    // Randomly raise new softirqs (if running)
    if (running && Math.random() < 0.1) {
      raiseSoftirq()
    }

    setPendingSoftirqs(newPendingSoftirqs)
    setActiveSoftirqs(newActiveSoftirqs)
    setCompletedSoftirqs(newCompletedSoftirqs)

    if (running) {
      animationRef.current = requestAnimationFrame(tick)
    }
  }

  // Start/stop the simulation
  useEffect(() => {
    if (running) {
      lastTickRef.current = Date.now()
      animationRef.current = requestAnimationFrame(tick)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [running])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Softirq Execution Visualization
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                  onClick={() => setRunning(!running)}
                >
                  {running ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                  {running ? "Pause" : "Start"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                  onClick={resetSimulation}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* CPU Visualization */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">CPU Cores</h3>
                {Array.from({ length: cpuCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 text-sm">CPU {i}</div>
                    <div className="flex-1 h-8 bg-gray-800 rounded-md relative overflow-hidden">
                      {activeSoftirqs[i] ? (
                        <div
                          className={`h-full ${activeSoftirqs[i].type.color} flex items-center justify-center text-xs font-medium text-white`}
                          style={{
                            width: `${
                              ((Date.now() - activeSoftirqs[i].startTime) / (activeSoftirqs[i].duration * 100)) * 100
                            }%`,
                          }}
                        >
                          {activeSoftirqs[i].type.id}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                          Idle
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-gray-800" />

              {/* Pending Softirqs */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Pending Softirqs</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800 hover:bg-gray-700 border-gray-700 h-7 px-2"
                      onClick={() => raiseSoftirq()}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Random
                    </Button>
                    <div className="flex gap-1">
                      {softirqTypes.slice(0, 3).map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          size="sm"
                          className={`${type.color} bg-opacity-20 hover:bg-opacity-30 border-none h-7 w-7 p-0`}
                          onClick={() => raiseSoftirq(type)}
                          title={type.name}
                        >
                          {type.id.charAt(0)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pendingSoftirqs.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">No pending softirqs</div>
                  ) : (
                    pendingSoftirqs.slice(0, 12).map((softirq) => (
                      <Badge
                        key={softirq.id}
                        className={`${softirq.type.color} bg-opacity-20 text-white`}
                        title={softirq.type.name}
                      >
                        {softirq.type.id}
                      </Badge>
                    ))
                  )}
                  {pendingSoftirqs.length > 12 && <Badge variant="outline">+{pendingSoftirqs.length - 12} more</Badge>}
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Completed Softirqs */}
              <div>
                <h3 className="text-sm font-medium mb-2">Recently Completed Softirqs</h3>
                <ScrollArea className="h-32 rounded-md border border-gray-800">
                  <div className="p-2 space-y-1">
                    {completedSoftirqs.length === 0 ? (
                      <div className="text-sm text-gray-500 py-2">No completed softirqs</div>
                    ) : (
                      completedSoftirqs.map((softirq) => (
                        <div
                          key={softirq.id}
                          className="flex items-center justify-between text-xs bg-gray-800 p-1.5 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${softirq.type.color}`}></div>
                            <span>{softirq.type.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>CPU {softirq.cpu}</span>
                            <span className="text-gray-400">{softirq.duration}ms</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm">Softirq Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Total Raised</div>
                  <div className="text-xl font-bold">{stats.totalRaised}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Completed</div>
                  <div className="text-xl font-bold">{stats.totalCompleted}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Pending</div>
                  <div className="text-xl font-bold">{pendingSoftirqs.length}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Avg Latency</div>
                  <div className="text-xl font-bold">
                    {stats.avgLatency ? Math.round(stats.avgLatency) : 0}
                    <span className="text-xs text-gray-400 ml-1">ms</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium mb-2">Type Distribution</h3>
                {softirqTypes.map((type) => (
                  <div key={type.id} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${type.color}`}></div>
                        {type.name}
                      </span>
                      <span>{stats.typeDistribution[type.id]}</span>
                    </div>
                    <Progress
                      value={stats.totalRaised > 0 ? (stats.typeDistribution[type.id] / stats.totalRaised) * 100 : 0}
                      className="h-1.5"
                      indicatorClassName={type.color}
                    />
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium mb-2">Softirq Execution Flow</h3>
                <div className="bg-gray-800 p-2 rounded-md text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">
                      1
                    </div>
                    <span>Hardware interrupt occurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">
                      2
                    </div>
                    <span>Interrupt handler marks softirq as pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">
                      3
                    </div>
                    <span>Kernel checks for pending softirqs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">
                      4
                    </div>
                    <span>Softirq handler executes with interrupts enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
