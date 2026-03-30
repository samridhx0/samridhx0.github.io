# eBPF is Changing Linux Observability and Most People Haven't Noticed

There's a technology in the Linux kernel that lets you run sandboxed programs inside the kernel itself - with no module compilation, no reboots, and verified safety. It's called eBPF, and it's quietly becoming one of the most important things in Linux infrastructure.

Cloudflare uses it for DDoS mitigation. Meta uses it for network load balancing. Google uses it for security enforcement. Your own kernel has it right now.

## What eBPF Actually Is

eBPF (extended Berkeley Packet Filter) started as a way to filter network packets efficiently. The original BPF was from 1992 - a small bytecode VM in the kernel for `tcpdump` to specify which packets to capture without copying everything to userspace.

The "extended" version expanded this massively. Modern eBPF programs can:

- Trace any kernel function or userspace function
- Modify network packets in-flight
- Enforce security policies (deny syscalls, block network connections)
- Collect performance metrics with near-zero overhead

And crucially: eBPF programs are verified by the kernel before running. The verifier checks that they can't crash the kernel, can't loop infinitely, and stay within memory bounds. It's a safe sandbox inside the most sensitive part of your OS.

## Check if Your Kernel Supports It

Most kernels 4.4+ have basic eBPF. Full feature support is in 5.x+:

```bash
uname -r

# Check for eBPF support
ls /sys/kernel/debug/tracing/

# Check for BTF (needed for CO-RE, makes programs portable)
ls /sys/kernel/btf/vmlinux
```

If `vmlinux` is there, you have BTF and can run modern eBPF tools without kernel header matching.

## bpftool - Inspect Running eBPF Programs

```bash
sudo apt install bpftool   # or linux-tools-common on Ubuntu

# List all loaded eBPF programs
sudo bpftool prog list

# List eBPF maps (shared memory between kernel and userspace)
sudo bpftool map list

# Show detailed info about a specific program
sudo bpftool prog show id 42 --pretty
```

On a system running Docker, Kubernetes, or systemd-bpf, you'll see a bunch of programs already loaded. Kubernetes uses eBPF (via Cilium or Calico) for pod networking and network policy.

## BCC - BPF Compiler Collection

The easiest way to start writing and running eBPF programs is BCC (BPF Compiler Collection). Install it:

```bash
sudo apt install bpfcc-tools python3-bpfcc   # Ubuntu
sudo dnf install bcc bcc-tools               # Fedora
```

It comes with a bunch of ready-to-use tools. Some favorites:

```bash
# Trace every exec() call system-wide (watch processes spawn)
sudo execsnoop-bpfcc

# Trace open() calls - see every file being opened
sudo opensnoop-bpfcc

# Watch TCP connections being established
sudo tcpconnect-bpfcc

# Profile CPU usage by stack trace (flame graph input)
sudo profile-bpfcc -F 99 -a 10 > /tmp/profile.txt
```

These work on any running process with no instrumentation or source code changes needed.

## Write a Simple eBPF Program

Here's a minimal eBPF program using BCC Python that traces every `execve` syscall and prints the command name:

```python
#!/usr/bin/env python3
from bcc import BPF

program = """
#include <uapi/linux/ptrace.h>

int trace_execve(struct pt_regs *ctx) {
    char comm[16];
    bpf_get_current_comm(&comm, sizeof(comm));
    bpf_trace_printk("execve called by: %s\\n", comm);
    return 0;
}
"""

b = BPF(text=program)
b.attach_kprobe(event=b.get_syscall_fnname("execve"), fn_name="trace_execve")

print("Tracing execve... Ctrl+C to stop")
b.trace_print()
```

Run it:

```bash
sudo python3 trace_exec.py
```

Every time any program on your system calls `execve` (which is how new processes start), you'll see it printed. This runs in the kernel with effectively zero overhead.

## bpftrace - awk for the Kernel

`bpftrace` is a higher-level tracing language inspired by DTrace. Think of it as awk but for kernel events:

```bash
sudo apt install bpftrace
```

One-liners that show what it can do:

```bash
# Count syscalls by process name
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_* { @[comm] = count(); }'

# Trace all files opened by a specific process
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_openat /comm == "nginx"/ { printf("%s\n", str(args->filename)); }'

# Show syscall latency histogram for read()
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; }
tracepoint:syscalls:sys_exit_read /@start[tid]/ {
    @usecs = hist((nsecs - @start[tid]) / 1000);
    delete(@start[tid]);
}'
```

That last one gives you a histogram of how long `read()` syscalls take, across the entire system, in real time.

## Why This Matters for Security

eBPF is how the next generation of security tooling works. Instead of kernel modules (which can crash the system) or userspace polling (which misses events), eBPF lets you hook into every meaningful event in the kernel safely.

Tools like Falco (container runtime security) and Tetragon (from Cilium, used by cloud providers for threat detection) run eBPF programs that watch for suspicious behavior patterns - privilege escalation attempts, unexpected network connections, file access to sensitive paths.

```bash
# Tetragon example: detect privilege escalation
# (this is pseudo-config, but real tools look like this)
# When any process calls setuid(0), alert if it's unexpected
```

The fact that verification happens at load time means you can safely run these programs on production systems without worrying about a buggy program crashing your kernel. That's a genuine shift from how kernel tracing worked before.

## Getting Deeper

The BPF Performance Tools book by Brendan Gregg is the reference. His website (brendangregg.com) has flame graphs, BPF tools, and Linux performance methodology that's worth reading even if you never write an eBPF program.

The kernel documentation at `Documentation/bpf/` in the Linux source tree is surprisingly readable.

For hands-on: `sudo bpftrace -l` lists every traceable point in your kernel. There are thousands. Every subsystem, every important function. All of it observable, in production, with zero overhead when not running.

That's not a small thing.
