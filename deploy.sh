set -e
if [ -z "$SCHEMA" ];
then
SCHEMA="https"
fi

echo
echo "*** Build idiot-view ***"
echo

cd idiot-view
yarn install
yarn build
cp -r dist/* ../couchdb/idiot/_design/idiot-view/_attachments
cd ..

echo
echo "*** Substitute secrets into replicator document ***"
echo

envsubst '$DEPLOY_USER $DEPLOY_PASSWORD $DEPLOY_HOST $SCHEMA' < replicator/idiot-copy-sensesWrite-to-history.json > couchdb/_replicator/idiot-copy-sensesWrite-to-history.json

echo
echo "*** Push magare-idiot to $DEPLOY_HOST ***"
echo

echo $SCHEMA://$DEPLOY_USER:$DEPLOY_PASSWORD@$DEPLOY_HOST
npm run bootstrap push --index $SCHEMA://$DEPLOY_USER:$DEPLOY_PASSWORD@$DEPLOY_HOST couchdb

