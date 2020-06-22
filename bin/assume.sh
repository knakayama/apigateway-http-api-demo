#!/usr/bin/env bash

set -xeuo pipefail

usage() {
  cat <<'EOT'
Usage: assume.sh [-p] [-h]
  -p     This is for production
  -h     Print this help
EOT
}

is_production=false

while getopts ':ph' args; do
  case "$args" in
    p)
      is_production=true
      ;;
    h)
      usage
      exit 0
      ;;
    *)
      usage
      exit 1
      ;;
  esac
done

if [[ "$is_production" == true ]]; then
  aws_account_id="$(cat "cdk.json" | jq -r '.context.prd.accountId')"
  aws_env="prd"
  aws_deployable_role_name="$AWS_DEPLOYABLE_ROLE_NAME_PRD"
  aws_delegated_role_name="$AWS_DELEGATED_ROLE_NAME_PRD"
  aws_deployable_role_external_id="$AWS_DEPLOYABLE_ROLE_EXTERNAL_ID_PRD"
elif [[ "${CIRCLE_TAG:-dummy}" =~ v([0-9]+\.){2}[0-9]+ ]]; then
  aws_account_id="$(cat "cdk.json" | jq -r '.context.stg.accountId')"
  aws_env="stg"
  aws_deployable_role_name="$AWS_DEPLOYABLE_ROLE_NAME_STG"
  aws_delegated_role_name="$AWS_DELEGATED_ROLE_NAME_STG"
  aws_deployable_role_external_id="$AWS_DEPLOYABLE_ROLE_EXTERNAL_ID_STG"
else
  aws_account_id="$(cat "cdk.json" | jq -r '.context.dev.accountId')"
  aws_env="dev"
  aws_deployable_role_name="$AWS_DEPLOYABLE_ROLE_NAME_DEV"
  aws_delegated_role_name="$AWS_DELEGATED_ROLE_NAME_DEV"
  aws_deployable_role_external_id="$AWS_DEPLOYABLE_ROLE_EXTERNAL_ID_DEV"
fi

aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_account_id}:role/${aws_deployable_role_name}" \
  --role-session-name "$CIRCLE_USERNAME" \
  --external-id "$aws_deployable_role_external_id" \
  --duration-seconds "900" \
  --query "Credentials" \
  --output "json")"

cat <<EOT > "aws-envs.sh"
export AWS_ACCOUNT_ID="$aws_account_id"
export AWS_DEFAULT_REGION="ap-northeast-1"
export AWS_ENV="$aws_env"
export AWS_CFN_ROLE_ARN="arn:aws:iam::${aws_account_id}:role/${aws_delegated_role_name}"
export AWS_ACCESS_KEY_ID="$(echo "$aws_sts_credentials" | jq -r '.AccessKeyId')"
export AWS_SECRET_ACCESS_KEY="$(echo "$aws_sts_credentials" | jq -r '.SecretAccessKey')"
export AWS_SESSION_TOKEN="$(echo "$aws_sts_credentials" | jq -r '.SessionToken')"
EOT
