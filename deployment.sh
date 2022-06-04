#!/usr/bin/env bash
# Build docker image & run

function pull_git_run {
    echo "RUN --> Git pull latest code"
    git pull origin main
}

function build_and_run {
    echo  "--> build and up docker"
    if [ $( docker ps -a | grep backend_bank| wc -l ) -gt 0 ]; then
	docker stop backend_bank || true && docker rm backend_bank || true
	echo "---- backend_bank exists"
    else
  	echo "---- backend_bank does not exist"
    fi


    docker build -t backend_bank:v1 .
    docker run --name backend_bank -d -p 8002:3010 backend_bank:v1
}

pull_git_run
build_and_run
