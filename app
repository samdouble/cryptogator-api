#!/bin/bash
#
# app development helper

set -euo pipefail

USAGE="Usage: app COMMAND [SUBCOMMAND]

Common usage:
  app dev
    start the development containers
  app server|server-test
    enter the specified container
  app server test-unit
    equivalent to run 'npm run test-unit' in 'server'"

if [[ "$#" == "0" ]]; then
  echo "No argument supplied"
  cmd="help"
else
  cmd="$1"
  shift
fi

# cd to the dir of this script
cd "${0%/*}"

case "${cmd}" in
  dev)
    sudo docker-compose build
    sudo docker-compose up
    ;;
  server)
    if [[ -z "${1-}" ]]; then
      sudo docker exec -it app-server /bin/bash
    elif [[ "$@" =~ ^test.* ]]; then
      sudo docker exec -it app-server-test /bin/bash -c "npm run $@"
    else
      sudo docker exec -it app-server /bin/bash -c "npm run $@"
    fi
    ;;
  server-test)
    if [[ -z "${1-}" ]]; then
      sudo docker exec -it app-server-test /bin/bash
    else
      sudo docker exec -it app-server-test /bin/bash -c "npm run $@"
    fi
    ;;
  list)
    sudo docker ps -a
    ;;
  clear)
    sudo docker stop $(sudo docker ps -a -q)
    sudo docker rm $(sudo docker ps -a -q)
    ;;
  clean)
    cd client
    sudo rm -rf node_modules/ yarn.lock
    cd ../server
    sudo rm -rf node_modules/ package-lock.json
    ;;
  prune)
    sudo docker system prune -a --volumes
    ;;
  help)
    echo "$USAGE"
    ;;
  *)
    echo "Unexpected command '${cmd}'" >&2
    exit 1
    ;;
esac

exit 0
