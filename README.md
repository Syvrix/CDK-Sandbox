# AWS CDK Malware Analysis Sandbox

This CDK project creates a secure, isolated AWS environment for malware analysis and security testing, following AWS security best practices and the guidance from [AWS Security Blog: Malware Analysis on AWS](https://aws.amazon.com/blogs/security/malware-analysis-on-aws-setting-up-a-secure-environment/).

## Security Features
- **Network Isolation**: Dedicated VPC with public/private subnets
- **Secure client connection**: Secure access point using AWS Session manager.
- **No Public IPs**: Analysis instances in private subnets only
- **VPC Endpoints**: S3 access without internet exposure
- **Least Privilege IAM**: Minimal permissions for EC2 role
- **Encryption**: S3 server-side encryption, HTTPS everywhere
- **Logging & Monitoring**: CloudTrail, GuardDuty, CloudWatch logs
- **Access Control**: Restricted security groups, no inbound to analysis instance

## Architecture
- **Analysis Instance**: Ubuntu instance in private isolated subnet with analysis tools
- **S3 Bucket**: Encrypted, versioned bucket with access logging
- **VPC**: Isolated network with private subnets only (no internet gateway or NAT gateway)

## Prerequisites
- **Node.js (v18+)**: Download from https://nodejs.org/ (includes npm)
- **AWS CLI**: Install from https://aws.amazon.com/cli/
- **AWS CDK CLI**: Install globally with `npm install -g aws-cdk`
- **AWS Account**: With appropriate permissions for EC2, VPC, S3, IAM, etc.

### Installing Prerequisites

#### 1. Install Node.js
Download and install from https://nodejs.org/ (LTS version recommended).

Verify installation:
```bash
node --version
npm --version
```

#### 2. Install AWS CLI
Download and install from https://aws.amazon.com/cli/.

Verify installation:
```bash
aws --version
```

#### 3. Configure AWS CLI
Configure your AWS credentials:
```bash
aws configure sso
```
Enter your:
- SSO session name (Recommended): my-sso
- SSO start URL [None]: https://my-sso-portal.awsapps.com/start
- SSO region [None]: eu-north-1
- SSO registration scopes [None]: sso:account:access
- When asked `CLI default output format (json if not specified) [No
ne]:` just press enter.

**Proof Key for Code Exchange (PKCE)** authorization is used by default for the AWS CLI starting with version 2.22.0 and must be used on devices with a browser. To continue to use Device authorization, append the --use-device-code option.

```bash
aws configure sso --use-device-code
```
##### Login using the configured profile
```bash
aws sso login --profile my-aws-profile-name
```

If you always want to use a specific profile without typing --profile each time, set:
```bash
setx AWS_PROFILE "admin"
```
- Restart terminal after setx has been ran.

#### 4. Install AWS CDK
```bash
npm install -g aws-cdk
```

Verify installation:
```bash
cdk --version
```

## Setup

### Step 1: Configure AWS CLI with SSO
Follow the AWS CLI prerequisites section above to set up your SSO profile (e.g., `sso-admin`).

### Step 2: Clone and Configure the Project
1. Clone or navigate to this repository.
2. Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```
   ```PowerShell
   Copy-item .\.env.example .\.env    
   ```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Update Environment Variables
Edit `.env` with your specific values:
- `CDK_DEFAULT_REGION`: `eu-north-1` (or your desired region)
- `CDK_DEFAULT_ACCOUNT`: Your AWS account ID
- `EC2_KEY_PAIR`: Your EC2 key pair name for instance access

### Step 5: Build the CDK Project
Compile TypeScript to JavaScript:
```bash
npm run build
```

### Step 6: Bootstrap CDK Environment (One-Time)
Set your AWS profile and region, then bootstrap:
```PowerShell
$env:AWS_PROFILE='sso-admin'
$env:AWS_REGION='eu-north-1'
cdk bootstrap aws://123456789/eu-north-1 --profile sso-admin
```
Replace `123456789` with your AWS account ID from your SSO setup.

Review the changes and confirm with `y` when prompted.


## Deployment
### Step 1. Synthesize and Deploy
Generate CloudFormation template:
```bash
cdk synth
```
If you are getting issues with the region, run the command with the created profile
```bash
cdk synth --profile sso-admin
```

### 2. Deploy the sandbox to your AWS account:
```bash
cdk deploy --profile sso-admin
```

### Step 4. Retrieve Deployment Outputs
After deployment completes, note the stack outputs:
- **AnalysisInstanceId**: Private analysis instance ID
- **AnalysisBucketName**: S3 bucket for analysis files
- **VpcId**: VPC ID for reference

### Step 5. Destroy when not in use: 
```bash
cdk destroy
```

## Usage
1. Connect to the analysis instance via AWS Session Manager
2. Upload files to S3 bucket
3. Analyze files in `/home/ubuntu/analysis` directory
4. Common tools available:
   - **ClamAV**: `clamscan <file>` for virus scanning
   - **YARA**: Write rules and scan with `yara <rules> <file>`
   - **Tshark**: Network analysis
   - **Python tools**: `oletools`, `pefile` for file analysis

## Security Considerations
- Analysis instance has no internet access (no NAT gateway, no internet gateway).
- Access via AWS Systems Manager Session Manager only (no SSH/RDP ports open).
- All traffic logged via CloudTrail and VPC Flow Logs.
- GuardDuty enabled for threat detection.
- Files in S3 are encrypted and private.
- Destroy the stack after analysis to avoid costs and exposure.

## Monitoring
- CloudTrail logs all API calls
- GuardDuty monitors for suspicious activity
- CloudWatch logs instance activity
- S3 access logs track bucket operations

## Cleanup
To destroy the sandbox:
```bash
cdk destroy
```

## Customization
- Modify instance types for more resources.
- Add additional tools in user data.
- Enable additional AWS services (e.g., Lambda for automated scanning).
- Add CloudWatch alarms for security events.

## Troubleshooting

### CDK Bootstrap Issues
If `cdk bootstrap` fails:
- Ensure AWS credentials are configured correctly
- Check that your account has permissions to create CloudFormation stacks
- Verify the region in your AWS config matches your desired deployment region

### Deployment Errors
- **AMI not found**: Update `AMI_REGION` in `.env` to match your deployment region
- **Session Manager access issues**: Ensure the instance role has SSM permissions and the VPC endpoints for SSM are available

### Permission Issues
The AWS account needs these permissions:
- EC2: Full access
- VPC: Full access
- S3: Full access
- IAM: Role creation
- CloudTrail: Full access
- GuardDuty: Full access
- CloudWatch: Full access

### Cost Monitoring
Monitor costs in AWS Billing dashboard. The sandbox includes:
- EC2 instances (bastion + analysis)
- NAT Gateway
- S3 storage
- GuardDuty (may incur charges)

**Projected 2026 Costs** (estimating ~5-10% annual increase):
- **Analysis EC2 (t3.medium)**: ~$0.0458-$0.0498/hour
- **GuardDuty**: ~$0.0459-$0.0499/hour
- **S3 Storage**: Variable based on file size

**Total Projected 2026 Cost**: ~**$0.09-$0.10/hour** (excluding S3 storage)

**Monthly Cost** (if run 8 hours/day): ~**$21-$24** in 2026

**Cost Optimization Tips:**
- **Stop instances** when not analyzing: `aws ec2 stop-instances --instance-ids <id>` (~50% savings)
- **[Use spot instances](https://aws.amazon.com/ec2/spot/)** for analysis (modify stack for spot allocation - 70% savings)
- **Destroy stack** after analysis: `cdk destroy` (eliminates recurring costs)
- **Monitor usage** in AWS Cost Explorer
- **Set up billing alerts** for unexpected costs

**Note**: AWS pricing typically increases 2-5% annually. The 2026 projections are estimates based on historical trends. Always check current pricing at https://aws.amazon.com/pricing/ and use AWS Cost Calculator for precise estimates in your region.