#!/bin/bash -e

apt update
apt install -y build-essential git cmake ninja-build pkg-config gdb debhelper dh-make devscripts clang lld