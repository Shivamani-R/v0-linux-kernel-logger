"use client"

import { useState, useEffect } from "react"
import { Search, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Simulated kernel log data
const generateKernelLogs = () => {
  const logTypes = ["info", "warning", "error", "debug"]
  const components = ["kernel", "systemd", "usb", "network", "memory", "cpu", "disk", "bluetooth", "audio", "graphics"]
  const messages = [
    "Process started",
    "Device connected",
    "Module loaded successfully",
    "Buffer overflow detected",
    "Memory allocation failed",
    "I/O error on device",
    "New USB device detected",
    "Network interface up",
    "CPU throttling activated",
    "Disk I/O bottleneck detected",
    "System call interrupted",
    "Page fault at address",
    "Scheduling delay detected",
    "IRQ handler registered",
    "DMA transfer completed",
  ]

  return Array.from({ length: 100 }, (_, i) => {
    const date = new Date()
    date.setSeconds(date.getSeconds() - i * 30)
    const type = logTypes[Math.floor(Math.random() * logTypes.length)]
    const component = components[Math.floor(Math.random() * components.length)]
    const message = messages[Math.floor(Math.random() * messages.length)]
    const pid = Math.floor(Math.random() * 10000)

    return {
      id: i,
      timestamp: date.toISOString(),
      type,
      component,
      message: `[${component}] ${message} (pid: ${pid})`,
      pid,
    }
  })
}

export default function KernelLogViewer() {
  const [logs, setLogs] = useState(generateKernelLogs())
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [componentFilter, setComponentFilter] = useState("all")

  // Filter logs based on search term and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || log.type === typeFilter
    const matchesComponent = componentFilter === "all" || log.component === componentFilter

    return matchesSearch && matchesType && matchesComponent
  })

  // Simulate new logs coming in
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = generateKernelLogs()[0]
      setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 99)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getTypeColor = (type) => {
    switch (type) {
      case "error":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      case "debug":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              className="pl-8 bg-gray-800 border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Log Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Select value={componentFilter} onValueChange={setComponentFilter}>
              <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Component" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Components</SelectItem>
                <SelectItem value="kernel">Kernel</SelectItem>
                <SelectItem value="systemd">Systemd</SelectItem>
                <SelectItem value="usb">USB</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="cpu">CPU</SelectItem>
                <SelectItem value="disk">Disk</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="bg-gray-800 hover:bg-gray-700 border-gray-700">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] rounded-md border border-gray-800">
          <div className="space-y-1 p-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start p-2 text-sm hover:bg-gray-800 rounded-md">
                <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${getTypeColor(log.type)}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        log.type === "error"
                          ? "text-red-400 border-red-800"
                          : log.type === "warning"
                            ? "text-yellow-400 border-yellow-800"
                            : log.type === "info"
                              ? "text-blue-400 border-blue-800"
                              : "text-gray-400 border-gray-700"
                      }`}
                    >
                      {log.type}
                    </Badge>
                  </div>
                  <div className="mt-1 break-all">{log.message}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-2 text-xs text-gray-400">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </CardContent>
    </Card>
  )
}
