#!/bin/sh
set -euxo pipefail

clean_up() {
  jupyter notebook stop
}

# Cleanup on exit
trap clean_up EXIT

# Cleanup before start
clean_up || true

# Start the kernel
jupyter notebook --NotebookApp.open_browser=False --NotebookApp.allow_origin=http://localhost:4000 --NotebookApp.token=dev &

wait
