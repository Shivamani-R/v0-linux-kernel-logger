"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cpu, Server, Zap, Clock, Info } from "lucide-react"
import SoftirqVisualizer from "./softirq-visualizer"
import WorkqueueVisualizer from "./workqueue-visualizer"
import TaskletVisualizer from "./tasklet-visualizer"
import KernelInfoPanel from "./kernel-info-panel"

export default function KernelDeferredExecutionVisualizer() {
  const [activeTab, setActiveTab] = useState("softirq")
  const [showInfoPanel, setShowInfoPanel] = useState(false)

  return (
    <div className="container mx-auto p-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Cpu className="h-10 w-10 mr-2 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold">Linux Kernel Deferred Execution</h1>
            <p className="text-gray-400">Visualizing Softirqs, Workqueues, and Tasklets</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="bg-gray-800 hover:bg-gray-700 border-gray-700 flex items-center gap-2"
          onClick={() => setShowInfoPanel(!showInfoPanel)}
        >
          <Info className="h-4 w-4" />
          {showInfoPanel ? "Hide" : "Show"} Info Panel
        </Button>
      </header>

      {showInfoPanel && <KernelInfoPanel />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-sm font-medium">Softirqs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>High-priority kernel tasks that run in interrupt context but with interrupts enabled.</p>
              <p className="text-xs text-gray-400 mt-1">
                Used for time-critical tasks like networking, timers, and scheduling.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-sm font-medium">Workqueues</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>Kernel threads that execute work functions in process context.</p>
              <p className="text-xs text-gray-400 mt-1">
                Used for deferrable work that may sleep or block during execution.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-sm font-medium">Tasklets</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>Lightweight deferred functions that run in softirq context.</p>
              <p className="text-xs text-gray-400 mt-1">
                Used for short, non-blocking tasks that need to be executed asynchronously.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-gray-900 w-full justify-start">
          <TabsTrigger value="softirq" className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Softirqs
          </TabsTrigger>
          <TabsTrigger value="workqueue" className="flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-500" />
            Workqueues
          </TabsTrigger>
          <TabsTrigger value="tasklet" className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            Tasklets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="softirq" className="mt-4">
          <SoftirqVisualizer />
        </TabsContent>

        <TabsContent value="workqueue" className="mt-4">
          <WorkqueueVisualizer />
        </TabsContent>

        <TabsContent value="tasklet" className="mt-4">
          <TaskletVisualizer />
        </TabsContent>
      </Tabs>

      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle>Comparison of Deferred Execution Mechanisms</CardTitle>
          <CardDescription>Key differences between softirqs, workqueues, and tasklets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-4">Feature</th>
                  <th className="text-left py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Softirqs
                    </div>
                  </th>
                  <th className="text-left py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-500" />
                      Workqueues
                    </div>
                  </th>
                  <th className="text-left py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      Tasklets
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-4 font-medium">Execution Context</td>
                  <td className="py-2 px-4">Interrupt Context</td>
                  <td className="py-2 px-4">Process Context</td>
                  <td className="py-2 px-4">Interrupt Context</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-4 font-medium">Can Sleep</td>
                  <td className="py-2 px-4">No</td>
                  <td className="py-2 px-4">Yes</td>
                  <td className="py-2 px-4">No</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-4 font-medium">Parallelism</td>
                  <td className="py-2 px-4">Same type can run on multiple CPUs</td>
                  <td className="py-2 px-4">Multiple worker threads</td>
                  <td className="py-2 px-4">Same tasklet cannot run in parallel</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-4 font-medium">Priority</td>
                  <td className="py-2 px-4">Static priority</td>
                  <td className="py-2 px-4">Normal process priority</td>
                  <td className="py-2 px-4">Based on softirq priority</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2 px-4 font-medium">Use Cases</td>
                  <td className="py-2 px-4">Networking, timers, scheduling</td>
                  <td className="py-2 px-4">Disk I/O, device management</td>
                  <td className="py-2 px-4">Driver-specific deferred work</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium">Implementation</td>
                  <td className="py-2 px-4">Static, predefined types</td>
                  <td className="py-2 px-4">Dynamic, can create custom queues</td>
                  <td className="py-2 px-4">Dynamic, can create at runtime</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-400 mb-4">
        <p>
          <strong>Note:</strong> This is a visualization tool to help understand Linux kernel concepts. It simulates the
          behavior of deferred execution mechanisms but does not represent actual kernel code execution.
        </p>
      </div>
    </div>
  )
}
