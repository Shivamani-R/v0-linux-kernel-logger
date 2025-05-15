"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Server, Play, Pause, RotateCcw, Plus, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Workqueue types
const workqueueTypes = [
  { id: "system", name: "System Workqueue", color: "bg-blue-500", description: "Default shared workqueue" },
  { id: "kblockd", name: "kblockd", color: "bg-purple-500", description: "Block device operations" },
  { id: "kswapd", name: "kswapd", color: "bg-green-500", description: "Memory management" },
  { id: "events", name: "events", color: "bg-yellow-500", description: "System events" },
  { id: "usb", name: "usb", color: "bg-red-500", description: "USB subsystem" },
]

// Work item priorities
const workPriorities = [
  { id: "high", name: "High Priority", delay: 0 },
  { id: "normal", name: "Normal Priority", delay: 1 },
  { id: "low", name: "Low Priority", delay: 2 },
]

// Generate a random work item
const generateWorkItem = () => {
  const type = workqueueTypes[Math.floor(Math.random() * workqueueTypes.length)]
  const priority = workPriorities[Math.floor(Math.random() * workPriorities.length)]
  return {
    id: Math.random().toString(36).substring(2, 9),
    type,
    priority,
    timestamp: Date.now(),
    duration: Math.floor(Math.random() * 10) + 3, // 3-12 seconds (simulated)
    status: "pending",
    progress: 0,
    canSleep: Math.random() > 0.7, // 30% chance the work item will sleep
    sleepDuration: Math.floor(Math.random() * 3) + 1, // 1-3 seconds
  }
}

