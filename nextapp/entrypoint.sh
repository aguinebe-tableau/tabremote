#!/bin/bash
if [[ -z $DEVELOPMENT ]]; then
  echo "We are in production, starting NEXTJS in production mode"
  cd /nextapp/tabremote
  TO_RUN="npm run dev"
else
  echo "We are in development, just keeping container up"
  TO_RUN="tail -f /dev/null"
fi
exec $TO_RUN
