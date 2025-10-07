import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AuditLog_Key {
  id: UUIDString;
  __typename?: 'AuditLog_Key';
}

export interface Calculation_Key {
  id: UUIDString;
  __typename?: 'Calculation_Key';
}

export interface CheckPaymentStatusData {
  user?: {
    id: string;
    email: string;
    hasPaid: boolean;
    stripeCustomerId?: string | null;
  } & User_Key;
}

export interface CheckPaymentStatusVariables {
  userId: string;
}

export interface CreateAuditLogData {
  auditLog_insert: AuditLog_Key;
}

export interface CreateAuditLogVariables {
  userId: string;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface CreatePaymentData {
  payment_insert: Payment_Key;
}

export interface CreatePaymentVariables {
  userId: string;
  amount: number;
  currency: string;
  status: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentMethod?: string | null;
}

export interface DeleteUserData {
  calculation_deleteMany: number;
  payment_deleteMany: number;
  auditLog_deleteMany: number;
  user_delete?: User_Key | null;
}

export interface DeleteUserVariables {
  userId: string;
}

export interface GetCalculationHistoryData {
  calculations: ({
    id: UUIDString;
    rendaBruta: number;
    dependentes: number;
    pensaoAlimenticia: number;
    despesasMedicas: number;
    despesasEducacao: number;
    previdenciaPrivada: number;
    inss: number;
    baseCalculo: number;
    impostoDevido: number;
    metodo: string;
    totalDeducoes: number;
    createdAt: TimestampString;
    isLatest: boolean;
  } & Calculation_Key)[];
}

export interface GetCalculationHistoryVariables {
  userId: string;
  limit?: number | null;
}

export interface GetLatestCalculationData {
  calculations: ({
    id: UUIDString;
    rendaBruta: number;
    dependentes: number;
    pensaoAlimenticia: number;
    despesasMedicas: number;
    despesasEducacao: number;
    previdenciaPrivada: number;
    inss: number;
    baseCalculo: number;
    impostoDevido: number;
    metodo: string;
    totalDeducoes: number;
    createdAt: TimestampString;
  } & Calculation_Key)[];
}

export interface GetLatestCalculationVariables {
  userId: string;
}

export interface GetLatestPaymentData {
  payments: ({
    id: UUIDString;
    stripeSessionId?: string | null;
    stripePaymentIntentId?: string | null;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string | null;
    createdAt: TimestampString;
    completedAt?: TimestampString | null;
  } & Payment_Key)[];
}

export interface GetLatestPaymentVariables {
  userId: string;
}

export interface GetUserAuditLogsData {
  auditLogs: ({
    id: UUIDString;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: TimestampString;
  } & AuditLog_Key)[];
}

export interface GetUserAuditLogsVariables {
  userId: string;
  limit?: number | null;
}

export interface GetUserByEmailData {
  users: ({
    id: string;
    email: string;
    displayName?: string | null;
    provider?: string | null;
    hasPaid: boolean;
    stripeCustomerId?: string | null;
    createdAt: TimestampString;
    lastLogin?: TimestampString | null;
  } & User_Key)[];
}

export interface GetUserByEmailVariables {
  email: string;
}

export interface GetUserData {
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    provider?: string | null;
    hasPaid: boolean;
    stripeCustomerId?: string | null;
    createdAt: TimestampString;
    lastLogin?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & User_Key;
}

export interface GetUserPaymentsData {
  payments: ({
    id: UUIDString;
    stripeSessionId?: string | null;
    stripePaymentIntentId?: string | null;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string | null;
    createdAt: TimestampString;
    completedAt?: TimestampString | null;
  } & Payment_Key)[];
}

export interface GetUserPaymentsVariables {
  userId: string;
}

export interface GetUserVariables {
  userId: string;
}

export interface Payment_Key {
  id: UUIDString;
  __typename?: 'Payment_Key';
}

export interface SaveCalculationData {
  calculation_updateMany: number;
  calculation_insert: Calculation_Key;
}

export interface SaveCalculationVariables {
  userId: string;
  rendaBruta: number;
  dependentes: number;
  pensaoAlimenticia: number;
  despesasMedicas: number;
  despesasEducacao: number;
  previdenciaPrivada: number;
  inss: number;
  baseCalculo: number;
  impostoDevido: number;
  metodo: string;
  totalDeducoes: number;
}

export interface UpdatePaymentStatus2Data {
  payment_update?: Payment_Key | null;
}

export interface UpdatePaymentStatus2Variables {
  paymentId: UUIDString;
  status: string;
  stripePaymentIntentId?: string | null;
  paymentMethod?: string | null;
}

export interface UpdatePaymentStatusData {
  user_update?: User_Key | null;
}

export interface UpdatePaymentStatusVariables {
  userId: string;
  hasPaid: boolean;
  stripeCustomerId?: string | null;
}

export interface UpdateUserLoginData {
  user_update?: User_Key | null;
}

export interface UpdateUserLoginVariables {
  userId: string;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  id: string;
  email: string;
  displayName?: string | null;
  provider?: string | null;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpdateUserLoginRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserLoginVariables): MutationRef<UpdateUserLoginData, UpdateUserLoginVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserLoginVariables): MutationRef<UpdateUserLoginData, UpdateUserLoginVariables>;
  operationName: string;
}
export const updateUserLoginRef: UpdateUserLoginRef;

