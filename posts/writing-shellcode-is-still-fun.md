# Writing Shellcode in 2025 is Still Fun, Actually

Hear me out. I know "shellcode" sounds like a 2003 thing. Exploit DB full of `\xeb\xfe` payloads and Stack Smashing for Fun and Profit. But writing shellcode is genuinely one of the best ways to understand what your computer is actually doing at the lowest level. And it's still relevant - every red teamer and malware analyst worth their salt knows this stuff.

This is not a "hack into a system" guide. This is "understand how programs talk to the OS at the metal" guide.

## What Even Is Shellcode

Shellcode is position-independent machine code - bytes that the CPU will execute directly, with no OS loader, no relocations, no external dependencies. It has to work no matter where in memory it lands.

The classic goal is to call `execve("/bin/sh", NULL, NULL)` - spawn a shell. That's the "hello world" of shellcode.

## Setting Up

You need a Linux x86-64 system and a few tools:

```bash
sudo apt install nasm gcc binutils
```

`nasm` is the assembler, `objdump` and `objcopy` come with binutils.

## Writing Your First Shellcode (x86-64 Linux)

The `execve` syscall on x86-64 is syscall number 59. Arguments go in `rdi`, `rsi`, `rdx`. Syscall number goes in `rax`. Call `syscall`.

```nasm
; shell.asm
section .text
global _start

_start:
    ; execve("/bin/sh", NULL, NULL)
    xor     rsi, rsi          ; rsi = NULL (argv)
    xor     rdx, rdx          ; rdx = NULL (envp)
    
    ; push "/bin/sh\0" onto stack
    ; "/bin//sh" packed as 8 bytes little-endian: 0x68732f6e69622f2f (leading double slash, harmless)
    xor     rax, rax
    push    rax               ; null terminator
    mov     rbx, 0x68732f6e69622f2f
    push    rbx               ; push "/bin/sh"
    
    mov     rdi, rsp          ; rdi = pointer to "/bin/sh"
    mov     al, 59            ; rax = 59 (execve syscall number)
    syscall
```

Assemble it:

```bash
nasm -f elf64 shell.asm -o shell.o
ld shell.o -o shell
./shell
```

That should drop you into a shell. If it does, you just wrote working shellcode.

## Extracting the Bytes

The actual shellcode is the bytes from the `.text` section:

```bash
objcopy -O binary --only-section=.text shell.o shellcode.bin
xxd shellcode.bin
```

You can also get it with objdump:

```bash
objdump -d shell.o | grep -A1000 '<_start>' | grep -oP '(?<=\t)[0-9a-f ]+(?=\t)' | tr -d ' \n'
```

## The Null Byte Problem

Many injection contexts (like `strcpy` or string processing) stop at null bytes `\x00`. If your shellcode contains a null byte, it gets truncated. So you have to write null-free shellcode.

Instead of `mov rax, 59` (which encodes as `\x48\xc7\xc0\x3b\x00\x00\x00` - note those zeros):

```nasm
xor rax, rax     ; zero out rax without null bytes
mov al, 59       ; only write low byte (59 = 0x3b, no null)
```

Check for nulls in your binary:

```bash
xxd shellcode.bin | grep " 00"
```

If nothing shows up, you're null-free.

## Testing Shellcode Safely

Write a small C harness:

```c
// test.c
#include <stdio.h>
#include <string.h>

// paste your shellcode bytes here
unsigned char shellcode[] = "\x48\x31\xf6\x48\x31\xd2...";

int main() {
    printf("Shellcode length: %zu\n", strlen(shellcode));
    // cast to function pointer and call
    void (*fp)() = (void(*)())shellcode;
    fp();
    return 0;
}
```

Compile with executable stack (needed to actually run code from the stack/data segment):

```bash
gcc -z execstack -no-pie test.c -o test
./test
```

Note: on a real system with modern mitigations (NX/DEP, ASLR, PIE), this wouldn't work without bypassing those protections first. That's a whole other rabbit hole.

## What This Teaches You

Writing shellcode forces you to understand:

- The syscall interface (how programs request services from the OS)
- x86-64 calling conventions and register usage
- Memory layout (stack, how strings work at the byte level)
- Why mitigations like NX, ASLR, and stack canaries exist and what they actually protect against

When you're doing malware analysis and you see a payload, you can read it. When you're reviewing a security audit finding about "arbitrary code execution," you know what that actually means at the instruction level.

## Going Further

The shellcraft module in pwntools is excellent for generating shellcode programmatically:

```bash
pip install pwntools
```

```python
from pwn import *
context.arch = 'amd64'
print(shellcraft.sh())          # print the assembly
sc = asm(shellcraft.sh())       # assemble it to bytes
print(enhex(sc))                # hex dump
```

And for the deep end: check out the [shell-storm shellcode database](http://shell-storm.org/shellcode/) for examples across architectures. Reading other people's shellcode (and understanding each instruction) is the fastest way to level up.

Computers are just following instructions. Shellcode is you writing the most direct instructions possible. It's kind of beautiful, if you're a certain kind of person.
