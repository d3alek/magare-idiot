module.exports = function(newDoc, oldDoc, userCtx, secObj) { 
  var admin = userCtx.roles.indexOf('_admin') !== -1;

  if (!admin) {
    throw({forbidden: 'Only admins allowed to create/edit/delete documents.'});
  }
}
