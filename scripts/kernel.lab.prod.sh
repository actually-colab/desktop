#!/bin/sh
set -euxo pipefail

clean_up() {
  yarn stop:kernel:all
}

# Cleanup on exit
trap clean_up EXIT

# Cleanup before start
clean_up || true

# Start the kernel
jupyter lab --no-browser --NotebookApp.allow_origin=https://app.actuallycolab.org --NotebookApp.token=prod &

wait
