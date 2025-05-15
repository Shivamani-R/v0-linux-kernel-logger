"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Play, Pause, RotateCcw, Plus, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Tasklet sources
const taskletSources = [
  { id: "net", name: "Network Driver", color: "bg-green-500", description: "Network packet processing" },
  { id: "usb", name: "USB Driver", color: "bg-blue-500", description: "USB device events" },
  { id: "block", name: "Block Driver", color: "bg-purple-500", description: "Disk I/O completion" },
  { id: "input", name: "Input Driver", color: "bg-yellow-500", description: "Input device events" },
  { id: "timer", name: "Timer", color: "bg-red-500", description: "Timer expiration" },
]

// Generate a random tasklet
const generateTasklet = (isHighPriority = false) => {
  const source = taskletSources[Math.floor(Math.random() * taskletSources.length)]
  return {
    id: Math.random().toString(36).substring(2, 9),
    source,
    timestamp: Date.now(),
    duration: Math.floor(Math.random() * 3) + 1, // 1-3ms
    status: "pending",
    isHighPriority,
  }
}

export default function TaskletVisualizer() {
  const [cpuCount] = useState(4)
  const [running, setRunning] = useState(false)
  const [pendingTasklets, setPendingTasklets] = useState([])
  const [activeTasklets, setActiveTasklets] = useState(Array(cpuCount).fill(null))
  const [completedTasklets, setCompletedTasklets] = useState([])
  const [showHighPriorityOnly, setShowHighPriorityOnly] = useState(false)
  const [stats, setStats] = useState({
    totalScheduled: 0,
    totalCompleted: 0,
    highPriorityCount: 0,
    normalPriorityCount: 0,
    sourceDistribution: Object.fromEntries(taskletSources.map((source) => [source.id, 0])),
  })

  const animationRef = useRef(null)
  const lastTickRef = useRef(Date.now())
  const simulationSpeedRef = useRef(1) // 1x speed

  // Schedule a new tasklet
  const scheduleTasklet = (source = null, isHighPriority = false) => {
    const newTasklet = source
      ? { ...generateTasklet(isHighPriority), source }
      : generateTasklet(isHighPriority || Math.random() < 0.3) // 30% chance for high priority

    // High priority tasklets go to the front of the queue
    setPendingTasklets((prev) => {
      if (newTasklet.isHighPriority) {
        return [newTasklet, ...prev]
      } else {
        return [...prev, newTasklet]
      }
    })

    setStats((prev) => ({
      ...prev,
      totalScheduled: prev.totalScheduled + 1,
      highPriorityCount: prev.highPriorityCount + (newTasklet.isHighPriority ? 1 : 0),
      normalPriorityCount: prev.normalPriorityCount + (newTasklet.isHighPriority ? 0 : 1),
      sourceDistribution: {
        ...prev.sourceDistribution,
        [newTasklet.source.id]: prev.sourceDistribution[newTasklet.source.id] + 1,
      },
    }))
  }

  // Reset the simulation
  const resetSimulation = () => {
    setRunning(false)
    setPendingTasklets([])
    setActiveTasklets(Array(cpuCount).fill(null))
    setCompletedTasklets([])
    setStats({
      totalScheduled: 0,
      totalCompleted: 0,
      highPriorityCount: 0,
      normalPriorityCount: 0,
      sourceDistribution: Object.fromEntries(taskletSources.map((source) => [source.id, 0])),
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

    // Process active tasklets
    let newActiveTasklets = [...activeTasklets]
    let newCompletedTasklets = [...completedTasklets]

    // Update active tasklets
    newActiveTasklets = newActiveTasklets.map((tasklet) => {
      if (!tasklet) return null

      const elapsedTime = now - tasklet.startTime
      if (elapsedTime >= tasklet.duration * 100) {
        // Tasklet completed
        const completedTasklet = {
          ...tasklet,
          status: "completed",
          completionTime: now,
        }
        newCompletedTasklets = [completedTasklet, ...newCompletedTasklets].slice(0, 100) // Keep last 100
        setStats((prev) => ({
          ...prev,
          totalCompleted: prev.totalCompleted + 1,
        }))
        return null
      }
      return tasklet
    })

    // Try to schedule pending tasklets on available CPUs
    let newPendingTasklets = [...pendingTasklets]

    // First, handle high priority tasklets
    const highPriorityTasklets = newPendingTasklets.filter((t) => t.isHighPriority)
    const normalPriorityTasklets = newPendingTasklets.filter((t) => !t.isHighPriority)

    // Process high priority first
    for (let i = 0; i < cpuCount; i++) {
      if (!newActiveTasklets[i] && highPriorityTasklets.length > 0) {
        const nextTasklet = highPriorityTasklets.shift()
        newActiveTasklets[i] = {
          ...nextTasklet,
          status: "active",
          startTime: now,
          cpu: i,
        }
      }
    }

    // Then normal priority
    for (let i = 0; i < cpuCount; i++) {
      if (!newActiveTasklets[i] && normalPriorityTasklets.length > 0) {
        const nextTasklet = normalPriorityTasklets.shift()
        newActiveTasklets[i] = {
          ...nextTasklet,
          status: "active",
          startTime: now,
          cpu: i,
        }
      }
    }

    // Rebuild pending queue with remaining tasklets
    newPendingTasklets = [...highPriorityTasklets, ...normalPriorityTasklets]

    // Randomly schedule new tasklets (if running)
    if (running && Math.random() < 0.1) {
      scheduleTasklet()
    }

    setPendingTasklets(newPendingTasklets)
    setActiveTasklets(newActiveTasklets)
    setCompletedTasklets(newCompletedTasklets)

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

  // Filter completed tasklets based on priority switch
  const filteredCompletedTasklets = showHighPriorityOnly
    ? completedTasklets.filter((t) => t.isHighPriority)
    : completedTasklets

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Tasklet Execution Visualization
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
                <h3 className="text-sm font-medium">CPU Cores (Tasklet Execution)</h3>
                {Array.from({ length: cpuCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 text-sm">CPU {i}</div>
                    <div className="flex-1 h-8 bg-gray-800 rounded-md relative overflow-hidden">
                      {activeTasklets[i] ? (
                        <div
                          className={`h-full ${activeTasklets[i].source.color} flex items-center justify-center text-xs font-medium text-white`}
                          style={{
                            width: `${
                              ((Date.now() - activeTasklets[i].startTime) / (activeTasklets[i].duration * 100)) * 100
                            }%`,
                          }}
                        >
                          {activeTasklets[i].isHighPriority ? "HI-" : ""}
                          {activeTasklets[i].source.id}
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

              {/* Pending Tasklets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Pending Tasklets</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800 hover:bg-gray-700 border-gray-700 h-7 px-2"
                      onClick={() => scheduleTasklet(null, false)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Normal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-900 hover:bg-red-800 border-red-800 h-7 px-2"
                      onClick={() => scheduleTasklet(null, true)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      High
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pendingTasklets.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">No pending tasklets</div>
                  ) : (
                    pendingTasklets.slice(0, 12).map((tasklet) => (
                      <Badge
                        key={tasklet.id}
                        className={`${tasklet.source.color} ${
                          tasklet.isHighPriority ? "ring-1 ring-red-500" : ""
                        } bg-opacity-20 text-white`}
                        title={`${tasklet.source.name} (${tasklet.isHighPriority ? "High" : "Normal"} Priority)`}
                      >
                        {tasklet.isHighPriority ? "HI-" : ""}
                        {tasklet.source.id}
                      </Badge>
                    ))
                  )}
                  {pendingTasklets.length > 12 && <Badge variant="outline">+{pendingTasklets.length - 12} more</Badge>}
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Completed Tasklets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Recently Completed Tasklets</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="high-priority-only"
                      checked={showHighPriorityOnly}
                      onCheckedChange={setShowHighPriorityOnly}
                    />
                    <Label htmlFor="high-priority-only" className="text-xs">
                      High Priority Only
                    </Label>
                  </div>
                </div>

                <ScrollArea className="h-32 rounded-md border border-gray-800">
                  <div className="p-2 space-y-1">
                    {filteredCompletedTasklets.length === 0 ? (
                      <div className="text-sm text-gray-500 py-2">No completed tasklets</div>
                    ) : (
                      filteredCompletedTasklets.map((tasklet) => (
                        <div
                          key={tasklet.id}
                          className="flex items-center justify-between text-xs bg-gray-800 p-1.5 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tasklet.source.color}`}></div>
                            <span>{tasklet.source.name}</span>
                            {tasklet.isHighPriority && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-900 text-red-300">
                                High
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>CPU {tasklet.cpu}</span>
                            <span className="text-gray-400">{tasklet.duration}ms</span>
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
            <CardTitle className="text-sm">Tasklet Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Total Scheduled</div>
                  <div className="text-xl font-bold">{stats.totalScheduled}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Completed</div>
                  <div className="text-xl font-bold">{stats.totalCompleted}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">High Priority</div>
                  <div className="text-xl font-bold">{stats.highPriorityCount}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Normal Priority</div>
                  <div className="text-xl font-bold">{stats.normalPriorityCount}</div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium mb-2">Source Distribution</h3>
                {taskletSources.map((source) => (
                  <div key={source.id} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${source.color}`}></div>
                        {source.name}
                      </span>
                      <span>{stats.sourceDistribution[source.id]}</span>
                    </div>
                    <Progress
                      value={
                        stats.totalScheduled > 0
                          ? (stats.sourceDistribution[source.id] / stats.totalScheduled) * 100
                          : 0
                      }
                      className="h-1.5"
                      indicatorClassName={source.color}
                    />
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium mb-2">Tasklet Execution Flow</h3>
                <div className="bg-gray-800 p-2 rounded-md text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">
                      1
                    </div>
                    <span>Driver calls tasklet_schedule()</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">
                      2
                    </div>
                    <span>Tasklet marked as pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">
                      3
                    </div>
                    <span>TASKLET_SOFTIRQ raised</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">
                      4
                    </div>
                    <span>Tasklet handler executes in softirq context</span>
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
