"use client"

import { useState, useEffect } from "react"
import { Terminal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import KernelLogViewer from "./kernel-log-viewer"
import ProcessMonitor from "./process-monitor"
import SystemStats from "./system-stats"
import CommandTerminal from "./command-terminal"

// Simulated kernel module status
const kernelModules = [
  { name: "ext4", status: "loaded", type: "filesystem" },
  { name: "btrfs", status: "loaded", type: "filesystem" },
  { name: "nvidia", status: "loaded", type: "driver" },
  { name: "bluetooth", status: "loaded", type: "driver" },
  { name: "usb_storage", status: "loaded", type: "driver" },
  { name: "iptables", status: "loaded", type: "network" },
]

export default function KernelActivityDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [uptime, setUptime] = useState("2 days, 7 hours, 14 minutes")
  const [kernelVersion, setKernelVersion] = useState("5.15.0-58-generic")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Terminal className="h-10 w-10 mr-2 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold">Kernel Activity Logger</h1>
            <p className="text-gray-400">Monitoring system kernel activities</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xl font-mono">{currentTime.toLocaleTimeString()}</div>
          <div className="text-sm text-gray-400">Uptime: {uptime}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kernel Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kernelVersion}</div>
            <p className="text-xs text-gray-400">Linux x86_64</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27%</div>
            <p className="text-xs text-gray-400">8 cores @ 3.6GHz</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 GB / 16 GB</div>
            <p className="text-xs text-gray-400">26% utilized</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">217</div>
            <p className="text-xs text-gray-400">3 system, 214 user</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="mb-6">
        <TabsList className="bg-gray-900">
          <TabsTrigger value="logs">Kernel Logs</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="stats">System Stats</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-4">
          <KernelLogViewer />
        </TabsContent>
        <TabsContent value="processes" className="mt-4">
          <ProcessMonitor />
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <SystemStats />
        </TabsContent>
        <TabsContent value="terminal" className="mt-4">
          <CommandTerminal />
        </TabsContent>
      </Tabs>

      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle>Loaded Kernel Modules</CardTitle>
          <CardDescription>Currently active kernel modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {kernelModules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span>{module.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {module.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="outline" className="bg-gray-800 hover:bg-gray-700 border-gray-700">
          Export Logs
        </Button>
        <div className="text-sm text-gray-400">Last updated: {currentTime.toLocaleString()}</div>
      </div>
    </div>
  )
}
