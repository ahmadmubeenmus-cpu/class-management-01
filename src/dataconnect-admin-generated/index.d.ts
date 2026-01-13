import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

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

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'GetClassesForEducator' Query. Allow users to execute without passing in DataConnect. */
export function getClassesForEducator(dc: DataConnect, vars: GetClassesForEducatorVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetClassesForEducatorData>>;
/** Generated Node Admin SDK operation action function for the 'GetClassesForEducator' Query. Allow users to pass in custom DataConnect instances. */
export function getClassesForEducator(vars: GetClassesForEducatorVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetClassesForEducatorData>>;

/** Generated Node Admin SDK operation action function for the 'EnrollInClass' Mutation. Allow users to execute without passing in DataConnect. */
export function enrollInClass(dc: DataConnect, vars: EnrollInClassVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<EnrollInClassData>>;
/** Generated Node Admin SDK operation action function for the 'EnrollInClass' Mutation. Allow users to pass in custom DataConnect instances. */
export function enrollInClass(vars: EnrollInClassVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<EnrollInClassData>>;

/** Generated Node Admin SDK operation action function for the 'ListMaterialsForClass' Query. Allow users to execute without passing in DataConnect. */
export function listMaterialsForClass(dc: DataConnect, vars: ListMaterialsForClassVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMaterialsForClassData>>;
/** Generated Node Admin SDK operation action function for the 'ListMaterialsForClass' Query. Allow users to pass in custom DataConnect instances. */
export function listMaterialsForClass(vars: ListMaterialsForClassVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMaterialsForClassData>>;

