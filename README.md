# Serverless Task Management System

This is my lab project for serverless lab: it 
management app where an **Admin** can create, update, assign, and close
tasks, and a **Member** can see the tasks assigned to them and update their
status. Everything runs on AWS and is provisioned with Terraform — no
click-ops.

## Architecture

```
React (Amplify) ──▶ API Gateway (HTTP API) ──▶ Lambda ──▶ DynamoDB
      │                     │                              │
      │              Cognito JWT authorizer          DynamoDB Stream
      ▼                     │                              │
  Cognito Hosted Auth ◀─────┘                               ▼
  (sign up / sign in)                                 notify Lambda ──▶ SES
```

- **Auth (Cognito)** — email/password sign-up, restricted to approved
  organizational domains, with two groups: `Admin` and `Member`. New users
  land in `Member` automatically; someone has to be promoted to `Admin`
  by hand (there was no time to build an admin-promotion flow).
- **API (API Gateway + Lambda)** — every route sits behind a Cognito JWT
  authorizer, so nothing works without a valid, signed-in session. Each
  Lambda also re-checks the caller's group from the JWT claims before doing
  anything admin-only.
- **Database (DynamoDB)** — one table, `taskId` as the only key. No GSIs.
  Assignment is just a list attribute (`assignedTo`) on the task item.
- **Notifications (SES + DynamoDB Streams)** — a Lambda subscribed to the
  table's stream reacts to inserts/updates and emails people.
- **Frontend (React + Amplify Hosting)** — a small Vite app using
  `aws-amplify`'s `<Authenticator>` for the login/sign-up UI, and a plain
  `fetch` wrapper for calling the API with the Cognito ID token attached.

## Repo layout

```
terraform/
  bootstrap/          # one-time: S3 bucket for remote state (own local state)
  modules/
    cognito/          # user pool, groups, pre-signup + post-confirmation triggers
    database/         # the Tasks table
    api/              # API Gateway + all the task Lambdas
    notifications/    # SES identity + the notify Lambda
    frontend/         # Amplify app + local-exec build/deploy
    lambda/           # reusable module: zip + IAM role + function, used by every Lambda above
  main.tf             # wires the modules together
lambda/               # Lambda source code (one folder per function, plain index.mjs)
frontend/             # the React app
```

## What each task Lambda does

| Route | Who | What |
|---|---|---|
| `POST /tasks` | Admin | create a task |
| `PATCH /tasks/{taskId}` | Admin | edit title/description/status |
| `POST /tasks/{taskId}/assign` | Admin | assign a member (conditional write — can't double-assign, and it checks the target user isn't deactivated in Cognito before assigning) |
| `POST /tasks/{taskId}/close` | Admin | set status to `CLOSED` |
| `PATCH /tasks/{taskId}/status` | Member | update status of a task assigned to them (can't set `CLOSED` — that's admin-only) |
| `GET /tasks` | Both | Admin gets every task; a Member only gets tasks where they're in `assignedTo` |

The `notify` Lambda isn't behind a route — it's triggered by the DynamoDB
stream. When a task's `assignedTo` list grows, it emails the new
assignee(s). When `status` changes, it emails every current assignee plus
whoever created the task.

## Deploying it yourself

1. **Bootstrap the state bucket** (once):
   ```
   cd terraform/bootstrap
   terraform init && terraform apply
   ```
   Copy the `bucket_name` output into `terraform/backend.tf`.

2. **Fill in `terraform/terraform.tfvars`**:
   - `ses_sender_email` — an address you can read mail at. SES emails it a
     verification link; nothing sends until you click it. SES also starts
     in sandbox mode, which means every *recipient* has to be verified too,
     until production access is requested.

3. **Deploy the main stack**:
   ```
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```
   This also builds and deploys the React app to Amplify via a `local-exec`
   provisioner (there's no GitHub repo wired up yet, so it's a scripted
   manual deploy instead of CI).

4. **Promote yourself to Admin.** Sign up through the app first (so the
   post-confirmation trigger puts you in `Member`), then move yourself into
   `Admin` from the Cognito console or CLI:
   ```
   aws cognito-idp admin-add-user-to-group \
     --user-pool-id <user_pool_id> \
     --username <your-email> \
     --group-name Admin
   ```

## Manual test checklist

This is basically the acceptance criteria from the spec, as a checklist I
used to sanity-check my own work:

- [x] Sign up with a non-approved email domain → rejected at sign-up
- [x] Sign up with an approved domain → works, lands in `Member`
- [ ] Hitting any API route with no token → `401`
- [ ] A `Member` token on an admin-only route (e.g. `POST /tasks`) → `403`
- [ ] Admin creates a task → shows up in `GET /tasks` for that admin
- [ ] Admin assigns a member → that member sees it in their `GET /tasks`,
      and gets an email
- [ ] Assigning the same member twice → second attempt is rejected
- [ ] Member updates status → admin + all assignees get an email
- [ ] Member tries to set status to `CLOSED` → rejected
- [ ] Admin closes a task → status becomes `CLOSED`
- [ ] Assigning a deactivated Cognito user → rejected

## Known limitations / things I'd do differently with more time

- **No admin-promotion flow.** Right now moving someone into the `Admin`
  group is a manual `aws cognito-idp` call. A real product would need an
  invite/promote flow instead of trusting whoever has console access.
- **No GSI on the Tasks table.** A member's "my tasks" view is a full table
  `Scan` with a filter, not an indexed `Query`. Fine at lab scale, would
  need revisiting if the table ever got big.
- **Amplify has no linked repo.** Deploys go out through a `local-exec`
  script that builds locally and pushes a zip — it works, but it's not a
  real CI/CD pipeline, and it only runs from whatever machine runs
  `terraform apply`.
- **SES sandbox mode.** Every recipient needs to be individually verified
  until someone requests production sending access for the account.
- **Single hash-key table.** This was a deliberate simplification over an
  earlier single-table design with a sort key + GSI. It's simpler to reason
  about, at the cost of the Scan-based query mentioned above.
