import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const getClassesForEducatorRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClassesForEducator', inputVars);
}
getClassesForEducatorRef.operationName = 'GetClassesForEducator';

export function getClassesForEducator(dcOrVars, vars) {
  return executeQuery(getClassesForEducatorRef(dcOrVars, vars));
}

export const enrollInClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'EnrollInClass', inputVars);
}
enrollInClassRef.operationName = 'EnrollInClass';

export function enrollInClass(dcOrVars, vars) {
  return executeMutation(enrollInClassRef(dcOrVars, vars));
}

export const listMaterialsForClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMaterialsForClass', inputVars);
}
listMaterialsForClassRef.operationName = 'ListMaterialsForClass';

export function listMaterialsForClass(dcOrVars, vars) {
  return executeQuery(listMaterialsForClassRef(dcOrVars, vars));
}

