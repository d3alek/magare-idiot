module.exports = function(newDoc, oldDoc, userCtx, secObj) { 
  var userName = userCtx.name;

  if (!userName) {
    if (
      newDoc._deleted &&
      oldDoc._id.lastIndexOf("sensesWrite", 0) === 0) {
      function twoDaysAgo() {
        return new Date((new Date()).getTime() - 1000*60*24*2).toISOString();
      }
      if (oldDoc.timestamp < twoDaysAgo()) {
        return;
      }
    }
    throw({forbidden: 'Anonymous not allowed to edit documents.'});
  }

  var admin = userCtx.roles.indexOf('_admin') !== -1;
  var deleteAction = typeof newDoc === 'undefined' || newDoc === null || newDoc._deleted === true;

  if (!admin && deleteAction) {
    throw({forbidden: 'Only admins allowed to delete documents.'});
  }

  var idiot = userCtx.roles.indexOf('idiot') !== -1;

  if (!admin && !idiot) {
    throw({forbidden: 'Only admins and users with `idiot` role allowed to edit documents.'});
  }

  var robot = userCtx.roles.indexOf('robot') !== -1;
  var createAction = typeof oldDoc === 'undefined' || oldDoc === null

  if (!admin && !robot && createAction) {
    throw({forbidden: 'Only admins and users with `robot` role allowed to create documents.'});
  }
}
