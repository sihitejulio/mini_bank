#!/usr/bin/env bash
# Build docker image & run
function build_and_run {
    docker build -t backend_bank:v1 .
    docker run --name backend_bank -d -p 8002:3010 backend_bank:v1
}

build_and_run
