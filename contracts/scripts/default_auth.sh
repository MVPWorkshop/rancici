#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:5050";

export WORLD_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.world.address')

export BATTLE_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "dojo_starter_battle::systems::battle::battle" ).address')

echo "---------------------------------------------------------------------------"
echo world : $WORLD_ADDRESS 
echo " "
echo actions : $BATTLE_ADDRESS
echo "---------------------------------------------------------------------------"


# enable system -> component authorizations
COMPONENTS=("Battle" "BattleConfig")

for component in ${COMPONENTS[@]}; do
    sozo auth writer $component $BATTLE_ADDRESS --world $WORLD_ADDRESS --rpc-url $RPC_URL
    # time out for 1 second to avoid rate limiting
    sleep 1
done

echo "Default authorizations have been successfully set."