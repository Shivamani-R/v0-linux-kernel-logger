"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

// Simulated kernel commands and responses
const commands = {
  help: `Available commands:
  - help: Show this help message
  - lsmod: List loaded kernel modules
  - dmesg: Display kernel ring buffer
  - sysinfo: Show system information
  - meminfo: Show memory information
  - cpuinfo: Show CPU information
  - netstat: Show network statistics
  - clear: Clear the terminal`,

  lsmod: `Module                  Size  Used by
ext4                  528384  1
crc32c_generic        16384  1
crc16                 16384  1
mbcache               16384  1
jbd2                  122880  1
nvidia_drm            57344  4
nvidia_modeset       1228800  1
nvidia              34185216  261
drm_kms_helper       184320  1
syscopyarea           16384  1
sysfillrect           16384  1
sysimgblt             16384  1
fb_sys_fops           16384  1
drm                  491520  4
i2c_core              81920  6`,

  dmesg: `[    0.000000] Linux version 5.15.0-58-generic (buildd@lcy02-amd64-017) (gcc (Ubuntu 11.3.0-1ubuntu1~22.04) 11.3.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #64-Ubuntu SMP Thu Jan 5 11:43:13 UTC 2023 (Ubuntu 5.15.0-58.64-generic 5.15.85)
[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-58-generic root=UUID=1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p ro quiet splash vt.handoff=7
[    0.000000] KERNEL supported cpus:
[    0.000000]   Intel GenuineIntel
[    0.000000]   AMD AuthenticAMD
[    0.000000]   Hygon HygonGenuine
[    0.000000]   Centaur CentaurHauls
[    0.000000]   zhaoxin   Shanghai  
[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'
[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'
[    0.000000] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'
[    0.000000] x86/fpu: xstate_offset[2]:  576, xstate_sizes[2]:  256
[    0.000000] x86/fpu: Enabled xstate features 0x7, context size is 832 bytes, using 'standard' format.
[    0.000000] signal: max sigframe size: 1776
[    0.000000] BIOS-provided physical RAM map:
[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009ffff] usable
[    0.000000] BIOS-e820: [mem 0x0000000000100000-0x00000000bffdffff] usable`,

  sysinfo: `System Information:
Kernel Name:    Linux
Kernel Version: 5.15.0-58-generic
Machine:        x86_64
Hostname:       ubuntu-server
Distribution:   Ubuntu 22.04.2 LTS
Uptime:         2 days, 7 hours, 14 minutes
Load Average:   0.52, 0.58, 0.59`,

  meminfo: `MemTotal:       16384000 kB
MemFree:        8192000 kB
MemAvailable:   10485760 kB
Buffers:         524288 kB
Cached:         2097152 kB
SwapCached:       16384 kB
Active:         4194304 kB
Inactive:       3145728 kB
SwapTotal:      2097152 kB
SwapFree:       1572864 kB
Dirty:             1024 kB
Writeback:            0 kB
AnonPages:      4718592 kB
Mapped:         1048576 kB
Shmem:           262144 kB
KReclaimable:    524288 kB
Slab:            786432 kB`,

  cpuinfo: `processor       : 0
vendor_id       : GenuineIntel
cpu family      : 6
model           : 158
model name      : Intel(R) Core(TM) i7-8700K CPU @ 3.70GHz
stepping        : 10
microcode       : 0xde
cpu MHz         : 3696.000
cache size      : 12288 KB
physical id     : 0
siblings        : 12
core id         : 0
cpu cores       : 6
apicid          : 0
initial apicid  : 0
fpu             : yes
fpu_exception   : yes
cpuid level     : 22
wp              : yes
flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc art arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx smx est tm2 ssse3 sdbg fma cx16 xtpr pdcm pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3dnowprefetch cpuid_fault epb invpcid_single pti ssbd ibrs ibpb stibp tpr_shadow vnmi flexpriority ept vpid ept_ad fsgsbase tsc_adjust bmi1 hle avx2 smep bmi2 erms invpcid rtm mpx rdseed adx smap clflushopt intel_pt xsaveopt xsavec xgetbv1 xsaves dtherm ida arat pln pts hwp hwp_notify hwp_act_window hwp_epp md_clear flush_l1d`,

  netstat: `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 localhost:39162         localhost:27017         ESTABLISHED
tcp        0      0 ubuntu:42454            ec2-54-160-149-205:https ESTABLISHED
tcp        0      0 ubuntu:55376            ec2-3-233-242-99:https  ESTABLISHED
tcp        0    372 ubuntu:ssh              desktop:49762           ESTABLISHED
tcp6       0      0 ip6-localhost:27017     ip6-localhost:39162     ESTABLISHED

Active UNIX domain sockets (w/o servers)
Proto RefCnt Flags       Type       State         I-Node   Path
unix  3      [ ]         STREAM     CONNECTED     35020    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     35021    
unix  3      [ ]         STREAM     CONNECTED     34467    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     34468    
unix  3      [ ]         STREAM     CONNECTED     34469    /run/systemd/journal/stdout`,
}

export default function CommandTerminal() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState([
    { type: "system", content: "Linux Kernel 5.15.0-58-generic (Ubuntu 22.04.2 LTS)" },
    { type: "system", content: "Type 'help' for available commands." },
    { type: "prompt", content: "root@ubuntu:~# " },
  ])
  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [history])

  // Focus input on mount and when clicking terminal
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      executeCommand()
    }
  }

  const executeCommand = () => {
    const cmd = input.trim().toLowerCase()

    // Add command to history
    setHistory((prev) => [
      ...prev.slice(0, prev.length - 1), // Remove the last prompt
      { type: "command", content: `root@ubuntu:~# ${input}` },
    ])

    // Process command
    if (cmd === "clear") {
      setHistory([
        { type: "system", content: "Linux Kernel 5.15.0-58-generic (Ubuntu 22.04.2 LTS)" },
        { type: "prompt", content: "root@ubuntu:~# " },
      ])
    } else if (cmd === "") {
      setHistory((prev) => [...prev, { type: "prompt", content: "root@ubuntu:~# " }])
    } else {
      // Get command response
      let response
      if (commands[cmd]) {
        response = commands[cmd]
      } else if (cmd.startsWith("echo ")) {
        response = cmd.substring(5)
      } else {
        response = `bash: ${cmd}: command not found`
      }

      // Add response and new prompt to history
      setHistory((prev) => [
        ...prev,
        { type: "output", content: response },
        { type: "prompt", content: "root@ubuntu:~# " },
      ])
    }

    // Clear input
    setInput("")
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div
          className="bg-black rounded-md border border-gray-800 h-[400px] font-mono text-sm cursor-text"
          onClick={handleTerminalClick}
        >
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {history.map((item, index) => (
              <div
                key={index}
                className={`whitespace-pre-wrap ${
                  item.type === "system"
                    ? "text-green-500"
                    : item.type === "command"
                      ? "text-white"
                      : item.type === "output"
                        ? "text-gray-300"
                        : "text-green-500"
                }`}
              >
                {item.content}
                {item.type === "prompt" && index === history.length - 1 && (
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    className="bg-transparent border-none outline-none text-white w-[calc(100%-8rem)] focus:ring-0"
                    autoComplete="off"
                    spellCheck="false"
                  />
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
