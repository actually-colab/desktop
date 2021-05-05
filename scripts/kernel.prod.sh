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
jupyter notebook --NotebookApp.open_browser=False --NotebookApp.allow_origin=https://app.actuallycolab.org --NotebookApp.token=prod &

wait
