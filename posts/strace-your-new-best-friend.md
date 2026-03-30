# strace: The Tool That Shows You Everything Your Program is Actually Doing

Your program is misbehaving. You've read the code. You've read the docs. You've Googled the error. Nothing. What now?

`strace`.

`strace` intercepts every system call your program makes and dumps them to stderr. System calls are how a program talks to the kernel - opening files, reading from sockets, allocating memory, spawning processes. Basically everything interesting happens through syscalls, so strace shows you basically everything.

## Basic Usage

```bash
strace ls /tmp
```

You'll get a wall of output. Don't panic. Scroll to the bottom and read upward. The end is usually where the interesting stuff happens.

Every line looks like:

```
openat(AT_FDCWD, "/tmp", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 3
```

That's the syscall name, arguments, and return value. `openat` opened `/tmp` and got file descriptor 3 back.

## Attach to a Running Process

You don't have to launch the program from scratch:

```bash
strace -p $(pgrep nginx)
```

Now you're watching a live process. Every syscall it makes from this point on shows up. Ctrl+C to detach.

## Filter by Syscall Type

The raw output is noisy. Filter to just what you care about:

```bash
# Only show file-related calls
strace -e trace=file ls /tmp

# Only show network calls
strace -e trace=network curl https://example.com

# Only show process creation
strace -e trace=process bash -c 'ls && echo done'
```

The `-e trace=` flag accepts categories like `file`, `network`, `process`, `memory`, `signal`, or specific syscall names like `openat,read,write`.

## Trace File Opens

This is the one I use constantly. "Why is this program reading from the wrong config file?"

```bash
strace -e trace=openat python3 myscript.py 2>&1 | grep -v ENOENT
```

The `grep -v ENOENT` filters out "file not found" attempts, which are normal (programs probe for optional files). What's left is every file that actually opened successfully.

## Follow Child Processes

Programs that fork (like web servers, shells, compilers) will have child processes you also want to trace:

```bash
strace -f make
```

`-f` follows forks. Each line is prefixed with the PID so you can tell which process did what.

## Save Output to a File

When you have a lot going on, dump it to file so you can grep it:

```bash
strace -o /tmp/trace.txt -f ./myprogram
```

Then:

```bash
grep "open\|read\|write" /tmp/trace.txt | head -50
```

## Timing: See What's Slow

```bash
strace -T ./myprogram 2>&1 | sort -t'<' -k2 -n | tail -20
```

`-T` appends the time each syscall took in seconds (like `<0.000123>`). Sort it and find the slow ones.

Or use `-c` for a summary table:

```bash
strace -c ./myprogram
```

Output:

```
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 54.32    0.012345         123       100         0 read
 ...
```

Great for performance profiling without adding any instrumentation to your code.

## Real Use Case: "Why Won't This Program Find My Config?"

```bash
strace -e trace=openat,stat ./myapp 2>&1 | grep -i "config\|conf"
```

This shows every file it tried to open or stat that had "config" in the path. You'll immediately see where it's looking versus where you put the file.

## Real Use Case: "Why Is This Network Request Failing?"

```bash
strace -e trace=network,connect ./myapp 2>&1 | head -30
```

You'll see the `connect()` syscalls with the address and port. If it's `ECONNREFUSED`, the service isn't listening. If it's `ETIMEDOUT`, packets are getting dropped. Much faster than reading through logging code.

## ltrace: Same Thing but for Library Calls

`strace` traces kernel syscalls. `ltrace` traces library calls - calls into shared libraries like libc. Same idea, different level:

```bash
ltrace ./myprogram 2>&1 | grep "malloc\|free\|strcmp"
```

Useful for seeing what strings a program is comparing (without a debugger), or tracking down memory allocation patterns.

If you do any kind of security work, system debugging, or reverse engineering on Linux, strace and ltrace are two of your most important tools. They require no modification to the target program, no recompilation, no debug symbols. You just attach and watch.
