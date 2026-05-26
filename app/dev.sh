#!/bin/bash
export PATH="$HOME/.local/node/bin:$PATH"
cd /Users/exx/aurum-experience
exec npm run dev -- --port 5174 --strictPort --host
