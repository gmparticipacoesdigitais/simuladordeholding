# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `irpf`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUser*](#getuser)
  - [*GetUserByEmail*](#getuserbyemail)
  - [*CheckPaymentStatus*](#checkpaymentstatus)
  - [*GetLatestCalculation*](#getlatestcalculation)
  - [*GetCalculationHistory*](#getcalculationhistory)
  - [*GetUserPayments*](#getuserpayments)
  - [*GetLatestPayment*](#getlatestpayment)
  - [*GetUserAuditLogs*](#getuserauditlogs)
- [**Mutations**](#mutations)
  - [*UpsertUser*](#upsertuser)
  - [*UpdateUserLogin*](#updateuserlogin)
  - [*UpdatePaymentStatus*](#updatepaymentstatus)
  - [*CreatePayment*](#createpayment)
  - [*UpdatePaymentStatus2*](#updatepaymentstatus2)
  - [*SaveCalculation*](#savecalculation)
  - [*CreateAuditLog*](#createauditlog)
  - [*DeleteUser*](#deleteuser)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `irpf`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

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

Below are examples of how to use the `irpf` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query requires an argument of type `GetUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser, GetUserVariables } from '@dataconnect/generated';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  userId: ..., 
};

// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser(getUserVars);
// Variables can be defined inline as well.
const { data } = await getUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect, getUserVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser(getUserVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef, GetUserVariables } from '@dataconnect/generated';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  userId: ..., 
};

// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef(getUserVars);
// Variables can be defined inline as well.
const ref = getUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect, getUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetUserByEmail
You can execute the `GetUserByEmail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByEmailRef:
```typescript
const name = getUserByEmailRef.operationName;
console.log(name);
```

### Variables
The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByEmailVariables {
  email: string;
}
```
### Return Type
Recall that executing the `GetUserByEmail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByEmailData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserByEmail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByEmail, GetUserByEmailVariables } from '@dataconnect/generated';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByEmail(getUserByEmailVars);
// Variables can be defined inline as well.
const { data } = await getUserByEmail({ email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByEmail(dataConnect, getUserByEmailVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByEmail(getUserByEmailVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByEmail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByEmailRef, GetUserByEmailVariables } from '@dataconnect/generated';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmailRef()` function to get a reference to the query.
const ref = getUserByEmailRef(getUserByEmailVars);
// Variables can be defined inline as well.
const ref = getUserByEmailRef({ email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByEmailRef(dataConnect, getUserByEmailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## CheckPaymentStatus
You can execute the `CheckPaymentStatus` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
checkPaymentStatus(vars: CheckPaymentStatusVariables): QueryPromise<CheckPaymentStatusData, CheckPaymentStatusVariables>;

interface CheckPaymentStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CheckPaymentStatusVariables): QueryRef<CheckPaymentStatusData, CheckPaymentStatusVariables>;
}
export const checkPaymentStatusRef: CheckPaymentStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
checkPaymentStatus(dc: DataConnect, vars: CheckPaymentStatusVariables): QueryPromise<CheckPaymentStatusData, CheckPaymentStatusVariables>;

interface CheckPaymentStatusRef {
  ...
  (dc: DataConnect, vars: CheckPaymentStatusVariables): QueryRef<CheckPaymentStatusData, CheckPaymentStatusVariables>;
}
export const checkPaymentStatusRef: CheckPaymentStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the checkPaymentStatusRef:
```typescript
const name = checkPaymentStatusRef.operationName;
console.log(name);
```

### Variables
The `CheckPaymentStatus` query requires an argument of type `CheckPaymentStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CheckPaymentStatusVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `CheckPaymentStatus` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CheckPaymentStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CheckPaymentStatusData {
  user?: {
    id: string;
    email: string;
    hasPaid: boolean;
    stripeCustomerId?: string | null;
  } & User_Key;
}
```
### Using `CheckPaymentStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, checkPaymentStatus, CheckPaymentStatusVariables } from '@dataconnect/generated';

// The `CheckPaymentStatus` query requires an argument of type `CheckPaymentStatusVariables`:
const checkPaymentStatusVars: CheckPaymentStatusVariables = {
  userId: ..., 
};

// Call the `checkPaymentStatus()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await checkPaymentStatus(checkPaymentStatusVars);
// Variables can be defined inline as well.
const { data } = await checkPaymentStatus({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await checkPaymentStatus(dataConnect, checkPaymentStatusVars);

console.log(data.user);

// Or, you can use the `Promise` API.
checkPaymentStatus(checkPaymentStatusVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `CheckPaymentStatus`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, checkPaymentStatusRef, CheckPaymentStatusVariables } from '@dataconnect/generated';

// The `CheckPaymentStatus` query requires an argument of type `CheckPaymentStatusVariables`:
const checkPaymentStatusVars: CheckPaymentStatusVariables = {
  userId: ..., 
};

// Call the `checkPaymentStatusRef()` function to get a reference to the query.
const ref = checkPaymentStatusRef(checkPaymentStatusVars);
// Variables can be defined inline as well.
const ref = checkPaymentStatusRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = checkPaymentStatusRef(dataConnect, checkPaymentStatusVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetLatestCalculation
You can execute the `GetLatestCalculation` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLatestCalculation(vars: GetLatestCalculationVariables): QueryPromise<GetLatestCalculationData, GetLatestCalculationVariables>;

interface GetLatestCalculationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLatestCalculationVariables): QueryRef<GetLatestCalculationData, GetLatestCalculationVariables>;
}
export const getLatestCalculationRef: GetLatestCalculationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLatestCalculation(dc: DataConnect, vars: GetLatestCalculationVariables): QueryPromise<GetLatestCalculationData, GetLatestCalculationVariables>;

interface GetLatestCalculationRef {
  ...
  (dc: DataConnect, vars: GetLatestCalculationVariables): QueryRef<GetLatestCalculationData, GetLatestCalculationVariables>;
}
export const getLatestCalculationRef: GetLatestCalculationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLatestCalculationRef:
```typescript
const name = getLatestCalculationRef.operationName;
console.log(name);
```

### Variables
The `GetLatestCalculation` query requires an argument of type `GetLatestCalculationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLatestCalculationVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `GetLatestCalculation` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLatestCalculationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetLatestCalculation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLatestCalculation, GetLatestCalculationVariables } from '@dataconnect/generated';

// The `GetLatestCalculation` query requires an argument of type `GetLatestCalculationVariables`:
const getLatestCalculationVars: GetLatestCalculationVariables = {
  userId: ..., 
};

// Call the `getLatestCalculation()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLatestCalculation(getLatestCalculationVars);
// Variables can be defined inline as well.
const { data } = await getLatestCalculation({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLatestCalculation(dataConnect, getLatestCalculationVars);

console.log(data.calculations);

// Or, you can use the `Promise` API.
getLatestCalculation(getLatestCalculationVars).then((response) => {
  const data = response.data;
  console.log(data.calculations);
});
```

### Using `GetLatestCalculation`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLatestCalculationRef, GetLatestCalculationVariables } from '@dataconnect/generated';

// The `GetLatestCalculation` query requires an argument of type `GetLatestCalculationVariables`:
const getLatestCalculationVars: GetLatestCalculationVariables = {
  userId: ..., 
};

// Call the `getLatestCalculationRef()` function to get a reference to the query.
const ref = getLatestCalculationRef(getLatestCalculationVars);
// Variables can be defined inline as well.
const ref = getLatestCalculationRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLatestCalculationRef(dataConnect, getLatestCalculationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.calculations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.calculations);
});
```

## GetCalculationHistory
You can execute the `GetCalculationHistory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCalculationHistory(vars: GetCalculationHistoryVariables): QueryPromise<GetCalculationHistoryData, GetCalculationHistoryVariables>;

interface GetCalculationHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCalculationHistoryVariables): QueryRef<GetCalculationHistoryData, GetCalculationHistoryVariables>;
}
export const getCalculationHistoryRef: GetCalculationHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCalculationHistory(dc: DataConnect, vars: GetCalculationHistoryVariables): QueryPromise<GetCalculationHistoryData, GetCalculationHistoryVariables>;

interface GetCalculationHistoryRef {
  ...
  (dc: DataConnect, vars: GetCalculationHistoryVariables): QueryRef<GetCalculationHistoryData, GetCalculationHistoryVariables>;
}
export const getCalculationHistoryRef: GetCalculationHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCalculationHistoryRef:
```typescript
const name = getCalculationHistoryRef.operationName;
console.log(name);
```

### Variables
The `GetCalculationHistory` query requires an argument of type `GetCalculationHistoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCalculationHistoryVariables {
  userId: string;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetCalculationHistory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCalculationHistoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetCalculationHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCalculationHistory, GetCalculationHistoryVariables } from '@dataconnect/generated';

// The `GetCalculationHistory` query requires an argument of type `GetCalculationHistoryVariables`:
const getCalculationHistoryVars: GetCalculationHistoryVariables = {
  userId: ..., 
  limit: ..., // optional
};

// Call the `getCalculationHistory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCalculationHistory(getCalculationHistoryVars);
// Variables can be defined inline as well.
const { data } = await getCalculationHistory({ userId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCalculationHistory(dataConnect, getCalculationHistoryVars);

console.log(data.calculations);

// Or, you can use the `Promise` API.
getCalculationHistory(getCalculationHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.calculations);
});
```

### Using `GetCalculationHistory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCalculationHistoryRef, GetCalculationHistoryVariables } from '@dataconnect/generated';

// The `GetCalculationHistory` query requires an argument of type `GetCalculationHistoryVariables`:
const getCalculationHistoryVars: GetCalculationHistoryVariables = {
  userId: ..., 
  limit: ..., // optional
};

// Call the `getCalculationHistoryRef()` function to get a reference to the query.
const ref = getCalculationHistoryRef(getCalculationHistoryVars);
// Variables can be defined inline as well.
const ref = getCalculationHistoryRef({ userId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCalculationHistoryRef(dataConnect, getCalculationHistoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.calculations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.calculations);
});
```

## GetUserPayments
You can execute the `GetUserPayments` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserPayments(vars: GetUserPaymentsVariables): QueryPromise<GetUserPaymentsData, GetUserPaymentsVariables>;

interface GetUserPaymentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserPaymentsVariables): QueryRef<GetUserPaymentsData, GetUserPaymentsVariables>;
}
export const getUserPaymentsRef: GetUserPaymentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserPayments(dc: DataConnect, vars: GetUserPaymentsVariables): QueryPromise<GetUserPaymentsData, GetUserPaymentsVariables>;

interface GetUserPaymentsRef {
  ...
  (dc: DataConnect, vars: GetUserPaymentsVariables): QueryRef<GetUserPaymentsData, GetUserPaymentsVariables>;
}
export const getUserPaymentsRef: GetUserPaymentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserPaymentsRef:
```typescript
const name = getUserPaymentsRef.operationName;
console.log(name);
```

### Variables
The `GetUserPayments` query requires an argument of type `GetUserPaymentsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserPaymentsVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `GetUserPayments` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserPaymentsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserPayments`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserPayments, GetUserPaymentsVariables } from '@dataconnect/generated';

// The `GetUserPayments` query requires an argument of type `GetUserPaymentsVariables`:
const getUserPaymentsVars: GetUserPaymentsVariables = {
  userId: ..., 
};

// Call the `getUserPayments()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserPayments(getUserPaymentsVars);
// Variables can be defined inline as well.
const { data } = await getUserPayments({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserPayments(dataConnect, getUserPaymentsVars);

console.log(data.payments);

// Or, you can use the `Promise` API.
getUserPayments(getUserPaymentsVars).then((response) => {
  const data = response.data;
  console.log(data.payments);
});
```

### Using `GetUserPayments`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserPaymentsRef, GetUserPaymentsVariables } from '@dataconnect/generated';

// The `GetUserPayments` query requires an argument of type `GetUserPaymentsVariables`:
const getUserPaymentsVars: GetUserPaymentsVariables = {
  userId: ..., 
};

// Call the `getUserPaymentsRef()` function to get a reference to the query.
const ref = getUserPaymentsRef(getUserPaymentsVars);
// Variables can be defined inline as well.
const ref = getUserPaymentsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserPaymentsRef(dataConnect, getUserPaymentsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.payments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.payments);
});
```

## GetLatestPayment
You can execute the `GetLatestPayment` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLatestPayment(vars: GetLatestPaymentVariables): QueryPromise<GetLatestPaymentData, GetLatestPaymentVariables>;

interface GetLatestPaymentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLatestPaymentVariables): QueryRef<GetLatestPaymentData, GetLatestPaymentVariables>;
}
export const getLatestPaymentRef: GetLatestPaymentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLatestPayment(dc: DataConnect, vars: GetLatestPaymentVariables): QueryPromise<GetLatestPaymentData, GetLatestPaymentVariables>;

interface GetLatestPaymentRef {
  ...
  (dc: DataConnect, vars: GetLatestPaymentVariables): QueryRef<GetLatestPaymentData, GetLatestPaymentVariables>;
}
export const getLatestPaymentRef: GetLatestPaymentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLatestPaymentRef:
```typescript
const name = getLatestPaymentRef.operationName;
console.log(name);
```

### Variables
The `GetLatestPayment` query requires an argument of type `GetLatestPaymentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLatestPaymentVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `GetLatestPayment` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLatestPaymentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetLatestPayment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLatestPayment, GetLatestPaymentVariables } from '@dataconnect/generated';

// The `GetLatestPayment` query requires an argument of type `GetLatestPaymentVariables`:
const getLatestPaymentVars: GetLatestPaymentVariables = {
  userId: ..., 
};

// Call the `getLatestPayment()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLatestPayment(getLatestPaymentVars);
// Variables can be defined inline as well.
const { data } = await getLatestPayment({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLatestPayment(dataConnect, getLatestPaymentVars);

console.log(data.payments);

// Or, you can use the `Promise` API.
getLatestPayment(getLatestPaymentVars).then((response) => {
  const data = response.data;
  console.log(data.payments);
});
```

### Using `GetLatestPayment`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLatestPaymentRef, GetLatestPaymentVariables } from '@dataconnect/generated';

// The `GetLatestPayment` query requires an argument of type `GetLatestPaymentVariables`:
const getLatestPaymentVars: GetLatestPaymentVariables = {
  userId: ..., 
};

// Call the `getLatestPaymentRef()` function to get a reference to the query.
const ref = getLatestPaymentRef(getLatestPaymentVars);
// Variables can be defined inline as well.
const ref = getLatestPaymentRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLatestPaymentRef(dataConnect, getLatestPaymentVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.payments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.payments);
});
```

## GetUserAuditLogs
You can execute the `GetUserAuditLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserAuditLogs(vars: GetUserAuditLogsVariables): QueryPromise<GetUserAuditLogsData, GetUserAuditLogsVariables>;

interface GetUserAuditLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserAuditLogsVariables): QueryRef<GetUserAuditLogsData, GetUserAuditLogsVariables>;
}
export const getUserAuditLogsRef: GetUserAuditLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserAuditLogs(dc: DataConnect, vars: GetUserAuditLogsVariables): QueryPromise<GetUserAuditLogsData, GetUserAuditLogsVariables>;

interface GetUserAuditLogsRef {
  ...
  (dc: DataConnect, vars: GetUserAuditLogsVariables): QueryRef<GetUserAuditLogsData, GetUserAuditLogsVariables>;
}
export const getUserAuditLogsRef: GetUserAuditLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserAuditLogsRef:
```typescript
const name = getUserAuditLogsRef.operationName;
console.log(name);
```

### Variables
The `GetUserAuditLogs` query requires an argument of type `GetUserAuditLogsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserAuditLogsVariables {
  userId: string;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetUserAuditLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserAuditLogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserAuditLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserAuditLogs, GetUserAuditLogsVariables } from '@dataconnect/generated';

// The `GetUserAuditLogs` query requires an argument of type `GetUserAuditLogsVariables`:
const getUserAuditLogsVars: GetUserAuditLogsVariables = {
  userId: ..., 
  limit: ..., // optional
};

// Call the `getUserAuditLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserAuditLogs(getUserAuditLogsVars);
// Variables can be defined inline as well.
const { data } = await getUserAuditLogs({ userId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserAuditLogs(dataConnect, getUserAuditLogsVars);

console.log(data.auditLogs);

// Or, you can use the `Promise` API.
getUserAuditLogs(getUserAuditLogsVars).then((response) => {
  const data = response.data;
  console.log(data.auditLogs);
});
```

### Using `GetUserAuditLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserAuditLogsRef, GetUserAuditLogsVariables } from '@dataconnect/generated';

// The `GetUserAuditLogs` query requires an argument of type `GetUserAuditLogsVariables`:
const getUserAuditLogsVars: GetUserAuditLogsVariables = {
  userId: ..., 
  limit: ..., // optional
};

// Call the `getUserAuditLogsRef()` function to get a reference to the query.
const ref = getUserAuditLogsRef(getUserAuditLogsVars);
// Variables can be defined inline as well.
const ref = getUserAuditLogsRef({ userId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserAuditLogsRef(dataConnect, getUserAuditLogsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.auditLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLogs);
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

Below are examples of how to use the `irpf` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserRef:
```typescript
const name = upsertUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserVariables {
  id: string;
  email: string;
  displayName?: string | null;
  provider?: string | null;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@dataconnect/generated';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  id: ..., 
  email: ..., 
  displayName: ..., // optional
  provider: ..., // optional
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ id: ..., email: ..., displayName: ..., provider: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@dataconnect/generated';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  id: ..., 
  email: ..., 
  displayName: ..., // optional
  provider: ..., // optional
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ id: ..., email: ..., displayName: ..., provider: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## UpdateUserLogin
You can execute the `UpdateUserLogin` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserLogin(vars: UpdateUserLoginVariables): MutationPromise<UpdateUserLoginData, UpdateUserLoginVariables>;

interface UpdateUserLoginRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserLoginVariables): MutationRef<UpdateUserLoginData, UpdateUserLoginVariables>;
}
export const updateUserLoginRef: UpdateUserLoginRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserLogin(dc: DataConnect, vars: UpdateUserLoginVariables): MutationPromise<UpdateUserLoginData, UpdateUserLoginVariables>;

interface UpdateUserLoginRef {
  ...
  (dc: DataConnect, vars: UpdateUserLoginVariables): MutationRef<UpdateUserLoginData, UpdateUserLoginVariables>;
}
export const updateUserLoginRef: UpdateUserLoginRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserLoginRef:
```typescript
const name = updateUserLoginRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserLogin` mutation requires an argument of type `UpdateUserLoginVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserLoginVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `UpdateUserLogin` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserLoginData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserLoginData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserLogin`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserLogin, UpdateUserLoginVariables } from '@dataconnect/generated';

// The `UpdateUserLogin` mutation requires an argument of type `UpdateUserLoginVariables`:
const updateUserLoginVars: UpdateUserLoginVariables = {
  userId: ..., 
};

// Call the `updateUserLogin()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserLogin(updateUserLoginVars);
// Variables can be defined inline as well.
const { data } = await updateUserLogin({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserLogin(dataConnect, updateUserLoginVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserLogin(updateUserLoginVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserLogin`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserLoginRef, UpdateUserLoginVariables } from '@dataconnect/generated';

// The `UpdateUserLogin` mutation requires an argument of type `UpdateUserLoginVariables`:
const updateUserLoginVars: UpdateUserLoginVariables = {
  userId: ..., 
};

// Call the `updateUserLoginRef()` function to get a reference to the mutation.
const ref = updateUserLoginRef(updateUserLoginVars);
// Variables can be defined inline as well.
const ref = updateUserLoginRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserLoginRef(dataConnect, updateUserLoginVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## UpdatePaymentStatus
You can execute the `UpdatePaymentStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePaymentStatus(vars: UpdatePaymentStatusVariables): MutationPromise<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;

interface UpdatePaymentStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePaymentStatusVariables): MutationRef<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;
}
export const updatePaymentStatusRef: UpdatePaymentStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePaymentStatus(dc: DataConnect, vars: UpdatePaymentStatusVariables): MutationPromise<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;

interface UpdatePaymentStatusRef {
  ...
  (dc: DataConnect, vars: UpdatePaymentStatusVariables): MutationRef<UpdatePaymentStatusData, UpdatePaymentStatusVariables>;
}
export const updatePaymentStatusRef: UpdatePaymentStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePaymentStatusRef:
```typescript
const name = updatePaymentStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdatePaymentStatus` mutation requires an argument of type `UpdatePaymentStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePaymentStatusVariables {
  userId: string;
  hasPaid: boolean;
  stripeCustomerId?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePaymentStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePaymentStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePaymentStatusData {
  user_update?: User_Key | null;
}
```
### Using `UpdatePaymentStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePaymentStatus, UpdatePaymentStatusVariables } from '@dataconnect/generated';

// The `UpdatePaymentStatus` mutation requires an argument of type `UpdatePaymentStatusVariables`:
const updatePaymentStatusVars: UpdatePaymentStatusVariables = {
  userId: ..., 
  hasPaid: ..., 
  stripeCustomerId: ..., // optional
};

// Call the `updatePaymentStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePaymentStatus(updatePaymentStatusVars);
// Variables can be defined inline as well.
const { data } = await updatePaymentStatus({ userId: ..., hasPaid: ..., stripeCustomerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePaymentStatus(dataConnect, updatePaymentStatusVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updatePaymentStatus(updatePaymentStatusVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdatePaymentStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePaymentStatusRef, UpdatePaymentStatusVariables } from '@dataconnect/generated';

// The `UpdatePaymentStatus` mutation requires an argument of type `UpdatePaymentStatusVariables`:
const updatePaymentStatusVars: UpdatePaymentStatusVariables = {
  userId: ..., 
  hasPaid: ..., 
  stripeCustomerId: ..., // optional
};

// Call the `updatePaymentStatusRef()` function to get a reference to the mutation.
const ref = updatePaymentStatusRef(updatePaymentStatusVars);
// Variables can be defined inline as well.
const ref = updatePaymentStatusRef({ userId: ..., hasPaid: ..., stripeCustomerId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePaymentStatusRef(dataConnect, updatePaymentStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CreatePayment
You can execute the `CreatePayment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPayment(vars: CreatePaymentVariables): MutationPromise<CreatePaymentData, CreatePaymentVariables>;

interface CreatePaymentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePaymentVariables): MutationRef<CreatePaymentData, CreatePaymentVariables>;
}
export const createPaymentRef: CreatePaymentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPayment(dc: DataConnect, vars: CreatePaymentVariables): MutationPromise<CreatePaymentData, CreatePaymentVariables>;

interface CreatePaymentRef {
  ...
  (dc: DataConnect, vars: CreatePaymentVariables): MutationRef<CreatePaymentData, CreatePaymentVariables>;
}
export const createPaymentRef: CreatePaymentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPaymentRef:
```typescript
const name = createPaymentRef.operationName;
console.log(name);
```

### Variables
The `CreatePayment` mutation requires an argument of type `CreatePaymentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePaymentVariables {
  userId: string;
  amount: number;
  currency: string;
  status: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentMethod?: string | null;
}
```
### Return Type
Recall that executing the `CreatePayment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePaymentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePaymentData {
  payment_insert: Payment_Key;
}
```
### Using `CreatePayment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPayment, CreatePaymentVariables } from '@dataconnect/generated';

// The `CreatePayment` mutation requires an argument of type `CreatePaymentVariables`:
const createPaymentVars: CreatePaymentVariables = {
  userId: ..., 
  amount: ..., 
  currency: ..., 
  status: ..., 
  stripeSessionId: ..., // optional
  stripePaymentIntentId: ..., // optional
  paymentMethod: ..., // optional
};

// Call the `createPayment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPayment(createPaymentVars);
// Variables can be defined inline as well.
const { data } = await createPayment({ userId: ..., amount: ..., currency: ..., status: ..., stripeSessionId: ..., stripePaymentIntentId: ..., paymentMethod: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPayment(dataConnect, createPaymentVars);

console.log(data.payment_insert);

// Or, you can use the `Promise` API.
createPayment(createPaymentVars).then((response) => {
  const data = response.data;
  console.log(data.payment_insert);
});
```

### Using `CreatePayment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPaymentRef, CreatePaymentVariables } from '@dataconnect/generated';

// The `CreatePayment` mutation requires an argument of type `CreatePaymentVariables`:
const createPaymentVars: CreatePaymentVariables = {
  userId: ..., 
  amount: ..., 
  currency: ..., 
  status: ..., 
  stripeSessionId: ..., // optional
  stripePaymentIntentId: ..., // optional
  paymentMethod: ..., // optional
};

// Call the `createPaymentRef()` function to get a reference to the mutation.
const ref = createPaymentRef(createPaymentVars);
// Variables can be defined inline as well.
const ref = createPaymentRef({ userId: ..., amount: ..., currency: ..., status: ..., stripeSessionId: ..., stripePaymentIntentId: ..., paymentMethod: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPaymentRef(dataConnect, createPaymentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.payment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.payment_insert);
});
```

## UpdatePaymentStatus2
You can execute the `UpdatePaymentStatus2` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePaymentStatus2(vars: UpdatePaymentStatus2Variables): MutationPromise<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;

interface UpdatePaymentStatus2Ref {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePaymentStatus2Variables): MutationRef<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;
}
export const updatePaymentStatus2Ref: UpdatePaymentStatus2Ref;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePaymentStatus2(dc: DataConnect, vars: UpdatePaymentStatus2Variables): MutationPromise<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;

interface UpdatePaymentStatus2Ref {
  ...
  (dc: DataConnect, vars: UpdatePaymentStatus2Variables): MutationRef<UpdatePaymentStatus2Data, UpdatePaymentStatus2Variables>;
}
export const updatePaymentStatus2Ref: UpdatePaymentStatus2Ref;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePaymentStatus2Ref:
```typescript
const name = updatePaymentStatus2Ref.operationName;
console.log(name);
```

### Variables
The `UpdatePaymentStatus2` mutation requires an argument of type `UpdatePaymentStatus2Variables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePaymentStatus2Variables {
  paymentId: UUIDString;
  status: string;
  stripePaymentIntentId?: string | null;
  paymentMethod?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePaymentStatus2` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePaymentStatus2Data`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePaymentStatus2Data {
  payment_update?: Payment_Key | null;
}
```
### Using `UpdatePaymentStatus2`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePaymentStatus2, UpdatePaymentStatus2Variables } from '@dataconnect/generated';

// The `UpdatePaymentStatus2` mutation requires an argument of type `UpdatePaymentStatus2Variables`:
const updatePaymentStatus2Vars: UpdatePaymentStatus2Variables = {
  paymentId: ..., 
  status: ..., 
  stripePaymentIntentId: ..., // optional
  paymentMethod: ..., // optional
};

// Call the `updatePaymentStatus2()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePaymentStatus2(updatePaymentStatus2Vars);
// Variables can be defined inline as well.
const { data } = await updatePaymentStatus2({ paymentId: ..., status: ..., stripePaymentIntentId: ..., paymentMethod: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePaymentStatus2(dataConnect, updatePaymentStatus2Vars);

console.log(data.payment_update);

// Or, you can use the `Promise` API.
updatePaymentStatus2(updatePaymentStatus2Vars).then((response) => {
  const data = response.data;
  console.log(data.payment_update);
});
```

### Using `UpdatePaymentStatus2`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePaymentStatus2Ref, UpdatePaymentStatus2Variables } from '@dataconnect/generated';

// The `UpdatePaymentStatus2` mutation requires an argument of type `UpdatePaymentStatus2Variables`:
const updatePaymentStatus2Vars: UpdatePaymentStatus2Variables = {
  paymentId: ..., 
  status: ..., 
  stripePaymentIntentId: ..., // optional
  paymentMethod: ..., // optional
};

// Call the `updatePaymentStatus2Ref()` function to get a reference to the mutation.
const ref = updatePaymentStatus2Ref(updatePaymentStatus2Vars);
// Variables can be defined inline as well.
const ref = updatePaymentStatus2Ref({ paymentId: ..., status: ..., stripePaymentIntentId: ..., paymentMethod: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePaymentStatus2Ref(dataConnect, updatePaymentStatus2Vars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.payment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.payment_update);
});
```

## SaveCalculation
You can execute the `SaveCalculation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
saveCalculation(vars: SaveCalculationVariables): MutationPromise<SaveCalculationData, SaveCalculationVariables>;

interface SaveCalculationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SaveCalculationVariables): MutationRef<SaveCalculationData, SaveCalculationVariables>;
}
export const saveCalculationRef: SaveCalculationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
saveCalculation(dc: DataConnect, vars: SaveCalculationVariables): MutationPromise<SaveCalculationData, SaveCalculationVariables>;

interface SaveCalculationRef {
  ...
  (dc: DataConnect, vars: SaveCalculationVariables): MutationRef<SaveCalculationData, SaveCalculationVariables>;
}
export const saveCalculationRef: SaveCalculationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the saveCalculationRef:
```typescript
const name = saveCalculationRef.operationName;
console.log(name);
```

### Variables
The `SaveCalculation` mutation requires an argument of type `SaveCalculationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `SaveCalculation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SaveCalculationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SaveCalculationData {
  calculation_updateMany: number;
  calculation_insert: Calculation_Key;
}
```
### Using `SaveCalculation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, saveCalculation, SaveCalculationVariables } from '@dataconnect/generated';

// The `SaveCalculation` mutation requires an argument of type `SaveCalculationVariables`:
const saveCalculationVars: SaveCalculationVariables = {
  userId: ..., 
  rendaBruta: ..., 
  dependentes: ..., 
  pensaoAlimenticia: ..., 
  despesasMedicas: ..., 
  despesasEducacao: ..., 
  previdenciaPrivada: ..., 
  inss: ..., 
  baseCalculo: ..., 
  impostoDevido: ..., 
  metodo: ..., 
  totalDeducoes: ..., 
};

// Call the `saveCalculation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await saveCalculation(saveCalculationVars);
// Variables can be defined inline as well.
const { data } = await saveCalculation({ userId: ..., rendaBruta: ..., dependentes: ..., pensaoAlimenticia: ..., despesasMedicas: ..., despesasEducacao: ..., previdenciaPrivada: ..., inss: ..., baseCalculo: ..., impostoDevido: ..., metodo: ..., totalDeducoes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await saveCalculation(dataConnect, saveCalculationVars);

console.log(data.calculation_updateMany);
console.log(data.calculation_insert);

// Or, you can use the `Promise` API.
saveCalculation(saveCalculationVars).then((response) => {
  const data = response.data;
  console.log(data.calculation_updateMany);
  console.log(data.calculation_insert);
});
```

### Using `SaveCalculation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, saveCalculationRef, SaveCalculationVariables } from '@dataconnect/generated';

// The `SaveCalculation` mutation requires an argument of type `SaveCalculationVariables`:
const saveCalculationVars: SaveCalculationVariables = {
  userId: ..., 
  rendaBruta: ..., 
  dependentes: ..., 
  pensaoAlimenticia: ..., 
  despesasMedicas: ..., 
  despesasEducacao: ..., 
  previdenciaPrivada: ..., 
  inss: ..., 
  baseCalculo: ..., 
  impostoDevido: ..., 
  metodo: ..., 
  totalDeducoes: ..., 
};

// Call the `saveCalculationRef()` function to get a reference to the mutation.
const ref = saveCalculationRef(saveCalculationVars);
// Variables can be defined inline as well.
const ref = saveCalculationRef({ userId: ..., rendaBruta: ..., dependentes: ..., pensaoAlimenticia: ..., despesasMedicas: ..., despesasEducacao: ..., previdenciaPrivada: ..., inss: ..., baseCalculo: ..., impostoDevido: ..., metodo: ..., totalDeducoes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = saveCalculationRef(dataConnect, saveCalculationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.calculation_updateMany);
console.log(data.calculation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.calculation_updateMany);
  console.log(data.calculation_insert);
});
```

## CreateAuditLog
You can execute the `CreateAuditLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAuditLog(vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;

interface CreateAuditLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
}
export const createAuditLogRef: CreateAuditLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAuditLog(dc: DataConnect, vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;

interface CreateAuditLogRef {
  ...
  (dc: DataConnect, vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
}
export const createAuditLogRef: CreateAuditLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAuditLogRef:
```typescript
const name = createAuditLogRef.operationName;
console.log(name);
```

### Variables
The `CreateAuditLog` mutation requires an argument of type `CreateAuditLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAuditLogVariables {
  userId: string;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
```
### Return Type
Recall that executing the `CreateAuditLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAuditLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAuditLogData {
  auditLog_insert: AuditLog_Key;
}
```
### Using `CreateAuditLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAuditLog, CreateAuditLogVariables } from '@dataconnect/generated';

// The `CreateAuditLog` mutation requires an argument of type `CreateAuditLogVariables`:
const createAuditLogVars: CreateAuditLogVariables = {
  userId: ..., 
  action: ..., 
  details: ..., // optional
  ipAddress: ..., // optional
  userAgent: ..., // optional
};

// Call the `createAuditLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAuditLog(createAuditLogVars);
// Variables can be defined inline as well.
const { data } = await createAuditLog({ userId: ..., action: ..., details: ..., ipAddress: ..., userAgent: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAuditLog(dataConnect, createAuditLogVars);

console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
createAuditLog(createAuditLogVars).then((response) => {
  const data = response.data;
  console.log(data.auditLog_insert);
});
```

### Using `CreateAuditLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAuditLogRef, CreateAuditLogVariables } from '@dataconnect/generated';

// The `CreateAuditLog` mutation requires an argument of type `CreateAuditLogVariables`:
const createAuditLogVars: CreateAuditLogVariables = {
  userId: ..., 
  action: ..., 
  details: ..., // optional
  ipAddress: ..., // optional
  userAgent: ..., // optional
};

// Call the `createAuditLogRef()` function to get a reference to the mutation.
const ref = createAuditLogRef(createAuditLogVars);
// Variables can be defined inline as well.
const ref = createAuditLogRef({ userId: ..., action: ..., details: ..., ipAddress: ..., userAgent: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAuditLogRef(dataConnect, createAuditLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLog_insert);
});
```

## DeleteUser
You can execute the `DeleteUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUser(vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface DeleteUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
}
export const deleteUserRef: DeleteUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUser(dc: DataConnect, vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface DeleteUserRef {
  ...
  (dc: DataConnect, vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
}
export const deleteUserRef: DeleteUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRef:
```typescript
const name = deleteUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUser` mutation requires an argument of type `DeleteUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteUserVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `DeleteUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserData {
  calculation_deleteMany: number;
  payment_deleteMany: number;
  auditLog_deleteMany: number;
  user_delete?: User_Key | null;
}
```
### Using `DeleteUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUser, DeleteUserVariables } from '@dataconnect/generated';

// The `DeleteUser` mutation requires an argument of type `DeleteUserVariables`:
const deleteUserVars: DeleteUserVariables = {
  userId: ..., 
};

// Call the `deleteUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUser(deleteUserVars);
// Variables can be defined inline as well.
const { data } = await deleteUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUser(dataConnect, deleteUserVars);

console.log(data.calculation_deleteMany);
console.log(data.payment_deleteMany);
console.log(data.auditLog_deleteMany);
console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUser(deleteUserVars).then((response) => {
  const data = response.data;
  console.log(data.calculation_deleteMany);
  console.log(data.payment_deleteMany);
  console.log(data.auditLog_deleteMany);
  console.log(data.user_delete);
});
```

### Using `DeleteUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRef, DeleteUserVariables } from '@dataconnect/generated';

// The `DeleteUser` mutation requires an argument of type `DeleteUserVariables`:
const deleteUserVars: DeleteUserVariables = {
  userId: ..., 
};

// Call the `deleteUserRef()` function to get a reference to the mutation.
const ref = deleteUserRef(deleteUserVars);
// Variables can be defined inline as well.
const ref = deleteUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRef(dataConnect, deleteUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.calculation_deleteMany);
console.log(data.payment_deleteMany);
console.log(data.auditLog_deleteMany);
console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.calculation_deleteMany);
  console.log(data.payment_deleteMany);
  console.log(data.auditLog_deleteMany);
  console.log(data.user_delete);
});
```

