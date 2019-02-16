set -e

cd idiot-view
yarn build
cp -r dist/* ../couchdb/idiot/_design/idiot-view/_attachments
cd ..

npm run bootstrap push --index https://$DEPLOY_USER:$DEPLOY_PASSWORD@$DEPLOY_URL couchdb

