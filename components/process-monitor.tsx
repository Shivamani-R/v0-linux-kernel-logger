"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUpDown, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

// Generate simulated process data
const generateProcesses = () => {
  const processNames = [
    "systemd",
    "kthreadd",
    "kworker",
    "rcu_sched",
    "migration",
    "watchdog",
    "firefox",
    "chrome",
    "vscode",
    "terminal",
    "bash",
    "ssh",
    "nginx",
    "apache",
    "mysql",
    "postgres",
    "redis",
    "mongodb",
    "docker",
    "containerd",
    "kubelet",
    "snapd",
    "NetworkManager",
    "bluetoothd",
    "pulseaudio",
    "Xorg",
    "gnome-shell",
  ]

  const users = ["root", "systemd", "nobody", "www-data", "user"]

  return Array.from({ length: 50 }, (_, i) => {
    const name = processNames[Math.floor(Math.random() * processNames.length)]
    const pid = Math.floor(Math.random() * 100000)
    const user = users[Math.floor(Math.random() * users.length)]
    const cpuUsage = Math.random() * 10
    const memoryUsage = Math.random() * 500
    const status = Math.random() > 0.1 ? "running" : "sleeping"

    return {
      id: i,
      name,
      pid,
      user,
      cpuUsage: cpuUsage.toFixed(1),
      memoryUsage: memoryUsage.toFixed(1),
      status,
    }
  })
}

export default function ProcessMonitor() {
  const [processes, setProcesses] = useState(generateProcesses())
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("cpuUsage")
  const [sortDirection, setSortDirection] = useState("desc")

  // Filter processes based on search term
  const filteredProcesses = processes.filter(
    (process) =>
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.pid.toString().includes(searchTerm),
  )

  // Sort processes
  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    if (sortField === "cpuUsage" || sortField === "memoryUsage") {
      return sortDirection === "asc"
        ? Number.parseFloat(a[sortField]) - Number.parseFloat(b[sortField])
        : Number.parseFloat(b[sortField]) - Number.parseFloat(a[sortField])
    } else {
      return sortDirection === "asc"
        ? a[sortField].toString().localeCompare(b[sortField].toString())
        : b[sortField].toString().localeCompare(a[sortField].toString())
    }
  })

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Simulate process updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses((prevProcesses) =>
        prevProcesses.map((process) => ({
          ...process,
          cpuUsage: (Math.random() * 10).toFixed(1),
          memoryUsage: (Math.random() * 500).toFixed(1),
          status: Math.random() > 0.1 ? "running" : "sleeping",
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Simulate killing a process
  const killProcess = (pid) => {
    setProcesses((prevProcesses) => prevProcesses.filter((process) => process.pid !== pid))
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search processes..."
              className="pl-8 bg-gray-800 border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border border-gray-800">
          <div className="grid grid-cols-12 gap-2 p-2 bg-gray-800 text-xs font-medium">
            <div className="col-span-3 flex items-center cursor-pointer" onClick={() => handleSort("name")}>
              PROCESS NAME
              {sortField === "name" && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </div>
            <div className="col-span-1 flex items-center cursor-pointer" onClick={() => handleSort("pid")}>
              PID
              {sortField === "pid" && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </div>
            <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort("user")}>
              USER
              {sortField === "user" && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </div>
            <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort("cpuUsage")}>
              CPU %{sortField === "cpuUsage" && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </div>
            <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort("memoryUsage")}>
              MEM (MB)
              {sortField === "memoryUsage" && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </div>
            <div className="col-span-1 flex items-center cursor-pointer" onClick={() => handleSort("status")}>
              STATUS
              {sortField === "status" && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </div>
            <div className="col-span-1 text-right">ACTION</div>
          </div>

          <ScrollArea className="h-[350px]">
            {sortedProcesses.map((process) => (
              <div
                key={process.id}
                className="grid grid-cols-12 gap-2 p-2 text-sm border-t border-gray-800 hover:bg-gray-800"
              >
                <div className="col-span-3 truncate">{process.name}</div>
                <div className="col-span-1">{process.pid}</div>
                <div className="col-span-2">{process.user}</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Progress value={Number.parseFloat(process.cpuUsage) * 10} className="h-2 w-12" />
                    <span>{process.cpuUsage}%</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Progress value={Number.parseFloat(process.memoryUsage) / 5} className="h-2 w-12" />
                    <span>{process.memoryUsage} MB</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      process.status === "running"
                        ? "text-green-400 border-green-800"
                        : "text-yellow-400 border-yellow-800"
                    }`}
                  >
                    {process.status}
                  </Badge>
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-950"
                    onClick={() => killProcess(process.pid)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Showing {sortedProcesses.length} of {processes.length} processes
        </div>
      </CardContent>
    </Card>
  )
}
