---
date: 2025-08-18T15:10:14-07:00
title: "Part 1 - Building a CI/CD Pipeline with GitHub Actions and Container Registries"
description: "Build a complete CI/CD pipeline with GitHub Actions for Flask apps. Learn to test containers, push to GHCR and AWS ECR, handle gotchas, and set up automated testing workflows - all within free AWS tier limits."
toc: true
tocOpen: true
---
# Building a CI/CD Pipeline with GitHub Actions and Container Registries

I recently built a complete CI/CD pipeline for my Flask job application tracking app. Like my Hugo blog setup, I struggled to find a single source covering everything I needed. I found myself cobbling together multiple YouTube videos, tutorials, and AWS and GitHub Actions documentation just to get a working pipeline. There's a lot of moving parts here, so I decided to split this into a two-part series.

In this first part, I'll walk you through setting up the continuous integration side of the pipeline. We'll cover my Flask app structure, the Docker build process, and how I configured GitHub Actions to automatically test containers and push images to both GitHub Container Registry (GHCR) and Amazon Elastic Container Registry (ECR).

## What to expect in Part 1
- Set up automated testing with basic health checks for containerized Flask apps
- Push to GitHub Container Registry (GHCR)
- Push to Amazon Elastic Container Registry (ECR)
- Handle all the gotchas I ran into

[Part 2]({{< ref "part-2-cicd-deploy-aws-ecs.md" >}}) will cover deploying these containers to AWS ECS.

## Overview of Flask Job Application Tracking App
Before diving into the CI/CD pipeline, let me show you what we're working with in terms of this Flask app. I built a job application tracking app, it's not complex, but it includes key components needed for a robust pipeline.

The app itself is fairly basic with features like adding new job applications, viewing them in a dashboard, and updating their status as you progress through interview processes. It uses SQLite for the database currently and includes forms for data entry. I intend to eventually move the database to something like AWS RDS and build a user portal. For now, we'll keep the AWS Security Group limited to my own IP.

### Health Check Endpoints, The Foundation of the Pipeline
One of the most important parts of this CI/CD pipeline is the health check implementation. This is used to test if the container is working as expected before uploading it to a registry.

```python
# Health checks
@app.route("/healthz/live")
def health_live():
    return "OK", 200

@app.route("/healthz/readiness")
def health_readiness():
    try:
        with db.engine.connect() as connection:
            connection.execute(db.text("SELECT 1"))
        return "OK", 200
    except Exception:
        return "Not Ready", 500
```


I created these endpoints following patterns that you see in Kubernetes and other container orchestration systems:
- `/healthz/live` - Simple "is the app running?" check that just returns OK
- `/healthz/readiness` - "Can the app serve traffic?" checks that database is communicating with the app

This separation is crucial for our container testing strategy. The liveness check confirms the Flask server started successfully, while the readiness check ensures the database is accessible and the app can actually handle requests. The readiness health check is expected to be used if a load balancer is added in front of the app, this will ensure the app is up and able to function. 

### Flask App Structure
Here's the structure of the app that is being containerized:
```bash
app/
├── Dockerfile            # Container build instructions
├── app.py                # Main Flask application
├── docker-compose.yml    # Local development setup
├── requirements.txt      # Python dependencies 
├── static
│   └── style.css         # CSS Style Sheet
└── templates             # HTML templates
    ├── add_job.html
    ├── base.html
    ├── dashboard.html
    ├── edit_job.html
    ├── job_details.html
    └── jobs.html
```