export default function WorkqueueVisualizer() {
  const [workerCount, setWorkerCount] = useState(4)
  const [running, setRunning] = useState(false)
  const [pendingWork, setPendingWork] = useState([])
  const [activeWork, setActiveWork] = useState([])
  const [completedWork, setCompletedWork] = useState([])
  const [stats, setStats] = useState({
    totalQueued: 0,
    totalCompleted: 0,
    avgCompletionTime: 0,
    typeDistribution: Object.fromEntries(workqueueTypes.map((type) => [type.id, 0])),
  })

  const animationRef = useRef(null)
  const lastTickRef = useRef(Date.now())
  const simulationSpeedRef = useRef(1) // 1x speed

  // Add a new work item to the pending queue
  const queueWork = (type = null, priority = null) => {
    const newWork = generateWorkItem()
    if (type) newWork.type = type
    if (priority) newWork.priority = priority

    // Sort by priority (high first)
    setPendingWork((prev) => {
      const updated = [...prev, newWork].sort((a, b) => {
        const priorityA = workPriorities.findIndex((p) => p.id === a.priority.id)
        const priorityB = workPriorities.findIndex((p) => p.id === b.priority.id)
        return priorityA - priorityB
      })
      return updated
    })

    setStats((prev) => ({
      ...prev,
      totalQueued: prev.totalQueued + 1,
      typeDistribution: {
        ...prev.typeDistribution,
        [newWork.type.id]: prev.typeDistribution[newWork.type.id] + 1,
      },
    }))
  }

  // Reset the simulation
  const resetSimulation = () => {
    setRunning(false)
    setPendingWork([])
    setActiveWork([])
    setCompletedWork([])
    setStats({
      totalQueued: 0,
      totalCompleted: 0,
      avgCompletionTime: 0,
      typeDistribution: Object.fromEntries(workqueueTypes.map((type) => [type.id, 0])),
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

    // Update active work items
    let newActiveWork = [...activeWork]
    let newCompletedWork = [...completedWork]

    // Process active work
    newActiveWork = newActiveWork
      .map((work) => {
        // Skip if the worker is sleeping
        if (work.sleeping) {
          const sleepElapsed = now - work.sleepStart
          if (sleepElapsed >= work.sleepDuration * 1000) {
            // Wake up from sleep
            return { ...work, sleeping: false }
          }
          return work
        }

        // Check if work should sleep
        if (work.canSleep && !work.hasSleepBefore && work.progress > 0.5) {
          return {
            ...work,
            sleeping: true,
            sleepStart: now,
            hasSleepBefore: true,
          }
        }

        // Update progress
        const progressIncrement = deltaTime / (work.duration * 1000)
        const newProgress = work.progress + progressIncrement

        if (newProgress >= 1) {
          // Work completed
          const completedWork = {
            ...work,
            status: "completed",
            completionTime: now,
            progress: 1,
          }
          newCompletedWork = [completedWork, ...newCompletedWork].slice(0, 100) // Keep last 100
          setStats((prev) => ({
            ...prev,
            totalCompleted: prev.totalCompleted + 1,
            avgCompletionTime:
              (prev.avgCompletionTime * (prev.totalCompleted - 1) + (now - work.timestamp)) / prev.totalCompleted,
          }))
          return null
        }

        return { ...work, progress: newProgress }
      })
      .filter(Boolean)

    // Try to schedule pending work to available workers
    const newPendingWork = [...pendingWork]
    while (newActiveWork.length < workerCount && newPendingWork.length > 0) {
      const nextWork = newPendingWork.shift()
      newActiveWork.push({
        ...nextWork,
        status: "active",
        startTime: now,
        progress: 0,
        workerId: newActiveWork.length,
      })
    }

    // Randomly queue new work (if running)
    if (running && Math.random() < 0.05) {
      queueWork()
    }

    setPendingWork(newPendingWork)
    setActiveWork(newActiveWork)
    setCompletedWork(newCompletedWork)

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
                <Server className="h-5 w-5 text-blue-500" />
                Workqueue Execution Visualization
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
              {/* Worker Threads Visualization */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Worker Threads</h3>
                  <Select
                    value={workerCount.toString()}
                    onValueChange={(value) => {
                      const newCount = Number.parseInt(value)
                      setWorkerCount(newCount)
                      // Adjust active workers if needed
                      if (activeWork.length > newCount) {
                        setActiveWork((prev) => prev.slice(0, newCount))
                      }
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-8 text-xs bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Workers" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="2">2 Workers</SelectItem>
                      <SelectItem value="4">4 Workers</SelectItem>
                      <SelectItem value="8">8 Workers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {Array.from({ length: workerCount }).map((_, i) => {
                  const worker = activeWork.find((w) => w.workerId === i)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-20 text-sm">Worker {i}</div>
                      <div className="flex-1 h-10 bg-gray-800 rounded-md relative overflow-hidden">
                        {worker ? (
                          <div className="h-full w-full">
                            <div
                              className={`h-full ${worker.type.color} flex items-center px-2 text-xs font-medium text-white`}
                              style={{ width: `${worker.progress * 100}%` }}
                            >
                              {worker.type.id}
                            </div>
                            {worker.sleeping && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Sleeping
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                            Idle
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator className="bg-gray-800" />

              {/* Pending Work */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Pending Work Items</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800 hover:bg-gray-700 border-gray-700 h-7 px-2"
                      onClick={() => queueWork()}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Random
                    </Button>
                    <div className="flex gap-1">
                      {workqueueTypes.slice(0, 3).map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          size="sm"
                          className={`${type.color} bg-opacity-20 hover:bg-opacity-30 border-none h-7 w-7 p-0`}
                          onClick={() => queueWork(type)}
                          title={type.name}
                        >
                          {type.id.charAt(0).toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pendingWork.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">No pending work</div>
                  ) : (
                    pendingWork.slice(0, 12).map((work) => (
                      <Badge
                        key={work.id}
                        className={`${work.type.color} bg-opacity-20 text-white flex items-center gap-1`}
                        title={`${work.type.name} (${work.priority.name})`}
                      >
                        {work.type.id}
                        <span
                          className={`w-2 h-2 rounded-full ${
                            work.priority.id === "high"
                              ? "bg-red-500"
                              : work.priority.id === "normal"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        ></span>
                      </Badge>
                    ))
                  )}
                  {pendingWork.length > 12 && <Badge variant="outline">+{pendingWork.length - 12} more</Badge>}
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Completed Work */}
              <div>
                <h3 className="text-sm font-medium mb-2">Recently Completed Work</h3>
                <ScrollArea className="h-32 rounded-md border border-gray-800">
                  <div className="p-2 space-y-1">
                    {completedWork.length === 0 ? (
                      <div className="text-sm text-gray-500 py-2">No completed work</div>
                    ) : (
                      completedWork.map((work) => (
                        <div
                          key={work.id}
                          className="flex items-center justify-between text-xs bg-gray-800 p-1.5 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${work.type.color}`}></div>
                            <span>{work.type.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                work.priority.id === "high"
                                  ? "bg-red-900 text-red-300"
                                  : work.priority.id === "normal"
                                    ? "bg-yellow-900 text-yellow-300"
                                    : "bg-green-900 text-green-300"
                              }`}
                            >
                              {work.priority.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Worker {work.workerId}</span>
                            <span className="text-gray-400">
                              {work.duration}s {work.canSleep ? "(slept)" : ""}
                            </span>
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
            <CardTitle className="text-sm">Workqueue Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Total Queued</div>
                  <div className="text-xl font-bold">{stats.totalQueued}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Completed</div>
                  <div className="text-xl font-bold">{stats.totalCompleted}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Pending</div>
                  <div className="text-xl font-bold">{pendingWork.length}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-md">
                  <div className="text-xs text-gray-400">Avg Completion</div>
                  <div className="text-xl font-bold">
                    {stats.avgCompletionTime ? Math.round(stats.avgCompletionTime / 1000) : 0}
                    <span className="text-xs text-gray-400 ml-1">s</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium mb-2">Type Distribution</h3>
                {workqueueTypes.map((type) => (
                  <div key={type.id} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${type.color}`}></div>
                        {type.name}
                      </span>
                      <span>{stats.typeDistribution[type.id]}</span>
                    </div>
                    <Progress
                      value={stats.totalQueued > 0 ? (stats.typeDistribution[type.id] / stats.totalQueued) * 100 : 0}
                      className="h-1.5"
                      indicatorClassName={type.color}
                    />
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium mb-2">Workqueue Execution Flow</h3>
                <div className="bg-gray-800 p-2 rounded-md text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">
                      1
                    </div>
                    <span>Code calls queue_work() function</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">
                      2
                    </div>
                    <span>Work item added to workqueue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">
                      3
                    </div>
                    <span>Worker thread wakes up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">
                      4
                    </div>
                    <span>Work function executes in process context</span>
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
