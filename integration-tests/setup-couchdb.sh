curl -X PUT $TEST_COUCHDB_ADDR/_config/admins/$TEST_ADMIN -d "\"$TEST_ADMIN_PASSWORD\""
curl -X PUT $TEST_COUCHDB_ADDR/_users
curl -X PUT $TEST_COUCHDB_ADDR/_users/org.couchdb.user:$TEST_USER -d "{\"name\": \"$TEST_USER\", \"password\": \"$TEST_USER_PASSWORD\", \"roles\": [], \"type\": \"user\"}"
curl -X PUT $TEST_COUCHDB_ADDR/_users/org.couchdb.user:$ANOTHER_USER -d "{\"name\": \"$ANOTHER_USER\", \"password\": \"$ANOTHER_USER_PASSWORD\", \"roles\": [], \"type\": \"user\"}"
