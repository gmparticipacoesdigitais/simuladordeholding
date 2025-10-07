# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { getUser, getUserByEmail, checkPaymentStatus, getLatestCalculation, getCalculationHistory, getUserPayments, getLatestPayment, getUserAuditLogs, upsertUser, updateUserLogin } from '@dataconnect/generated';


// Operation GetUser:  For variables, look at type GetUserVars in ../index.d.ts
const { data } = await GetUser(dataConnect, getUserVars);

// Operation GetUserByEmail:  For variables, look at type GetUserByEmailVars in ../index.d.ts
const { data } = await GetUserByEmail(dataConnect, getUserByEmailVars);

// Operation CheckPaymentStatus:  For variables, look at type CheckPaymentStatusVars in ../index.d.ts
const { data } = await CheckPaymentStatus(dataConnect, checkPaymentStatusVars);

// Operation GetLatestCalculation:  For variables, look at type GetLatestCalculationVars in ../index.d.ts
const { data } = await GetLatestCalculation(dataConnect, getLatestCalculationVars);

// Operation GetCalculationHistory:  For variables, look at type GetCalculationHistoryVars in ../index.d.ts
const { data } = await GetCalculationHistory(dataConnect, getCalculationHistoryVars);

// Operation GetUserPayments:  For variables, look at type GetUserPaymentsVars in ../index.d.ts
const { data } = await GetUserPayments(dataConnect, getUserPaymentsVars);

// Operation GetLatestPayment:  For variables, look at type GetLatestPaymentVars in ../index.d.ts
const { data } = await GetLatestPayment(dataConnect, getLatestPaymentVars);

// Operation GetUserAuditLogs:  For variables, look at type GetUserAuditLogsVars in ../index.d.ts
const { data } = await GetUserAuditLogs(dataConnect, getUserAuditLogsVars);

// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation UpdateUserLogin:  For variables, look at type UpdateUserLoginVars in ../index.d.ts
const { data } = await UpdateUserLogin(dataConnect, updateUserLoginVars);


```