export function updateUserLogin(vars: UpdateUserLoginVariables): MutationPromise<UpdateUserLoginData, UpdateUserLoginVariables>;
export function updateUserLogin(dc: DataConnect, vars: UpdateUserLoginVariables): MutationPromise<UpdateUserLoginData, UpdateUserLoginVariables>;

interface UpdatePaymentStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePaymentStatusVariables): MutationRef<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePaymentStatusVariables): MutationRef<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;
  operationName: string;
}
export const updatePaymentStatusRef: UpdatePaymentStatusRef;

export function updatePaymentStatus(vars: UpdatePaymentStatusVariables): MutationPromise<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;
export function updatePaymentStatus(dc: DataConnect, vars: UpdatePaymentStatusVariables): MutationPromise<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;

interface CreatePaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePaymentVariables): MutationRef<CreatePaymentData, CreatePaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePaymentVariables): MutationRef<CreatePaymentData, CreatePaymentVariables>;
  operationName: string;
}
export const createPaymentRef: CreatePaymentRef;

export function createPayment(vars: CreatePaymentVariables): MutationPromise<CreatePaymentData, CreatePaymentVariables>;
export function createPayment(dc: DataConnect, vars: CreatePaymentVariables): MutationPromise<CreatePaymentData, CreatePaymentVariables>;

interface UpdatePaymentStatus2Ref {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePaymentStatus2Variables): MutationRef<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePaymentStatus2Variables): MutationRef<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;
  operationName: string;
}
export const updatePaymentStatus2Ref: UpdatePaymentStatus2Ref;

export function updatePaymentStatus2(vars: UpdatePaymentStatus2Variables): MutationPromise<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;
export function updatePaymentStatus2(dc: DataConnect, vars: UpdatePaymentStatus2Variables): MutationPromise<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;

interface SaveCalculationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SaveCalculationVariables): MutationRef<SaveCalculationData, SaveCalculationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SaveCalculationVariables): MutationRef<SaveCalculationData, SaveCalculationVariables>;
  operationName: string;
}
export const saveCalculationRef: SaveCalculationRef;

export function saveCalculation(vars: SaveCalculationVariables): MutationPromise<SaveCalculationData, SaveCalculationVariables>;
export function saveCalculation(dc: DataConnect, vars: SaveCalculationVariables): MutationPromise<SaveCalculationData, SaveCalculationVariables>;

interface CreateAuditLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
  operationName: string;
}
export const createAuditLogRef: CreateAuditLogRef;

