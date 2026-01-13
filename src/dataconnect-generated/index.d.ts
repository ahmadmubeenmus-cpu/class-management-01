import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Attendance_Key {
  enrollmentStudentId: UUIDString;
  enrollmentClassId: UUIDString;
  sessionId: UUIDString;
  __typename?: 'Attendance_Key';
}

export interface Class_Key {
  id: UUIDString;
  __typename?: 'Class_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  displayName: string;
  email: string;
  userType: string;
}

export interface EnrollInClassData {
  enrollment_insert: Enrollment_Key;
}

export interface EnrollInClassVariables {
  studentId: UUIDString;
  classId: UUIDString;
}

export interface Enrollment_Key {
  studentId: UUIDString;
  classId: UUIDString;
  __typename?: 'Enrollment_Key';
}

export interface GetClassesForEducatorData {
  classes: ({
    id: UUIDString;
    name: string;
    description: string;
    courseCode: string;
  } & Class_Key)[];
}

export interface GetClassesForEducatorVariables {
  educatorId: UUIDString;
}

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

export interface ListMaterialsForClassVariables {
  classId: UUIDString;
}

export interface Material_Key {
  id: UUIDString;
  __typename?: 'Material_Key';
}

export interface Session_Key {
  id: UUIDString;
  __typename?: 'Session_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetClassesForEducatorRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassesForEducatorVariables): QueryRef<GetClassesForEducatorData, GetClassesForEducatorVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassesForEducatorVariables): QueryRef<GetClassesForEducatorData, GetClassesForEducatorVariables>;
  operationName: string;
}
export const getClassesForEducatorRef: GetClassesForEducatorRef;

export function getClassesForEducator(vars: GetClassesForEducatorVariables): QueryPromise<GetClassesForEducatorData, GetClassesForEducatorVariables>;
export function getClassesForEducator(dc: DataConnect, vars: GetClassesForEducatorVariables): QueryPromise<GetClassesForEducatorData, GetClassesForEducatorVariables>;

interface EnrollInClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: EnrollInClassVariables): MutationRef<EnrollInClassData, EnrollInClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: EnrollInClassVariables): MutationRef<EnrollInClassData, EnrollInClassVariables>;
  operationName: string;
}
export const enrollInClassRef: EnrollInClassRef;

export function enrollInClass(vars: EnrollInClassVariables): MutationPromise<EnrollInClassData, EnrollInClassVariables>;
export function enrollInClass(dc: DataConnect, vars: EnrollInClassVariables): MutationPromise<EnrollInClassData, EnrollInClassVariables>;

interface ListMaterialsForClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMaterialsForClassVariables): QueryRef<ListMaterialsForClassData, ListMaterialsForClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListMaterialsForClassVariables): QueryRef<ListMaterialsForClassData, ListMaterialsForClassVariables>;
  operationName: string;
}
export const listMaterialsForClassRef: ListMaterialsForClassRef;

export function listMaterialsForClass(vars: ListMaterialsForClassVariables): QueryPromise<ListMaterialsForClassData, ListMaterialsForClassVariables>;
export function listMaterialsForClass(dc: DataConnect, vars: ListMaterialsForClassVariables): QueryPromise<ListMaterialsForClassData, ListMaterialsForClassVariables>;

