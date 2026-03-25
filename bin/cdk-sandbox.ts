#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import * as cdk from 'aws-cdk-lib';
import { MalwareAnalysisSandboxStack } from '../lib/malware-analysis-sandbox-stack';

const app = new cdk.App();
new MalwareAnalysisSandboxStack(app, 'MalwareAnalysisSandboxStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});