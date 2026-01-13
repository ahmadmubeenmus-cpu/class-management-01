const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const getClassesForEducatorRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassesForEducator', inputVars);
}
getClassesForEducatorRef.operationName = 'GetClassesForEducator';
exports.getClassesForEducatorRef = getClassesForEducatorRef;

exports.getClassesForEducator = function getClassesForEducator(dcOrVars, vars) {
  return executeQuery(getClassesForEducatorRef(dcOrVars, vars));
};

const enrollInClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'EnrollInClass', inputVars);
}
enrollInClassRef.operationName = 'EnrollInClass';
exports.enrollInClassRef = enrollInClassRef;

exports.enrollInClass = function enrollInClass(dcOrVars, vars) {
  return executeMutation(enrollInClassRef(dcOrVars, vars));
};

const listMaterialsForClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMaterialsForClass', inputVars);
}
listMaterialsForClassRef.operationName = 'ListMaterialsForClass';
exports.listMaterialsForClassRef = listMaterialsForClassRef;

exports.listMaterialsForClass = function listMaterialsForClass(dcOrVars, vars) {
  return executeQuery(listMaterialsForClassRef(dcOrVars, vars));
};
