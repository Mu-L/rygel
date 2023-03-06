; This program is free software: you can redistribute it and/or modify
; it under the terms of the GNU Lesser General Public License as published by
; the Free Software Foundation, either version 3 of the License, or
; (at your option) any later version.
;
; This program is distributed in the hope that it will be useful,
; but WITHOUT ANY WARRANTY; without even the implied warranty of
; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
; GNU Lesser General Public License for more details.
;
; You should have received a copy of the GNU Lesser General Public License
; along with this program. If not, see https://www.gnu.org/licenses/.

; Forward
; ----------------------------

public ForwardCallG
public ForwardCallF
public ForwardCallD
public ForwardCallRG
public ForwardCallRF
public ForwardCallRD

.model flat, C
.code

; Copy function pointer to EAX, in order to save it through argument forwarding.
; Also make a copy of the SP to CallData::old_sp because the callback system might need it.
; Save ESP in EBX (non-volatile), and use carefully assembled stack provided by caller.
prologue macro
    endbr32
    push ebp
    mov ebp, esp
    mov eax, dword ptr [esp+16]
    mov dword ptr [eax+0], esp
    mov eax, dword ptr [esp+8]
    mov esp, dword ptr [esp+12]
endm

fastcall macro
    mov ecx, dword ptr [esp+0]
    mov edx, dword ptr [esp+4]
    add esp, 16
endm

; Call native function.
; Once done, restore normal stack pointer and return.
; The return value is passed back untouched.
epilogue macro
    call eax
    mov esp, ebp
    pop ebp
    ret
endm

ForwardCallG proc
    prologue
    epilogue
ForwardCallG endp

ForwardCallF proc
    prologue
    epilogue
ForwardCallF endp

ForwardCallD proc
    prologue
    epilogue
ForwardCallD endp

ForwardCallRG proc
    prologue
    fastcall
    epilogue
ForwardCallRG endp

ForwardCallRF proc
    prologue
    fastcall
    epilogue
ForwardCallRF endp

ForwardCallRD proc
    prologue
    fastcall
    epilogue
ForwardCallRD endp

; Callbacks
; ----------------------------

extern RelayCallback : PROC
public CallSwitchStack

; Call the C function RelayCallback with the following arguments:
; static trampoline ID, the current stack pointer, a pointer to the stack arguments of this call,
; and a pointer to a struct that will contain the result registers.
; After the call, simply load these registers from the output struct.
; Depending on ABI, call convention and return value size, we need to issue ret <something>. Since ret
; only takes an immediate value, and I prefer not to branch, the return address is moved instead according
; to BackRegisters::ret_pop before ret is issued.
trampoline macro ID
    endbr32
    sub esp, 44
    mov dword ptr [esp+0], ID
    mov dword ptr [esp+4], esp
    lea eax, dword ptr [esp+48]
    mov dword ptr [esp+8], eax
    lea eax, dword ptr [esp+16]
    mov dword ptr [esp+12], eax
    call RelayCallback
    mov edx, dword ptr [esp+44]
    mov ecx, dword ptr [esp+36]
    mov dword ptr [esp+ecx+44], edx
    mov eax, dword ptr [esp+16]
    mov edx, dword ptr [esp+20]
    lea esp, [esp+ecx+44]
    ret
endm

; This version also loads the x87 stack with the result, if need be.
; We have to branch to avoid x87 stack imbalance.
trampoline_vec macro ID
    local l1, l2, l3

    endbr32
    sub esp, 44
    mov dword ptr [esp+0], ID
    mov dword ptr [esp+4], esp
    lea eax, dword ptr [esp+48]
    mov dword ptr [esp+8], eax
    lea eax, dword ptr [esp+16]
    mov dword ptr [esp+12], eax
    call RelayCallback
    mov edx, dword ptr [esp+44]
    mov ecx, dword ptr [esp+36]
    mov dword ptr [esp+ecx+44], edx
    cmp byte ptr [esp+32], 0
    jne l2
l1:
    fld dword ptr [esp+24]
    lea esp, dword ptr [esp+ecx+44]
    ret
l2:
    fld qword ptr [esp+24]
    lea esp, dword ptr [esp+ecx+44]
    ret
endm

; When a callback is relayed, Koffi will call into Node.js and V8 to execute Javascript.
; The problem is that we're still running on the separate Koffi stack, and V8 will
; probably misdetect this as a "stack overflow". We have to restore the old
; stack pointer, call Node.js/V8 and go back to ours.
CallSwitchStack proc
    endbr32
    push ebp
    mov ebp, esp
    mov edx, dword ptr [esp+28]
    mov ecx, dword ptr [esp+24]
    mov eax, esp
    sub eax, dword ptr [ecx+0]
    and eax, -16
    mov dword ptr [ecx+4], eax
    mov esp, dword ptr [esp+20]
    sub esp, 28
    mov eax, dword ptr [ebp+8]
    mov dword ptr [esp+0], eax
    mov eax, dword ptr [ebp+12]
    mov dword ptr [esp+4], eax
    mov eax, dword ptr [ebp+16]
    mov dword ptr [esp+8], eax
    call edx
    mov esp, ebp
    pop ebp
    ret
CallSwitchStack endp

; Trampolines
; ----------------------------

include trampolines/masm32.inc

end