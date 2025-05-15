"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for charts
const generateTimePoints = (count) => {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now)
    date.setMinutes(date.getMinutes() - (count - i - 1))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  })
}

const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

export default function SystemStats() {
  const [timePoints, setTimePoints] = useState(generateTimePoints(30))
  const [cpuData, setCpuData] = useState(generateRandomData(30, 5, 60))
  const [memoryData, setMemoryData] = useState(generateRandomData(30, 20, 50))
  const [diskData, setDiskData] = useState(generateRandomData(30, 1, 20))
  const [networkData, setNetworkData] = useState(generateRandomData(30, 0, 100))

  // Simulate updating data
  useEffect(() => {
    const interval = setInterval(() => {
      setTimePoints((prev) => {
        const newPoints = [...prev]
        newPoints.shift()
        const now = new Date()
        newPoints.push(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        return newPoints
      })

      setCpuData((prev) => {
        const newData = [...prev]
        newData.shift()
        newData.push(Math.floor(Math.random() * 56) + 5)
        return newData
      })

      setMemoryData((prev) => {
        const newData = [...prev]
        newData.shift()
        newData.push(Math.floor(Math.random() * 31) + 20)
        return newData
      })

      setDiskData((prev) => {
        const newData = [...prev]
        newData.shift()
        newData.push(Math.floor(Math.random() * 20) + 1)
        return newData
      })

      setNetworkData((prev) => {
        const newData = [...prev]
        newData.shift()
        newData.push(Math.floor(Math.random() * 101))
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Simple chart component
  const Chart = ({ data, label, color, max = 100 }) => {
    const maxValue = Math.max(...data, max * 0.7)

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">{label}</h3>
          <span className="text-sm text-gray-400">
            Current: {data[data.length - 1]}
            {label.includes("CPU") ? "%" : label.includes("Memory") ? "%" : label.includes("Disk") ? "MB/s" : "KB/s"}
          </span>
        </div>
        <div className="h-40 flex items-end gap-1">
          {data.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-opacity-20 rounded-t"
              style={{
                height: `${(value / maxValue) * 100}%`,
                backgroundColor: color,
                transition: "height 0.3s ease",
              }}
              title={`${timePoints[index]}: ${value}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          {[0, 6, 12, 18, 24, 29].map((index) => (
            <span key={index}>{timePoints[index]}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>System Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpu">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="disk">Disk I/O</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="cpu" className="mt-4">
            <Chart data={cpuData} label="CPU Utilization" color="#22c55e" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">User</div>
                <div className="text-xl font-bold">{cpuData[cpuData.length - 1] * 0.7}%</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">System</div>
                <div className="text-xl font-bold">{cpuData[cpuData.length - 1] * 0.2}%</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">I/O Wait</div>
                <div className="text-xl font-bold">{cpuData[cpuData.length - 1] * 0.05}%</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Idle</div>
                <div className="text-xl font-bold">{100 - cpuData[cpuData.length - 1]}%</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="mt-4">
            <Chart data={memoryData} label="Memory Usage" color="#3b82f6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-xl font-bold">16 GB</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Used</div>
                <div className="text-xl font-bold">
                  {((16 * memoryData[memoryData.length - 1]) / 100).toFixed(1)} GB
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Cached</div>
                <div className="text-xl font-bold">{(16 * 0.2).toFixed(1)} GB</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Swap</div>
                <div className="text-xl font-bold">0.5 GB</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="disk" className="mt-4">
            <Chart data={diskData} label="Disk I/O" color="#f59e0b" max={50} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Read</div>
                <div className="text-xl font-bold">{diskData[diskData.length - 1] * 0.6} MB/s</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Write</div>
                <div className="text-xl font-bold">{diskData[diskData.length - 1] * 0.4} MB/s</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Used</div>
                <div className="text-xl font-bold">127 GB</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Free</div>
                <div className="text-xl font-bold">873 GB</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="mt-4">
            <Chart data={networkData} label="Network Traffic" color="#ec4899" max={200} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Download</div>
                <div className="text-xl font-bold">{networkData[networkData.length - 1] * 0.7} KB/s</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Upload</div>
                <div className="text-xl font-bold">{networkData[networkData.length - 1] * 0.3} KB/s</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Packets In</div>
                <div className="text-xl font-bold">{Math.floor(networkData[networkData.length - 1] * 0.8)}</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Packets Out</div>
                <div className="text-xl font-bold">{Math.floor(networkData[networkData.length - 1] * 0.4)}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