The app runs on port 8080 and uses SQLite for simplicity. You can view the complete source code and all these files in my [GitHub repository](https://github.com/gereader/FlaskJobTracker).

### Why This Setup Works for CI/CD
This Flask app gives us everything we need to demonstrate a real-world CI/CD pipeline:

Realistic dependencies - Uses SQLAlchemy, WTForms, and other common libraries
Database testing - The readiness endpoint validates database connectivity
Simple deployment - Self-contained with SQLite, no external services required
Health check - Proper endpoints for automated testing and monitoring

The health check endpoints will be the foundation of our container testing strategy. We can use them to verify that our container is working correctly before pushing it to the registry. 


## Setting Up the Container Testing in GitHub Actions
This is the foundation, testing before we put anything in production. You want to ensure that you have thought about how you validate that your code will work before launching it anywhere you consider production. In this case, I don't want to upload a bad version of my container, so I need to validate that it works before uploading it into my registries.


### Basic Workflow Structure
```yaml
jobs:
  # Test Job
  test:
    runs-on: ubuntu-latest
    # ... test steps

  # Push to GHCR Job
  build_and_push_ghcr:
    runs-on: ubuntu-latest
    needs: test  # Only runs if test passes

  # Push to ECR Job
  build_and_push_ecr:
    runs-on: ubuntu-latest
    needs: test  # Only runs if test passes
```

The `needs: test` dependency ensures the fail-fast approach, we do not want ANY bad containers make it to production, so if it fails the test, we will not push a container to production. 

### Container Testing Strategy
This will show how I approached the testing my container using the `healthz/live` and `healthz/readiness` endpoints. If they fail, the whole task fails. 

```yaml
# Build container during test
- name: Build Docker Image
  run: docker build -t ${{ steps.ghcr_tag.outputs.lowercase }} app

# Start the container running the Flask app
- name: Run container in background
  run: |
    docker run -d --name flask-test -p 8080:8080 ${{ steps.ghcr_tag.outputs.lowercase }}

# Wait for container to test "ok" or timeout in 30s, this makes sure the container is comes "up"
- name: Wait for Container Test
  run: |
    timeout 30 bash -c 'until curl -f http://localhost:8080/healthz/live; do sleep 10; done'

# Second test, make sure the readiness passes, can the Flask app talk to the database?
- name: Container Readiness check
  run: |
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/healthz/readiness")
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo "Readiness request was successful (HTTP 200 OK)."
    else
        echo "Readiness Request failed with HTTP status code: $HTTP_CODE"
        exit 1
    fi

# Stop the container, job is completed, test passes
- name: Stop container, test complete
  run: docker stop flask-test
```

Here is what the testing looks like in action. The first screenshot shows a failed test where the container couldn't start properly. Notice the repeated 404 errors from curl trying to reach the health endpoint, this container couldn't reach the `healthz/live` endpoint so it failed after 30s. 

{{< lightbox src="Actions-Test-Fail.webp" 
    alt="Screenshot showing GitHub Actions interface with red x and error message 'Process completed with exit code 124'" 
    caption="Our initial test run fails because the container can't connect to the healthz/live endpoint" >}}

Then this is what a successful test run where both health checks pass looks like.

{{< lightbox src="Actions-Test-Pass.webp" 
    alt="Screenshot showing GitHub Actions interface with check marks and passing test status 'OK'" 
    caption="The workflow shows our Flask app tests and Docker build completed successfully" >}}

## Docker Context Gotcha
My Flask app lives in /app subdirectory, not the root of the repo. This caused issues at first because the `docker/build-push-action@v6` action needs to know where the Dockerfile is located. Luckily, smarter minds than me had already thought of this and built in the ability to set your context to indicate where the Dockerfile is located.

```bash
FlaskJobTracker
└── app
    ├── Dockerfile
```

Problem: Default context looks in repository root
Solution: Use context: "{{defaultContext}}:app"

```yaml
      # https://github.com/marketplace/actions/build-and-push-docker-images
      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          # Define context since Dockerfile is not in the root
          context: "{{defaultContext}}:app"
          push: true
          tags: ${{ steps.ghcr_tag.outputs.lowercase }}
```

The Dockerfile itself is straightforward Flask containerization. Feel free to check out the complete Dockerfile on my [GitHub](https://github.com/gereader/FlaskJobTracker/blob/main/app/Dockerfile).

## GitHub Container Registry (GHCR) Setup
GHCR is available under GitHub free accounts. You will need to configure authentication to get this working with GitHub Actions though. 

### Authentication Setup
You will need to generate a Personal Access Token (PAT), and give it appropriate permissions to access repos, write packages, and delete packages.

GitHub Account Settings → Developer settings → Personal access tokens → Tokens (Classic)


Set the Note, this will be what your PAT is referred by when viewing your configured tokens.

Make sure to set an appropriate Expiration time. I set mine to 90 days, and I know that I will need to update the token when it expires. You will be required to us the Classic token because fine-grained don't yet support container registry.

I set my permissions to allow "repo", "write:packages", and "delete:packages" permissions.


{{< lightbox src="GitHub-Generate-PAT.webp" 
    alt="Screenshot showing GitHub New personal access token (classic) screen" 
    caption="The token doesn't note need access to everything, only a the required permissions to interact with your repo and container registry" >}}


### Repository Secrets Setup
You will need to create a GitHub Action Secret with the PAT token you generated. I have also added a secret with my GitHub username, that way I do not need to hardcode my username. I could have added my username as a variable instead, but it's easy enough to access secrets that I included it here. 

Repo → Settings → Security → Secrets and variables

{{< lightbox src="GitHub-Repo-Secrets.webp" 
    alt="Screenshot showing GitHub Actions secrets screen with secrets already set" 
    caption="Set your PAT secret named 'GH_PAT_GHCR' and username named 'GH_USERNAME'" >}}

We will reference these secrets when logging in to GHCR from docker in our workflow. 

```yaml
      # Login to ghcr action
      # https://github.com/docker/login-action?tab=readme-ov-file#github-container-registry
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ secrets.GH_USERNAME }}
          password: ${{ secrets.GH_PAT_GHCR }}
```

### Repository Naming Gotcha for GHCR
GHCR requires lowercase names in the tags, but my repo "FlaskJobTracker" has capital letters so I had to come up with a method to lowercase my name since I really didn't want to rename my repo to make it work. I found the `ASzc/change-string-case-action@v6` action was made to be able to upper or lowercase string, so we create a variable for our tag and call the `.lowercase` variable. 

Problem: GHCR requires lowercase names, but my repo is "FlaskJobTracker"
Solution: Automatic case conversion in the workflow

```yaml
      # Convert tag to lowercase since its required by ghcr
      - id: ghcr_tag
        uses: ASzc/change-string-case-action@v6
        with:
          string: ghcr.io/${{ github.repository }}:latest


      # Example Build and Push step showing the lowercase string
      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          tags: ${{ steps.ghcr_tag.outputs.lowercase }}
          
```

### Complete GHCR Push Workflow
This is the full workflow to push a container to GHCR. 

1. Checkout latest repo
2. Docker Login, use Secrets we defined
3. Enable string to be Lowercased
4. Build and Push container to GHCR

```yaml
  build_and_push_ghcr:
    runs-on: ubuntu-latest
    needs: test
    steps:
        # Latest checkout action
        # https://github.com/actions/checkout
      - uses: actions/checkout@v5

      # Login to ghcr action
      # https://github.com/docker/login-action?tab=readme-ov-file#github-container-registry
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ secrets.GH_USERNAME }}
          password: ${{ secrets.GH_PAT_GHCR }}

      # Convert tag to lowercase since its required by ghcr
      - id: ghcr_tag
        uses: ASzc/change-string-case-action@v6
        with:
          string: ghcr.io/${{ github.repository }}:latest


      # https://github.com/marketplace/actions/build-and-push-docker-images
      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          # Define context since Dockerfile is not in the root
          context: "{{defaultContext}}:app"
          push: true
          # This tag is used to name and set tags for the container
          # This is being made lowercase from the previous step ghcr_tag
          tags: ${{ steps.ghcr_tag.outputs.lowercase }}
```
{{< lightbox src="GitHub-Actions-Push-GHCR.webp" 
    alt="Screenshot showing GitHub Actions build_and_push_ghcr job completing" 
    caption="Now you should can run the GitHub Actions Job to push the container to GHCR" >}}

You can look at all your package versions from your repo here. You can add additional tags and they will also show. 

{{< lightbox src="GHCR-Packages.webp" 
    alt="Screenshot showing GitHub repo with arrow pointing to Packages"  >}}

Now that we have GHCR working, let's set up AWS ECR as our second registry. This gives us redundancy and prepares us for AWS ECS deployment in Part 2.

## AWS Elastic Container Registry (ECR) Setup

We are going to be tackling setting up AWS ECR for our containers while staying within the free tier and minimizing cost as much as possible. ECR will be our second registry and what we'll use for ECS deployment in Part 2.

### Cost Reality Check

Before I go further into AWS ECR setup, let me address the reality of costs. Despite AWS calling much of this "free tier," my current month-to-date costs are $0.94 after implementing this workflow and letting it run for a few days:

- **EC2 (ECS cluster):** $0.355
- **VPC networking:** $0.351  
- **ECR storage:** $0.252

I'm currently using AWS credits that I received when opening a new AWS Free Tier account, so this isn't costing me any money out of pocket yet. However, once those credits expire, based on that ~$0.40/day cost. I'm expecting around $12/month ($144/year) in ongoing costs. This is still fairly affordable for a complete CI/CD pipeline, but worth factoring into your budget planning rather than assuming it's perpetually free. I myself will likely rework this project in the future to automate the infrastructure so I can run it when I need it, which will reduce the cost further.


### AWS CLI Configuration

I prefer to set up an AWS CLI profile for an account at the start. This allows me to easily use AWS CLI and know that I am running commands against the desired account. Here is the basics, with AWS CLI installed, run the `aws configure --profile <name of profile>` command. This sets up a profile using the name you specify. You'll need to provide the Access Key ID and Secret Access Key for your account. I have created an IAM User in my account called `iamadmin` that I give admin permissions to, I do this for improved security so I only have to login to my root account as a last resort.


```bash
aws configure --profile learning
AWS Access Key ID [None]: REDACTED
AWS Secret Access Key [None]: REDACTED
Default region name [None]: us-west-2
Default output format [None]:
```

Let's verify the profile is working correctly:

```bash
aws sts get-caller-identity --profile learning
{
    "UserId": "AIDA4SO3J6TLRKIIX5JGU",
    "Account": "REDACTED-ACCOUNT",
    "Arn": "arn:aws:iam::REDACTED-ACCOUNT:user/iamadmin"
}
```

Now that I have my AWS CLI setup, I like to verify that my budget is setup to make sure I'm aware if I exceed my $10 monthly limit. I setup this budget whenever I create a new AWS account using the Monthly Cost Budget template. 

```bash
aws budgets describe-budgets --account-id $(aws sts get-caller-identity --query Account --output text --profile learning) --profile learning
```


Lets break that command down. We are looking at all of the budgets on my account. The command with `$()` is returning my account number so that it can be used as the `account-id` in the outer command. 


```bash
~ $ aws budgets describe-budgets --account-id $(aws sts get-caller-identity --query Account --output text --profile learning) --profile learning
{
    "Budgets": [
        {
            "BudgetName": "My Monthly Cost Budget",
            "BudgetLimit": {
                "Amount": "10.0",
                "Unit": "USD"
            },
            "TimeUnit": "MONTHLY",
            "TimePeriod": {
                "Start": "2025-06-30T17:00:00-07:00",
                "End": "2087-06-14T17:00:00-07:00"
            },
            "CalculatedSpend": {
                "ActualSpend": {
                    "Amount": "0.938",
                    "Unit": "USD"
                }
            },
            "BudgetType": "COST",
:...skipping...
{
    "Budgets": [
        {
            "BudgetName": "My Monthly Cost Budget",
            "BudgetLimit": {
                "Amount": "10.0",
                "Unit": "USD"
            },
            "TimeUnit": "MONTHLY",
            "TimePeriod": {
                "Start": "2025-06-30T17:00:00-07:00",
                "End": "2087-06-14T17:00:00-07:00"
            },
            "CalculatedSpend": {
                "ActualSpend": {
                    "Amount": "0.938",
                    "Unit": "USD"
                }
            },
            "BudgetType": "COST",
            "LastUpdatedTime": "2025-08-19T21:05:47.565000-07:00",
            "FilterExpression": {
                "Not": {
                    "Dimensions": {
                        "Key": "RECORD_TYPE",
                        "Values": [
                            "Credit",
                            "Refund"
                        ]
                    }
                }
            },
            "Metrics": [
                "UnblendedCost"
            ]
        }
    ]
}
~
~
~
~ $
```

You can see here that I have a monthly budget setup for $10 and you can see my current actual spend $0.938. 

```json
            "BudgetLimit": {
                "Amount": "10.0",
                "Unit": "USD"
            },
            "TimeUnit": "MONTHLY",
```
``` json
                "ActualSpend": {
                    "Amount": "0.938",
                    "Unit": "USD"
                }
```

This confirms I'm well within my budget before setting up any new services, and serves as a reminder in case I forgot to setup a budget in my account. This is useful to make sure I am not going to be surprised by a really expensive bill in the future. 

### ECR Repository Creation

**Note** I am going to be duplicating my initial deployment of this so that I can take current screenshots.

Here is where I hit my first gotcha, right out the gate. When trying to create a public ECR repository, the default action of clicking "create"  on the root Amazon Elastic Container Registry page was creating a private repository. 

{{< lightbox src="ECR-private-repo.webp" 
    alt="AWS ECR console showing confusing interface defaulting to private repository creation" 
    caption="The ECR console kept trying to make me create a private repo" >}}

**The solution:** Navigate to the public registry repositories from the sidebar. Once there you can create a repository that is public. Because the sidebar was hidden on the root page I didn't think to check there at first. 

{{< lightbox src="ECR-public-repo-sidebar.webp" 
    alt="AWS ECR console sidebar highlighting the 'Public registry' option" 
    caption="Use the sidebar to access public registry options to create a public repo" >}}


You'll want to create a public repository. I created mine with a namespace matching my github username, but that is not necessary. I will call this new repository gereader/flaskjobtracker-v2, otherwise I am taking all of the default options. 

{{< lightbox src="ECR-repo-created.webp" 
    alt="AWS ECR public repository showing created banner with repository name 'gereader/flaskjobtracker-v2' and showing the URI" 
    caption="When you create your repository you will be given a URI for it" >}}

The public repository gives us a URI like: `public.ecr.aws/w8m5m8y0/gereader/flaskjobtracker-v2`


### IAM Setup for GitHub Actions

Next up I am going to be setting up a restricted access account to access the AWS repositories. I don't want to put my admin level account into my repository for automation. It's considered best practice to have an account for a single purpose, so I'll generate a new one specifically for this GitHub Actions workflow in IAM. 

To make it so I can easily add other accounts if I need them, I setup permissions in a group. You could apply the permissions directly to a User, but I find that it's often better to setup groups with desired permissions to easily add Users in the future. 

Go ahead and navigate under IAM in your AWS account and setup a User Group. I am calling mine `gereader-flaskjobtracker-v2` so it's apparent what it is used for. For the permissions, for now we want to give access to read/write/delete in our Public registries. I am opting to give `AmazonElasticContainerRegistryPublicFullAccess` which contains all the required permissions. 

{{< lightbox src="AWS-Create-Group.webp" 
    alt="AWS IAM console showing group creation with name 'gereader-flaskjobtracker-v2' and AmazonElasticContainerRegistryPublicFullAccess policy attached" 
    caption="Created IAM group with the necessary permissions for ECR" >}}

We then need to create a User and make it a member of the group we just created. This will be the user that GitHub Actions will use so I like to name it in a way to easily identify it. We'll call it `user-github-actions-flaskjobtracker` and add it to the group we created. 

{{< lightbox src="create-user-with-group.webp" 
    alt="AWS IAM console showing user creation with username 'user-flaskjobtracker' being added to the gereader-flaskjobtracker-v2 group" 
    caption="Created dedicated IAM user and added it to the permissions group" >}}

Now that we have the user created we can generated access key for it. You'll be able to generate access keys if you navigate under your created user and go to the `Security credentials` tab. 

{{< lightbox src="IAM-User-Generate-Key.webp" 
    alt="AWS IAM console showing user settings under the Security credentials tab with the 'create access key'" 
    caption="Create an access key for the user we created" >}}

Once you create the access key AWS will only give you access to the secret the first time. So make sure you download it or copy the details down. You can keep this window open for now and we can copy it directly into GitHub repository secrets, but I suggest storing it somewhere safe as well. 

{{< lightbox src="Create-Access-Key.webp" 
    alt="AWS IAM access key creation screen with access key ID visible but secret key hidden" 
    caption="Generated access keys for the our user" >}}

Add these access keys into GitHub repository secrets just like we did for GHCR:
- `ECR_USER_KEY`: Your generated access key ID  
- `ECR_USER_KEY_SECRET`: Your generated secret access key
- `AWS_ACCOUNT_ID`: Your AWS account ID (I do this to avoid hardcoding it)

{{< lightbox src="GitHub-ECR-Secrets.webp" 
    alt="GitHub repository secrets page showing ECR_USER_KEY, ECR_USER_KEY_SECRET, and AWS_ACCOUNT_ID secrets configured" 
    caption="GitHub repository secrets configured for ECR authentication" >}}

### ECR Authentication Gotchas

Public ECR has some quirks that I didn't see called out initially when researching this.

**Key gotchas:**
- Public ECR repos are **global**
- You **must authenticate to us-east-1** regardless of your default region
- You have to tell the action the registry is public so it uses the correct authentication endpoint

This is how the authentication works in GitHub Actions.

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4.3.1
  with:
    aws-access-key-id: ${{ secrets.ECR_USER_KEY }}
    aws-secret-access-key: ${{ secrets.ECR_USER_KEY_SECRET }}
    aws-region: us-east-1 # ECR Public can only be logged into from us-east-1

- name: Login to Amazon ECR
  id: login-ecr-public
  uses: aws-actions/amazon-ecr-login@v2
  with:
    registry-type: public # This has to be set to properly authenticate
```

### Dynamic Registry URI Lookup

In an effort to minimize hardcoding where I could, I opted to lookup the public uri using the AWS CLI in my workflow.

```yaml
- name: Get ECR Public registry URI
  id: ecr-public-details
  run: |
    REGISTRY_URI=$(aws ecr-public describe-registries --region us-east-1 --query 'registries[0].registryUri' --output text)
    echo "uri=$REGISTRY_URI" >> $GITHUB_OUTPUT
    echo "container_uri=$REGISTRY_URI/gereader/flaskjobtracker" >> $GITHUB_OUTPUT
```

This queries AWS for my registry URI and creates variables I can use in later steps. I believe this is cleaner than hardcoding account-specific information and makes the overall content more reusable. 

### Complete ECR Push Workflow

Here is the complete workflow to push the container to ECR. 

```yaml
  build_and_push_ecr:
    runs-on: ubuntu-latest
    needs: test # Test the build first
    steps:
      # Checkout code
      - uses: actions/checkout@v5

      - name: Configure AWS credentials # Setup Credentials for login, note the region
        uses: aws-actions/configure-aws-credentials@v4.3.1
        with:
          aws-access-key-id: ${{ secrets.ECR_USER_KEY }}
          aws-secret-access-key: ${{ secrets.ECR_USER_KEY_SECRET }}
          aws-region: us-east-1 # ECR Public can only be logged into from us-east-1

      - name: Get ECR Public registry URI
        id: ecr-public-details
        run: |
          REGISTRY_URI=$(aws ecr-public describe-registries --region us-east-1 --query 'registries[0].registryUri' --output text)
          echo "uri=$REGISTRY_URI" >> $GITHUB_OUTPUT
          echo "container_uri=$REGISTRY_URI/gereader/flaskjobtracker" >> $GITHUB_OUTPUT

      - name: Login to Amazon ECR
        id: login-ecr-public
        uses: aws-actions/amazon-ecr-login@v2
        with:
          registry-type: public

      - name: Build and push Docker image to ECR
        uses: docker/build-push-action@v6
        with:
          context: "{{defaultContext}}:app"
          push: true
          # Using both latest and commit SHA for versioning, multiline is supported for tags
          tags: |
            ${{ steps.ecr-public-details.outputs.container_uri }}:latest
            ${{ steps.ecr-public-details.outputs.container_uri }}:${{ github.sha }}
```

Notice I'm using both `latest` and `${{ github.sha }}` tags. This gives me a latest version for quick reference and a specific commit-based version to easily identify a new container. One gotcha I ran into here is, for multiline tags to work, you cannot surround the tags by double quotes, it will try to add the double quotes to the tag which fails. You could also do comma separated, but the length of the lines it makes it difficult to read at a glance.

{{< lightbox src="GitHub-Actions-ECR-Push.webp" 
    alt="GitHub Actions workflow logs showing successful ECR push with login and build steps completed with a task definition (covered in part 2) that shows the image tag 'public.ecr.aws/w8m5m8y0/gereader/flaskjobtracker:d53bd318f2f775a51bafc0be78d9b6c8a2200c8a'" 
    caption="Successful ECR push workflow showing all authentication and build steps" >}}

{{< lightbox src="ECR-Console-Images.webp" 
    alt="AWS ECR console showing the pushed container image with both latest and commit SHA tag 'd53bd318f2f775a51bafc0be78d9b6c8a2200c8a'" 
    caption="ECR repository now contains our Flask app container with all of the desired tags" >}}

## The Complete Part 1 Workflow

Now we can put everything together. This is the complete workflow file that handles testing and pushing to both GHCR and ECR registries:

```yaml
---
name: Docker Image CI for GHCR for our FlaskApp

on: 
  push

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      # Convert tag to lowercase since its required by ghcr
      - id: ghcr_tag
        uses: ASzc/change-string-case-action@v6
        with:
          string: ghcr.io/${{ github.repository }}:latest

      # Build container during test
      - name: Build Docker Image
        run: docker build -t ${{ steps.ghcr_tag.outputs.lowercase }} app

      # Run container
      - name: Run container in background
        run: |
          docker run -d --name flask-test -p 8080:8080 ${{ steps.ghcr_tag.outputs.lowercase }}
      
      # Wait for container to test okay or timeout in 30s
      - name: Wait for Container Test
        run: |
          timeout 30 bash -c 'until curl -f http://localhost:8080/healthz/live; do sleep 10; done'

      # Readiness check
      - name: Container Readiness check
        run: |
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/healthz/readiness")
          if [ "$HTTP_CODE" -eq 200 ]; then
              echo "Readiness request was successful (HTTP 200 OK)."
          else
              echo "Readiness Request failed with HTTP status code: $HTTP_CODE"
              exit 1
          fi

      - name: Stop container, test complete
        run: docker stop flask-test

  build_and_push_ghcr:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v5

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ secrets.GH_USERNAME }}
          password: ${{ secrets.GH_PAT_GHCR }}

      - id: ghcr_tag
        uses: ASzc/change-string-case-action@v6
        with:
          string: ghcr.io/${{ github.repository }}:latest

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: "{{defaultContext}}:app"
          push: true
          tags: ${{ steps.ghcr_tag.outputs.lowercase }}
          
  build_and_push_ecr:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v5

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4.3.1
        with:
          aws-access-key-id: ${{ secrets.ECR_USER_KEY }}
          aws-secret-access-key: ${{ secrets.ECR_USER_KEY_SECRET }}
          aws-region: us-east-1

      - name: Get ECR Public registry URI
        id: ecr-public-details
        run: |
          REGISTRY_URI=$(aws ecr-public describe-registries --region us-east-1 --query 'registries[0].registryUri' --output text)
          echo "uri=$REGISTRY_URI" >> $GITHUB_OUTPUT
          echo "container_uri=$REGISTRY_URI/gereader/flaskjobtracker" >> $GITHUB_OUTPUT

      - name: Login to Amazon ECR
        id: login-ecr-public
        uses: aws-actions/amazon-ecr-login@v2
        with:
          registry-type: public

      - name: Build and push Docker image to ECR
        uses: docker/build-push-action@v6
        with:
          context: "{{defaultContext}}:app"
          push: true
          tags: |
            ${{ steps.ecr-public-details.outputs.container_uri }}:latest
            ${{ steps.ecr-public-details.outputs.container_uri }}:${{ github.sha }}
```

{{< lightbox src="GitHub-Actions-Complete-Workflow.webp" 
    alt="GitHub Actions workflow summary showing all three jobs (test, build_and_push_ghcr, build_and_push_ecr) with green check marks" 
    caption="Complete workflow run showing successful test and dual registry push" >}}

## What's Next

In Part 2, we'll take the container image and deploy them to AWS ECS:

- Setting up an ECS cluster in free tier
- Creating task definitions and services  
- Automating deployments from our GitHub Actions
- Implementing rolling updates and monitoring

This has only been the foundation so far as we prepare to deploy our code to a production environment. We'll see you in part 2 when we configure the infrastructure to host our application. 

## Resources

- [GitHub Actions Docker build/push documentation](https://github.com/marketplace/actions/build-and-push-docker-images)
- [AWS ECR Public documentation](https://docs.aws.amazon.com/AmazonECR/latest/public/)
- [GitHub Container Registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker login action for GHCR](https://github.com/docker/login-action?tab=readme-ov-file#github-container-registry)