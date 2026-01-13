# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetClassesForEducator*](#getclassesforeducator)
  - [*ListMaterialsForClass*](#listmaterialsforclass)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*EnrollInClass*](#enrollinclass)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetClassesForEducator
You can execute the `GetClassesForEducator` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getClassesForEducator(vars: GetClassesForEducatorVariables): QueryPromise<GetClassesForEducatorData, GetClassesForEducatorVariables>;

interface GetClassesForEducatorRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassesForEducatorVariables): QueryRef<GetClassesForEducatorData, GetClassesForEducatorVariables>;
}
export const getClassesForEducatorRef: GetClassesForEducatorRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getClassesForEducator(dc: DataConnect, vars: GetClassesForEducatorVariables): QueryPromise<GetClassesForEducatorData, GetClassesForEducatorVariables>;

interface GetClassesForEducatorRef {
  ...
  (dc: DataConnect, vars: GetClassesForEducatorVariables): QueryRef<GetClassesForEducatorData, GetClassesForEducatorVariables>;
}
export const getClassesForEducatorRef: GetClassesForEducatorRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getClassesForEducatorRef:
```typescript
const name = getClassesForEducatorRef.operationName;
console.log(name);
```

### Variables
The `GetClassesForEducator` query requires an argument of type `GetClassesForEducatorVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetClassesForEducatorVariables {
  educatorId: UUIDString;
}
```
### Return Type
Recall that executing the `GetClassesForEducator` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetClassesForEducatorData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetClassesForEducatorData {
  classes: ({
    id: UUIDString;
    name: string;
    description: string;
    courseCode: string;
  } & Class_Key)[];
}
```
### Using `GetClassesForEducator`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getClassesForEducator, GetClassesForEducatorVariables } from '@dataconnect/generated';

// The `GetClassesForEducator` query requires an argument of type `GetClassesForEducatorVariables`:
const getClassesForEducatorVars: GetClassesForEducatorVariables = {
  educatorId: ..., 
};

// Call the `getClassesForEducator()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getClassesForEducator(getClassesForEducatorVars);
// Variables can be defined inline as well.
const { data } = await getClassesForEducator({ educatorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getClassesForEducator(dataConnect, getClassesForEducatorVars);

console.log(data.classes);

// Or, you can use the `Promise` API.
getClassesForEducator(getClassesForEducatorVars).then((response) => {
  const data = response.data;
  console.log(data.classes);
});
```

### Using `GetClassesForEducator`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getClassesForEducatorRef, GetClassesForEducatorVariables } from '@dataconnect/generated';

// The `GetClassesForEducator` query requires an argument of type `GetClassesForEducatorVariables`:
const getClassesForEducatorVars: GetClassesForEducatorVariables = {
  educatorId: ..., 
};

// Call the `getClassesForEducatorRef()` function to get a reference to the query.
const ref = getClassesForEducatorRef(getClassesForEducatorVars);
// Variables can be defined inline as well.
const ref = getClassesForEducatorRef({ educatorId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getClassesForEducatorRef(dataConnect, getClassesForEducatorVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.classes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.classes);
});
```

## ListMaterialsForClass
You can execute the `ListMaterialsForClass` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMaterialsForClass(vars: ListMaterialsForClassVariables): QueryPromise<ListMaterialsForClassData, ListMaterialsForClassVariables>;

interface ListMaterialsForClassRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMaterialsForClassVariables): QueryRef<ListMaterialsForClassData, ListMaterialsForClassVariables>;
}
export const listMaterialsForClassRef: ListMaterialsForClassRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMaterialsForClass(dc: DataConnect, vars: ListMaterialsForClassVariables): QueryPromise<ListMaterialsForClassData, ListMaterialsForClassVariables>;

interface ListMaterialsForClassRef {
  ...
  (dc: DataConnect, vars: ListMaterialsForClassVariables): QueryRef<ListMaterialsForClassData, ListMaterialsForClassVariables>;
}
export const listMaterialsForClassRef: ListMaterialsForClassRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMaterialsForClassRef:
```typescript
const name = listMaterialsForClassRef.operationName;
console.log(name);
```

