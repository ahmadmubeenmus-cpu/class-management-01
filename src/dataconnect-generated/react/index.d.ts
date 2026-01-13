import { CreateUserData, CreateUserVariables, GetClassesForEducatorData, GetClassesForEducatorVariables, EnrollInClassData, EnrollInClassVariables, ListMaterialsForClassData, ListMaterialsForClassVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useGetClassesForEducator(vars: GetClassesForEducatorVariables, options?: useDataConnectQueryOptions<GetClassesForEducatorData>): UseDataConnectQueryResult<GetClassesForEducatorData, GetClassesForEducatorVariables>;
export function useGetClassesForEducator(dc: DataConnect, vars: GetClassesForEducatorVariables, options?: useDataConnectQueryOptions<GetClassesForEducatorData>): UseDataConnectQueryResult<GetClassesForEducatorData, GetClassesForEducatorVariables>;

export function useEnrollInClass(options?: useDataConnectMutationOptions<EnrollInClassData, FirebaseError, EnrollInClassVariables>): UseDataConnectMutationResult<EnrollInClassData, EnrollInClassVariables>;
export function useEnrollInClass(dc: DataConnect, options?: useDataConnectMutationOptions<EnrollInClassData, FirebaseError, EnrollInClassVariables>): UseDataConnectMutationResult<EnrollInClassData, EnrollInClassVariables>;

export function useListMaterialsForClass(vars: ListMaterialsForClassVariables, options?: useDataConnectQueryOptions<ListMaterialsForClassData>): UseDataConnectQueryResult<ListMaterialsForClassData, ListMaterialsForClassVariables>;
export function useListMaterialsForClass(dc: DataConnect, vars: ListMaterialsForClassVariables, options?: useDataConnectQueryOptions<ListMaterialsForClassData>): UseDataConnectQueryResult<ListMaterialsForClassData, ListMaterialsForClassVariables>;