export function createAuditLog(vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;
export function createAuditLog(dc: DataConnect, vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;
export function deleteUser(dc: DataConnect, vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;
export function getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserByEmailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  operationName: string;
}
export const getUserByEmailRef: GetUserByEmailRef;

export function getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface CheckPaymentStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CheckPaymentStatusVariables): QueryRef<CheckPaymentStatusData, CheckPaymentStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CheckPaymentStatusVariables): QueryRef<CheckPaymentStatusData, CheckPaymentStatusVariables>;
  operationName: string;
}
export const checkPaymentStatusRef: CheckPaymentStatusRef;

export function checkPaymentStatus(vars: CheckPaymentStatusVariables): QueryPromise<CheckPaymentStatusData, CheckPaymentStatusVariables>;
export function checkPaymentStatus(dc: DataConnect, vars: CheckPaymentStatusVariables): QueryPromise<CheckPaymentStatusData, CheckPaymentStatusVariables>;

interface GetLatestCalculationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLatestCalculationVariables): QueryRef<GetLatestCalculationData, GetLatestCalculationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLatestCalculationVariables): QueryRef<GetLatestCalculationData, GetLatestCalculationVariables>;
  operationName: string;
}
export const getLatestCalculationRef: GetLatestCalculationRef;

export function getLatestCalculation(vars: GetLatestCalculationVariables): QueryPromise<GetLatestCalculationData, GetLatestCalculationVariables>;
export function getLatestCalculation(dc: DataConnect, vars: GetLatestCalculationVariables): QueryPromise<GetLatestCalculationData, GetLatestCalculationVariables>;

interface GetCalculationHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCalculationHistoryVariables): QueryRef<GetCalculationHistoryData, GetCalculationHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCalculationHistoryVariables): QueryRef<GetCalculationHistoryData, GetCalculationHistoryVariables>;
  operationName: string;
}
export const getCalculationHistoryRef: GetCalculationHistoryRef;

export function getCalculationHistory(vars: GetCalculationHistoryVariables): QueryPromise<GetCalculationHistoryData, GetCalculationHistoryVariables>;
export function getCalculationHistory(dc: DataConnect, vars: GetCalculationHistoryVariables): QueryPromise<GetCalculationHistoryData, GetCalculationHistoryVariables>;

interface GetUserPaymentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserPaymentsVariables): QueryRef<GetUserPaymentsData, GetUserPaymentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserPaymentsVariables): QueryRef<GetUserPaymentsData, GetUserPaymentsVariables>;
  operationName: string;
}
export const getUserPaymentsRef: GetUserPaymentsRef;

export function getUserPayments(vars: GetUserPaymentsVariables): QueryPromise<GetUserPaymentsData, GetUserPaymentsVariables>;
export function getUserPayments(dc: DataConnect, vars: GetUserPaymentsVariables): QueryPromise<GetUserPaymentsData, GetUserPaymentsVariables>;

interface GetLatestPaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLatestPaymentVariables): QueryRef<GetLatestPaymentData, GetLatestPaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLatestPaymentVariables): QueryRef<GetLatestPaymentData, GetLatestPaymentVariables>;
  operationName: string;
}
export const getLatestPaymentRef: GetLatestPaymentRef;

export function getLatestPayment(vars: GetLatestPaymentVariables): QueryPromise<GetLatestPaymentData, GetLatestPaymentVariables>;
export function getLatestPayment(dc: DataConnect, vars: GetLatestPaymentVariables): QueryPromise<GetLatestPaymentData, GetLatestPaymentVariables>;

interface GetUserAuditLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserAuditLogsVariables): QueryRef<GetUserAuditLogsData, GetUserAuditLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserAuditLogsVariables): QueryRef<GetUserAuditLogsData, GetUserAuditLogsVariables>;
  operationName: string;
}
export const getUserAuditLogsRef: GetUserAuditLogsRef;

export function getUserAuditLogs(vars: GetUserAuditLogsVariables): QueryPromise<GetUserAuditLogsData, GetUserAuditLogsVariables>;
export function getUserAuditLogs(dc: DataConnect, vars: GetUserAuditLogsVariables): QueryPromise<GetUserAuditLogsData, GetUserAuditLogsVariables>;

