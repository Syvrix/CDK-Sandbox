# AWS CDK Malware Analysis Sandbox

This CDK project creates a secure, isolated AWS environment for malware analysis and security testing, following AWS security best practices and the guidance from [AWS Security Blog: Malware Analysis on AWS](https://aws.amazon.com/blogs/security/malware-analysis-on-aws-setting-up-a-secure-environment/).

## Security Features
- **Network Isolation**: Dedicated VPC with public/private subnets
- **Bastion Host**: Secure access point in public subnet
- **No Public IPs**: Analysis instances in private subnets only
- **VPC Endpoints**: S3 access without internet exposure
- **Least Privilege IAM**: Minimal permissions for EC2 role
- **Encryption**: S3 server-side encryption, HTTPS everywhere
- **Logging & Monitoring**: CloudTrail, GuardDuty, CloudWatch logs
- **Access Control**: Restricted security groups, no inbound to analysis instance

## Architecture
- **Bastion Host**: Ubuntu instance in public subnet for SSH access
- **Analysis Instance**: Ubuntu instance in private subnet with analysis tools
- **S3 Bucket**: Encrypted, versioned bucket with access logging
- **VPC**: Isolated network with NAT Gateway for controlled outbound access

## Prerequisites
- **Node.js (v18+)**: Download from https://nodejs.org/ (includes npm)
- **AWS CLI**: Install from https://aws.amazon.com/cli/
- **AWS CDK CLI**: Install globally with `npm install -g aws-cdk`
- **AWS Account**: With appropriate permissions for EC2, VPC, S3, IAM, etc.
- **EC2 Key Pair**: Created in your AWS account

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
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

#### 4. Install AWS CDK
```bash
npm install -g aws-cdk
```

Verify installation:
```bash
cdk --version
```

#### 5. Create EC2 Key Pair
In AWS Console or via CLI:
```bash
aws ec2 create-key-pair --key-name your-key-pair-name --query 'KeyMaterial' --output text > your-key-pair-name.pem
chmod 400 your-key-pair-name.pem
```

## Setup
1. Clone or navigate to this repository.
2. Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Bootstrap CDK for your account/region (one-time setup):
   ```bash
   cdk bootstrap
   ```
5. The stack will automatically load configuration from `.env` file.

### Environment Configuration
Edit `.env` with your specific values:
- `ALLOWED_IP`: Your public IP address (find at https://whatismyipaddress.com/)
- `EC2_KEY_PAIR`: Name of your EC2 key pair
- `AMI_REGION`: AWS region you're deploying to (must match CDK region)

## Deployment
1. Synthesize the CloudFormation template:
   ```bash
   cdk synth
   ```
2. Deploy the stack:
   ```bash
   cdk deploy
   ```
3. Note the outputs (Bastion Public IP, Analysis Instance ID, Bucket Name, VPC ID).

## Usage
1. SSH into the bastion host:
   ```bash
   ssh -i your-key.pem ubuntu@<bastion-public-ip>
   ```
2. From bastion, SSH to analysis instance (use private IP):
   ```bash
   ssh ubuntu@<analysis-private-ip>
   ```
3. Upload files to S3 bucket or transfer via bastion.
4. Analyze files in `/home/ubuntu/analysis` directory.
5. Common tools available:
   - **ClamAV**: `clamscan <file>` for virus scanning
   - **YARA**: Write rules and scan with `yara <rules> <file>`
   - **Tshark**: Network analysis
   - **Python tools**: `oletools`, `pefile` for file analysis

## Security Considerations
- Analysis instance has no direct internet access; updates via bastion if needed.
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
- **Key pair not found**: Ensure the key pair name in `.env` exists in your AWS account
- **IP restriction**: Update `ALLOWED_IP` with your current public IP

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

Destroy when not in use: `cdk destroy`