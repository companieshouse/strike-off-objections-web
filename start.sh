#!/bin/bash
#
# Start script for strike-off-objections-web

APP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [[ -z "${MESOS_SLAVE_PID}" ]]; then

    source ~/.chs_env/private_env
    source ~/.chs_env/global_env
    source ~/.chs_env/strike-off-objections-web/env

    PORT="${STRIKE_OFF_OBJECTIONS_WEB_PORT}"

    exec npm run devstart -- --PORT=$PORT
else

    PORT="$1"
    CONFIG_URL="$2"
    ENVIRONMENT="$3"
    APP_NAME="$4"

    source /etc/profile

    echo "Downloading environment from: ${CONFIG_URL}/${ENVIRONMENT}/${APP_NAME}"
    wget -O "${APP_DIR}/private_env" "${CONFIG_URL}/${ENVIRONMENT}/private_env"
    wget -O "${APP_DIR}/global_env" "${CONFIG_URL}/${ENVIRONMENT}/global_env"
    wget -O "${APP_DIR}/app_env" "${CONFIG_URL}/${ENVIRONMENT}/${APP_NAME}/env"
    source "${APP_DIR}/private_env"
    source "${APP_DIR}/global_env"
    source "${APP_DIR}/app_env"

    exec node ${APP_DIR}/bin/www.js -- $PORT
fi