### Variables
The `ListMaterialsForClass` query requires an argument of type `ListMaterialsForClassVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListMaterialsForClassVariables {
  classId: UUIDString;
}
```
### Return Type
Recall that executing the `ListMaterialsForClass` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMaterialsForClassData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMaterialsForClassData {
  materials: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    fileUrl: string;
    fileType: string;
    uploadDate: DateString;
  } & Material_Key)[];
}
```
### Using `ListMaterialsForClass`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMaterialsForClass, ListMaterialsForClassVariables } from '@dataconnect/generated';

// The `ListMaterialsForClass` query requires an argument of type `ListMaterialsForClassVariables`:
const listMaterialsForClassVars: ListMaterialsForClassVariables = {
  classId: ..., 
};

// Call the `listMaterialsForClass()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMaterialsForClass(listMaterialsForClassVars);
// Variables can be defined inline as well.
const { data } = await listMaterialsForClass({ classId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMaterialsForClass(dataConnect, listMaterialsForClassVars);

console.log(data.materials);

// Or, you can use the `Promise` API.
listMaterialsForClass(listMaterialsForClassVars).then((response) => {
  const data = response.data;
  console.log(data.materials);
});
```

### Using `ListMaterialsForClass`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMaterialsForClassRef, ListMaterialsForClassVariables } from '@dataconnect/generated';

// The `ListMaterialsForClass` query requires an argument of type `ListMaterialsForClassVariables`:
const listMaterialsForClassVars: ListMaterialsForClassVariables = {
  classId: ..., 
};

// Call the `listMaterialsForClassRef()` function to get a reference to the query.
const ref = listMaterialsForClassRef(listMaterialsForClassVars);
// Variables can be defined inline as well.
const ref = listMaterialsForClassRef({ classId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMaterialsForClassRef(dataConnect, listMaterialsForClassVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.materials);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.materials);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  displayName: string;
  email: string;
  userType: string;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
  userType: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ displayName: ..., email: ..., userType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
  userType: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ displayName: ..., email: ..., userType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## EnrollInClass
You can execute the `EnrollInClass` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
enrollInClass(vars: EnrollInClassVariables): MutationPromise<EnrollInClassData, EnrollInClassVariables>;

interface EnrollInClassRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: EnrollInClassVariables): MutationRef<EnrollInClassData, EnrollInClassVariables>;
}
export const enrollInClassRef: EnrollInClassRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
enrollInClass(dc: DataConnect, vars: EnrollInClassVariables): MutationPromise<EnrollInClassData, EnrollInClassVariables>;

interface EnrollInClassRef {
  ...
  (dc: DataConnect, vars: EnrollInClassVariables): MutationRef<EnrollInClassData, EnrollInClassVariables>;
}
export const enrollInClassRef: EnrollInClassRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the enrollInClassRef:
```typescript
const name = enrollInClassRef.operationName;
console.log(name);
```

### Variables
The `EnrollInClass` mutation requires an argument of type `EnrollInClassVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface EnrollInClassVariables {
  studentId: UUIDString;
  classId: UUIDString;
}
```
### Return Type
Recall that executing the `EnrollInClass` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `EnrollInClassData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface EnrollInClassData {
  enrollment_insert: Enrollment_Key;
}
```
### Using `EnrollInClass`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, enrollInClass, EnrollInClassVariables } from '@dataconnect/generated';

// The `EnrollInClass` mutation requires an argument of type `EnrollInClassVariables`:
const enrollInClassVars: EnrollInClassVariables = {
  studentId: ..., 
  classId: ..., 
};

// Call the `enrollInClass()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await enrollInClass(enrollInClassVars);
// Variables can be defined inline as well.
const { data } = await enrollInClass({ studentId: ..., classId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await enrollInClass(dataConnect, enrollInClassVars);

console.log(data.enrollment_insert);

// Or, you can use the `Promise` API.
enrollInClass(enrollInClassVars).then((response) => {
  const data = response.data;
  console.log(data.enrollment_insert);
});
```

### Using `EnrollInClass`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, enrollInClassRef, EnrollInClassVariables } from '@dataconnect/generated';

// The `EnrollInClass` mutation requires an argument of type `EnrollInClassVariables`:
const enrollInClassVars: EnrollInClassVariables = {
  studentId: ..., 
  classId: ..., 
};

// Call the `enrollInClassRef()` function to get a reference to the mutation.
const ref = enrollInClassRef(enrollInClassVars);
// Variables can be defined inline as well.
const ref = enrollInClassRef({ studentId: ..., classId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = enrollInClassRef(dataConnect, enrollInClassVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.enrollment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.enrollment_insert);
});
```

