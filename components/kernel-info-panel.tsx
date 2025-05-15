import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function KernelInfoPanel() {
  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle>Linux Kernel Deferred Execution Mechanisms</CardTitle>
        <CardDescription>Understanding how the kernel handles asynchronous tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="softirq">Softirqs</TabsTrigger>
            <TabsTrigger value="workqueue">Workqueues</TabsTrigger>
            <TabsTrigger value="tasklet">Tasklets</TabsTrigger>
            <TabsTrigger value="code">Sample Code</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Why Deferred Execution?</h3>
              <p className="text-sm text-gray-300">
                The Linux kernel needs mechanisms to handle work that cannot or should not be performed in the direct
                path of execution, especially in interrupt handlers. Deferred execution allows the kernel to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-300 mt-2 space-y-1">
                <li>Keep interrupt handlers short and responsive</li>
                <li>Handle non-critical work at a more appropriate time</li>
                <li>Balance system load and responsiveness</li>
                <li>Perform work in the appropriate execution context</li>
              </ul>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <h3 className="text-lg font-medium mb-2">Execution Contexts</h3>
              <p className="text-sm text-gray-300">
                The Linux kernel operates in two main execution contexts, each with different constraints:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-medium mb-1">Interrupt Context</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    <li>Cannot sleep or block</li>
                    <li>Cannot access user space</li>
                    <li>Cannot schedule</li>
                    <li>Limited stack space</li>
                    <li>Used by interrupt handlers, softirqs, and tasklets</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-medium mb-1">Process Context</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    <li>Can sleep and block</li>
                    <li>Can access user space</li>
                    <li>Can schedule</li>
                    <li>Normal stack space</li>
                    <li>Used by system calls, kernel threads, and workqueues</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="softirq" className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Softirqs (Software Interrupts)</h3>
              <p className="text-sm text-gray-300">
                Softirqs are one of the oldest deferred execution mechanisms in the Linux kernel. They are statically
                defined at compile time and represent high-priority tasks that need to be executed shortly after an
                interrupt.
              </p>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Key Characteristics</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>Limited to 32 types (10 are currently used in the kernel)</li>
                <li>Run with interrupts enabled</li>
                <li>Cannot sleep or block</li>
                <li>Can run concurrently on different CPUs</li>
                <li>Have static priorities</li>
                <li>Checked and executed after hardware interrupts and when explicitly invoked</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">Standard Softirq Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <span className="font-mono text-yellow-400">HI_SOFTIRQ</span>
                  <p className="text-xs text-gray-300">Highest priority tasks</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <span className="font-mono text-yellow-400">TIMER_SOFTIRQ</span>
                  <p className="text-xs text-gray-300">Timer processing</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <span className="font-mono text-yellow-400">NET_TX_SOFTIRQ</span>
                  <p className="text-xs text-gray-300">Network packet transmission</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <span className="font-mono text-yellow-400">NET_RX_SOFTIRQ</span>
                  <p className="text-xs text-gray-300">Network packet reception</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <span className="font-mono text-yellow-400">BLOCK_SOFTIRQ</span>
                  <p className="text-xs text-gray-300">Block device operations</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <span className="font-mono text-yellow-400">TASKLET_SOFTIRQ</span>
                  <p className="text-xs text-gray-300">Tasklet processing</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workqueue" className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Workqueues</h3>
              <p className="text-sm text-gray-300">
                Workqueues are kernel threads (workers) that execute functions on behalf of the kernel or drivers.
                They're the most flexible deferred execution mechanism because they run in process context.
              </p>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Key Characteristics</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>Run in process context as kernel threads</li>
                <li>Can sleep, block, and use synchronization primitives</li>
                <li>Can access user space memory (with proper locking)</li>
                <li>Flexible scheduling with normal process priorities</li>
                <li>Support for dedicated or shared worker pools</li>
                <li>Can be bound to specific CPUs</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">Workqueue Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-400">System Workqueue</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    The default shared workqueue that most kernel subsystems use for their deferred work.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Accessed via <span className="font-mono">schedule_work()</span> and related functions.
                  </p>
                </div>

                <div className="bg-gray-800 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-400">Dedicated Workqueues</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    Custom workqueues created for specific purposes, with their own worker threads.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created via <span className="font-mono">alloc_workqueue()</span> and related functions.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasklet" className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Tasklets</h3>
              <p className="text-sm text-gray-300">
                Tasklets are a lightweight mechanism built on top of softirqs. They provide a simpler interface for
                deferring work and are commonly used in device drivers.
              </p>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <h4 className="font-medium mb-1">Key Characteristics</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>Run in interrupt context (based on softirqs)</li>
                <li>Cannot sleep or block</li>
                <li>Dynamically created at runtime</li>
                <li>Same tasklet cannot run on multiple CPUs simultaneously</li>
                <li>Different tasklets can run in parallel</li>
                <li>Simpler to use than raw softirqs</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">Tasklet Implementation</h4>
              <p className="text-sm text-gray-300">
                Tasklets are implemented using two softirq types: <span className="font-mono">TASKLET_SOFTIRQ</span> and{" "}
                <span className="font-mono">HI_SOFTIRQ</span> (for high-priority tasklets).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h5 className="font-medium text-purple-400">Normal Tasklets</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    Standard priority tasklets, suitable for most deferred work in drivers.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Scheduled via <span className="font-mono">tasklet_schedule()</span>
                  </p>
                </div>

                <div className="bg-gray-800 p-3 rounded-lg">
                  <h5 className="font-medium text-purple-400">High-Priority Tasklets</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    Higher priority tasklets, executed before normal tasklets.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Scheduled via <span className="font-mono">tasklet_hi_schedule()</span>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Softirq Example</h3>
                <div className="bg-gray-800 p-3 rounded-lg font-mono text-xs">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    {`/* Declaring a softirq handler */
static void my_softirq_handler(struct softirq_action *action)
{
    /* Handle the softirq work */
    /* Cannot sleep */
}

/* Registering the softirq */
open_softirq(MY_SOFTIRQ, my_softirq_handler);

/* Raising the softirq */
raise_softirq(MY_SOFTIRQ);`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Workqueue Example</h3>
                <div className="bg-gray-800 p-3 rounded-lg font-mono text-xs">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    {`/* Work function */
static void my_work_handler(struct work_struct *work)
{
    /* Can sleep if needed */
    msleep(100);
    /* Do the actual work */
}

/* Declaring and initializing work */
DECLARE_WORK(my_work, my_work_handler);

/* Using system workqueue */
schedule_work(&my_work);

/* Creating a dedicated workqueue */
struct workqueue_struct *my_wq;
my_wq = alloc_workqueue("my_queue", 
                        WQ_UNBOUND, 1);

/* Queue work on dedicated queue */
queue_work(my_wq, &my_work);`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Tasklet Example</h3>
                <div className="bg-gray-800 p-3 rounded-lg font-mono text-xs">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    {`/* Tasklet handler function */
static void my_tasklet_handler(unsigned long data)
{
    /* Cannot sleep */
    /* Handle the tasklet work */
}

/* Declaring and initializing a tasklet */
DECLARE_TASKLET(my_tasklet, my_tasklet_handler, 0);

/* Scheduling the tasklet */
tasklet_schedule(&my_tasklet);

/* For high-priority tasklet */
DECLARE_TASKLET_HIGH(my_hi_tasklet, 
                    my_tasklet_handler, 0);
tasklet_hi_schedule(&my_hi_tasklet);

/* Killing a tasklet */
tasklet_kill(&my_tasklet);`}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
